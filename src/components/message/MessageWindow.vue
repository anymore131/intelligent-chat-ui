<!-- components/message/MessageWindow.vue -->
<template>
  <div class="chat-window">
    <!-- 头部信息 -->
    <div class="chat-header">
      <div class="contact-info">
        <div class="contact-details">
          <h3>{{ messageStore.selectedContact!.name }}</h3>
        </div>
      </div>
    </div>

    <!-- 聊天记录区域 -->
    <div class="chat-messages" ref="messageContainer">
      <div
        v-for="message in messageStore.messages"
        :key="message.id"
        :class="[
          'message',
          message.senderId === userStore.id ? 'sent' : 'received'
        ]"
      >
        <img
          :src="userStore.avatarUrl"
          alt="User avatar"
          v-if="message.senderId === userStore.id"
          class="avatar"
        />
        <img
          :src="messageStore.selectedContact!.avatar"
          alt="User avatar"
          v-if="message.senderId !== userStore.id"
          class="avatar"
        />

        <div class="message-content">
          <!-- 文本消息 -->
          <template v-if="message.contentType === 1">
            <p>{{ message.content }}</p>
          </template>

          <!-- 图片消息 -->
          <template v-else-if="message.contentType === 2">
            <div class="file-message">
              <el-image
                :src="getFileInfo(message.content).filePath"
                :preview-src-list="[getFileInfo(message.content).filePath]"
                fit="cover"
                class="file-image"
                hide-on-click-modal
              />
            </div>
          </template>

          <!-- 文件消息 -->
          <template v-else-if="message.contentType === 3">
            <div
              class="file-message"
              @click="downloadFile(getFileInfo(message.content))"
            >
              <el-icon :size="24" class="file-icon">
                <component
                  :is="getFileIcon(getFileInfo(message.content).fileName)"
                />
              </el-icon>
              <div class="file-info">
                <span class="file-name">{{
                  getFileInfo(message.content).fileName
                }}</span>
                <span class="file-size">{{
                  getFileSize(getFileInfo(message.content).fileSize)
                }}</span>
              </div>
            </div>
          </template>

          <!-- 音频消息 -->
          <template v-else-if="message.contentType === 4">
            <div class="audio-message">
              <audio
                ref="audio"
                :src="getFileInfo(message.content).filePath"
                @ended="handleAudioEnded"
                controls
              />
              <span class="audio-name">
                {{ getFileInfo(message.content).fileName }}
              </span>
            </div>
          </template>
          <span class="message-time">{{ formatTime(message.createTime) }}</span>
        </div>
      </div>
      <!-- 加载更多指示器 -->
      <div
        class="loading-more"
        id="loading-more"
        ref="loadingMoreRef"
        v-if="!messageStore.isAll"
      >
        <el-button type="text" @click="getChat">点击加载更多</el-button>
      </div>
    </div>

    <!-- 输入区域 -->
    <div class="chat-input-area">
      <!-- 工具栏 -->
      <div class="toolbar">
        <div class="tool-buttons">
          <input
            type="file"
            ref="fileInput"
            style="display: none"
            multiple
            @change="handleFileSelect"
          />
          <Paperclip class="icon" title="添加文件" @click="triggerFileInput" />
          <Image class="icon" title="添加图片" @click="triggerImageInput" />
          <SmilePlus class="icon" title="添加表情" @click="toggleEmojiPicker" />
        </div>
      </div>

      <!-- 添加文件预览区域 -->
      <div class="file-preview" v-if="selectedFiles.length > 0">
        <div
          v-for="(file, index) in selectedFiles"
          :key="index"
          :class="['file-preview-item', `type-${getContentType(file)}`]"
        >
          <el-icon :size="20" class="file-icon">
            <component :is="getFileIcon(file.name, getContentType(file))" />
          </el-icon>
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">{{ getFileSize(file.size) }}</span>
          <el-icon class="remove-icon" @click="removeFile(index)">
            <Close />
          </el-icon>
        </div>
      </div>

      <!-- 输入框 -->
      <div class="input-wrapper">
        <el-input
          v-model="messageInput"
          type="textarea"
          placeholder="输入消息..."
          @keyup.enter.prevent="sendMessage"
          :autosize="{ minRows: 4, maxRows: 6 }"
        />
      </div>
      <div class="input-controls">
        <el-button
          type="primary"
          @click="sendMessage"
          :disabled="!messageInput.trim() && selectedFiles.length === 0"
        >
          发送
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import {
  Paperclip,
  Image,
  SmilePlus,
  Play,
  Pause,
  FileText,
  File,
  FileImage,
  FileAudio,
  FileVideo,
  Archive,
  FileCode
} from 'lucide-vue-next';
import { EmojiButton } from '@joeattardi/emoji-button';
import { ElMessage } from 'element-plus';
import { useMessageStore } from '@/stores/messageStore';
import { useUserStore } from '@/stores/userStore';
import type { Message } from '@/stores/messageStore';
import { formatTime } from '@/utils/time';

