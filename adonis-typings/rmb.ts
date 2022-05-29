/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Addons/RmbMiddleware' {
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { ApplicationContract } from '@ioc:Adonis/Core/Application'

  export interface RouteModelBindingMiddlewareContract {
    new (app: ApplicationContract): {
      handle(ctx: HttpContextContract, next: () => void): any
    }
  }

  const RouteModelBindingMiddleware: RouteModelBindingMiddlewareContract
  export default RouteModelBindingMiddleware
}
