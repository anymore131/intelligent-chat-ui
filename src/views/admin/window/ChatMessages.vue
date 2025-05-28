<!-- views/admin/window/ChatMessages.vue -->
<template>
  <div class="chat-messages-container">
    <!-- 头部区域 -->
    <div class="header">
      <h2>消息管理</h2>
      <div class="actions">
        <el-button type="primary" @click="openAddDialog">
          <el-icon>
            <Plus />
          </el-icon>
          添加消息
        </el-button>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-area">
      <el-form :model="searchForm" inline>
        <el-form-item label="发送者">
          <el-select
            v-model="searchForm.senderId"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户名搜索并添加"
            :remote-method="searchSender"
            :loading="senderLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in senderOptions"
              :key="user.id"
              :label="`${user.userName} (ID: ${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="接收者">
          <el-select
            v-model="searchForm.receiverId"
            multiple
            filterable
            remote
            reserve-keyword
            placeholder="请输入用户名搜索并添加"
            :remote-method="searchReceiver"
            :loading="receiverLoading"
            style="width: 100%"
          >
            <el-option
              v-for="user in receiverOptions"
              :key="user.id"
              :label="`${user.userName} (ID: ${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.contentType"
            multiple
            placeholder="类型"
            clearable
            style="width: 280px"
          >
            <el-option label="文本" :value="1" />
            <el-option label="图片" :value="2" />
            <el-option label="文件" :value="3" />
            <el-option label="语言" :value="4" />
            <el-option label="文本删除" :value="91" />
            <el-option label="文件删除" :value="92" />
          </el-select>
        </el-form-item>
        <el-form-item label="文本">
          <el-input
            style="width: 200px"
            v-model="searchForm.content"
            placeholder="请输入文本"
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
        :data="messagesStore.messages.list"
        border
        stripe
        v-loading="messagesStore.isLoading"
        style="width: 100%"
        height="calc(100vh - 350px)"
      >
        <el-table-column prop="senderId" label="发送者ID" width="100" />
        <el-table-column prop="senderName" label="发送者" width="150" />
        <el-table-column prop="receiverId" label="接收者ID" width="100" />
        <el-table-column prop="receiverName" label="接收者" width="150" />
        <el-table-column prop="contentType" label="消息类型" width="100">
          <template #default="scope">
            <el-tag
              v-if="scope.row.contentType === 1"
              size="small"
              type="primary"
              >文本</el-tag
            >
            <el-tag
              v-if="scope.row.contentType === 2"
              size="small"
              type="success"
              >图片</el-tag
            >
            <el-tag
              v-if="scope.row.contentType === 3"
              size="small"
              type="success"
              >文件</el-tag
            >
            <el-tag
              v-if="scope.row.contentType === 4"
              size="small"
              type="success"
              >音频</el-tag
            >
            <el-tag
              v-if="scope.row.contentType === 91"
              size="small"
              type="danger"
              >文本删除</el-tag
            >
            <el-tag
              v-if="scope.row.contentType === 92"
              size="small"
              type="danger"
              >文件删除</el-tag
            >
          </template>
        </el-table-column>
        <el-table-column prop="content" label="消息" width="300">
          <template #default="scope">
            <template
              v-if="scope.row.contentType === 1 || scope.row.contentType === 91"
            >
              {{ scope.row.content }}
            </template>
            <template v-else>
              <div v-if="scope.row.content">
                <template v-if="typeof scope.row.content === 'string'">
                  <!-- 处理字符串类型的content（可能是JSON字符串） -->
                  <template v-if="isJsonString(scope.row.content)">
                    <div>
                      {{ JSON.parse(scope.row.content).fileName }}
                      <el-button
                        v-if="scope.row.contentType === 2"
                        size="small"
                        type="primary"
                        plain
                        @click="previewFile(JSON.parse(scope.row.content))"
                      >
                        <el-icon><View /></el-icon>
                        预览
                      </el-button>
                      <el-button
                        v-if="
                          scope.row.contentType === 3 ||
                          scope.row.contentType === 4
                        "
                        size="small"
                        type="success"
                        plain
                        @click="downloadFile(JSON.parse(scope.row.content))"
                      >
                        <el-icon><Download /></el-icon>
                        下载
                      </el-button>
                    </div>
                  </template>
                  <template v-else>
                    {{ truncateString(scope.row.content, 20) }}
                  </template>
                </template>
                <template v-else-if="typeof scope.row.content === 'object'">
                  <!-- 处理对象类型的content -->
                  <div>
                    {{ scope.row.content.fileName }}
                    <el-button
                      v-if="scope.row.contentType === 2"
                      size="small"
                      type="primary"
                      plain
                      @click="previewFile(scope.row.content)"
                    >
                      <el-icon><View /></el-icon>
                      预览
                    </el-button>
                    <el-button
                      v-if="
                        scope.row.contentType === 3 ||
                        scope.row.contentType === 4
                      "
                      size="small"
                      type="success"
                      plain
                      @click="downloadFile(scope.row.content)"
                    >
                      <el-icon><Download /></el-icon>
                      下载
                    </el-button>
                  </div>
                </template>
              </div>
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180">
          <template #default="scope">
            {{ formatTotalTime(scope.row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
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
              @click="deleteMessage(scope.row.id)"
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
        :total="messagesStore.messages.total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 添加/编辑对话框 -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑消息' : '添加消息'"
      width="40%"
    >
      <el-form
        :model="formData"
        label-width="100px"
        :rules="formRules"
        ref="formRef"
      >
        <el-form-item label="消息类型" prop="contentType" required>
          <el-select
            v-model="formData.contentType"
            placeholder="请选择消息类型"
            @change="handleTypeChange"
          >
            <el-option label="文本" :value="1" />
            <el-option label="图片" :value="2" />
            <el-option label="文件" :value="3" />
            <el-option label="语音" :value="4" />
          </el-select>
        </el-form-item>

        <el-form-item label="发送者" prop="senderId" required>
          <el-select
            v-model="formData.senderId"
            filterable
            remote
            placeholder="请输入用户名搜索"
            :remote-method="searchSender"
            :loading="senderLoading"
          >
            <el-option
              v-for="user in senderOptions"
              :key="user.id"
              :label="`${user.userName} (ID: ${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="接收者" prop="receiverId" required>
          <el-select
            v-model="formData.receiverId"
            filterable
            remote
            placeholder="请输入用户名搜索"
            :remote-method="searchReceiver"
            :loading="receiverLoading"
          >
            <el-option
              v-for="user in receiverOptions"
              :key="user.id"
              :label="`${user.userName} (ID: ${user.id})`"
              :value="user.id"
            />
          </el-select>
        </el-form-item>

        <!-- 文本内容区域 -->
        <el-form-item
          label="消息内容"
          prop="content"
          required
          v-if="formData.contentType === 1"
        >
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="5"
            placeholder="请输入文本内容"
          />
        </el-form-item>

        <!-- 文件上传区域 -->
        <el-form-item
          label="上传文件"
          prop="file"
          required
          v-if="formData.contentType && formData.contentType !== 1"
        >
          <el-upload
            class="upload-demo"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
          >
            <el-button type="primary">选择文件</el-button>
            <span v-if="fileInput" style="margin-left: 10px">{{
              fileInput.name
            }}</span>
          </el-upload>
          <div class="el-upload__tip" v-if="formData.contentType === 2">
            只能上传图片文件
          </div>
          <div class="el-upload__tip" v-if="formData.contentType === 3">
            支持各种文件类型
          </div>
          <div class="el-upload__tip" v-if="formData.contentType === 4">
            只能上传音频文件
          </div>
        </el-form-item>

        <el-form-item label="创建时间">
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
        <el-button type="primary" @click="updateModel" v-if="dialog.isEdit"
          >修改</el-button
        >
        <el-button type="primary" @click="submitForm" v-else>添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { useMessagesStore } from '@/stores/admin/messagesStore';
import type {
  MessageQuery,
  MessagesRequest
} from '@/stores/admin/messagesStore';
import { ElMessage, ElMessageBox } from 'element-plus';
import { formatTotalTime } from '@/utils/time';
import { Plus, Edit, Delete, View, Download } from '@element-plus/icons-vue';
import type { UploadFile } from 'element-plus/es/components/upload/src/upload';
import { truncateString } from '@/utils/string';

const messagesStore = useMessagesStore();

const formRef = ref();

const dialog = reactive({
  visible: false,
  isEdit: false
});

const pagination = reactive({
  pageNo: 1,
  pageSize: 10
});

const timeRange = ref<string[]>([]);

const senderLoading = ref(false);
const senderOptions = ref<Array<{ id: number; userName: string }>>([]);
const receiverLoading = ref(false);
const receiverOptions = ref<Array<{ id: number; userName: string }>>([]);

const searchSender = async (query: string) => {
  if (query.trim()) {
    senderLoading.value = true;
    try {
      await messagesStore.fetchUserName({
        userName: query,
        pageNo: 1,
        pageSize: 10
      });
      senderOptions.value = messagesStore.user.list;
    } finally {
      senderLoading.value = false;
    }
  }
};

const searchReceiver = async (query: string) => {
  if (query.trim()) {
    receiverLoading.value = true;
    try {
      await messagesStore.fetchUserName({
        userName: query,
        pageNo: 1,
        pageSize: 10
      });
      receiverOptions.value = messagesStore.user.list;
    } finally {
      receiverLoading.value = false;
    }
  }
};

const searchForm = reactive<MessageQuery>({
  senderId: [],
  receiverId: [],
  content: null,
  contentType: [],
  startTime: null,
  endTime: null,
  pageNo: pagination.pageNo,
  pageSize: pagination.pageSize
});

const formData = reactive<MessagesRequest>({
  id: null,
  senderId: null,
  receiverId: null,
  content: null,
  contentType: null,
  createTime: null
});

const formRules = reactive({
  senderId: [{ required: true, message: '请选择发送者', trigger: 'blur' }],
  receiverId: [{ required: true, message: '请选择接收者', trigger: 'blur' }],
  contentType: [{ required: true, message: '请选择消息类型', trigger: 'blur' }],
  content: [
    {
      required: true,
      message: '请输入消息内容',
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (formData.contentType === 1 && !value) {
          callback(new Error('请输入消息内容'));
        } else {
          callback();
        }
      }
    }
  ],
  file: [
    {
      required: true,
      message: '请上传文件',
      trigger: 'blur',
      validator: (rule: any, value: any, callback: any) => {
        if (formData.contentType !== 1 && !fileInput.value) {
          callback(new Error('请上传文件'));
        } else {
          callback();
        }
      }
    }
  ]
});

const fetchMessages = async () => {
  const params = {
    ...searchForm,
    ...pagination,
    startTime: timeRange.value?.[0]?.replace(' ', 'T'),
    endTime: timeRange.value?.[1]?.replace(' ', 'T')
  };
  await messagesStore.fetchMessages(params);
};

const fileInput = ref<File>();
const handleFileChange = (file: UploadFile) => {
  fileInput.value = file.raw;
};

onMounted(() => {
  fetchMessages();
});

const handleSearch = () => {
  pagination.pageNo = 1;
  if (searchForm.content === '') searchForm.content = null;
  if (searchForm.senderId?.length === 0) searchForm.senderId = null;
  if (searchForm.receiverId?.length === 0) searchForm.receiverId = null;
  if (searchForm.contentType?.length === 0) searchForm.contentType = null;
  fetchMessages();
};

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  fetchMessages();
};

// 页码变化
const handlePageChange = (page: number) => {
  pagination.pageNo = page;
  fetchMessages();
};

const handleTypeChange = (type: number) => {
  formData.content = null;
  fileInput.value = undefined;
};

const openAddDialog = () => {
  dialog.visible = true;
  dialog.isEdit = false;
  resetForm();
};

const handleEdit = (Message: any) => {
  dialog.visible = true;
  dialog.isEdit = true;
  Object.assign(formData, Message);
};

// 重置表单
const resetForm = () => {
  formData.id = null;
  formData.senderId = null;
  formData.receiverId = null;
  formData.content = null;
  formData.contentType = null;
  formData.createTime = null;
  fileInput.value = undefined;
};

const resetSearch = () => {
  timeRange.value = [];
  searchForm.content = null;
  searchForm.contentType = [];
  searchForm.senderId = [];
  searchForm.receiverId = [];
  searchForm.startTime = null;
  searchForm.endTime = null;
  handleSearch();
};

const submitForm = async () => {
  try {
    // 验证表单
    await formRef.value?.validate();

    if (formData.contentType === 1) {
      // 文本消息
      await messagesStore.createMessages(formData);
    } else {
      // 文件类型消息
      if (!fileInput.value) {
        ElMessage.error('请选择文件');
        return;
      }

      await messagesStore.createMessagesWithFile(
        formData.senderId!,
        formData.receiverId!,
        formData.contentType!,
        formData.createTime ? formData.createTime?.replace(' ', 'T') : null,
        fileInput.value
      );
    }
    if (messagesStore.error) {
      ElMessage.error(messagesStore.error);
    } else {
      ElMessage.success(dialog.isEdit ? '修改成功' : '添加成功');
    }
    dialog.visible = false;
    resetSearch();
    fetchMessages();
  } catch (error) {
    console.error('提交失败:', error);
  }
};

const deleteMessage = (id: number) => {
  ElMessageBox.confirm('确定要删除该记录吗？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    await messagesStore.deleteMessages(id);
    if (messagesStore.error) {
      ElMessage.error(messagesStore.error);
    } else {
      ElMessage.success('记录删除成功！');
    }
  });
};

const updateModel = async () => {
  try {
    formData.createTime = formData.createTime
      ? formData.createTime?.replace(' ', 'T')
      : null;
    await messagesStore.updateMessages(formData);
    if (messagesStore.error) {
      ElMessage.error(messagesStore.error);
    } else {
      ElMessage.success('记录修改成功！');
    }
    dialog.visible = false;
    resetForm();
    fetchMessages();
  } catch (error) {
    ElMessage.error((error as Error).message || '修改失败');
  }
};

// 判断字符串是否是JSON
const isJsonString = (str: string) => {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
};

// 预览文件
const previewFile = (fileInfo: any) => {
  if (fileInfo.filePath) {
    window.open(fileInfo.filePath, '_blank');
  } else {
    ElMessage.warning('文件路径不存在');
  }
};

// 下载文件
const downloadFile = (fileInfo: any) => {
  if (fileInfo.filePath) {
    const link = document.createElement('a');
    link.href = fileInfo.filePath;
    link.download = fileInfo.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    ElMessage.warning('文件路径不存在');
  }
};
</script>

<style scoped>
.chat-messages-container {
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

.upload-demo {
  width: 100%;
}
.el-upload__tip {
  margin-top: 7px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
</style>
