<template>
  <div class="register-container">
    <el-form
      :model="formData"
      :rules="rules"
      ref="registerFormRef"
      @submit.prevent="handleRegister"
      class="register-form"
      label-position="top"
    >
      <h2 class="title">用户注册</h2>

      <el-form-item prop="username" label="用户名">
        <el-input
          v-model="formData.username"
          placeholder="请输入用户名"
          prefix-icon="el-icon-user"
        />
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="请输入密码"
          prefix-icon="el-icon-lock"
          show-password
        />
      </el-form-item>

      <el-form-item prop="userType" label="用户类型">
        <el-radio-group v-model="formData.userType">
          <el-radio label="user">普通用户</el-radio>
          <el-radio label="worker">维修人员</el-radio>
        </el-radio-group>
      </el-form-item>

      <template v-if="formData.userType === 'user'">
        <el-form-item prop="userProfile.name" label="姓名">
          <el-input
            v-model="formData.userProfile.name"
            placeholder="请输入姓名"
            prefix-icon="el-icon-postcard"
          />
        </el-form-item>
        <el-form-item prop="userProfile.phone" label="电话">
          <el-input
            v-model="formData.userProfile.phone"
            placeholder="请输入电话"
            prefix-icon="el-icon-phone-outline"
          />
        </el-form-item>
        <el-form-item prop="userProfile.address" label="地址">
          <el-input
            v-model="formData.userProfile.address"
            placeholder="请输入地址"
            prefix-icon="el-icon-location-outline"
          />
        </el-form-item>
        <el-form-item prop="userProfile.email" label="邮箱">
          <el-input
            v-model="formData.userProfile.email"
            placeholder="请输入邮箱"
            prefix-icon="el-icon-message"
          />
        </el-form-item>
      </template>

      <template v-if="formData.userType === 'worker'">
        <el-form-item prop="skill" label="工种">
          <el-select
            v-model="formData.skill"
            placeholder="请选择工种"
            class="full-width"
          >
            <el-option label="漆工" value="painter" />
            <el-option label="焊工" value="welder" />
            <el-option label="机修" value="mechanic" />
          </el-select>
        </el-form-item>

        <el-form-item prop="hourlyRate" label="时薪（元/小时）">
          <el-input-number
            v-model="formData.hourlyRate"
            :min="20"
            :max="200"
            class="full-width"
          />
        </el-form-item>
      </template>

      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
          class="full-width"
          :loading="isLoading"
        >
          立即注册
        </el-button>
      </el-form-item>

      <div class="links">
        <router-link to="/login">已有账号？立即登录</router-link>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
// 假设您的 store 和 API 文件路径如下，如果不同请自行修改
// import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
// 假设您的 API 调用函数如下，如果函数名或路径不同请自行修改
import { userRegister } from '@/api/user';
import { repairmanRegister } from '@/api/repairman';


const router = useRouter();
// const authStore = useAuthStore(); // 如果暂时不用 authStore 可以注释掉

const formData = reactive({
  username: 'Baguette',
  password: 'Bag111',
  userType: 'user',
  skill: '',
  hourlyRate: 50,
  userProfile: {
    name: '法棍',
    phone: '13517530053',
    address: '220HandanRd',
    email: 'celseca60@gmail.com'
  }
});

const registerFormRef = ref(null); // 创建对 el-form 的引用

