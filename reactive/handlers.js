import { hasOwn, isIntegerKey, isObject } from "../utils/index.js"
import { track,trigger } from "./effect.js"
const get = createGetter()
const set = createSetter()
const shallowGet = createGetter(false, true)
const shallowGet = createSetter()
let TrackOpTypes = {
  GET: 'get',
  SET: 'set',
  ADD: 'add'
}
function hasChanged(n,o) {
  return !Object.is(n, 0)
}
// 收集依赖
function createGetter(isReadonly = false, shallow = false) {
  return function get(target,key,receiver) {
    const res = Reflect.get(target, key, receiver)
    // 如果不是readonly那么收集依赖
    if(!isReadonly){
      track(target,TrackOpTypes.GET,key)
    }
    // 如果为浅收集，那么直接返回值，不再继续继续往下走了
    if(shallow){
        return res;
    }
    // 不是shallow，那么应该对value的类型继续reactive
    if(isObject(res)){ // vue2 是一上来就递归，vue3 是当取值时会进行代理 。 vue3的代理模式是懒代理
      return isReadonly ? readonly(res) : reactive(res)
    }
    return res;
  }
}
function createSetter() {
  return function set(target,key,value, receiver) {
    let oldValue = target[key]
    let hadKey = Array.isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target,key);
    const result = Reflect.set(target, key, value, receiver);
    if(!hadKey){
      // 新增 
      trigger(target,TrackOpTypes.ADD,key,value);
    }else if(hasChanged(oldValue,value)){
      // 修改 
      trigger(target,TrackOpTypes.SET,key,value,oldValue)
    }
    return result
  }
}
export const mutableHandlers = {
  get,
  set
}