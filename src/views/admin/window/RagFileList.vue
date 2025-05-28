<!-- views/admin/window/RagFileList.vue -->
<template>
  <div class="rag_file_list">
    <!-- 头部区域 -->
    <div class="header">
      <h2>知识库文件管理</h2>
      <div class="actions"></div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="知识库ID">
          <el-input
            v-model="searchForm.ragId"
            placeholder="请输入知识库ID"
            clearable
          />
        </el-form-item>
        <el-form-item label="文件名">
          <el-input
            v-model="searchForm.fileName"
            placeholder="请输入文件名"
            clearable
          />
        </el-form-item>
        <el-form-item label="地址">
          <el-input
            v-model="searchForm.path"
            placeholder="请输入地址"
            clearable
          />
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
        :data="fileStore.ragFiles.list"
        border
        stripe
        v-loading="fileStore.isLoading"
        style="width: 100%"
        height="calc(100vh - 350px)"
      >
        <el-table-column prop="ragId" label="知识库ID" width="100" />
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" width="150" />
        <el-table-column prop="ragName" label="知识库名" width="250" />
        <el-table-column prop="fileName" label="文件名" width="250" />
        <el-table-column prop="fileContent" label="地址" width="500" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTotalTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="download(scope.row)">
              <el-icon>
                <Download />
              </el-icon>
              下载
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
        :total="fileStore.ragFiles.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, View, Download } from '@element-plus/icons-vue';
import { useFileStore } from '@/stores/admin/fileStore';
import type { RagFileRequest, RagFile } from '@/stores/admin/fileStore';
import { formatTotalTime } from '@/utils/time';

const fileStore = useFileStore();

// 分页配置
const pagination = reactive({
  pageNo: 1,
  pageSize: 10
});

// 时间范围选择器
const timeRange = ref<string[]>([]);

// 搜索表单
const searchForm = reactive<RagFileRequest>({
  ragId: null,
  fileName: null,
  path: null,
  startCreateTime: null,
  endCreateTime: null,
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize
});

// 初始化加载数据
onMounted(() => {
  fetchRagFiles();
});

const fetchRagFiles = async () => {
  const params = {
    ...searchForm,
    ...pagination,
    startCreateTime: timeRange.value?.[0]?.replace(' ', 'T'),
    endCreateTime: timeRange.value?.[1]?.replace(' ', 'T')
  };
  await fileStore.fetchRagFiles(params);
};

// 搜索处理
const handleSearch = () => {
  pagination.pageNo = 1;
  fetchRagFiles();
};

// 重置搜索
const resetSearch = () => {
  timeRange.value = [];
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchRagFiles();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchRagFiles();
};

// 文件下载
const download = (row: RagFile) => {
  const link = document.createElement('a');
  link.href = row.fileContent;
  link.download = row.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.rag_file_list {
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
  .rag_file_list {
    height: auto;
    min-height: 100vh;
  }

  :deep(.el-table) {
    height: auto !important;
    max-height: 500px;
  }
}
</style>
