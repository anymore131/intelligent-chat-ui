<!-- Register.vue -->
<template>
  <div class="login">
    <div class="loginPart">
      <h2>用户注册</h2>
      <el-form
        aria-autocomplete="off"
        :model="registerForm"
        ref="registerFormRef"
        :rules="rules"
        label-width="100px"
        style="transform: translate(-30px)"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="registerForm.userName"
            placeholder="请输入用户名"
          ></el-input>
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input
            v-model="registerForm.name"
            placeholder="请输入姓名"
          ></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            type="password"
            v-model="registerForm.password"
            placeholder="请输入密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            type="password"
            v-model="registerForm.confirmPassword"
            placeholder="请确认密码"
            show-password
          ></el-input>
        </el-form-item>
        <el-button
          class="btn"
          type="primary"
          @click="register"
          :loading="loading"
          >注册</el-button
        >
        <div style="text-align: right; transform: translate(0, 30px)">
          <router-link to="/login" class="a">已有账号？去登录</router-link>
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
const registerFormRef = ref<FormInstance>();
const loading = ref(false);

const registerForm = reactive({
  userName: '',
  name: '',
  password: '',
  confirmPassword: ''
});

// 密码一致性验证规则
const validatePassword = (
  rule: any,
  value: string,
  callback: (error?: Error) => void
) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'));
  } else {
    callback();
  }
};

const rules = reactive({
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      min: 3,
      max: 16,
      message: '用户名长度需在3-16个字符之间',
      trigger: 'blur'
    }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      min: 6,
      max: 16,
      message: '密码长度需在6-16个字符之间',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validatePassword, trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    {
      min: 2,
      max: 16,
      message: '姓名长度需在2-16个字符之间',
      trigger: 'blur'
    }
  ]
});

const register = async () => {
  try {
    // 执行表单验证
    const valid = await registerFormRef.value?.validate();
    if (!valid) return;

    // 调用注册接口
    const success = await userStore.register({
      userName: registerForm.userName,
      password: registerForm.password,
      name: registerForm.name
    });

    if (success) {
      ElMessage.success('注册成功');
      // 跳转登录页
      router.push('/login');
    } else {
      ElMessage.error(userStore.error || '注册失败');
    }
  } catch (error) {
    console.error('注册异常:', error);
  }
};
</script>

<style scoped>
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
  background-image: url('@/assets/images/loginbg.png');
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

.code-btn {
  transform: translate(20px);
  width: 90px;
  height: 40px;
  font-size: 10px;
}

.a {
  color: var(--a-color);
}
</style>
