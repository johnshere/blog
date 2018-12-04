# 单例

&emsp;&emsp;js 中继承是采用原型链实现的，因此只要实现对象的属性是单例，那么它就就是单例属性

## 私有属性

&emsp;&emsp;在不利用 ES6 新提案的情况下，利用作用域来模拟私有属性似乎是唯一的解决方案了。
&emsp;&emsp;不论是闭包还是其他的方式，都是利用一个变量作用域之外不可见来实现
文件内实现一个对象：

```
var Person = (function () {
  var age
  function Person () { }
  Person.prototype.getAge = function () {
    return age
  Person.prototype.setAge = function (payload) {
    age = payload
  }
  return Person
})()
```

单文件模块：

```
let name
export class Person {
  get name () {
    return name
  }
  set name (payload) {
    name = payload
  }
}
```
