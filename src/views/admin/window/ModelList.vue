<!-- views/admin/window/ModelList.vue -->
<template>
  <div class="model-management-container">
    <!-- 头部区域 -->
    <div class="header">
      <h2>大模型管理</h2>
      <div class="actions">
        <el-button type="primary" @click="openAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          添加模型
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="平台名称">
          <el-input
            style="width: 200px"
            v-model="searchForm.platformName"
            placeholder="请输入平台名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="模型名称">
          <el-input
            style="width: 200px"
            v-model="searchForm.modelName"
            placeholder="请输入模型名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            style="width: 150px"
            clearable
          >
            <el-option label="Chat" value="Chat" />
            <el-option label="Multi" value="Multi" />
            <el-option label="Deep" value="Deep" />
            <el-option label="Tool" value="Tool" />
            <el-option label="Embedding" value="Embedding" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.used"
            placeholder="状态"
            clearable
            style="width: 120px"
          >
            <el-option label="已启用" :value="1" />
            <el-option label="未启用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="用户">
          <el-select
            v-model="searchForm.userId"
            placeholder="请选择用户"
            clearable
            filterable
          >
            <el-option
              v-for="user in modelStore.adminUser"
              :key="user.id"
              :label="`${user.userName} (${user.name})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据表格 -->

    <div class="table-container">
      <el-table
        :data="modelStore.pageModel.list"
        border
        stripe
        v-loading="modelStore.isLoading"
        style="width: 100%"
        height="calc(100vh - 350px)"
        @sort-change="handleSortChange"
      >
        <el-table-column
          prop="platform"
          label="平台"
          width="120"
          sortable="custom"
          fixed
        />
        <el-table-column
          prop="platformName"
          label="平台名称"
          width="150"
          sortable="custom"
        />
        <el-table-column
          prop="userName"
          label="创建者"
          width="120"
          sortable="custom"
        />
        <el-table-column
          prop="modelName"
          label="模型名称"
          width="180"
          sortable="custom"
        />
        <el-table-column
          prop="type"
          label="类型"
          width="120"
          sortable="custom"
        />
        <el-table-column prop="used" label="状态" width="100" sortable="custom">
          <template #default="scope">
            <el-tag :type="scope.row.used ? 'success' : 'info'">
              {{ scope.row.used ? '已启用' : '未启用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="createTime"
          label="创建时间"
          width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{ formatTotalTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="updateTime"
          label="更新时间"
          width="180"
          sortable="custom"
        >
          <template #default="scope">
            {{
              scope.row.updateTime
                ? formatTotalTime(scope.row.updateTime)
                : '--'
            }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="handleEdit(scope.row)"
              v-if="scope.row.used == 0"
            >
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              @click="handleClose(scope.row.id)"
              v-if="scope.row.used == 1"
            >
              <el-icon>
                <CloseBold />
              </el-icon>
              关闭
            </el-button>
            <el-button
              size="small"
              @click="handleOpen(scope.row.id)"
              v-if="scope.row.used == 0"
            >
              <el-icon><Select /></el-icon>
              开启
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row.id)"
              v-if="scope.row.used == 0"
            >
              <el-icon>
                <Delete />
              </el-icon>
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
        :total="modelStore.pageModel.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑模型' : '添加模型'"
      width="40%"
    >
      <el-form
        :model="formData"
        label-width="100px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="平台名称" prop="platformName">
          <el-select
            v-model="formData.platformId"
            placeholder="请选择平台名称"
            clearable
            filterable
          >
            <el-option
              v-for="platform in modelStore.myPlatforms"
              :key="platform.id"
              :label="`${platform.platformName}(${platform.platform})`"
              :value="platform.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模型名称" prop="modelName">
          <el-input v-model="formData.modelName" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="Chat" value="Chat" />
            <el-option label="Multi" value="Multi" />
            <el-option label="Deep" value="Deep" />
            <el-option label="Tool" value="Tool" />
            <el-option label="Embedding" value="Embedding" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button v-if="dialog.isEdit" type="primary" @click="updateModel"
          >修改</el-button
        >
        <el-button v-if="!dialog.isEdit" type="primary" @click="submitForm"
          >确认</el-button
        >
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, h } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, CloseBold, Select } from '@element-plus/icons-vue';
import { useModelStore } from '@/stores/admin/modelStore';
import { formatTotalTime } from '@/utils/time';
import type { ModelQuery, ModelRequest } from '@/stores/admin/modelStore';

const modelStore = useModelStore();

// 表单引用
const formRef = ref();

// 分页配置
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  isAsc: false,
  sortBy: 'createTime'
});

