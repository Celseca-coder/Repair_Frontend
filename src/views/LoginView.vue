<template>
  <div class="login-container">
    <el-form
      :model="formData"
      :rules="rules"
      ref="loginFormRef"
      @submit.prevent="handleLogin"
      class="login-form"
    >
      <h2 class="title">车辆维修系统登录</h2>

      <el-form-item prop="username">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          prefix-icon="el-icon-user"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="el-icon-lock"
          show-password
        />
      </el-form-item>

      <el-form-item prop="role">
        <el-select
          v-model="formData.role"
          placeholder="请选择登录身份"
          class="full-width"
        >
          <el-option label="普通用户" value="user" />
          <el-option label="维修人员" value="worker" />
          <el-option label="系统管理员" value="admin" />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          class="full-width"
          :loading="isLoading"
        >
          立即登录
        </el-button>
      </el-form-item>

      <div class="links">
        <router-link to="/register">立即注册</router-link>
        <router-link to="/forgot-password">忘记密码？</router-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
// Your script setup code from the error message
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth'; // Assuming correct path
import { ElMessage } from 'element-plus';

const router = useRouter();
const authStore = useAuthStore();

const formData = reactive({
  username: '',
  password: '',
  role: 'user'
});

const rules = reactive({
  username: [
    { required: true, message: '用户名不能为空', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '必须选择登录身份', trigger: 'change' }
  ]
});

const isLoading = ref(false);
const loginFormRef = ref(null);

const handleLogin = async () => {
  if (!loginFormRef.value) {
    console.error("loginFormRef is not available");
    return;
  }

  try {
    await loginFormRef.value.validate();
  } catch (validationErrors) {
    console.log('表单校验失败:', validationErrors);
    return;
  }

  const loginCredentials = {
    username: formData.username,
    password: formData.password,
    role: formData.role
  };
  console.log("将要发送到后端的登录数据:", loginCredentials);

  try {
    isLoading.value = true;
    await authStore.login(loginCredentials);
    ElMessage.success('登录成功');

    switch(formData.role) {
      case 'user':
        router.push('/dashboard');
        break;
      case 'worker':
        router.push('/worker/dashboard');
        break;
      case 'admin':
        router.push('/admin/dashboard');
        break;
      default:
        ElMessage.warning('未知用户角色，请联系管理员');
    }
  } catch (error) {
    console.error('登录处理出错:', error);
    ElMessage.error(error.message || '登录失败，请检查您的凭据或网络连接。');
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-form {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.1);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.links {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.full-width {
  width: 100%;
}
</style>