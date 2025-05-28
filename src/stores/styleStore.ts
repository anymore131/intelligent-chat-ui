// stores/styleStore.ts
import { defineStore } from 'pinia';

type Theme = 'light' | 'dark' | 'pink';

export const useStyleStore = defineStore('style', {
  state: () => ({
    currentTheme: 'light' as Theme
  }),

  actions: {
    // 初始化主题（应用启动时调用）
    initTheme() {
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      const systemPrefersDark = window.matchMedia?.(
        '(prefers-color-scheme: dark)'
      ).matches;

      this.currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
      this.applyTheme(this.currentTheme);

      // 监听系统主题变化
      if (window.matchMedia) {
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', (e) => {
            if (!localStorage.getItem('theme')) {
              // 只有用户未手动选择时才跟随系统
              this.setTheme(e.matches ? 'dark' : 'pink');
            }
          });
      }
    },

    // 应用主题到DOM
    applyTheme(theme: Theme) {
      const root = document.documentElement;

      // 移除所有主题类
      root.classList.remove('light-theme', 'dark-theme', 'pink-theme');
      // 添加当前主题类
      root.classList.add(`${theme}-theme`);
      // 更新当前状态
      this.currentTheme = theme;
      // 保存到本地存储
      localStorage.setItem('theme', theme);
    },

    // 切换主题
    toggleTheme() {
      const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
      this.setTheme(newTheme);
    },

    // 设置特定主题
    setTheme(theme: Theme) {
      this.applyTheme(theme);
    }
  }
});
