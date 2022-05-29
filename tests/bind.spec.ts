/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { bind } from '../src/decorators/bind'

test.group('Bind decorator', () => {
  test('collect method parameter types and store on the controller', async ({ assert }) => {
    class User {}

    class UsersController {
      @bind()
      public async show(_, __: User) {}
    }

    assert.deepEqual(UsersController['bindings'], { show: [User] })
  })

  test('raise error when parameter type is an interface', async ({ assert }) => {
    assert.plan(1)
    interface User {}

    try {
      class UsersController {
        @bind()
        public async show(_, __: User) {}
      }
      assert.deepEqual(UsersController['bindings'], {})
    } catch (error) {
      assert.equal(
        error.message,
        'E_INVALID_BIND_VALUE: Cannot bind "{Object Constructor}" as 1st parameter to "UsersController.show" method. Make sure to type hint a class constructor'
      )
    }
  })

  test('raise error when parameter type is a primitive type', async ({ assert }) => {
    assert.plan(1)

    try {
      class UsersController {
        @bind()
        public async show(_, __: string) {}
      }
      assert.deepEqual(UsersController['bindings'], {})
    } catch (error) {
      assert.equal(
        error.message,
        'E_INVALID_BIND_VALUE: Cannot bind "{String Constructor}" as 1st parameter to "UsersController.show" method. Make sure to type hint a class constructor'
      )
    }
  })

  test('raise error when parameter type is a primitive value', async ({ assert }) => {
    assert.plan(1)

    try {
      class UsersController {
        @bind()
        public async show(_, __: 'user') {}
      }
      assert.deepEqual(UsersController['bindings'], {})
    } catch (error) {
      assert.equal(
        error.message,
        'E_INVALID_BIND_VALUE: Cannot bind "{String Constructor}" as 1st parameter to "UsersController.show" method. Make sure to type hint a class constructor'
      )
    }
  })

  test('raise error when parameter type is a function type', async ({ assert }) => {
    assert.plan(1)

    function getUser() {}

    try {
      class UsersController {
        @bind()
        public async show(_, __: typeof getUser) {}
      }
      assert.deepEqual(UsersController['bindings'], {})
    } catch (error) {
      assert.equal(
        error.message,
        'E_INVALID_BIND_VALUE: Cannot bind "{Object Constructor}" as 1st parameter to "UsersController.show" method. Make sure to type hint a class constructor'
      )
    }
  })

  test('collect method parameter from the parent class', async ({ assert }) => {
    class User {}

    class BaseController {
      @bind()
      public async show(_, __: User) {}
    }

    class UsersController extends BaseController {
      @bind()
      public async update(_, __: User) {}
    }

    assert.deepEqual(BaseController['bindings'], { show: [User] })
    assert.deepEqual(UsersController['bindings'], { show: [User], update: [User] })
  })

  test('collect method parameter from the multiple parent class', async ({ assert }) => {
    class User {}

    class BaseController {
      @bind()
      public async index(_, __: User) {}
    }

    class UserBaseController extends BaseController {
      @bind()
      public async show(_, __: User) {}
    }

    class UsersController extends UserBaseController {
      @bind()
      public async update(_, __: User) {}
    }

    assert.deepEqual(BaseController['bindings'], { index: [User] })
    assert.deepEqual(UserBaseController['bindings'], { show: [User], index: [User] })
    assert.deepEqual(UsersController['bindings'], { show: [User], update: [User], index: [User] })
  })
})
