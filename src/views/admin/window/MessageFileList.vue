<!-- views/admin/window/MessageFileList.vue -->
<template>
  <div class="message-file-list">
    <!-- 头部区域 -->
    <div class="header">
      <h2>消息文件管理</h2>
      <div class="actions"></div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="用户ID">
          <el-input
            v-model="searchForm.userId"
            placeholder="请输入用户ID"
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
        :data="fileStore.messageFiles.list"
        border
        stripe
        v-loading="fileStore.isLoading"
        style="width: 100%"
        height="calc(100vh - 350px)"
      >
        <el-table-column prop="userId" label="用户ID" width="100" />
        <el-table-column prop="userName" label="用户名" width="150" />
        <el-table-column prop="fileName" label="文件名" width="250" />
        <el-table-column prop="filePath" label="地址" width="500" />
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTotalTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="scope">
            <el-button
              size="small"
              @click="preview(scope.row.fileContent)"
              v-if="checkImage(scope.row.fileName)"
            >
              <el-icon>
                <View />
              </el-icon>
              预览
            </el-button>
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
        :total="fileStore.messageFiles.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 图片预览 -->
    <div>
      <el-image-viewer
        v-if="showPreview"
        :url-list="imageList"
        show-progress
        :initial-index="imageIndex"
        @close="showPreview = false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, Edit, Delete, Download, View } from '@element-plus/icons-vue';
import { useFileStore } from '@/stores/admin/fileStore';
import type { MessageFileRequest, MessageFile } from '@/stores/admin/fileStore';
import { formatTotalTime } from '@/utils/time';

const fileStore = useFileStore();

const showPreview = ref(false);
const imageList = ref<string[]>([]);
const imageIndex = ref(0);

// 分页配置
const pagination = reactive({
  pageNo: 1,
  pageSize: 10
});

// 时间范围选择器
const timeRange = ref<string[]>([]);

// 搜索表单
const searchForm = reactive<MessageFileRequest>({
  userId: null,
  fileName: null,
  path: null,
  startCreateTime: null,
  endCreateTime: null,
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize
});

// 初始化加载数据
onMounted(() => {
  fetchMessageFiles();
});

const fetchMessageFiles = async () => {
  const params = {
    ...searchForm,
    ...pagination,
    startCreateTime: timeRange.value?.[0]?.replace(' ', 'T'),
    endCreateTime: timeRange.value?.[1]?.replace(' ', 'T')
  };
  await fileStore.fetchMessageFiles(params);
};

// 搜索处理
const handleSearch = () => {
  pagination.pageNo = 1;
  fetchMessageFiles();
};

// 重置搜索
const resetSearch = () => {
  timeRange.value = [];
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchMessageFiles();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchMessageFiles();
};

// 图片预览
const preview = (path: string) => {
  imageList.value = [...imageList.value, path];
  imageIndex.value = imageList.value.indexOf(path);
  showPreview.value = true;
};

// 检查文件是否为图片
function checkImage(fileName: string): boolean {
  const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i;
  return imageExtensions.test(fileName);
}

// 文件下载
const download = (row: MessageFile) => {
  const link = document.createElement('a');
  link.href = row.filePath;
  link.download = row.fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.message-file-list {
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
  .message-file-list {
    height: auto;
    min-height: 100vh;
  }

  :deep(.el-table) {
    height: auto !important;
    max-height: 500px;
  }
}
</style>
