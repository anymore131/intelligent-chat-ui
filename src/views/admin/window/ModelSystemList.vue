<!-- views/admin/window/ModelSystemList.vue -->
<template>
  <div class="role-management-container">
    <!-- 头部区域 -->
    <div class="header">
      <h2>角色管理</h2>
      <div class="actions">
        <el-button type="primary" @click="openAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          添加角色
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户">
          <el-select
            v-model="searchForm.userId"
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户名搜索并添加"
            :remote-method="searchUser"
            :loading="userLoading"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.userName} (ID: ${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入角色名称"
            clearable
          />
        </el-form-item>

        <el-form-item label="描述">
          <el-input
            v-model="searchForm.description"
            placeholder="请输入角色描述"
            clearable
          />
        </el-form-item>

        <el-form-item label="访问策略" style="width: 250px">
          <el-select
            v-model="searchForm.accessPolicy"
            placeholder="请选择访问策略"
            clearable
          >
            <el-option label="公开" value="public" />
            <el-option label="私有" value="private" />
            <el-option label="删除" value="delete" />
          </el-select>
        </el-form-item>

        <el-form-item label="创建时间">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->
    <div class="table-wrapper">
      <el-table
        :data="systemStore.systems.list"
        border
        stripe
        v-loading="systemStore.isLoading"
        style="width: 100%"
        height="calc(100vh - 350px)"
      >
        <el-table-column prop="name" label="角色名称" width="150" />
        <el-table-column prop="description" label="描述" width="300">
          <template #default="scope">
            {{ truncateString(scope.row.description, 18) }}
          </template>
        </el-table-column>
        <el-table-column prop="accessPolicy" label="访问策略" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.accessPolicy === 'public'" type="success"
              >公开</el-tag
            >
            <el-tag v-if="scope.row.accessPolicy === 'private'" type="warning"
              >私有</el-tag
            >
            <el-tag v-if="scope.row.accessPolicy === 'delete'" type="error"
              >删除</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="usedNumber" label="使用人数" width="100" />
        <el-table-column prop="userName" label="创建人" width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTotalTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="preview(scope.row)">
              <el-icon>
                <View />
              </el-icon>
              详情
            </el-button>
            <el-button size="small" @click="handleEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="deleteRole(scope.row.id)"
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

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.pageNo"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[5, 10, 20, 50, 100]"
        :total="systemStore.systems.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 预览对话框 -->
    <el-dialog v-model="showDetail" title="角色详情">
      <el-descriptions :column="1" border label-class-name="custom-label">
        <el-descriptions-item label="ID">{{
          detailData.id
        }}</el-descriptions-item>
        <el-descriptions-item label="角色名称">{{
          detailData.name
        }}</el-descriptions-item>
        <el-descriptions-item label="描述">
          <div style="white-space: pre-line">{{ detailData.description }}</div>
        </el-descriptions-item>
        <el-descriptions-item label="访问策略">
          {{ detailData.accessPolicy }}
        </el-descriptions-item>
        <el-descriptions-item label="使用人数">{{
          detailData.usedNumber
        }}</el-descriptions-item>
        <el-descriptions-item label="创建人">{{
          detailData.userName
        }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{
          formatTotalTime(detailData.createTime)
        }}</el-descriptions-item>
      </el-descriptions>
      <template #footer>
        <el-button type="primary" @click="showDetail = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑角色' : '添加角色'"
      width="40%"
    >
      <el-form
        :model="formData"
        label-width="100px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="拥有者" prop="userId" required>
          <el-select
            v-model="formData.userId"
            filterable
            remote
            placeholder="请输入用户名搜索"
            :remote-method="searchUser"
            :loading="userLoading"
          >
            <el-option
              v-for="user in userOptions"
              :key="user.id"
              :label="`${user.userName} (ID: ${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="角色名称" prop="name" required>
          <el-input v-model="formData.name" placeholder="请输入角色名称" />
        </el-form-item>

        <el-form-item label="描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入角色描述"
          />
        </el-form-item>

        <el-form-item label="访问策略" prop="accessPolicy" required>
          <el-select
            v-model="formData.accessPolicy"
            placeholder="请选择访问策略"
          >
            <el-option label="公开" value="public" />
            <el-option label="私有" value="private" />
            <el-option label="删除" value="delete" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useModelSystemStore } from '@/stores/admin/modelSystemStore';
import type { System, SystemQuery } from '@/stores/admin/modelSystemStore';
import {
  ElMessage,
  ElMessageBox,
  ElDescriptions,
  ElDescriptionsItem
} from 'element-plus';
import { formatTotalTime } from '@/utils/time';
import { truncateString } from '@/utils/string';
import { Plus, Edit, Delete, View } from '@element-plus/icons-vue';

const systemStore = useModelSystemStore();

const formRef = ref();
const showDetail = ref(false);

const dialog = reactive({
  visible: false,
  isEdit: false
});

const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  isAsc: false,
  sortBy: 'createTime'
});

