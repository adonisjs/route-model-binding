/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import 'reflect-metadata'
import { bind } from '../src/decorators/bind'

class User {}

export class UsersController {
  @bind()
  public show(_, __: User) {}
}