const messageStore = useMessageStore();
const userStore = useUserStore();
const messageInput = ref('');
const messageContainer = ref<HTMLElement | null>(null);

// 初始化时获取历史消息
onMounted(() => {
  init();
});

watch(
  () => messageStore.selectedContactId,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      messageStore.isAll = false;
      init();
    }
  }
);

const init = () => {
  messageStore.messages = [];

  if (messageStore.selectedContactId) {
    messageStore.fetchMessages({
      lastId: null,
      senderId: userStore.id,
      receiverId: messageStore.selectedContactId,
      pageSize: 20
    });
  }
};

// 获取历史记录
const getChat = () => {
  console.log(messageStore.messages);

  messageStore.fetchMessages({
    lastId: messageStore.messages[messageStore.messages.length - 1].id,
    senderId: userStore.id,
    receiverId: messageStore.selectedContactId as number,
    pageSize: 20
  });
};

// 发送消息
const sendMessage = async () => {
  try {
    // 如果有文本内容，先发送文本消息
    if (messageInput.value.trim()) {
      const textMessage = {
        toId: messageStore.selectedContactId as number,
        content: messageInput.value,
        contentType: 1
      };
      userStore.sendMessage(textMessage);
      messageStore.addMessage({
        id: messageStore.messages[0]?.id + 1 || Date.now(),
        senderId: userStore.id,
        receiverId: messageStore.selectedContactId as number,
        content: messageInput.value,
        contentType: 1,
        createTime: new Date().toISOString()
      } as Message);
      messageInput.value = '';
    }

    // 发送所有文件
    for (const file of selectedFiles.value) {
      const contentType = getContentType(file);
      const filePath = await messageStore.sendFile(
        messageStore.selectedContactId as number,
        contentType,
        file
      );

      if (filePath) {
        let content = '';
        if (contentType === 2 || contentType === 4) {
          // 图片和音频需要特殊结构
          content = JSON.stringify({
            fileName: file.name,
            filePath,
            fileSize: file.size,
            duration: contentType === 4 ? getAudioDuration(file) : null // 音频特有
          });
        } else {
          // 普通文件
          content = JSON.stringify({
            fileName: file.name,
            filePath,
            fileSize: file.size
          });
        }
        messageStore.addMessage({
          id: Date.now(),
          senderId: userStore.id,
          receiverId: messageStore.selectedContactId as number,
          content,
          contentType,
          createTime: new Date().toISOString()
        } as Message);
      }
    }

    // 清空已选文件
    selectedFiles.value = [];
  } catch (error) {
    ElMessage.error('发送消息失败');
    console.error('发送消息失败:', error);
  }
};

const getContentType = (file: File): number => {
  const imageTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp'
  ];
  const audioTypes = [
    'audio/mpeg',
    'audio/wav',
    'audio/ogg',
    'audio/mp3',
    'audio/x-wav'
  ];

  if (imageTypes.includes(file.type)) {
    return 2; // 图片
  } else if (audioTypes.includes(file.type)) {
    return 4; // 音频
  }
  return 3; // 其他都是普通文件
};

