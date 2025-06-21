<template>
  <div class="user-management-view">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleExport">导出数据</el-button>
        </div>
      </template>
      <el-table :data="users" v-loading="loading" style="width: 100%" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="profile.name" label="姓名" width="120" />
        <el-table-column prop="profile.phone" label="电话" width="150" />
        <el-table-column prop="profile.email" label="邮箱" width="180" />
        <el-table-column prop="profile.address" label="地址" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button-group>
              <el-button size="small" type="primary" @click="handleEdit(row)" :loading="submitting">编辑</el-button>
              <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-if="!loading && users.length === 0" description="暂无用户数据" />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'edit' ? '编辑用户' : '新增用户'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="姓名" prop="profile.name">
          <el-input v-model="form.profile.name" />
        </el-form-item>
        <el-form-item label="电话" prop="profile.phone">
          <el-input v-model="form.profile.phone" />
        </el-form-item>
        <el-form-item label="邮箱" prop="profile.email">
          <el-input v-model="form.profile.email" />
        </el-form-item>
        <el-form-item label="地址" prop="profile.address">
          <el-input v-model="form.profile.address" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false" :disabled="submitting">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers, updateUser } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('edit')
const formRef = ref(null)
const form = ref({
  id: null,
  username: '',
  userType: 'User',
  profile: {
    id: null,
    phone: '',
    name: '',
    email: '',
    address: ''
  }
})

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  'profile.name': [
    { required: true, message: '请输入姓名', trigger: 'blur' }
  ],
  'profile.phone': [
    { required: true, message: '请输入电话', trigger: 'blur' },
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

const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await getUsers()
    users.value = response.data.filter(user => user.userType !== 'MAINTENANCE')
  } catch (error) {
    console.error('获取用户列表失败:', error)
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

const handleExport = () => {
  ElMessage.info('导出用户数据功能待实现。')
}

const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { 
    ...row, 
    profile: row.profile ? { ...row.profile } : { id: null, phone: '', name: '', email: '', address: '' }
  }
  dialogVisible.value = true
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
      type: 'warning'
    })
    ElMessage.success(`用户 "${row.username}" 删除成功 (模拟操作)。`)
    fetchUsers()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除操作失败 (模拟操作)。')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 表单验证
    await formRef.value.validate()
    
    submitting.value = true
    
    // 准备发送给API的数据，确保格式符合接口要求
    const userData = {
      id: form.value.id,
      username: form.value.username,
      userType: form.value.userType || 'User',
      profile: {
        phone: form.value.profile.phone,
        name: form.value.profile.name,
        email: form.value.profile.email,
        address: form.value.profile.address
      }
    }
    
    // 调用API更新用户信息
    const response = await updateUser(form.value.id, userData)
    
    if (response.data) {
      ElMessage.success('用户信息更新成功')
      dialogVisible.value = false
      // 重新获取用户列表以显示最新数据
      await fetchUsers()
    } else {
      ElMessage.error('更新失败：未收到有效响应')
    }
  } catch (error) {
    console.error('更新用户信息失败:', error)
    if (error.response) {
      // 服务器返回错误响应
      ElMessage.error(`更新失败：${error.response.data?.message || error.response.statusText}`)
    } else if (error.request) {
      // 网络错误
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      ElMessage.error(error.message || '更新用户信息失败')
    }
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchUsers()
})
</script>

<style scoped>
.user-management-view {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.el-table {
  margin-top: 20px;
}
</style> 