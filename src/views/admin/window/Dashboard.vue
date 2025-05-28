<!-- view/admin/window/Dashboard.vue -->
<template>
  <div class="dashboard-container">
    <h1 class="dashboard-title">控制台</h1>

    <div v-if="dashboardStore.isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>Loading...</p>
    </div>

    <div v-else class="scrollable-content">
      <!-- 每日AI调用数据 - 横向排列 -->
      <div class="stats-section horizontal-section">
        <div class="info-header">
          <h2 class="section-title">
            每日AI调用数据
            <el-button type="text" @click="navigateTo(32)">管理模型</el-button>
            <el-button type="text" @click="navigateTo(33)"
              >模型使用详情</el-button
            >
          </h2>
        </div>
        <div class="stats-cards horizontal-cards">
          <div class="stat-card" v-for="(item, key) in aiCallData" :key="key">
            <div class="stat-value">{{ item.value }}</div>
            <div class="stat-label">{{ item.label }}</div>
          </div>
        </div>
      </div>

      <div class="info-grid">
        <!-- 用户信息 -->
        <div class="info-card">
          <div class="info-header">
            <h3>用户信息</h3>
            <el-button type="text" @click="navigateTo(21)">管理用户</el-button>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">管理员</span>
              <span class="info-value">{{ dashboardStore.normal.admin }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">普通用户</span>
              <span class="info-value">{{ dashboardStore.normal.user }}</span>
            </div>
          </div>
        </div>

        <!-- 知识库信息 -->
        <div class="info-card">
          <div class="info-header">
            <h3>知识库信息</h3>
            <el-button type="text" @click="navigateTo(35)"
              >管理知识库</el-button
            >
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">知识库数量</span>
              <span class="info-value">{{ dashboardStore.normal.rag }}</span>
            </div>
          </div>
        </div>

        <!-- AI角色信息 -->
        <div class="info-card">
          <div class="info-header">
            <h3>AI角色信息</h3>
            <el-button type="text" @click="navigateTo(34)">管理角色</el-button>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">AI角色</span>
              <span class="info-value">{{ dashboardStore.normal.system }}</span>
            </div>
          </div>
        </div>

        <!-- 文件信息 -->
        <div class="info-card">
          <div class="info-header">
            <h3>文件信息</h3>
          </div>
          <div class="info-content">
            <div class="info-item">
              <span class="info-label">
                消息文件
                <el-button type="text" @click="navigateTo(42)">查看</el-button>
              </span>
              <span class="info-value">{{ dashboardStore.normal.system }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                知识库文件
                <el-button type="text" @click="navigateTo(43)">查看</el-button>
              </span>
              <span class="info-value">{{ dashboardStore.normal.system }}</span>
            </div>
            <div class="info-item">
              <span class="info-label">
                头像文件
                <el-button type="text" @click="navigateTo(41)">查看</el-button>
              </span>
              <span class="info-value">{{ dashboardStore.normal.system }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useDashboardStore } from '@/stores/admin/dashboardStore';
import { useMenuStore } from '@/stores/admin/menuStore';

const dashboardStore = useDashboardStore();
const menuStore = useMenuStore();

const aiCallData = computed(() => [
  { label: '普通', value: dashboardStore.chat.chat },
  { label: '深度思考', value: dashboardStore.chat.deep },
  { label: '多模态', value: dashboardStore.chat.multi },
  { label: '知识库调用', value: dashboardStore.chat.rag },
  { label: '联网搜索', value: dashboardStore.chat.web }
]);

// 导航方法
const navigateTo = (id: number) => {
  if (id) {
    menuStore.setSelectMenu(id);
  }
};

onMounted(() => {
  dashboardStore.getDashboard().then(() => {
    if (dashboardStore.error) {
      ElMessage.error(dashboardStore.error);
      dashboardStore.error = null;
    }
  });
});
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  color: var(--admin-text-color);
  background-color: var(--admin-bg-color);
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.dashboard-title {
  color: var(--admin-text-color);
  margin-bottom: 2rem;
  text-align: left;
  font-weight: 600;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  color: var(--admin-text-color);
}

.loading-spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-radius: 50%;
  border-top: 4px solid var(--admin-border-color);
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.scrollable-content {
  max-height: calc(100vh - 100px); /* 减去标题高度 */
  overflow-y: auto;
  padding-right: 8px; /* 防止滚动条遮挡内容 */

  /* 自定义滚动条样式 */
  scrollbar-width: thin;
  scrollbar-color: var(--admin-scrollbar-thumb-color)
    var(--admin-scrollbar-track-color);
}

.scrollable-content::-webkit-scrollbar {
  width: 8px;
}

.scrollable-content::-webkit-scrollbar-track {
  background: var(--admin-scrollbar-track-color);
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb {
  background-color: var(--admin-scrollbar-thumb-color);
  border-radius: 4px;
}

.scrollable-content::-webkit-scrollbar-thumb:hover {
  background-color: var(--admin-scrollbar-thumb-hover-color);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

/* 每日AI调用数据 - 横向布局 */
.horizontal-section {
  margin-bottom: 2rem;
}

.horizontal-cards {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
}

.horizontal-cards .stat-card {
  flex: 1;
  min-width: 150px;
  max-width: 200px;
}

/* 基础信息网格布局 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-card {
  background-color: var(--admin-bg-color);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.info-header {
  display: flex;
  color: var(--admin-text-color);
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid var(--admin-border-bottom-color);
  padding-bottom: 0.5rem;
}

.info-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #34495e;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: var(--admin-text-color);
  font-size: 0.95rem;
}

.info-value {
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--admin-a-color);
}

/* 统计卡片通用样式 */
.stat-card {
  background-color: var(--admin-bg-card-color);
  border-radius: 6px;
  padding: 1rem;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--admin-a-color);
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--admin-a-color);
  font-size: 0.9rem;
}

.section-title {
  color: var(--admin-text-color);
  margin-bottom: 2rem;
  font-size: 1.25rem;
  font-weight: 500;
}
</style>
