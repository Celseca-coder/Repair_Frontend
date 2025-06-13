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
              <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
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
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getUsers } from '@/api/admin'
import { ElMessage, ElMessageBox } from 'element-plus'

const users = ref([])
const loading = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('edit')
const formRef = ref(null)
const form = ref({
  id: null,
  username: '',
  profile: {
    id: null,
    phone: '',
    name: '',
    email: '',
    address: ''
  }
})

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

const handleSubmit = () => {
  if (!formRef.value) return
  ElMessage.success(`用户 "${form.value.username}" ${dialogType.value === 'edit' ? '编辑' : '新增'}成功 (模拟操作)。`)
  dialogVisible.value = false
  fetchUsers()
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