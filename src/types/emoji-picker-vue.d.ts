// src/types/emoji-picker-vue.d.ts
declare module 'emoji-picker-vue' {
  import { DefineComponent } from 'vue';
  const EmojiPicker: DefineComponent<{
    native?: boolean;
    'disable-skin-tones'?: boolean;
    // 添加其他你需要的props
  }>;
  export default EmojiPicker;
}