const searchForm = reactive<ModelQuery>({
  platformName: null,
  modelName: null,
  type: null,
  used: null,
  platformId: null,
  userId: null,
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize,
  isAsc: pagination.isAsc,
  sortBy: pagination.sortBy
});

// 对话框状态
const dialog = reactive({
  visible: false,
  isEdit: false
});

// 表单数据
const formData = reactive<ModelRequest>({
  id: null,
  platformId: null,
  modelName: null,
  type: null,
  used: null
});

// 表单验证规则
const formRules = {
  platform: [{ required: true, message: '请选择平台', trigger: 'change' }],
  platformId: [{ required: true, message: '请输入平台名称', trigger: 'blur' }],
  modelName: [{ required: true, message: '请输入模型名称', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }]
};

// 初始化加载数据
onMounted(async () => {
  await modelStore.fetchPlatform();
  fetchModels();
  if (modelStore.adminUser.length === 0) {
    await modelStore.fetchAdmins();
  }
});

// 排序变化处理
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  pagination.sortBy = prop;
  pagination.isAsc = order === 'ascending';
  fetchModels();
};

// 获取模型列表
const fetchModels = async () => {
  const params = {
    ...searchForm,
    ...pagination
  };
  await modelStore.fetchModels(params);
};

// 搜索处理
const handleSearch = () => {
  pagination.pageNo = 1;
  fetchModels();
};

// 重置搜索
const resetSearch = () => {
  searchForm.platformName = null;
  searchForm.modelName = null;
  searchForm.type = null;
  searchForm.used = null;
  searchForm.userId = null;
  searchForm.platformId = null;
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchModels();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchModels();
};

// 打开添加对话框
const openAddDialog = () => {
  dialog.visible = true;
  dialog.isEdit = false;
  resetForm();
};

// 编辑模型
const handleEdit = (model: any) => {
  dialog.visible = true;
  dialog.isEdit = true;
  Object.assign(formData, model);
};

// 重置表单
const resetForm = () => {
  formData.id = null;
  formData.used = null;
  formData.platformId = null;
  formData.modelName = null;
  formData.type = null;
};

// 提交表单
const submitForm = async () => {
  try {
    await modelStore.addModel(formData);
    if (modelStore.error) {
      ElMessage.error(modelStore.error);
    } else {
      ElMessage.success('模型添加成功！');
    }
    dialog.visible = false;
    resetForm();
    fetchModels();
  } catch (error) {
    ElMessage.error((error as Error).message || '添加失败');
  }
};

// 修改模型
const updateModel = async () => {
  try {
    await modelStore.updateModel(formData);
    if (modelStore.error) {
      ElMessage.error(modelStore.error);
    } else {
      ElMessage.success('模型修改成功！');
    }
    dialog.visible = false;
    resetForm();
    fetchModels();
  } catch (error) {
    ElMessage.error((error as Error).message || '修改失败');
  }
};

// 删除模型
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('确定要删除该模型吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await modelStore.deleteModel(id);
    if (modelStore.error) {
      ElMessage.error(modelStore.error);
    } else {
      ElMessage.success('模型删除成功！');
    }
  });
};

// 开启模型
const handleOpen = async (id: number) => {
  const request = {
    id: id,
    platformId: null,
    modelName: null,
    type: null,
    used: 1
  };
  ElMessageBox.confirm('确定要开启该模型吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await modelStore.updateModel(request);
    if (modelStore.error) {
      ElMessage.error(modelStore.error);
    } else {
      fetchModels();
      ElMessage.success('模型开启成功！');
    }
  });
};

// 关闭模型
const handleClose = async (id: number) => {
  const request = {
    id: id,
    platformId: null,
    modelName: null,
    type: null,
    used: 0
  };
  ElMessageBox.confirm('确定要关闭该模型吗？（关闭后第二天才可删除）', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await modelStore.updateModel(request);
    if (modelStore.error) {
      ElMessage.error(modelStore.error);
    } else {
      fetchModels();
      ElMessage.success('模型关闭成功！');
    }
  });
};
</script>

<style scoped>
.model-management-container {
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
  scrollbar-color: var(--admin-scrollbar-thumb-color) var(--admin-scrollbar-track-color);
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

/* 响应式调整 */
@media (max-width: 768px) {
  .model-management-container {
    height: auto;
    min-height: 100vh;
  }

  :deep(.el-table) {
    height: auto !important;
    max-height: 500px;
  }
}
</style>
