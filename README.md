# intelligent-chat-ui

基于langchain4j的智能聊天系统ui页面，实现了登录注册页面、用户端主页面、管理端主页面。用户端主页面是以组件的形式展示在视图上，管理端主页面通过路由切换视图。

## 技术栈

Vue3+TS、ElementPlus、echarts、pinia、websocket、axios

## 项目安装

```sh
npm install
```

### 编译

```sh
npm run dev
```

### 打包

```sh
npm run build
```

## 前后端连接

配置信息位于根目录下的vite.config.ts，默认端口5173，后端地址：localhost:8080

## 注

api和types都在对应的stores下未作拆分
