<template>
  <div class="user-profile">
    <el-card class="profile-card">
      <template #header>
        <div class="card-header">
          <span>个人信息</span>
          <el-button type="primary" @click="handleEdit" v-if="!isEditing">编辑</el-button>
        </div>
      </template>
      
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
        
        <el-form-item label="姓名" prop="profile.name">
          <el-input v-model="userForm.profile.name" />
        </el-form-item>
        
        <el-form-item label="手机号" prop="profile.phone">
          <el-input v-model="userForm.profile.phone" />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="profile.email">
          <el-input v-model="userForm.profile.email" />
        </el-form-item>
        
        <el-form-item label="地址" prop="profile.address">
          <el-input v-model="userForm.profile.address" type="textarea" />
        </el-form-item>
        
        <el-form-item v-if="isEditing">
          <el-button type="primary" @click="handleSubmit">保存</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import axios from 'axios'

const authStore = useAuthStore()
const isEditing = ref(false)
const userFormRef = ref(null)

const userForm = reactive({
  username: '',
  profile: {
    name: '',
    phone: '',
    email: '',
    address: ''
  }
})

const rules = {
  'profile.name': [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  'profile.phone': [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  'profile.email': [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  'profile.address': [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ]
}

const fetchUserInfo = async () => {
  try {
    const response = await axios.get('/api/users/info', {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response.data.code === 200) {
      const { username, profile } = response.data.data
      userForm.username = username
      userForm.profile = { ...profile }
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
  }
}

const handleEdit = () => {
  isEditing.value = true
}

const handleCancel = () => {
  isEditing.value = false
  fetchUserInfo() // 重新获取数据，放弃修改
}

const handleSubmit = async () => {
  if (!userFormRef.value) return
  
  await userFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const response = await axios.post('/api/users/editUser', {
          userId: authStore.userId,
          profile: userForm.profile
        }, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        })
        
        if (response.data.code === 200) {
          ElMessage.success('修改成功')
          isEditing.value = false
          fetchUserInfo() // 重新获取最新数据
        }
      } catch (error) {
        ElMessage.error('修改失败')
      }
    }
  })
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.user-profile {
  max-width: 800px;
  margin: 20px auto;
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