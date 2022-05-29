/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ApplicationContract } from '@ioc:Adonis/Core/Application'

/**
 * AdonisJS provider for registering the middleware to the container
 */
export default class RmbProvider {
  constructor(protected app: ApplicationContract) {}

  public register() {
    this.app.container.bind('Adonis/Addons/RmbMiddleware', () => {
      const { RouteModelBindingMiddleware } = require('../src/middleware/route_model_binding')
      return new RouteModelBindingMiddleware(this.app)
    })
  }
}
