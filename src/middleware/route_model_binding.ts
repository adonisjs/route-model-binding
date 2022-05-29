/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { esmResolver } from '@poppinss/utils'
import { inject } from '@adonisjs/core/build/standalone'
import type { ApplicationContract } from '@ioc:Adonis/Core/Application'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { ResourceLoader } from '../resource_loader'

@inject(['Adonis/Core/Application'])
export class RouteModelBindingMiddleware {
  constructor(private application: ApplicationContract) {}

  public async handle(ctx: HttpContextContract, next: () => Promise<any>) {
    ctx.resources = {}

    /**
     * Ensure the route exists for which we want to load resources
     */
    const route = ctx.route
    if (!route) {
      return next()
    }

    /**
     * Ensure the route has a controller.method handler. We do not load
     * resources for inline callbacks
     */
    const handler = route.meta.resolvedHandler
    if (!handler || handler.type === 'function') {
      return next()
    }

    /**
     * Ensure the bindings for the given controller method are defined
     */
    const controllerConstructor = esmResolver(this.application.container.use(handler))
    if (!controllerConstructor['bindings'] || !controllerConstructor['bindings'][handler.method]) {
      return next()
    }

    /**
     * Load resources
     */
    const resourceLoader = new ResourceLoader(ctx)
    await resourceLoader.load(controllerConstructor['bindings'][handler.method])
    ctx.resources = resourceLoader.resources

    await next()
  }
}
