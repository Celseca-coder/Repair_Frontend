<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" link @click="handleEdit" v-if="!isEditing" :disabled="isLoading">编辑</el-button>
        </div>
      </template>
      
      <div v-loading="isLoading">
        <el-form 
          :model="userForm" 
          :rules="rules"
          ref="userFormRef"
          label-width="100px"
          :disabled="!isEditing"
        >
          <el-form-item label="用户名">
            <el-input v-model="userForm.username" disabled />
          </el-form-item>
          
          <el-form-item label="姓名" prop="name">
            <el-input v-model="userForm.name" />
          </el-form-item>
          
          <el-form-item label="手机号" prop="phone">
            <el-input v-model="userForm.phone" />
          </el-form-item>
          
          <el-form-item label="邮箱" prop="email">
            <el-input v-model="userForm.email" />
          </el-form-item>
          
          <el-form-item label="地址" prop="address">
            <el-input v-model="userForm.address" type="textarea" />
          </el-form-item>
          
          <el-form-item v-if="isEditing">
            <el-button type="primary" @click="handleSubmit">保存</el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { ElMessage } from 'element-plus';
// **【修改1】: 导入封装好的 API 函数，而不是直接使用 axios**
import { getUserInfo, editUser } from '@/api/user';

const authStore = useAuthStore();
const isEditing = ref(false);
const isLoading = ref(false); // **【修改2】: 添加一个加载状态**
const userFormRef = ref(null);
const originalUserData = ref(null); // 用于存储原始数据，方便取消编辑时恢复

// **【修改3】: 简化表单数据结构，不再需要 profile 嵌套**
// 后端 editUser 接口通常接收一个扁平的 DTO 或只包含 profile 部分
const userForm = reactive({
  id: null,
  username: '',
  name: '',
  phone: '',
  email: '',
  address: ''
});

// **【修改4】: 相应地简化校验规则**
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
};

// **【修改5】: 修改 fetchUserInfo 函数，使用导入的 API**
const fetchUserInfo = async () => {
  isLoading.value = true;
  try {
    // 调用封装好的 API 函数，它会自动添加 token 和 baseURL
    const response = await getUserInfo();

    // 根据后端实际返回的数据结构进行调整
    // 假设后端 /users/info 直接返回用户数据对象 { id, username, profile: { ... } }
    if (response.data) {
      const { id, username, profile } = response.data;
      
      // 更新表单数据
      userForm.id = id;
      userForm.username = username;
      Object.assign(userForm, profile); // 将 profile 对象的属性合并到 userForm

      // 保存一份原始数据用于取消操作
      originalUserData.value = JSON.parse(JSON.stringify(userForm));
    } else {
        ElMessage.error('获取用户信息失败：后端未返回数据');
    }
  } catch (error) {
    ElMessage.error('获取用户信息时发生网络错误' + (error.message || '未知错误'));
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const handleEdit = () => {
  isEditing.value = true;
};

const handleCancel = () => {
  isEditing.value = false;
  // 从保存的原始数据恢复，而不是重新请求API，这样更快
  if (originalUserData.value) {
      Object.assign(userForm, originalUserData.value);
  }
  // 清除可能的校验错误提示
  userFormRef.value.clearValidate();
};

// **【修改6】: 修改 handleSubmit 函数，使用导入的 API**
const handleSubmit = async () => {
  if (!userFormRef.value) return;
  
  try {
    await userFormRef.value.validate();

    // 准备要发送到后端的数据，精确匹配后端期望的格式
    const payload = {
        id: userForm.id, // 顶级用户ID
        username: userForm.username, // 顶级用户名
        // 暂时不包含 password 字段，除非后端明确要求
        profile: {
            id: userForm.id, // 假设 profile.id 和 user.id 相同
            name: userForm.name,
            phone: userForm.phone,
            email: userForm.email,
            address: userForm.address,
        }
    };

    const response = await editUser(payload);
    
    // 假设后端成功响应结构为 { code: 200, message: '修改成功', data: ... } 或者直接返回数据
    if (response.data) { // 根据后端实际返回，这里可以只判断 response.data 是否存在或符合预期
      ElMessage.success('修改成功');
      isEditing.value = false;
      // 更新原始数据备份，并重新填充表单以显示最新数据
      fetchUserInfo(); 
    } else {
        ElMessage.error(response.data?.message || '修改失败');
    }
  } catch (validationError) {
    // 校验失败时，通常不需要手动提示，Element Plus会自动处理
    console.log("表单校验失败", validationError);
  }
};

onMounted(() => {
  fetchUserInfo();
});
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
}

.profile-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.el-form {
  margin-top: 20px;
}
</style>