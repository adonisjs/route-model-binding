/*
 * @adonisjs/route-model-binding
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { LucidModel, LucidRow } from '@ioc:Adonis/Lucid/Orm'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

export type Param = {
  parent: null | string
  scoped: boolean
  name: string
  param: string
  lookupKey: string | '$primaryKey'
}

export interface RouteModel extends LucidModel {
  findForRequest?(ctx: HttpContextContract, param: Param, value: any): LucidRow | Promise<LucidRow>
  routeLookupKey?: string

  new (): {
    findRelatedForRequest?(
      ctx: HttpContextContract,
      param: Param,
      value: any
    ): LucidRow | Promise<LucidRow>
  } & LucidRow
}
