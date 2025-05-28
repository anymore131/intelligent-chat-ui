<template>
  <div class="window-container">
    <div class="header">
      <h2>大模型平台管理</h2>
      <div class="button-group">
        <el-button type="primary" @click="openAddPlatformDialog">
          <el-icon>
            <Plus />
          </el-icon>
          添加平台
        </el-button>
      </div>
    </div>

    <div class="table-wrapper">
      <el-table
        :data="platforms"
        border
        style="width: 100%"
        height="calc(100vh - 220px)"
      >
        <el-table-column prop="platform" label="平台" width="100" />
        <el-table-column prop="platformName" label="平台名称" width="100" />
        <el-table-column prop="userName" label="用户" width="120" />
        <el-table-column label="apiKey" width="250">
          <template #default="scope">
            <span v-if="scope.row.showApiKey">{{ scope.row.apiKey }}</span>
            <span v-else>********</span>
            <el-button
              v-if="scope.row.showApiKey"
              size="small"
              type="text"
              @click.stop="copyApiKey(scope.row.apiKey)"
              class="copy-btn"
            >
              <el-icon>
                <DocumentCopy />
              </el-icon>
            </el-button>
          </template>
        </el-table-column>
        <el-table-column label="地址" width="250">
          <template #default="scope">
            <a
              :href="scope.row.apiAddress"
              target="_blank"
              rel="noopener noreferrer"
              class="api-address-link"
            >
              {{ scope.row.apiAddress }}
            </a>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="180">
          <template #default="scope">
            {{ formatTotalTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="toggleVisibility(scope.row)">
              <el-icon>
                <View />
              </el-icon>
              显示
            </el-button>
            <el-button size="small" @click="editPlatform(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
              修改
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deletePlatform(scope.row.id)"
            >
              <el-icon>
                <Delete />
              </el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加/编辑平台对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEditing ? '修改平台' : '添加平台'"
      width="40%"
    >
      <el-form :model="platformForm" label-width="120px">
        <el-form-item label="平台">
          <el-input v-model="platformForm.platform" />
        </el-form-item>
        <el-form-item label="平台名称">
          <el-input v-model="platformForm.platformName" />
        </el-form-item>
        <el-form-item label="API Key">
          <el-input
            v-model="platformForm.apiKey"
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="API地址">
          <el-input v-model="platformForm.apiAddress" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitPlatform">
            {{ isEditing ? '保存修改' : '添加' }}
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Plus,
  View,
  Edit,
  Delete,
  DocumentCopy
} from '@element-plus/icons-vue';
import { useModelStore } from '@/stores/admin/modelStore.ts';
import { useUserStore } from '@/stores/userStore.ts';
import { formatTotalTime } from '@/utils/time';

const modelStore = useModelStore();
const userStore = useUserStore();

const dialogVisible = ref(false);
const isEditing = ref(false);

onMounted(() => {
  modelStore.fetchPlatform();
});

const platforms = computed(() => {
  return modelStore.platforms.map((platform) => ({
    ...platform,
    showApiKey: false // 默认不显示真实API Key
  }));
});

// 当前选中的平台
const currentPlatform = ref({
  id: 0,
  userId: '',
  platform: '',
  platformName: '',
  apiKey: '',
  apiAddress: '',
  createTime: ''
});

const toggleVisibility = (platform: any) => {
  if (userStore.id == platform.userId) {
    platform.showApiKey = !platform.showApiKey;
  } else {
    ElMessage.error('您无权限查看！');
  }
};

// 平台表单
const platformForm = reactive({
  id: 0,
  platform: '',
  platformName: '',
  apiKey: '',
  apiAddress: ''
});

// 打开添加平台对话框
const openAddPlatformDialog = () => {
  isEditing.value = false;
  resetPlatformForm();
  dialogVisible.value = true;
};

// 编辑平台
const editPlatform = (platform: any) => {
  isEditing.value = true;
  Object.assign(platformForm, platform);
  dialogVisible.value = true;
};

// 提交平台表单
const submitPlatform = async () => {
  if (isEditing.value) {
    try {
      await modelStore.updatePlatform(platformForm);
      if (!modelStore.error) {
        ElMessage.success('平台信息修改成功！');
        dialogVisible.value = false;
      } else {
        ElMessage.error(modelStore.error);
      }
    } catch (error) {
      ElMessage.error('修改失败');
    }
  } else {
    try {
      await modelStore.addPlatform(platformForm);
      if (!modelStore.error) {
        ElMessage.success('平台添加成功！');
        dialogVisible.value = false;
      } else {
        ElMessage.error(modelStore.error);
      }
    } catch (error) {
      ElMessage.error('添加失败');
    }
  }
};

// 删除平台
const deletePlatform = async (id: number) => {
  try {
    await modelStore.deletePlatform(id);
    if (!modelStore.error) {
      ElMessage.success('平台删除成功！');
    } else {
      ElMessage.error(modelStore.error);
    }
  } catch (error) {
    ElMessage.error('删除失败');
  }
};

// 重置平台表单
const resetPlatformForm = () => {
  platformForm.id = 0;
  platformForm.platform = '';
  platformForm.platformName = '';
  platformForm.apiKey = '';
  platformForm.apiAddress = '';
};

const copyApiKey = (key: string) => {
  navigator.clipboard
    .writeText(key)
    .then(() => {
      ElMessage.success('API Key 已复制到剪贴板');
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制');
    });
};
</script>

<style scoped>
.window-container {
  background-color: var(--admin-bg-color);
  color: var(--admin-text-color);
  border-radius: 4px;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.button-group {
  margin-left: 10px;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 优化表格滚动条样式 */
:deep(.el-table__body-wrapper) {
  scrollbar-width: thin;
  scrollbar-color: var(--admin-scrollbar-thumb-color)
    var(--admin-scrollbar-track-color);
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-track {
  background: var(--admin-scrollbar-track-color);
  border-radius: 4px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb {
  background-color: var(--admin-scrollbar-thumb-color);
  border-radius: 4px;
}

:deep(.el-table__body-wrapper)::-webkit-scrollbar-thumb:hover {
  background-color: var(--admin-scrollbar-thumb-hover-color);
}

/* 固定列样式调整 */
:deep(.el-table__fixed-right) {
  height: 100% !important;
}

.api-key-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.copy-btn {
  margin-left: 8px;
  color: var(--el-color-primary);
}

.api-address-link {
  color: var(--admin-a-color);
  text-decoration: none;
  transition: color 0.2s;
  word-break: break-all;
}

.api-address-link:hover {
  color: var(--admin-a-hover-color);
  text-decoration: underline;
}

.api-address-link:active {
  color: var(--admin-a-active-color);
}

/* 如果需要为长地址添加省略号效果 */
.api-address-link.ellipsis {
  display: inline-block;
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.el-table {
  margin-top: 20px;
}

.el-button + .el-button {
  margin-left: 8px;
}
</style>
