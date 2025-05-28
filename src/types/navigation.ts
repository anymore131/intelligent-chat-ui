// types/navigation.ts
import type { Component } from 'vue';

export type MenuKey = 'message' | 'aiMessage' | 'rag' | 'system' | 'contact';
export interface WindowComponents {
  default: Component; // 未选择列表项时显示的组件
  detail: Component; // 选择列表项后显示的详情组件
}

export interface MenuItem {
  key: MenuKey;
  name: string;
}