const rules = reactive({
  username: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码长度至少6位', trigger: 'blur' }
  ],
  userType: [{ required: true, message: '用户类型不能为空', trigger: 'change' }],
  skill: [{
    validator: (rule, value, callback) => {
      if (formData.userType === 'worker' && !value) {
        callback(new Error('维修人员必须选择工种'));
      } else {
        callback();
      }
    },
    trigger: 'change'
  }],
  'userProfile.name': [{
    validator: (rule, value, callback) => {
      if (formData.userType === 'user' && !value) {
        callback(new Error('姓名不能为空'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'userProfile.phone': [{
    validator: (rule, value, callback) => {
      if (formData.userType === 'user' && !value) {
        callback(new Error('电话不能为空'));
      } else if (formData.userType === 'user' && value && !/^\d{11}$/.test(value)) { // 简单11位数字校验
        callback(new Error('请输入有效的11位电话号码'));
      }
      else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'userProfile.address': [{
    validator: (rule, value, callback) => {
      if (formData.userType === 'user' && !value) {
        callback(new Error('地址不能为空'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }],
  'userProfile.email': [{
    validator: (rule, value, callback) => {
      if (formData.userType === 'user' && !value) {
        callback(new Error('邮箱不能为空'));
      } else if (formData.userType === 'user' && value && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(value)) {
        callback(new Error('请输入有效的邮箱地址'));
      } else {
        callback();
      }
    },
    trigger: 'blur'
  }]
});

const isLoading = ref(false);

const handleRegister = async () => {
  if (!registerFormRef.value) return;
  try {
    await registerFormRef.value.validate();
    isLoading.value = true;
    let postData;
    let apiCall;

    if (formData.userType === 'user') {
      postData = {
        username: formData.username,
        password: formData.password,
        profile: {
          name: formData.userProfile.name,
          phone: formData.userProfile.phone,
          address: formData.userProfile.address,
          email: formData.userProfile.email
        }
      };
      apiCall = userRegister;
    } else { // worker
      postData = {
        username: formData.username,
        password: formData.password,
        // 确保 workType 字段名和枚举值与后端 API 期望的一致
        workType: formData.skill ? formData.skill.toUpperCase() : '', // 例如 PAINTER, WELDER, MECHANIC
        hourlyRate: formData.hourlyRate,
        status: 'IDLE' // 或其他默认状态
      };
      apiCall = repairmanRegister;
    }

    const response = await apiCall(postData);

    // 根据您的实际 API 响应结构调整判断条件
    // Mock API 直接返回 { success: boolean, message: string }
    if (response && response.success) {
      ElMessage.success(response.message || '注册成功');
      router.push('/login'); // 注册成功后跳转到登录页
    } else {
      ElMessage.error(response.message || '注册失败');
    }
  } catch (error) {
    if (error && Array.isArray(error.fields)) {
      // 表单验证失败时，Element Plus 的 validate 会 reject
      // 通常错误信息会直接显示在表单项上，这里可以不额外提示，或者只给一个总的提示
      // ElMessage.error('请检查表单输入项是否正确！');
      console.log('表单验证失败:', error.fields);
    } else {
      console.error('注册请求出错:', error);
      // 这里处理 API 调用本身的错误，而不是表单验证错误
      if (error.response) { // Axios 错误结构
        ElMessage.error(error.response.data.message || `服务器错误，状态码 ${error.response.status}`);
      } else if (error.request) { // 请求已发出但没有收到响应
        ElMessage.error('注册失败：未能收到服务器响应，请检查网络或服务器状态。');
      } else { // 设置请求时发生了一些事情，触发了错误
        ElMessage.error(error.message || '注册失败：请求发送失败或发生未知错误。');
      }
    }
  } finally {
    isLoading.value = false;
  }
};

watch(() => formData.userType, (newUserType, oldUserType) => {
  if (newUserType === 'user') {
    formData.skill = '';
    // formData.hourlyRate = 50; // 保留之前的输入或设为默认值
  } else if (newUserType === 'worker') {
    // formData.userProfile.name = ''; // 清空或保留，根据产品需求
    // formData.userProfile.phone = '';
    // formData.userProfile.address = '';
    // formData.userProfile.email = '';
  }
  // 切换用户类型后，清除整个表单的校验结果，以便重新校验
  if (registerFormRef.value) {
    registerFormRef.value.clearValidate();
  }
});

</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f0f2f5; /* 一个常见的背景色 */
  padding: 20px; /* 为小屏幕添加一些边距 */
}

.register-form {
  width: 100%;
  max-width: 420px; /* 限制最大宽度 */
  padding: 30px 35px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.title {
  text-align: center;
  margin-bottom: 25px;
  font-size: 24px;
  color: #303133; /* Element Plus 默认文字颜色 */
  font-weight: 600;
}

.full-width {
  width: 100%;
}

.links {
  text-align: center;
  margin-top: 20px;
}

.links a {
  color: #409eff; /* Element Plus 主题色 */
  text-decoration: none;
  font-size: 14px;
}
.links a:hover {
  text-decoration: underline;
}

/* 统一 el-form-item 的下边距 */
.el-form-item {
  margin-bottom: 22px;
}

/* 针对 el-input-number 的特定样式调整（如果需要） */
.el-input-number {
  width: 100%;
}
</style>