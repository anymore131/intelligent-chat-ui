// main.ts
import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import '@/assets/styles/global.css';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import { useStyleStore } from '@/stores/styleStore';

const app = createApp(App);
const pinia = createPinia();

app.use(ElementPlus);
app.use(pinia);
app.use(router);

// 初始化用户状态
const userStore = useUserStore();
userStore.initialize();

// 注册 element-plus 图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 初始化主题
const styleStore = useStyleStore();
styleStore.initTheme();

// 延迟加载路由配置
import('./router').then(({ setupRouter }) => {
  setupRouter();
  app.mount('#app');
});
