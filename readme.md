### vue3响应式demo
#### 实现目标
* 实现一个对象或者数组在获取时候收集行为函数，设置时候触发收集的行为函数,对于下面的代码，我们希望obj.name变化时候effect包裹的函数可以重新执行。
```
    let {reactive, effect} = bundle
    let obj = reactive({
      name: 'hjd',
      age: 10
    })
    effect(() => {
      app.innerHTML = obj.name
    })
    obj.name = 'haha'
```
#### 具体流程
1. 实现reactive，拦截对于数据的访问，设置操作。
2. 在访问时候通过effect收集依赖的函数
3. 在更新时候进行触发。