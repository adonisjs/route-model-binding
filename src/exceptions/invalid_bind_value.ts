/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception } from '@poppinss/utils'
import { string } from '@poppinss/utils/build/helpers'

/**
 * Raised when trying to inject a primitive value like "StringConstructor"
 * to a class constructor or method
 */
export class InvalidBindValueException extends Exception {
  public static invoke(value: any, parentName: string, index: number) {
    const primitiveName = `{${value.name} Constructor}`
    const errorMessage = `Cannot bind "${primitiveName}" as ${string.ordinalize(
      index
    )} parameter to "${parentName}" method. Make sure to type hint a class constructor`

    return new this(errorMessage, 500, 'E_INVALID_BIND_VALUE')
  }
}
