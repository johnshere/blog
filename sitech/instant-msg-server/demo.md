# 即时通讯-消息推送使用说明

&emsp;&emsp;此处，在我的设想中现有的系统中对消息上行（即 client > server）是不存在问题，现在需要解决的是消息下行（即 server > client）。所以此处功能是为了解决消息下行而出现的。对于上下行并存的及时通讯暂时没有做处理。  
&emsp;&emsp;首先从 ~~master~~ **4development** 更新代码

> 即使用 socket.handle.js 文件，文件路径为[http://172.18.49.161/crm-isf/fast-integration-web/blob/4development/src/api/socket.handle.js](http://172.18.49.161/crm-isf/fast-integration-web/blob/4development/src/api/socket.handle.js)

## 更新依赖

&emsp;&emsp;我新使用了依赖 socket.io，在工程中执行更新

```
  yarn install
```

## 页面使用

&emsp;&emsp;我在/src/api 的 sokcet.handle.js 中对 socket.io 客户端做了封装。使得连接更加严谨，同时简化了使用操作。但是暂时只考虑提供由服务端返回消息给页面，页面向客户端发起消息现在没有实现，一时半会也不考虑实现。

```
import SocketHandle from '../../../../api/socket.handle'

let handle = new SocketHandle()
handle.connect(function (resp) {
  console.log(resp)
  handle.loginRoom('456', (resp) => {
    console.log('listen', resp)
    handle.listen('test', resp => {
      console.log(resp)
    })
  }, (error) => {
    console.log(error)
  })
}, function (er) {
  console.log(er)
})
setTimeout(() => {
  console.log('disconnect')
  handle.disconnect()
}, 40000)
```

~~首先，new SocketHandle 实例时会配置连接的服务器路径（已经在 constants 中配置）~~  
~~其次，首次请求服务器时，会启动连接后台（该操作被我封装了）~~  
**实例化之后，首先执行连接动作`handle.connect`，并提供异常回调（注意：如果连接服务器失败，会不断重连，会造成异常回调无限执行）**  
然后，loginRoom 是指在服务器上建立了独立的通讯空间（类似于 qq 聊天室），**不在使用 promise，采用回调，并提供异常回调**  
最后，监听某一个事件，该动作相当于某一个消息类型，指定接收某类消息  
上述的 loginRoom 并不是个必要操作  
以下是浏览器控制台的输出日志：

```
> is connecting to server
> socketIO connect success
> going to login room id:456,type:loginWhenFirst
> login room success
> listen
> ready to listen event eventName:test
> disconnect
> going to disconnect
```

### 连接房间

&emsp;&emsp;demo 如下：

```
handle.loginRoom('456', (resp) => {
  console.log('listen')
}, (error) => {
  console.log(error)
})

handle.loginRoom('456', 'loginWhenFirst', (resp) => {
  console.log('listen')
}, (error) => {
  console.log(error)
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
  handle.listen(resp => {
    console.log(resp)
  })
```

&emsp;&emsp;**默认监听事件为'downmsg'**

&emsp;&emsp;建立“聊天室”并不是一个必要操作，也可以直接监听事件，那么就是只是监听全局的事件  
&emsp;&emsp;如果像上面先建立“聊天室”，再监听事件‘test’，则可以监听到全局的‘test’事件，和“聊天室”内的事件。

### 默认事件消息

&emsp;&emsp;诸如：连接、建立房间等操作，需要等待服务器返回是否成功。~~服务器返回的事件为‘downmsg’，该事件也是 listen 方法的默认监听事件。~~  
&emsp;&emsp;服务器默认返回~~'downmsg'~~的消息我封装了五种消息：

1. eventName：connetResp { code: '2001', msg: 'connect success' } 服务器连接成功
2. eventName：loginRoomResp { code: '2002', msg: 'login room (id:' + id + ') success' } 房间建立成功
3. eventName：loginRoomResp { code: '2003', msg: err.message } 建立房间时异常
4. eventName：loginRoomResp { code: '2004', msg: 'your room id(' + id + ') already exist' }
   // 无法登录房间，该房间已经启用
5. eventName：loginRoomResp { code: '2005', msg: 'you have kicked out room (id' + id + ')' }
   // 被强制踢出房间

---

## 消息下发服务 - Server

&emsp;&emsp;后端服务工程源代码：[http://172.18.49.161/crm-isf/instant-msg-server.git](http://172.18.49.161/crm-isf/instant-msg-server.git)

&emsp;&emsp;socket.io 的服务端并没在此篇文章中体现，这里的服务端接口实际上是 http 接口，是提供给后台服务端各处业务代码调用的，用于下发消息。  
&emsp;&emsp;此处服务端实际是 socket.io 和 koa2 的整合体。

&emsp;&emsp;上述所有代码均为页面监听消息所做的准备，而下发的消息如何提供则是由服务端各个微服务调用统一的下发接口实现。

### 接口规范

接口路径：
[http://172.18.231.87:3000/project/94/interface/api/934](http://172.18.231.87:3000/project/94/interface/api/934)  
接口示例：  
~~入参，‘roomId'为非必填，不填则全局发送消息。‘eventName’必须传入，否则不允许发送。‘data’为透传字段，不做处理，直接发送给页面。~~

- roomId：可选字段，指定消息下发的‘聊天室’通讯通道
- eventName：必传字段，对应页面监听的事件，两者保持统一
- data：必传字段，透传给页面的数据，不做校验

  入参：

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

&emsp;&emsp;出参，不论下发成功还是失败都会返回‘0000’（**因为下发的消息房间、事件、监听者都不能保证一定存在，所以该接口只要被调用就默认返回成功，只有服务器异常时会返回其他结果**）。

- RETURN_CODE：返回编码
- RETURN_MSG：返回信息

出参：

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

## 场景

### 场景一：服务器异步通知

&emsp;&emsp;业务处理过程 http 的一次请求一次响应，在很多场景下是不能满足的，例如：**大文件报表生成、工作流流转**。这个时候就需要服务器异步通知了。

- 例一：一键生产场景，假若该场景下，后台工作流需要在多个业务场景下流转，则无法确定完成时间，并且存在多个结果响应。不同的环节都需要响应前端一次，并且根据环节的不同在页面展示不同的效果。
- 例二：一键启动之后，后台服务将会启动守护线程不断工作。原本在四川的处理方案，则是在守护线程之后提供额外的接口，不断轮询状态表更新前端页面数。即，同时维护两套并行的逻辑解决这个事情。而有此处的方案后，则可以在**守护线程中调用消息通知接口**。

&emsp;&emsp;可以根据每一个登录者工号创建一个通讯房间，当守护线程启动之后，不断对其下发消息。如下：

```
{
  "ROOT": {
    "BODY": {
      "roomId": "batchWriteCard" + staffId,
      "eventName": "machineOne",
      "data": {
        "time": "2018/12/10 18:53:44",
        "tradeId": "T2893474872735478",
        "phoneNo": "18866668888",
        "total": "131"
      }
    }
  }
}
```

### 场景二：实时消息推送

&emsp;&emsp;客户端消息推送，这个功能是十分强大的，但是我们所有的 web 产品中都没有这个功能。按我的设想，以后用户不可避免的会提出类似的需求，所以这个可以做提前的技术储备。

- 全局消息-不论用户处于何处页面都能接受消息。  
  --单页应用开发有别于传统的多页开发，可以在最上级父页面实现全局消息监听  
  --混合开发，原生与 web 本是两套系统，如果要消息通知，需要进一步分析
- 账号登录  
  --目前我们的 web 系统无法甄别一个账号是否多处登录，可以利用这个**房间**的概念实现  
  --业务受理消息、订单流转消息等改善用户体验

```
export default {
  name: 'App',
  created () {
    let handle = new SocketHandle()
    handle.connect(resp => {
      handle.loginRoom('w_18656557809', 'loginWhenFirst', (resp) => {
        handle.listen('adMsg', resp => {
          this.showADMessage(resp) // 显示广告
        })
        handle.listen('serviceMsg', resp => {
          this.showServiceMessage(resp) // 显示业务消息，提供点击跳转到受理页面
        })
      }, (error) => {
        console.log(error)
      })
    }, function (er) {
      console.log(er)
    })
  }
}
```

&emsp;&emsp;当该订单工作流转到写卡环节时，调用消息通知接口，对订单归属工号进行消息通知。例如，当登录用户有新出的需要处理的写卡任务时，给其推送一条消息。用户确认并点击后跳转到对应处理页面。**此处场景还需要完善功能，目前没有历史消息的累计存储，不会对未接收消息补发**

```
{
  "ROOT": {
    "BODY": {
      "roomId": "w_18656557809",
      "eventName": "test",
      "data": {
          msg: '您有一笔订到流转到写卡环节，请尽快处理'，
          url: 'app.html#writeCard?tradeId=T124467268744'
      }
    }
  }
}
```

### 场景三：实时聊天

&emsp;&emsp;即：即时通讯，大多数情况下即时通讯系统是可以独立于业务办理之外的。则此处可以使用‘聊天室’功能，在两个人之间建立独立的通讯房间（如：A.staffId+B.staffId），则可以实现两个者对话，甚至可以创建聊天群

<Valine></Valine>
