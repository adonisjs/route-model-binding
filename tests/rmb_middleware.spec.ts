/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { test } from '@japa/runner'
import type { HasMany } from '@ioc:Adonis/Lucid/Orm'

import { setup, fs, getContextForRoute, migrate, rollback } from '../test_helpers'
import { RouteModelBindingMiddleware } from '../src/middleware/route_model_binding'
import { bind } from '../src/decorators/bind'

test.group('Route model binding | middleware', (group) => {
  group.each.setup(async () => {
    await fs.fsExtra.ensureDir(join(fs.basePath, 'database'))
    return () => fs.cleanup()
  })

  test('load resources for a given request', async ({ assert }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column, hasMany } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string

      @hasMany(() => Comment)
      public comments: HasMany<typeof Comment>
    }

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    class PostsController {
      @bind()
      public show(_, __: Post) {}
    }

    await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/2')
    ctx.route!.meta.resolvedHandler = {
      type: 'binding',
      namespace: 'PostsController',
      method: 'show',
    }

    app.container.bind('PostsController', () => PostsController)
    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {
      assert.property(ctx.resources, 'post')
      assert.instanceOf(ctx.resources.post, Post)
      assert.equal(ctx.resources.post.id, 2)
      assert.equal(ctx.resources.post.slug, 'hello-adonisjs')
    })

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })

  test('load resources with a custom route param', async ({ assert }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column, hasMany } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string

      @hasMany(() => Comment)
      public comments: HasMany<typeof Comment>
    }

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    class PostsController {
      @bind()
      public show(_, __: Post) {}
    }

    await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    const ctx = getContextForRoute(app, 'posts/:post(slug)', 'posts/hello-adonisjs')
    ctx.route!.meta.resolvedHandler = {
      type: 'binding',
      namespace: 'PostsController',
      method: 'show',
    }

    app.container.bind('PostsController', () => PostsController)
    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {
      assert.property(ctx.resources, 'post')
      assert.instanceOf(ctx.resources.post, Post)
      assert.equal(ctx.resources.post.id, 2)
      assert.equal(ctx.resources.post.slug, 'hello-adonisjs')
    })

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })

  test("do not load resources when controller isn't using the bind decorator", async ({
    assert,
  }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column, hasMany } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string

      @hasMany(() => Comment)
      public comments: HasMany<typeof Comment>
    }

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    class PostsController {
      public show(_, __: Post) {}
    }

    await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/2')
    ctx.route!.meta.resolvedHandler = {
      type: 'binding',
      namespace: 'PostsController',
      method: 'show',
    }

    app.container.bind('PostsController', () => PostsController)
    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {
      assert.deepEqual(ctx.resources, {})
    })

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })

  test('do not load resources when route handler is a closure', async ({ assert }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column, hasMany } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string

      @hasMany(() => Comment)
      public comments: HasMany<typeof Comment>
    }

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    class PostsController {
      public show(_, __: Post) {}
    }

    await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/2')
    app.container.bind('PostsController', () => PostsController)
    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {
      assert.deepEqual(ctx.resources, {})
    })

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })

  test('use decorator to specify the models to bind', async ({ assert }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column, hasMany } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string

      @hasMany(() => Comment)
      public comments: HasMany<typeof Comment>
    }

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    class PostsController {
      @bind([Post])
      public show(_, __: Post) {}
    }

    await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/2')
    ctx.route!.meta.resolvedHandler = {
      type: 'binding',
      namespace: 'PostsController',
      method: 'show',
    }

    app.container.bind('PostsController', () => PostsController)

    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {
      assert.property(ctx.resources, 'post')
      assert.instanceOf(ctx.resources.post, Post)
      assert.equal(ctx.resources.post.id, 2)
      assert.equal(ctx.resources.post.slug, 'hello-adonisjs')
    })

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })

  test('use decorator to skip resource loading for certain parameters', async ({ assert }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column, hasMany } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string

      @hasMany(() => Comment)
      public comments: HasMany<typeof Comment>
    }

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    class PostsController {
      @bind()
      public show(_, __: null, ___: Post) {}
    }

    await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    const ctx = getContextForRoute(app, ':sessionId/posts/:post', '1/posts/2')
    ctx.route!.meta.resolvedHandler = {
      type: 'binding',
      namespace: 'PostsController',
      method: 'show',
    }

    app.container.bind('PostsController', () => PostsController)

    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {
      assert.property(ctx.resources, 'post')
      assert.instanceOf(ctx.resources.post, Post)
      assert.equal(ctx.resources.post.id, 2)
      assert.equal(ctx.resources.post.slug, 'hello-adonisjs')
      const postController = app.container.make(app.container.use('PostsController'))
      const injections = postController.getHandlerArguments(ctx)
      assert.deepEqual(injections, [ctx, ctx.resources.post])
    })

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })

  test('ignore bindings which have no parameters in route', async ({ assert }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column, hasMany } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string

      @hasMany(() => Comment)
      public comments: HasMany<typeof Comment>
    }

    class Comment extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    class PostsController {
      @bind()
      public show(_, __: Post, ___: Comment) {}
    }

    await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/2')
    ctx.route!.meta.resolvedHandler = {
      type: 'binding',
      namespace: 'PostsController',
      method: 'show',
    }

    app.container.bind('PostsController', () => PostsController)
    await new RouteModelBindingMiddleware(app).handle(ctx, async () => {
      assert.property(ctx.resources, 'post')
      assert.instanceOf(ctx.resources.post, Post)
      assert.equal(ctx.resources.post.id, 2)
      assert.equal(ctx.resources.post.slug, 'hello-adonisjs')

      const postController = app.container.make(app.container.use('PostsController'))
      const injections = postController.getHandlerArguments(ctx)
      assert.deepEqual(injections, [ctx, ctx.resources.post])
    })

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })
})
