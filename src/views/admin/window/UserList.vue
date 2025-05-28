<!-- views/admin/window/UserList.vue -->
<template>
  <div class="user-management-container">
    <!-- 头部区域 -->
    <div class="header">
      <h2>用户管理</h2>
      <div class="actions">
        <el-button type="primary" @click="openAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          添加用户
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户名">
          <el-input
            v-model="searchForm.userName"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="姓名">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="管理员">
          <el-select
            v-model="searchForm.admin"
            placeholder="请选择"
            style="width: 200px"
            clearable
          >
            <el-option label="超级管理员" :value="2" />
            <el-option label="管理员" :value="1" />
            <el-option label="用户" :value="0" />
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
        :data="userStore.pageUsers.list"
        border
        stripe
        v-loading="userStore.isLoading"
        style="width: 100%"
        height="calc(100vh - 350px)"
        @sort-change="handleSortChange"
      >
        <el-table-column prop="id" label="ID" width="80" sortable="custom" />
        <el-table-column
          prop="userName"
          label="用户名"
          width="150"
          sortable="custom"
        />
        <el-table-column
          prop="name"
          label="姓名"
          width="120"
          sortable="custom"
        />
        <el-table-column
          prop="admin"
          label="管理员"
          width="100"
          sortable="custom"
        >
          <template #default="scope">
            <el-tag :type="scope.row.admin ? 'success' : 'info'">
              {{ scope.row.admin ? '是' : '否' }}
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
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="handleEdit(scope.row)">
              <el-icon>
                <Edit />
              </el-icon>
              编辑
            </el-button>
            <el-button
              size="small"
              type="warning"
              v-if="userStore.adminUser === 2"
              @click="handleChangeAdmin(scope.row.id, scope.row.admin)"
            >
              <el-icon>
                <User />
              </el-icon>
              权限
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
        :page-sizes="[10, 20, 50, 100]"
        :total="userStore.pageUsers.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑用户' : '添加用户'"
      width="40%"
    >
      <el-form
        :model="formData"
        label-width="100px"
        :rules="dialog.isEdit ? updateFormRules : formRules"
        ref="formRef"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="formData.userName" v-if="dialog.isEdit" disabled />
          <el-input v-model="formData.userName" v-else />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="formData.name" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!dialog.isEdit">
          <el-input v-model="formData.password" type="password" show-password />
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
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, User } from '@element-plus/icons-vue';
import { useUserStore } from '@/stores/userStore';
import { formatTotalTime } from '@/utils/time';

const userStore = useUserStore();

// 分页配置
const pagination = reactive({
  pageNo: 1,
  pageSize: 10,
  isAsc: false,
  sortBy: 'createTime'
});

// 时间范围选择器
const timeRange = ref<string[]>([]);

// 搜索表单
const searchForm = reactive({
  userName: null,
  name: null,
  admin: null,
  startCreateTime: null,
  endCreateTime: null,
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
const formData = reactive({
  id: 0,
  userName: '',
  name: '',
  password: '',
  admin: 0
});

// 表单验证规则
const formRules = {
  userName: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const updateFormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }]
};

// 初始化加载数据
onMounted(() => {
  fetchUsers();
  userStore.getAdmin();
});

onBeforeUnmount(() => {
  userStore.adminUser = 0;
});

// 获取用户列表
const fetchUsers = async () => {
  const params = {
    ...searchForm,
    ...pagination,
    startCreateTime: timeRange.value?.[0]?.replace(' ', 'T'),
    endCreateTime: timeRange.value?.[1]?.replace(' ', 'T')
  };
  await userStore.fetchUser(params);
};

// 搜索处理
const handleSearch = () => {
  pagination.pageNo = 1;
  fetchUsers();
};

// 重置搜索
const resetSearch = () => {
  timeRange.value = [];
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchUsers();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchUsers();
};

// 排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  pagination.sortBy = prop;
  pagination.isAsc = order === 'ascending';
  fetchUsers();
};

// 打开添加对话框
const openAddDialog = () => {
  dialog.visible = true;
  dialog.isEdit = false;
  resetForm();
};

// 编辑用户
const handleEdit = (user: any) => {
  dialog.visible = true;
  dialog.isEdit = true;
  Object.assign(formData, user);
};

// 重置表单
const resetForm = () => {
  formData.id = 0;
  formData.userName = '';
  formData.name = '';
  formData.password = '';
  formData.admin = 0;
};

// 修改权限
const handleChangeAdmin = async (id: number, admin: number) => {
  try {
    await ElMessageBox.confirm(
      `确定要将此用户${admin === 1 ? '设为普通用户' : '设为管理员'}吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    const s = await userStore.permissions(id, admin == 1 ? 0 : 1);
    if (s) {
      fetchUsers();
      ElMessage.success('修改成功');
    } else {
      ElMessage.error(userStore.error);
    }
  } catch (error) {}
};

// 提交表单
const submitForm = async () => {};

// 删除用户
const handleDelete = async (id: number) => {};
</script>

<style scoped>
.user-management-container {
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
  flex-shrink: 0;
}

.search-area {
  margin-bottom: 20px;
  flex-shrink: 0;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  margin-bottom: 20px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}

/* 表格滚动条样式 */
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

/* 响应式调整 */
@media (max-width: 768px) {
  .user-management-container {
    height: auto;
    min-height: 100vh;
  }

  :deep(.el-table) {
    height: auto !important;
    max-height: 500px;
  }
}
</style>
