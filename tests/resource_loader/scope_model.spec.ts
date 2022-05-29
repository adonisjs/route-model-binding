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
import { ResourceLoader } from '../../src/resource_loader'
import { setup, fs, getContextForRoute, migrate, rollback } from '../../test_helpers'

test.group('Resource Loader | Scoped', (group) => {
  group.each.setup(async () => {
    await fs.fsExtra.ensureDir(join(fs.basePath, 'database'))
    return () => fs.cleanup()
  })

  test('load nested scoped resource', async ({ assert }) => {
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

    const [post1, post2] = await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    await post1.related('comments').create({ title: 'Nice post', slug: 'nice-post' })
    await post2.related('comments').create({ title: 'Awesome post', slug: 'nice-post' })

    const ctx = getContextForRoute(app, 'posts/:post/comments/:>comment', 'posts/2/comments/1')
    const loader = new ResourceLoader(ctx)
    await assert.rejects(() => loader.load([Post, Comment]), 'E_ROW_NOT_FOUND: Row not found')

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })

  test('load nested scoped resource by custom route key', async ({ assert }) => {
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

    const [post1, post2] = await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    await post1.related('comments').create({ title: 'Nice post', slug: 'nice-post' })
    await post2.related('comments').create({ title: 'Awesome post', slug: 'nice-post' })

    const ctx = getContextForRoute(
      app,
      'posts/:post/comments/:>comment(slug)',
      'posts/2/comments/nice-post'
    )
    const loader = new ResourceLoader(ctx)
    await loader.load([Post, Comment])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.deepEqual(ctx.params, { post: '2', comment: 'nice-post' })
    assert.deepEqual(ctx.request.params(), { post: '2', comment: 'nice-post' })
    assert.equal(ctx.request.param('post'), '2')
    assert.equal(ctx.request.param('comment'), 'nice-post')

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 2)
    assert.equal(loader.resources.post.slug, 'hello-adonisjs')

    assert.property(loader.resources, 'comment')
    assert.instanceOf(loader.resources.comment, Comment)
    assert.equal(loader.resources.comment.id, 2)
    assert.equal(loader.resources.comment.postId, 2)
  })

  test('load nested scoped resource by custom model key', async ({ assert }) => {
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
      public static routeLookupKey = 'slug'

      @column({ isPrimary: true })
      public id: number

      @column()
      public postId: number

      @column()
      public title: string

      @column()
      public slug: string
    }

    const [post1, post2] = await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    await post1.related('comments').create({ title: 'Nice post', slug: 'nice-post' })
    await post2.related('comments').create({ title: 'Awesome post', slug: 'nice-post' })

    const ctx = getContextForRoute(
      app,
      'posts/:post/comments/:>comment',
      'posts/2/comments/nice-post'
    )
    const loader = new ResourceLoader(ctx)
    await loader.load([Post, Comment])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.deepEqual(ctx.params, { post: '2', comment: 'nice-post' })
    assert.deepEqual(ctx.request.params(), { post: '2', comment: 'nice-post' })
    assert.equal(ctx.request.param('post'), '2')
    assert.equal(ctx.request.param('comment'), 'nice-post')

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 2)
    assert.equal(loader.resources.post.slug, 'hello-adonisjs')

    assert.property(loader.resources, 'comment')
    assert.instanceOf(loader.resources.comment, Comment)
    assert.equal(loader.resources.comment.id, 2)
    assert.equal(loader.resources.comment.postId, 2)
  })

  test('load nested scoped resource by custom "findRelatedForRequest" method', async ({
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

      public findRelatedForRequest(_, param, value) {
        if (param.name === 'comment') {
          return this.related('comments' as any)
            .query()
            .where('slug', value)
            .firstOrFail()
        }
      }
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

    const [post1, post2] = await Post.createMany([
      {
        title: 'Hello world',
        slug: 'hello-world',
      },
      {
        title: 'Hello AdonisJS',
        slug: 'hello-adonisjs',
      },
    ])

    await post1.related('comments').create({ title: 'Nice post', slug: 'nice-post' })
    await post2.related('comments').create({ title: 'Awesome post', slug: 'nice-post' })

    const ctx = getContextForRoute(
      app,
      'posts/:post/comments/:>comment',
      'posts/2/comments/nice-post'
    )
    const loader = new ResourceLoader(ctx)
    await loader.load([Post, Comment])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.deepEqual(ctx.params, { post: '2', comment: 'nice-post' })
    assert.deepEqual(ctx.request.params(), { post: '2', comment: 'nice-post' })
    assert.equal(ctx.request.param('post'), '2')
    assert.equal(ctx.request.param('comment'), 'nice-post')

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 2)
    assert.equal(loader.resources.post.slug, 'hello-adonisjs')

    assert.property(loader.resources, 'comment')
    assert.instanceOf(loader.resources.comment, Comment)
    assert.equal(loader.resources.comment.id, 2)
    assert.equal(loader.resources.comment.postId, 2)
  })

  test('raise exception when relationship for a scoped param is not defined', async ({
    assert,
  }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      @column({ isPrimary: true })
      public id: number

      @column()
      public title: string

      @column()
      public slug: string
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

    const ctx = getContextForRoute(
      app,
      'posts/:post/comments/:>comment',
      'posts/2/comments/nice-post'
    )
    const loader = new ResourceLoader(ctx)
    await assert.rejects(
      () => loader.load([Post, Comment]),
      'E_MISSING_RELATIONSHIP: Cannot load "comment" for route "/posts/:post/comments/:>comment". Make sure to define it as a relationship on model "Post"'
    )

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))
  })
})