// 获取音频时长（需要创建临时对象）
const getAudioDuration = (file: File): Promise<number> => {
  return new Promise((resolve) => {
    const audio = new Audio();
    audio.src = URL.createObjectURL(file);
    audio.onloadedmetadata = () => {
      resolve(audio.duration);
      URL.revokeObjectURL(audio.src); // 释放内存
    };
    audio.onerror = () => resolve(0); // 出错返回0
  });
};

// 获取文件信息
const getFileInfo = (content: string) => {
  try {
    return JSON.parse(content);
  } catch (e) {
    return {
      fileName: '未知文件',
      filePath: '',
      fileSize: 0
    };
  }
};

// 获取文件图标
const getFileIcon = (fileName: string, contentType?: number) => {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  // 优先根据contentType判断
  if (contentType === 2) return FileImage; // 图片
  if (contentType === 4) return FileAudio; // 音频

  // 根据扩展名判断
  switch (extension) {
    // 图片类型
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'webp':
      return FileImage;
    // 音频类型
    case 'mp3':
    case 'wav':
    case 'ogg':
    case 'flac':
    case 'aac':
      return FileAudio;
    // 视频类型
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'mkv':
      return FileVideo;
    // 压缩文件
    case 'zip':
    case 'rar':
    case '7z':
      return Archive;
    // 文档类型
    case 'pdf':
      return FileText;
    case 'doc':
    case 'docx':
      return FileText;
    case 'xls':
    case 'xlsx':
      return FileText;
    case 'ppt':
    case 'pptx':
      return FileText;
    // 代码文件
    case 'js':
    case 'ts':
    case 'html':
    case 'css':
    case 'json':
      return FileCode;
    default:
      return File;
  }
};

// 格式化文件大小
const getFileSize = (bytes: number) => {
  if (!bytes) return '未知大小';
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB';
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB';
};

// 下载文件
const downloadFile = (fileInfo: any) => {
  if (!fileInfo.filePath) return;

  const link = document.createElement('a');
  link.href = fileInfo.filePath;
  link.download = fileInfo.fileName || 'download';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const audio = new Audio();
const currentAudioId = ref<string | number | null>(null);

// 处理音频自然结束
const handleAudioEnded = () => {
  currentAudioId.value = null;
};

const emojiButton = ref<EmojiButton | null>(null);
const emojiPickerVisible = ref(false);

// 初始化emoji选择器
const initEmojiPicker = () => {
  const picker = new EmojiButton({
    position: 'top-end',
    autoHide: false
  });

  picker.on('emoji', (selection) => {
    messageInput.value += selection.emoji;
    emojiPickerVisible.value = false;
  });

  emojiButton.value = picker;
};

// 切换emoji选择器显示
const toggleEmojiPicker = (event: MouseEvent) => {
  if (!emojiButton.value) return;

  if (emojiPickerVisible.value) {
    emojiButton.value.hidePicker();
    emojiPickerVisible.value = false;
  } else {
    emojiButton.value.showPicker(event.target as HTMLElement);
    emojiPickerVisible.value = true;
  }
};

// 组件挂载时初始化
onMounted(() => {
  initEmojiPicker();
});

const fileInput = ref<HTMLInputElement | null>(null);
const imageInput = ref<HTMLInputElement | null>(null);
const selectedFiles = ref<File[]>([]);

// 触发文件选择
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.accept = '*/*'; // 接受所有文件类型
    fileInput.value.click();
  }
};

// 触发图片选择
const triggerImageInput = () => {
  if (fileInput.value) {
    fileInput.value.accept = 'image/*'; // 只接受图片
    fileInput.value.click();
  }
};

// 处理文件选择
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    // 添加到已选文件列表
    selectedFiles.value = [...selectedFiles.value, ...Array.from(input.files)];
    // 清空输入值以便重复选择相同文件
    input.value = '';
  }
};

