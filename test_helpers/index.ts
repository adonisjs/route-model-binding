/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { Filesystem } from '@poppinss/dev-utils'
import { DatabaseContract } from '@ioc:Adonis/Lucid/Database'
import { Application } from '@adonisjs/core/build/standalone'

export const fs = new Filesystem(join(__dirname, '__app'))

/**
 * Setup AdonisJS application
 */
export async function setup() {
  const application = new Application(fs.basePath, 'web', {
    providers: ['@adonisjs/core', '@adonisjs/lucid'],
  })

  await fs.add(
    'config/app.ts',
    `
    export const profiler = { enabled: true }
    export const appKey = 'averylongrandomsecretkey'
    export const http = {
      trustProxy: () => {},
      cookie: {}
    }
  `
  )

  await fs.add(
    'config/database.ts',
    `
    import { join } from 'path'

    export const connection = 'sqlite'
    export const connections = {
      sqlite: {
        client: 'sqlite3',
        connection: {
          filename: join(__dirname, '..', 'database', 'db.sqlite')
        }
      }
    }
  `
  )

  await application.setup()
  await application.registerProviders()
  await application.bootProviders()

  return application
}

/**
 * Migrate database
 */
export async function migrate(database: DatabaseContract) {
  await database.connection().schema.createTable('posts', (table) => {
    table.increments('id')
    table.string('title').notNullable()
    table.string('slug').notNullable()
  })

  await database.connection().schema.createTable('comments', (table) => {
    table.increments('id')
    table.integer('post_id').notNullable().unsigned().references('id').inTable('posts')
    table.string('title').notNullable()
    table.string('slug').notNullable()
  })
}

/**
 * Rollback database
 */
export async function rollback(database: DatabaseContract) {
  await database.connection().schema.dropTable('posts')
  await database.connection().schema.dropTable('comments')
  await database.manager.closeAll()
}

/**
 * Returns the context for a given route
 */
export function getContextForRoute(app: Application, route: string, url: string) {
  const HttpContext = app.container.resolveBinding('Adonis/Core/HttpContext')
  const Route = app.container.resolveBinding('Adonis/Core/Route')

  Route.get(route, () => {})
  Route.commit()

  const matchingRoute = Route.match(url, 'GET')!

  const ctx = HttpContext.create(matchingRoute.route.pattern, matchingRoute.params)
  return ctx
}
