# 从零开始

## 目标

&emsp;&emsp;现在我想搭建一个服务器，作为 websocket 服务器的同时，还需要能够接受 http 请求，并将该请求通过 websocket 转发到前端。

## 设想

&emsp;&emsp;使用 koa2 作为服务器，同时使用 socket.io 作为 websocket 服务器。不使用 koa 组件化的 socket.io。
&emsp;&emsp;koa-generator 教授搭建开发环境
