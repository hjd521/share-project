let shouldTrack = false
let targetMap = new Map()
let effectStack = []
let activeEffect = null 
let trackStack = []
let uid = 0
// 暂停监听
export function pauseTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = false
}
// 启动监听
export function enableTracking() {
  trackStack.push(shouldTrack)
  shouldTrack = true
}
// 回复上一次的监听状态
export function resetTracking() {
  const last = trackStack.pop()
  shouldTrack = last === undefined ? true : last
}
// 收集依赖
export function track(target, type, key) {
  if (!shouldTrack || activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
    activeEffect.deps.push(dep)
  }
}
export function trigger(target, type, key, nValue, oValue) {
  // 拿到存储的dep数组
  let depsMap = targetMap.get(target)
  let effects = new Set()
  if (!depsMap) {
    return
  }
  if (key !== 'undefined') {
    depsMap.get(key).forEach((effect) => {
      effects.add(effect)
    })
  }
  effects.forEach((item) => {
    item()
  })
}
function isEffect(fn) {
  return fn._isEffect === 'true'
}
export function effect(fn, options = {}) {
  // 防止传入的fn已经
  if (isEffect(fn)) { // 
    fn = fn.raw
  }
  const effect = createReactiveEffect(fn, options)
  if (!options.lazy) {
    effect()
  }
  return effect
}
function cleanup(effect) {
  console.log('清除')
}
function createReactiveEffect(fn, options) {
  const effect = function() {
    if (!effect.active) {
      return options.scheduler ? undefined : fn()
    }
    if (!effectStack.includes(effect)) {
      cleanup(effect)
      try {
        enableTracking() // 设置可以被监听
        effectStack.push(effect) // 将当前effect入栈
        activeEffect = effect // 设置活动effect
        return fn() // 执行fn
      } finally {
        effectStack.pop() // 最后将effect出栈
        resetTracking() // 出栈-恢复之前是否可以被检测的状态
        activeEffect = effectStack[effectStack.length - 1] // 设置活动的effect，恢复
      }
    }
  }
  effect.id = uid++ // uid
  effect._isEffect = true // 标记为effect
  effect.active = true
  effect.raw = fn // 拿到原始函数
  effect.deps = [] // 存储被观测的属性。
  effect.options = options // 存储属性
  return effect
}