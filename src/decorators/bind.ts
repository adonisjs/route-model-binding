/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RouteModel } from '../contracts'
import { InvalidBindValueException } from '../exceptions/invalid_bind_value'

function isPrimtiveConstructor(value: any): boolean {
  return [String, Function, Object, Date, Number, Boolean].indexOf(value) > -1
}

/**
 * Automatically query Lucid models for the current HTTP
 * request. The decorator is meant to work only
 * with controllers
 */
export function bind(models?: (RouteModel | null)[]) {
  return function (target: any, propertyKey: string) {
    const methodParams = models || Reflect.getMetadata('design:paramtypes', target, propertyKey)

    /**
     * Instantiate static bindings property on the controller class
     */
    const parentBindings = target.constructor.bindings
    if (!target.constructor.hasOwnProperty('bindings')) {
      Object.defineProperty(target.constructor, 'bindings', {
        value: parentBindings ? Object.assign({}, parentBindings) : {},
      })

      Object.defineProperty(target, 'getHandlerArguments', {
        value: function (ctx: HttpContextContract) {
          const handler = ctx.route!.meta.resolvedHandler
          if (!handler || handler.type === 'function') {
            return [ctx]
          }

          const bindings = this.constructor.bindings[handler.method]
          if (!bindings) {
            return [ctx]
          }

          return bindings.reduce(
            (result: any[], binding: any, index: number) => {
              if (binding !== null) {
                const paramAtIndex = ctx.route!.params[index]
                result.push(ctx.resources[paramAtIndex])
              }
              return result
            },
            [ctx]
          )
        },
      })
    }

    target.constructor.bindings[propertyKey] = target.constructor.bindings[propertyKey] || []
    methodParams.forEach((param: any, index: number) => {
      /**
       * The first method param is always the HTTP context
       */
      if (models || index !== 0) {
        /**
         * Disallow type hinting interfaces, types or any other type
         */
        if (isPrimtiveConstructor(param)) {
          throw InvalidBindValueException.invoke(
            param,
            `${target.constructor.name}.${propertyKey}`,
            index
          )
        }

        target.constructor.bindings[propertyKey].push(param)
      }
    })
  }
}
