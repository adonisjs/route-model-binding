/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'

/**
 * Raised when trying to inject a primitive value like "StringConstructor"
 * to a class constructor or method
 */
export class MissingRelationshipException extends Exception {
  public static invoke(paramName: string, route: string, parentModel: string) {
    const errorMessage = `Cannot load "${paramName}" for route "${route}". Make sure to define it as a relationship on model "${parentModel}"`

    return new this(errorMessage, 500, 'E_MISSING_RELATIONSHIP')
  }
}