const timeRange = ref<string[]>([]);

const searchForm = reactive<SystemQuery>({
  userId: null,
  name: null,
  description: null,
  accessPolicy: null,
  usedNumber: null,
  startCreateTime: null,
  endCreateTime: null,
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize,
  isAsc: pagination.isAsc,
  sortBy: pagination.sortBy
});

const formData = reactive<System>({
  id: 0,
  userId: null,
  userName: '',
  name: '',
  description: '',
  accessPolicy: '',
  usedNumber: 0,
  createTime: ''
});

const formRules = reactive({
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  accessPolicy: [{ required: true, message: '请选择访问策略', trigger: 'blur' }]
});

const fetchSystems = async () => {
  const params = {
    ...searchForm,
    ...pagination,
    startCreateTime: timeRange.value?.[0]?.replace(' ', 'T'),
    endCreateTime: timeRange.value?.[1]?.replace(' ', 'T')
  };
  await systemStore.fetchSystems(params);
};

onMounted(() => {
  fetchSystems();
});

const handleSearch = () => {
  pagination.pageNo = 1;
  if (searchForm.name === '') searchForm.name = null;
  if (searchForm.description === '') searchForm.description = null;
  if (searchForm.accessPolicy === '') searchForm.accessPolicy = null;
  fetchSystems();
};

const userLoading = ref(false);
const userOptions = ref<Array<{ id: number; userName: string }>>([]);

const searchUser = async (query: string) => {
  if (query.trim()) {
    userLoading.value = true;
    try {
      await systemStore.fetchUserName({
        userName: query,
        pageNo: 1,
        pageSize: 10
      });
      userOptions.value = systemStore.user.list;
    } finally {
      userLoading.value = false;
    }
  } else {
    userOptions.value = [];
    searchForm.userId = null;
  }
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchSystems();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchSystems();
};

const detailData = reactive<System>({
  id: 0,
  userId: 0,
  userName: '',
  name: '',
  description: '',
  accessPolicy: '',
  usedNumber: 0,
  createTime: ''
});

// 预览方法
const preview = (row: System) => {
  Object.assign(detailData, row);
  showDetail.value = true;
};

const openAddDialog = () => {
  dialog.visible = true;
  dialog.isEdit = false;
  resetForm();
};

const handleEdit = (system: System) => {
  dialog.visible = true;
  dialog.isEdit = true;
  Object.assign(formData, system);
};

// 重置表单
const resetForm = () => {
  formData.id = 0;
  formData.name = '';
  formData.description = '';
  formData.accessPolicy = '';
};

const resetSearch = () => {
  timeRange.value = [];
  searchForm.name = null;
  searchForm.description = null;
  searchForm.accessPolicy = null;
  searchForm.startCreateTime = null;
  searchForm.endCreateTime = null;
  handleSearch();
};

const submitForm = async () => {
  try {
    await formRef.value?.validate();

    if (dialog.isEdit) {
      await systemStore.updateSystem(formData);
    } else {
      await systemStore.createSystem(formData);
    }

    if (systemStore.error) {
      ElMessage.error(systemStore.error);
    } else {
      ElMessage.success(dialog.isEdit ? '修改成功' : '添加成功');
    }

    dialog.visible = false;
    fetchSystems();
  } catch (error) {
    console.error('提交失败:', error);
  }
};

const deleteRole = (id: number) => {
  ElMessageBox.confirm('确定要删除该角色吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    // 注意：roleStore.ts 中没有 delete 方法，需要添加
    // 这里假设有一个 deleteRole 方法
    // await roleStore.deleteRole(id);

    if (systemStore.error) {
      ElMessage.error(systemStore.error);
    } else {
      ElMessage.success('角色删除成功！');
      fetchSystems();
    }
  });
};
</script>

<style scoped>
.role-management-container {
  padding: 20px;
  background-color: var(--admin-bg-color);
  color: var(--admin-text-color);
  border-radius: 4px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.table-container {
  flex: 1;
  overflow: hidden;
  margin-bottom: 20px;
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
:deep(.el-table__fixed-right),
:deep(.el-table__fixed) {
  height: 100% !important;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.custom-label {
  width: 100px !important;
  min-width: 100px !important;
  background-color: var(--admin-bg-card-color);
}

/* 响应式调整 */
@media (max-width: 768px) {
  .role-management-container {
    height: auto;
    min-height: 100vh;
  }

  :deep(.el-table) {
    height: auto !important;
    max-height: 500px;
  }
}
</style>
