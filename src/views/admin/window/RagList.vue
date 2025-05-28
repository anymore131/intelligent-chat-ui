<!-- views/admin/window/RagList.vue -->
<template>
  <div class="rag-management-container">
    <!-- 头部区域 -->
    <div class="header">
      <h2>知识库管理</h2>
      <div class="actions">
        <el-button type="primary" @click="openAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          添加知识库
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="知识库名称">
          <el-input
            style="width: 200px"
            v-model="searchForm.name"
            placeholder="请输入知识库名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="创建者">
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
    <div class="table-container">
      <el-table
        :data="ragStore.rags.list"
        border
        stripe
        v-loading="ragStore.loading"
        style="width: 100%"
        height="calc(100vh - 350px)"
      >
        <el-table-column prop="id" label="ID" width="100" />
        <el-table-column prop="name" label="知识库名称" width="200" />
        <el-table-column prop="userId" label="创建者ID" width="150" />
        <el-table-column prop="userName" label="创建者" width="150" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTotalTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              type="danger"
              @click="handleDelete(scope.row.id)"
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
        :total="ragStore.rags.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑知识库' : '添加知识库'"
      width="40%"
    >
      <el-form
        :model="formData"
        label-width="100px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="知识库名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入知识库名称" />
        </el-form-item>
        <el-form-item label="所属用户" prop="userId" required>
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
        <el-form-item label="创建时间" prop="createTime">
          <el-date-picker
            v-model="formData.createTime"
            type="datetime"
            placeholder="选择创建时间"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button v-if="dialog.isEdit" type="primary" @click="updateRag"
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
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete } from '@element-plus/icons-vue';
import { useRagStore } from '@/stores/admin/ragStore';
import { formatTotalTime } from '@/utils/time';
import type { RagQuery, RagRequest } from '@/stores/admin/ragStore';

const ragStore = useRagStore();

// 表单引用
const formRef = ref();

// 分页配置
const pagination = reactive({
  pageNo: 1,
  pageSize: 10
});

const searchForm = reactive<RagQuery>({
  name: null,
  userId: null,
  startCreateTime: null,
  endCreateTime: null,
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize
});

// 对话框状态
const dialog = reactive({
  visible: false,
  isEdit: false
});

// 表单数据
const formData = reactive<RagRequest>({
  createTime: null,
  userId: null,
  name: null
});

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入知识库名称', trigger: 'blur' }],
  userId: [{ required: true, message: '请选择所属用户', trigger: 'change' }]
};

// 初始化加载数据
onMounted(async () => {
  fetchRags();
});

const timeRange = ref<string[]>([]);

// 获取知识库列表
const fetchRags = async () => {
  const params = {
    ...searchForm,
    ...pagination,
    startCreateTime: timeRange.value?.[0]?.replace(' ', 'T'),
    endCreateTime: timeRange.value?.[1]?.replace(' ', 'T')
  };
  await ragStore.fetchRags(params);
};

// 搜索处理
const handleSearch = () => {
  pagination.pageNo = 1;
  fetchRags();
};

// 重置搜索
const resetSearch = () => {
  searchForm.name = null;
  searchForm.userId = null;
  searchForm.startCreateTime = null;
  searchForm.endCreateTime = null;
  timeRange.value = [];
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchRags();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchRags();
};

// 打开添加对话框
const openAddDialog = () => {
  dialog.visible = true;
  dialog.isEdit = false;
  resetForm();
};

// 编辑知识库
const handleEdit = (rag: any) => {
  dialog.visible = true;
  dialog.isEdit = true;
  Object.assign(formData, rag);
};

// 重置表单
const resetForm = () => {
  formData.createTime = null;
  formData.userId = null;
  formData.name = null;
};

const userLoading = ref(false);
const userOptions = ref<Array<{ id: number; userName: string }>>([]);

const searchUser = async (query: string) => {
  if (query.trim()) {
    userLoading.value = true;
    try {
      await ragStore.fetchUserName({
        userName: query,
        pageNo: 1,
        pageSize: 10
      });
      userOptions.value = ragStore.user.list;
    } finally {
      userLoading.value = false;
    }
  } else {
    userOptions.value = [];
    searchForm.userId = null;
  }
};

// 提交表单
const submitForm = async () => {
  try {
    formData.createTime ? formData.createTime?.replace(' ', 'T') : null,
      await ragStore.createRag(formData);
    if (ragStore.error) {
      ElMessage.error(ragStore.error);
    } else {
      ElMessage.success('知识库添加成功！');
    }
    dialog.visible = false;
    resetForm();
    fetchRags();
  } catch (error) {
    ElMessage.error((error as Error).message || '添加失败');
  }
};

// 修改知识库
const updateRag = async () => {
  try {
    formData.createTime ? formData.createTime?.replace(' ', 'T') : null,
      await ragStore.updateRag(formData);
    if (ragStore.error) {
      ElMessage.error(ragStore.error);
    } else {
      ElMessage.success('知识库修改成功！');
    }
    dialog.visible = false;
    resetForm();
    fetchRags();
  } catch (error) {
    ElMessage.error((error as Error).message || '修改失败');
  }
};

// 删除知识库
const handleDelete = async (id: number) => {
  ElMessageBox.confirm('确定要删除该知识库吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await ragStore.deleteRag(id);
    if (ragStore.error) {
      ElMessage.error(ragStore.error);
    } else {
      ElMessage.success('知识库删除成功！');
      fetchRags();
    }
  });
};
</script>

<style scoped>
.rag-management-container {
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
:deep(.el-table__fixed-right) {
  height: 100% !important;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .rag-management-container {
    height: auto;
    min-height: 100vh;
  }

  :deep(.el-table) {
    height: auto !important;
    max-height: 500px;
  }
}
</style>