// 移除文件
const removeFile = (index: number) => {
  selectedFiles.value.splice(index, 1);
};
</script>

<style scoped>
.chat-window {
  height: 100vh;
  flex: 1;
  display: flex;
  flex-direction: column;
  background-color: var(--bg-color);
}

.chat-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--bg-color);
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.contact-details h3 {
  margin: 0;
  font-size: 16px;
}

.status {
  font-size: 12px;
  color: var(--text-shallow-color);
}

.header-actions {
  display: flex;
  gap: 16px;
}

.icon {
  cursor: pointer;
  color: var(--text-shallow-color);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column-reverse;
  position: relative;
}

.message {
  margin: 8px 0;
  max-width: 70%;
  display: flex;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin: 0 10px;
}

.message.sent {
  flex-direction: row-reverse;
  margin-left: auto;
}

.message.received {
  margin-right: auto;
}

.message-content {
  padding: 10px 14px;
  border-radius: 12px;
  position: relative;
}

.sent .message-content {
  background-color: var(--message-sent-bg-color);
  color: var(--text-opposite-color);
}

.received .message-content {
  background-color: var(--message-received-text-color);
  color: var(--text-color);
}

.message-content p {
  margin: 0;
  word-break: break-word;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
  background-color: var(--bg-color-light);
  cursor: pointer;
  transition: background-color 0.2s;
}

.file-message:hover {
  background-color: var(--bg-color-lighter);
}

.file-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  object-fit: cover;
}

.file-info {
  display: flex;
  flex-direction: column;
}

.file-name {
  font-size: 14px;
  word-break: break-all;
}

.file-size {
  font-size: 12px;
}

.audio-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 8px;
}

.audio-icon {
  cursor: pointer;
}

.audio-name {
  font-size: 14px;
}

.message-time {
  font-size: 12px;
  margin-top: 4px;
  opacity: 0.7;
  display: block;
}

.loading-more {
  text-align: center;
  padding: 0 10px 10px 10px;
  color: var(--text-shallow-color);
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.chat-input-area {
  border: 1px solid var(--border-color);
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin: 20px;
  padding: 16px;
}

.toolbar {
  position: relative;
  padding: 8px 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 12px;
}

.emoji-picker-container {
  position: absolute;
  bottom: 100%;
  right: 0;
  z-index: 1000;
  margin-bottom: 10px;
}

.tool-buttons {
  display: flex;
  gap: 16px;
}

.file-preview-item {
  display: flex;
  align-items: center;
  padding: 8px;
  margin-bottom: 6px;
  background: var(--bg-color-light);
  border-radius: 6px;
  position: relative;
}

/* 不同类型的不同颜色标记 */
.file-preview-item.type-2 {
  /* 图片 */
  border-left: 3px solid var(--el-color-primary);
}
.file-preview-item.type-3 {
  /* 文件 */
  border-left: 3px solid var(--el-color-info);
}
.file-preview-item.type-4 {
  /* 音频 */
  border-left: 3px solid var(--el-color-success);
}

.audio-duration {
  margin-left: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.file-preview-item {
  display: flex;
  align-items: center;
  padding: 6px;
  margin-bottom: 4px;
  background-color: var(--bg-color-lighter);
  border-radius: 4px;
}

.file-name {
  margin-left: 8px;
  margin-right: auto;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 200px;
}

.remove-icon {
  margin-left: 8px;
  cursor: pointer;
  color: var(--el-color-danger);
}

.remove-icon:hover {
  opacity: 0.8;
}

.input-wrapper {
  display: flex;
  gap: 12px;
}

.input-wrapper :deep(.el-textarea__inner) {
  resize: none;
  border-radius: 8px;
}

.input-controls {
  display: flex;
  margin-top: 10px;
  justify-content: flex-end;
}

.no-chat-selected {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-shallow-color);
  font-size: 16px;
  background-color: var(--bg-card-color);
}
</style>
