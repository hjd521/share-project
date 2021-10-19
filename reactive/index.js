import { isObject } from "../utils"
import {mutableHandlers} from './handlers'
/**
 * 
 * @param {*} target :object
 * @returns proxy instance
 */
let readonlyMap = new Map()
let reactiveMap = new Map()
export function reactive(target) {
  return createReactiveObject(target, false, mutableHandlers)
}
// 创建代理
// 判断是否是对象或者数组
// 判断是否已经代理过了
// 
function createReactiveObject(target, isReadonly, baseHandlers) {
  if (!isObject(target)) {
    return target
  }
  let proxyMap = isReadonly ? readonlyMap : reactiveMap
  let exist = proxyMap.get(target) // 判断当前对象是否在map中
  if(exist) {
    return exist
  }
  // 这里还要对target做是否可以被监听的判断，比如是否是冻结的对象。是否是vue生成的可以被跳过的对象。
  const proxy = new Proxy(target, baseHandlers) // 设置proxy代理get和set
  proxyMap.set(target, proxy);
  return proxy
}