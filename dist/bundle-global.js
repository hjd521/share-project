var bundle = (function (exports) {
  'use strict';

  function isObject(data) {
    return Array.isArray(data) || Object.prototype.toString.call(data) === '[object Object]'
  }
  function isString(key) {
    return typeof key === 'string'
  }
  function isIntegerKey(key) {
    return  isString(key) &&
    key !== 'NaN' &&
    key[0] !== '-' &&
    '' + parseInt(key, 10) === key
  }
  const hasOwnProperty = Object.prototype.hasOwnProperty;
  function hasOwn(target,key) {
    return hasOwnProperty.call(target,key)
  }

  let shouldTrack = false;
  let targetMap = new Map();
  let effectStack = [];
  let activeEffect = null; 
  let trackStack = [];
  let uid = 0;
  // 启动监听
  function enableTracking() {
    trackStack.push(shouldTrack);
    shouldTrack = true;
  }
  // 回复上一次的监听状态
  function resetTracking() {
    const last = trackStack.pop();
    shouldTrack = last === undefined ? true : last;
  }
  // 收集依赖
  function track(target, type, key) {
    if (!shouldTrack || activeEffect === undefined) {
      return
    }
    let depsMap = targetMap.get(target);
    if (!depsMap) {
      targetMap.set(target, (depsMap = new Map()));
    }
    let dep = depsMap.get(key);
    if (!dep) {
      depsMap.set(key, (dep = new Set()));
    }
    if (!dep.has(activeEffect)) {
      dep.add(activeEffect);
      activeEffect.deps.push(dep);
    }
  }
  function trigger(target, type, key, nValue, oValue) {
    // 拿到存储的dep数组
    let depsMap = targetMap.get(target);
    let effects = new Set();
    if (!depsMap) {
      return
    }
    if (key !== 'undefined') {
      depsMap.get(key).forEach((effect) => {
        effects.add(effect);
      });
    }
    effects.forEach((item) => {
      item();
    });
  }
  function isEffect(fn) {
    return fn._isEffect === 'true'
  }
  function effect(fn, options = {}) {
    // 防止传入的fn已经
    if (isEffect(fn)) { // 
      fn = fn.raw;
    }
    const effect = createReactiveEffect(fn, options);
    if (!options.lazy) {
      effect();
    }
    return effect
  }
  function cleanup(effect) {
    console.log('清楚');
  }
  function createReactiveEffect(fn, options) {
    const effect = function() {
      if (!effect.active) {
        return options.scheduler ? undefined : fn()
      }
      if (!effectStack.includes(effect)) {
        cleanup();
        try {
          enableTracking(); // 设置可以被监听
          effectStack.push(effect); // 将当前effect入栈
          activeEffect = effect; // 设置活动effect
          return fn() // 执行fn
        } finally {
          effectStack.pop(); // 最后将effect出栈
          resetTracking(); // 出栈-恢复之前是否可以被检测的状态
          activeEffect = effectStack[effectStack.length - 1]; // 设置活动的effect，恢复
        }
      }
    };
    effect.id = uid++; // uid
    effect._isEffect = true; // 标记为effect
    effect.active = true;
    effect.raw = fn; // 拿到原始函数
    effect.deps = []; // 存储被观测的属性。
    effect.options = options; // 存储属性
    return effect
  }

  const get = createGetter();
  const set = createSetter();
  let TrackOpTypes = {
    GET: 'get',
    SET: 'set',
    ADD: 'add'
  };
  function hasChanged(n,o) {
    return !Object.is(n, 0)
  }
  function createGetter(isReadonly = false, shallow = false) {
    return function get(target,key,receiver) {
      console.log('get');
      const res = Reflect.get(target, key, receiver);
      // 如果不是readonly那么收集依赖
      if(!isReadonly){
        track(target,TrackOpTypes.GET,key);
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
      let oldValue = target[key];
      let hadKey = Array.isArray(target) && isIntegerKey(key) ? Number(key) < target.length : hasOwn(target,key);
      const result = Reflect.set(target, key, value, receiver);
      if(!hadKey){
        // 新增 
        trigger(target,TrackOpTypes.ADD,key);
      }else if(hasChanged(oldValue)){
        // 修改 
        trigger(target,TrackOpTypes.SET,key);
      }
      return result
    }
  }
  const mutableHandlers = {
    get,
    set
  };

  /**
   * 
   * @param {*} target :object
   * @returns proxy instance
   */
  let readonlyMap = new Map();
  let reactiveMap = new Map();
  function reactive$1(target) {
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
    let proxyMap = isReadonly ? readonlyMap : reactiveMap;
    let exist = proxyMap.get(target); // 判断当前对象是否在map中
    if(exist) {
      return exist
    }
    // 这里还要对target做是否可以被监听的判断，比如是否是冻结的对象。是否是vue生成的可以被跳过的对象。
    const proxy = new Proxy(target, baseHandlers); // 设置proxy代理get和set
    proxyMap.set(target, proxy);
    return proxy
  }

  exports.effect = effect;
  exports.reactive = reactive$1;

  Object.defineProperty(exports, '__esModule', { value: true });

  return exports;

}({}));
//# sourceMappingURL=bundle-global.js.map
