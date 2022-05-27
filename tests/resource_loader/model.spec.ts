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

test.group('Resource Loader', (group) => {
  group.each.setup(async () => {
    await fs.fsExtra.ensureDir(join(fs.basePath, 'database'))
    return () => fs.cleanup()
  })

  test('load model by primary key', async ({ assert }) => {
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

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/1')
    const loader = new ResourceLoader(ctx)
    await loader.load([Post])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 1)
    assert.equal(loader.resources.post.slug, 'hello-world')
  })

  test('load model by custom model key', async ({ assert }) => {
    const app = await setup()
    await migrate(app.container.resolveBinding('Adonis/Lucid/Database'))

    const { BaseModel, column } = app.container.resolveBinding('Adonis/Lucid/Orm')

    class Post extends BaseModel {
      public static routeLookupKey = 'slug'

      @column({ isPrimary: true })
      public id: number

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

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/hello-adonisjs')
    const loader = new ResourceLoader(ctx)
    await loader.load([Post])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 2)
    assert.equal(loader.resources.post.slug, 'hello-adonisjs')
  })

  test('load model by custom route key', async ({ assert }) => {
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
    const loader = new ResourceLoader(ctx)
    await loader.load([Post])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.deepEqual(ctx.params, { post: 'hello-adonisjs' })
    assert.deepEqual(ctx.request.params(), { post: 'hello-adonisjs' })
    assert.equal(ctx.request.param('post'), 'hello-adonisjs')

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 2)
    assert.equal(loader.resources.post.slug, 'hello-adonisjs')
  })

  test('load model by static "findForRequest" method', async ({ assert }) => {
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

      public static findForRequest(_, __, value: string) {
        return this.query().where('slug', value).firstOrFail()
      }
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

    const ctx = getContextForRoute(app, 'posts/:post', 'posts/hello-adonisjs')
    const loader = new ResourceLoader(ctx)
    await loader.load([Post])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 2)
    assert.equal(loader.resources.post.slug, 'hello-adonisjs')
  })

  test('load nested independent resource', async ({ assert }) => {
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
    await post2.related('comments').create({ title: 'Awesome post', slug: 'awesome-post' })

    const ctx = getContextForRoute(app, 'posts/:post/comments/:comment', 'posts/1/comments/1')
    const loader = new ResourceLoader(ctx)
    await loader.load([Post, Comment])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 1)
    assert.equal(loader.resources.post.slug, 'hello-world')

    assert.property(loader.resources, 'comment')
    assert.instanceOf(loader.resources.comment, Comment)
    assert.equal(loader.resources.comment.id, 1)
    assert.equal(loader.resources.comment.slug, 'nice-post')
  })

  test('do not load resource for optional missing param', async ({ assert }) => {
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
    await post2.related('comments').create({ title: 'Awesome post', slug: 'awesome-post' })

    const ctx = getContextForRoute(app, 'posts/:post/comments/:comment?', 'posts/1/comments')
    const loader = new ResourceLoader(ctx)
    await loader.load([Post, Comment])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.property(loader.resources, 'post')
    assert.instanceOf(loader.resources.post, Post)
    assert.equal(loader.resources.post.id, 1)
    assert.equal(loader.resources.post.slug, 'hello-world')

    assert.notProperty(loader.resources, 'comment')
  })

  test('do not load resource for param with missing model', async ({ assert }) => {
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
    await post2.related('comments').create({ title: 'Awesome post', slug: 'awesome-post' })

    const ctx = getContextForRoute(app, 'posts/:post/comments/:comment?', 'posts/1/comments/1')
    const loader = new ResourceLoader(ctx)
    await loader.load([null, Comment])

    await rollback(app.container.resolveBinding('Adonis/Lucid/Database'))

    assert.notProperty(loader.resources, 'post')
    assert.property(loader.resources, 'comment')
    assert.instanceOf(loader.resources.comment, Comment)
    assert.equal(loader.resources.comment.id, 1)
    assert.equal(loader.resources.comment.slug, 'nice-post')
  })
})
