<!-- Login.vue -->
<template>
  <div class="login">
    <div class="loginPart">
      <h2>用户登录</h2>
      <el-form
        :model="loginForm"
        ref="formRef"
        :rules="rules"
        label-width="100px"
        @keyup.enter="handleLogin"
        style="transform: translate(-30px)"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="loginForm.userName"
            placeholder="请输入用户名"
            clearable
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            placeholder="请输入密码"
            show-password
            clearable
          ></el-input>
        </el-form-item>

        <el-button
          class="btn"
          type="primary"
          @click="handleLogin"
          auto-insert-space
          @keyup.enter="handleLogin"
          :loading="loading"
        >
          登录
        </el-button>
        <div style="text-align: right; transform: translate(0, 30px)">
          <router-link to="/register" class="a">还没有账号？立即注册</router-link>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, type FormInstance, type FormRules } from 'element-plus';
import { useUserStore } from '../stores/userStore';

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

// 表单引用
const formRef = ref<FormInstance>();

// 登录表单数据
const loginForm = reactive({
  userName: '',
  password: ''
});

// 验证规则
const rules = reactive<FormRules>({
  userName: [
    { required: true, message: '用户名不能为空', trigger: 'blur' },
    { min: 3, max: 16, message: '长度在 3 到 16 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
  ]
});

// 处理登录
const handleLogin = async () => {
  // 表单验证
  if (!formRef.value) return;
  const valid = await formRef.value.validate();
  if (!valid) return;

  loading.value = true;
  try {
    const success = await userStore.login(
      loginForm.userName,
      loginForm.password,
      false
    );

    if (success) {
      ElMessage.success('登录成功');
      router.push('/home');
    } else {
      ElMessage.error(userStore.error || '登录失败');
    }
  } catch (error) {
    ElMessage.error('登录请求失败，请检查网络');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login {
  height: 100%;
  width: 100%;
  overflow: hidden;
}

.login__particles {
  height: 100%;
  width: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  opacity: 0.9;
  position: fixed;
  pointer-events: none;
}

.loginPart {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  padding: 50px;
  background: var(--bg-color);
  color: var(--text-color);
  box-sizing: border-box;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
  border-radius: 15px;
}

h2 {
  margin: 0 0 30px;
  padding: 0;
  color: var(--text-color);
  text-align: center;
  /*文字居中*/
}

.btn {
  transform: translate(170px);
  width: 80px;
  height: 40px;
  font-size: 15px;
}

.a {
  color: var(--a-color);
}
</style>
