/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { ParamsParser } from '../src/params_parser'

test.group('Params Parser', () => {
  test('parse route params', async ({ assert }) => {
    const parser = new ParamsParser(['post'], '/:post')
    assert.deepEqual(parser.parse(), [
      {
        name: 'post',
        param: 'post',
        lookupKey: '$primaryKey',
        scoped: false,
        parent: null,
      },
    ])
  })

  test('parse nested route params', async ({ assert }) => {
    const parser = new ParamsParser(['post', 'comment'], '/:post/comments/:comment')
    assert.deepEqual(parser.parse(), [
      {
        name: 'post',
        param: 'post',
        lookupKey: '$primaryKey',
        scoped: false,
        parent: null,
      },
      {
        name: 'comment',
        param: 'comment',
        lookupKey: '$primaryKey',
        scoped: false,
        parent: null,
      },
    ])
  })

  test('parse nested route scoped params', async ({ assert }) => {
    const parser = new ParamsParser(['post', '>comment'], '/:post/comments/:>comment')
    assert.deepEqual(parser.parse(), [
      {
        name: 'post',
        param: 'post',
        lookupKey: '$primaryKey',
        scoped: false,
        parent: null,
      },
      {
        name: 'comment',
        param: '>comment',
        lookupKey: '$primaryKey',
        scoped: true,
        parent: 'post',
      },
    ])
  })

  test('disallow first param to be scoped', async ({ assert }) => {
    const parser = new ParamsParser(['>post', '>comment'], '/:>post/comments/:>comment')
    assert.throws(
      () => parser.parse(),
      'The first parameter in route "/:>post/comments/:>comment" cannot be scoped'
    )
  })

  test('parse param with custom key', async ({ assert }) => {
    const parser = new ParamsParser(['post(slug)'], '/posts/:post(slug)')
    assert.deepEqual(parser.parse(), [
      {
        name: 'post',
        param: 'post(slug)',
        lookupKey: 'slug',
        scoped: false,
        parent: null,
      },
    ])
  })

  test('parse scoped param with custom key', async ({ assert }) => {
    const parser = new ParamsParser(
      ['post(slug)', '>comment(slug)'],
      '/posts/:post(slug)/comments/:>comment(slug)'
    )
    assert.deepEqual(parser.parse(), [
      {
        name: 'post',
        param: 'post(slug)',
        lookupKey: 'slug',
        scoped: false,
        parent: null,
      },
      {
        name: 'comment',
        param: '>comment(slug)',
        lookupKey: 'slug',
        scoped: true,
        parent: 'post',
      },
    ])
  })
})
