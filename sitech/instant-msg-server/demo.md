# 即时通讯-消息推送使用说明

&emsp;&emsp;首先从 master 更新代码

## 更新依赖

&emsp;&emsp;我新添加了依赖 socket.io，在工程中执行更新

```
  yarn install
```

## 页面使用

&emsp;&emsp;我在/src/api 的 sokcet.handle.js 中对 socket.io 客户端做了封装。使得连接更加严谨，同时简化了使用操作。但是暂时只考虑提供由服务端返回消息给页面，页面向客户端发起消息现在没有实现，一时半会也不考虑实现。

```
import SocketHandle from '../../../../api/socket.handle'

let handle = new SocketHandle()
handle.loginRoom('456').then(() => {
  console.log('listen')
  handle.listen('test', resp => {
    console.log(resp)
  })
})
setTimeout(() => {
  console.log('close')
  handle.close()
}, 40000)
```

&emsp;&emsp;首先，new SocketHandle 实例时会配置连接的服务器路径（已经在 constants 中配置）  
&emsp;&emsp;其次，首次请求服务器时，会启动连接后台（该操作被我封装了）  
&emsp;&emsp;然后，loginRoom 是指在服务器上建立了独立的通讯空间（类似于 qq 聊天室）  
&emsp;&emsp;最后，监听某一个事件，该动作相当于某一个消息类型，指定接收某类消息  
&emsp;&emsp;上述的 loginRoom 并不是个必要操作  
以下是浏览器控制台的输出日志：

```
> is connecting to server                         socket.handle.js?7dab:29
> socketIO connect success                        socket.handle.js?7dab:32
> going to login room id:456,type:loginWhenFirst  socket.handle.js?7dab:60
> login room success                              socket.handle.js?7dab:64
> listen                                          home.vue?250d:23
> ready to listen event eventName:test            socket.handle.js?7dab:88
> close                                           home.vue?250d:29
> going to disconnect                             socket.handle.js?7dab:102
```

### 连接房间

&emsp;&emsp;demo 如下：

```
handle.loginRoom('456').then(() => {
  console.log('listen')
})
```

&emsp;&emsp;相当于建立一个“qq 聊天室”，这个入参‘456’则是“聊天室”的 id，后面还有一个隐式的参数 type，type 有三种模式，默认是 loginWhenFirst。当“聊天室”建立，那么当前连接便可以监听其中产生的信息（例如，服务端向“聊天室”中推送消息时）。

1. loginWhenFirst，只允许第一个进入房间的连接存在，其他被阻止
2. loginWhenLast，只允许最后进入房间的连接存在，之前的会被剔除
3. loginWhenever，不校验，直接加入该房间（非特殊情况不建议使用；1 和 2 中代码存在逻辑 bug，没有对复数情况进行判断，所以使用该方试时，则不应该再用 1 和 2）

### 监听事件

&emsp;&emsp;如下：

```
  handle.listen('test', resp => {
    console.log(resp)
  })
```

&emsp;&emsp;建立“聊天室”并不是一个必要操作，也可以直接监听事件，那么就是只是监听全局的事件  
&emsp;&emsp;如果像上面先建立“聊天室”，再监听事件‘test’，则可以监听到全局的‘test’事件，和“聊天室”内的事件。

### code

&emsp;&emsp;诸如：连接、建立房间等操作，需要等待服务器返回是否成功。服务器返回的事件为‘downmsg’，该事件也是 listen 方法的默认监听事件。  
&emsp;&emsp;服务器默认返回‘downmsg’的消息我封装了五种消息：

1. { code: '2001', msg: 'connect success' } 服务器连接成功
2. { code: '2002', msg: 'login room (id:' + id + ') success' } 房间建立成功
3. { code: '2003', msg: err.message } 建立房间时异常
4. { code: '2004', msg: 'your room id(' + id + ') already exist' }
   // 无法登录房间，该房间已经启用
5. { code: '2005', msg: 'you have kicked out room (id' + id + ')' }
   // 被强制踢出房间

## 消息下发服务

接口路径：
[http://172.18.231.87:3000/project/94/interface/api/934](http://172.18.231.87:3000/project/94/interface/api/934)  
接口示例：  
&emsp;&emsp;入参，‘roomId'为非必填，不填则全局发送消息。‘eventName’必须传入，否则不允许发送。‘data’为透传字段，不做处理，直接发送给页面。入参：

```
{
  "ROOT": {
    "BODY": {
      "roomId": "456",
      "eventName": "test",
      "data": {}
    }
  }
}
```

&emsp;&emsp;出参，不论下发成功还是失败都会返回‘0000’。出参：

```
{
  "ROOT": {
    "BODY": {
      "RETURN_CODE": "0000",
      "RETURN_MSG": "ok"
    }
  }
}
```
