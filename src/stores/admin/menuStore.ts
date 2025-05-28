// stores/admin/menuStore.ts
import { defineStore } from 'pinia';

interface MenuState {
  selectMenu: number;
}

export const useMenuStore = defineStore('menu', {
  state: (): MenuState => {
    const savedMenu = sessionStorage.getItem('selectedMenu');
    return {
      selectMenu: savedMenu ? parseInt(savedMenu) : 10
    };
  },
  actions: {
    setSelectMenu(id: number) {
      this.selectMenu = id;
      sessionStorage.setItem('selectedMenu', id.toString());
    }
  }
});
