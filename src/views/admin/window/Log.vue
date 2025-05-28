<!-- views/admin/window/Log.vue -->
<template>
  <div class="log-management-container">
    <!-- 头部区域 -->
    <div class="header">
      <h2>系统日志管理</h2>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="模块" style="width: 200px">
          <el-select
            v-model="searchForm.module"
            placeholder="模块名称"
            clearable
          >
            <el-option label="管理员" value="admin" />
            <el-option label="用户" value="user" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作类型" style="width: 250px">
          <el-select
            v-model="searchForm.operationType"
            placeholder="请选择操作类型"
            clearable
          >
            <el-option label="新增" value="新增" />
            <el-option label="修改" value="修改" />
            <el-option label="删除" value="删除" />
            <el-option label="查询" value="查询" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="执行时间(ms)">
          <el-input-number
            v-model="searchForm.minExecutionTime"
            :min="0"
            placeholder="最小执行时间"
          />
        </el-form-item>
        <el-form-item label="错误日志" style="width: 200px">
          <el-select
            v-model="searchForm.error"
            placeholder="错误筛选"
            clearable
          >
            <el-option label="仅错误" :value="1" />
            <el-option label="仅成功" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="时间范围">
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
      <div class="table-container">
        <el-table
          :data="logStore.logs.list"
          border
          stripe
          v-loading="logStore.isLoading"
          style="width: 100%"
          height="calc(100vh - 350px)"
          @sort-change="handleSortChange"
        >
          <el-table-column
            prop="module"
            label="模块"
            width="120"
            sortable="custom"
          />
          <el-table-column
            prop="userName"
            label="用户"
            width="120"
            sortable="custom"
          />
          <el-table-column
            prop="operationType"
            label="操作类型"
            width="100"
            sortable="custom"
          >
            <template #default="scope">
              <el-tag :type="getOperationTypeColor(scope.row.operationType)">
                {{ scope.row.operationType }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="className"
            label="类名"
            width="180"
            show-overflow-tooltip
          />
          <el-table-column
            prop="methodName"
            label="方法名"
            width="150"
            show-overflow-tooltip
          />
          <el-table-column label="执行结果" width="120">
            <template #default="scope">
              <el-tag :type="scope.row.errorMessage ? 'danger' : 'success'">
                {{ scope.row.errorMessage ? '失败' : '成功' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="executionTime"
            label="耗时(ms)"
            width="100"
            sortable="custom"
          >
            <template #default="scope">
              <span :class="getExecutionTimeClass(scope.row.executionTime)">
                {{ scope.row.executionTime }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="operationIp" label="操作IP" width="140" />
          <el-table-column
            prop="createTime"
            label="操作时间"
            width="180"
            sortable="custom"
          >
            <template #default="scope">
              {{ formatTotalTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="scope">
              <el-button size="small" @click="showDetail(scope.row)"
                >详情</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.pageNo"
        v-model:page-size="pagination.pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="logStore.logs.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 日志详情对话框 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="日志详情"
      width="70%"
      :style="{ maxWidth: '900px' }"
    >
      <div class="dialog-content">
        <el-descriptions :column="1" border class="fixed-width-descriptions">
          <el-descriptions-item
            label="日志ID"
            label-class-name="fixed-label"
            content-class-name="fixed-content"
          >
            {{ detailDialog.data.id }}
          </el-descriptions-item>
          <el-descriptions-item
            label="模块"
            label-class-name="fixed-label"
            content-class-name="fixed-content"
          >
            {{ detailDialog.data.module }}
          </el-descriptions-item>
          <el-descriptions-item label="用户">
            {{ detailDialog.data.userName }}
          </el-descriptions-item>
          <el-descriptions-item label="操作类型">
            <el-tag
              :type="getOperationTypeColor(detailDialog.data.operationType)"
            >
              {{ detailDialog.data.operationType }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="类名">{{
            detailDialog.data.className
          }}</el-descriptions-item>
          <el-descriptions-item label="方法名">{{
            detailDialog.data.methodName
          }}</el-descriptions-item>
          <el-descriptions-item
            label="方法参数"
            v-if="detailDialog.data.methodParams"
          >
            <pre class="json-container">{{
              formatJson(detailDialog.data.methodParams)
            }}</pre>
          </el-descriptions-item>
          <el-descriptions-item label="执行耗时">
            <span
              :class="getExecutionTimeClass(detailDialog.data.executionTime)"
            >
              {{ detailDialog.data.executionTime }} ms
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="操作IP">{{
            detailDialog.data.operationIp
          }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{
            formatTotalTime(detailDialog.data.createTime)
          }}</el-descriptions-item>
          <el-descriptions-item label="返回值">
            <pre class="json-container">{{
              formatJson(detailDialog.data.returnValue)
            }}</pre>
          </el-descriptions-item>
          <el-descriptions-item
            label="错误信息"
            v-if="detailDialog.data.errorMessage"
          >
            <pre class="json-container error-json">{{
              formatJson(detailDialog.data.errorMessage)
            }}</pre>
          </el-descriptions-item>
        </el-descriptions>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useLogStore } from '@/stores/admin/logStore';
import { formatTotalTime } from '@/utils/time';

const logStore = useLogStore();

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
  module: null,
  userId: null,
  operationType: null,
  minExecutionTime: null,
  error: null,
  startCreateTime: null,
  endCreateTime: null,
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize,
  isAsc: pagination.isAsc,
  sortBy: pagination.sortBy
});

// 详情对话框
const detailDialog = reactive({
  visible: false,
  data: {} as any
});

// 初始化加载数据
onMounted(() => {
  fetchLogs();
});

// 获取日志列表
const fetchLogs = async () => {
  const params = {
    ...searchForm,
    ...pagination,
    startCreateTime: timeRange.value?.[0]?.replace(' ', 'T'),
    endCreateTime: timeRange.value?.[1]?.replace(' ', 'T')
  };
  await logStore.fetchLogs(params);
};

// 搜索处理
const handleSearch = () => {
  pagination.pageNo = 1;
  fetchLogs();
};

// 重置搜索
const resetSearch = () => {
  timeRange.value = [];
  searchForm.endCreateTime = null;
  searchForm.startCreateTime = null;
  searchForm.module = null;
  searchForm.userId = null;
  searchForm.operationType = null;
  searchForm.minExecutionTime = null;
  searchForm.error = null;
  handleSearch();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchLogs();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchLogs();
};

// 排序变化
const handleSortChange = ({ prop, order }: { prop: string; order: string }) => {
  pagination.sortBy = prop;
  pagination.isAsc = order === 'ascending';
  fetchLogs();
};

// 显示详情
const showDetail = (log: any) => {
  detailDialog.data = log;
  detailDialog.visible = true;
};

// 操作类型颜色
const getOperationTypeColor = (type: string) => {
  const map: Record<string, string> = {
    新增: 'success',
    修改: 'warning',
    删除: 'danger',
    查询: 'info',
    其他: 'info'
  };
  return map[type] || '';
};

const formatJson = (str: string) => {
  try {
    const json = JSON.parse(str);
    return JSON.stringify(json, null, 2);
  } catch (e) {
    return str; // 如果不是JSON格式，直接返回原始字符串
  }
};

// 执行时间样式
const getExecutionTimeClass = (time: number) => {
  if (time > 1000) return 'execution-time-high';
  if (time > 500) return 'execution-time-medium';
  return 'execution-time-low';
};
</script>

<style scoped>
.log-management-container {
  padding: 20px;
  background-color: var(--admin-bg-color);
  color: var(--admin-text-color);
  border-radius: 4px;
}

.header {
  margin-bottom: 20px;
}

.search-area {
  margin-bottom: 20px;
}

.table-wrapper {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.table-container {
  margin-bottom: 20px;
  overflow: hidden;
  margin-bottom: 20px;
}

:deep(.el-table) {
  flex: 1;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto !important;
  scrollbar-width: thin;
  scrollbar-color: var(--admin-scrollbar-thumb-color) var(--admin-scrollbar-track-color);
}

/* 自定义滚动条样式 */
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

.pagination-container {
  display: flex;
  justify-content: flex-end;
}

.log-value,
.log-error {
  padding: 8px;
  background-color: var(--admin-bg-card-color);
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.log-error {
  color: var(--admin-error-color);
  background-color: var(--admin-bg-card-color);
}

.fixed-width-descriptions {
  --label-width: 150px;
}

/* 固定标签宽度 */
:deep(.fixed-label) {
  width: var(--label-width);
  text-align: right;
  padding-right: 20px;
  background-color: var(--admin-bg-card-color) !important;
}

/* 内容区域自适应 */
:deep(.fixed-content) {
  width: calc(100% - var(--label-width));
  min-height: 44px;
}

.dialog-content {
  max-width: 100%;
  overflow: hidden;
}

/* JSON容器样式 */
.json-container {
  padding: 10px;
  background-color: var(--admin-bg-color);
  color: var(--admin-text-color);
  border-radius: 4px;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: Consolas, Monaco, 'Andale Mono', monospace;
  line-height: 1.5;
}

.error-json {
  background-color: var(--admin-bg-card-color);
  color: var(--admin-error-color);
}

/* 滚动条样式 */
.json-container::-webkit-scrollbar {
  width: 6px;
}

.json-container::-webkit-scrollbar-track {
  background: var(--admin-scrollbar-thumb-track-color);
}

.json-container::-webkit-scrollbar-thumb {
  background: var(--admin-scrollbar-thumb-color);
  border-radius: 3px;
}

.json-container::-webkit-scrollbar-thumb:hover {
  background: var(--admin-scrollbar-thumb-hover-color);
}
</style>
