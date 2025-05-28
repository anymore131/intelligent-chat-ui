// utils/error.ts
import { useUserStore } from '@/stores/userStore';

const userStore = useUserStore();

export const tokenError = (message: string) => {
  if (message.includes('Token 已过期') || message.includes('Token 无效')) {
    userStore.handleTokenExpired(message);
  }
};
