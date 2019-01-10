# 敏感接口加固

&emsp;&emsp;目前前后端交互过程中没有考虑过敏感数据的安全问题，极易被攻击者利用，擅自篡改敏感数据使得接口被攻击。

## 整改思路

1. 敏感数据存储后台，不允许直接使用前台的数据
2. 关联接口进行依赖校验，必须成功完成前置接口，才能调用下一个接口。

## 接口整改

&emsp;&emsp;现在 wsg 中使用一个公共的 Controller 接受前端调用的接口，然后调用对应的 hsf 服务。现在需要将这部分逻辑提取出来形成单独的 Controller，并为其添加自己单独的逻辑。

### 选号、选占接口

#### 选号接口修改

&emsp;&emsp;接口前端调用的文件为`op_web_view_o2o\apps\serviceapps\pub-ui\service_js\shopInfoWrite.js`，用户下单的页面  
&emsp;&emsp;原有的选号接口在`op_web_view_o2o\online-ui\js\ajaxconfig.js`中配置的路径为：

```js
 'share-selectSerialNumber': '/o2o/wsg/def/com_sitech_o2o_contact_service_ISelectNumServiceSvc_selectNum', //分享业务移网号码选择
```

&emsp;&emsp;即使用了 wsg 中公用的 Controller 转发请求到后台各个域。现在需要进行改造，创建新的专用 Controller。其中的代码逻辑和原有的公共逻辑没有变化，仅增加将返回的选号数组保存 wsg 的 session 中，提供选占接口使用。例如：

```js
session.setItem("selectNumArray", JSON.toJSONString(["186xxxx8680","155xxxx9680","173xxxx9680"])
```

&emsp;&emsp;新的选号接口路径建议为：`/o2o/wsg/selectNum`  
&emsp;&emsp;<b>改造点：</b>

1. 创建新的 Controller，其中实现保存返回选号数据到 session
2. 新的 Controller 路径需要加入免登录校验配置中
3. 前端`ajaxconfig.js`中的 share-selectSerialNumber 的 key 对应的值更改为新的链接路径

#### 选占接口修改

&emsp;\$emsp;接口前端调用的文件为`op_web_view_o2o\apps\serviceapps\pub-ui\service_js\shopInfoWrite.js`，用户下单的页面  
&emsp;&emsp;原有的选号接口在`op_web_view_o2o\online-ui\js\ajaxconfig.js`中配置的路径为：

```js
'share-serialNumberStateChange': '/o2o/wsg/def/com_sitech_o2o_contact_service_ISelectNumServiceSvc_changeNumStatus'
```

&emsp;&emsp;这个接口原来也是使用的公共 Controller 转到各个域。现在需要进行调整，创建单独的 Controller，校验入参中的校验参数，‘选占号码’不允许传入具体的手机号码，只允许传入对应选号时保存在 session 中的标识。然后取下 session 中的数据替换该字段数据。  
&emsp;&emsp;判断后台服务是否返回选占成功，如果选占成功，则将选占成功的号码保存在 session 中。例如：`session.setItem("checkedNum", "183xxxx9680")`  
&emsp;&emsp;新的选号接口路径建议为：`/o2o/wsg/changeNumStatus`  
&emsp;&emsp;<b>改造点：</b>

1. 创建新的 Controller，校验‘选占号码’的入参必须为标识，然后从 session 中能取到该数据，在替换掉选在号码字段内容。
2. 新的 Controller 路径需要加入免登录校验配置中
3. 前端`ajaxconfig.js`中的 share-serialNumberStateChange 的 key 对应的值更改为新的链接路径。

### 订单归集接口

&emsp;&emsp;接口前端调用的文件为`op_web_view_o2o\apps\serviceapps\pub-ui\service_js\shopInfoWrite.js`，用户下单的页面  
&emsp;&emsp;原有的选号接口在`op_web_view_o2o\online-ui\js\ajaxconfig.js`中配置的路径为：

```js
'share-preSubmit':'/o2o/wsg/def/com_sitech_o2o_trade_service_ITradePreSubmitServiceSvc_insertITradePreSubmitTable',
```

&emsp;&emsp;现在订单归集接口需要修改为选占号码不从前台传输，该从 wsg 的 session 中获取选占号码。  
&emsp;&emsp;创建新的 Controller，复制原有公共 Controller 的调用 hsf 的逻辑。当 Controller 被调用时，从 session 中获取 key（`checkedNum`）对应的手机号码，判断号码准确性后放置在请求报文对应的`serialNumber`字段，（位置大概在{"array":[{"serialNumber":"xxx"}]}）  
&emsp;&emsp;<b>改造点：</b>

1. 创建新的 Controller，从 session 中取下‘选占号码’，判断准确性后放入入参中对应位置，替换原数据。
2. 新的 Controller 路径需要加入免登录校验配置中
3. 前端`ajaxconfig.js`中的 share-preSubmit 的 key 对应的值更改为新的链接路径。

### 支付接口

&emsp;&emsp;通过代码走查，并询问前后台开发陈庆、廖云辉、柴铭。<b>基本确认订单归集到支付，这部分流程中“不存在被篡改金额规避支付金额数量”的风险。</b>  
&emsp;&emsp;移网下单（零元商品），该场景中，前台传递 goodsFee 字段给后台，但是传递的是空字符串，后台判断为零元商品，此处既然是零元商品，则不可能篡改更低。  
&emsp;&emsp;权益商品（有价商品），该场景中，前台不会直接传递支付金额给后台，只会传递用于展示的金额参数，真正支付时会通过接口查询对应商品的价格。

### 后激活接口

&emsp;&emsp;订单只有在激活之后才能使用订购的手机卡。询问后台开发后确认，后激活一共调用四个接口，一个查询接口一个辅助接口，两个关键性接口。最后的活体认证，即后激活最后确认成功的接口，该接口存在被攻击的风险，后台没有做接口之间的关联。  
&emsp;&emsp;经过分析发现，<b>该接口可能出现被篡改数据激活成功的现象。</b>  
&emsp;&emsp;我们不会直接暴露腾讯优图的接口给前台，而是做了封装，暴露自己的服务给前台。  
&emsp;&emsp;我们自己封装的“OCR 接口”与“人脸核身”接口之间没有关联。“人脸核身”接口可以被直接调用，通过之后还需要进行人工审核，才能正式通过。  
&emsp;&emsp;我们封装的“人脸核身”接口被直接调用，可以被篡改视频、证件信息。篡改的信息会被透传给优图，他们也可能用这些信息系统判断认为检测通过。我们此处没有做校验，直接信任优图返回的成功接口。虽然后面还有人工审核，但是系统还是有风险的。  
&emsp;&emsp;原有的选号接口在`op_web_view_o2o\online-ui\js\ajaxconfig.js`中配置的路径为：

```js
'activation-faceBodyVerify':'/o2o/wsg/def/com_sitech_o2o_trade_service_ICardActivationServiceSvc_faceBodyVerifyForAct',

```

&emsp;&emsp;<b>改造点：</b>

1. 增加校验逻辑，在我们封装的“人脸核身”接口中，在调用优图人脸核身接口之前，判断传入的证件号码是否为下单证件号码，若不是不予进行下一步。
