<!-- error/404.vue -->
<template>
  <div class="error-page">
    <div class="error-content">
      <el-result
        icon="error"
        title="404 页面不存在"
        sub-title="您访问的页面可能已丢失在数字宇宙中"
      >
        <template #extra>
          <el-button type="primary" @click="goHome">
            <el-icon>
              <HomeFilled />
            </el-icon>
            返回首页
          </el-button>
        </template>
      </el-result>
    </div>
  </div>
</template>

<script setup lang="ts">
import { HomeFilled } from '@element-plus/icons-vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.replace('/');
};
</script>

<style scoped>
.error-page {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.error-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80%;
  max-width: 600px;
  padding: 40px;
  background: var(--admin-bg-color);
  /* 半透明白色背景 */
  border-radius: 15px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  text-align: center;
}

/* 调整Element组件默认样式 */
:deep(.el-result) {
  padding: 0;
}

:deep(.el-result__title) {
  margin-top: 20px;
  color: var(--admin-text-color);
  font-size: 28px;
}

:deep(.el-result__subtitle) {
  margin: 15px 0 30px;
  color: var(--admin-btn-color);
  font-size: 16px;
  line-height: 1.6;
}

:deep(.el-button) {
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  transition: all 0.3s;
}

:deep(.el-button--primary) {
  background: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.el-button--primary:hover) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(64, 158, 255, 0.4);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .error-content {
    width: 90%;
    padding: 25px;
  }

  :deep(.el-result__title) {
    font-size: 22px;
  }

  :deep(.el-result__subtitle) {
    font-size: 14px;
  }
}
</style>
