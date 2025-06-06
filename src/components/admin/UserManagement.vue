<template>
  <div class="user-management">
    <h2>用户管理</h2>
    <div v-if="adminStore.loadingUsers">加载中...</div>
    <div v-else-if="adminStore.usersError" style="color: red;">加载失败: {{ adminStore.usersError }}</div>
    <el-table v-else :data="adminStore.users" style="width: 100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="role" label="角色">
        <template #default="{row}">
          <el-tag :type="roleTagType[row.role]">
            {{ roleText[row.role] }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="registrationDate" label="注册时间" />
      <el-table-column label="操作" width="180">
        <template #default="{row}">
          <el-button size="small" @click="openEditDialog(row)" :disabled="adminStore.loadingUserAction">编辑</el-button>
          <el-button 
            size="small" 
            type="danger"
            @click="handleDeleteUser(row)"
            :loading="adminStore.loadingUserAction && userActionUserId === row.id"
            :disabled="adminStore.loadingUserAction"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑用户对话框 -->
    <el-dialog 
      v-model="editDialogVisible" 
      title="编辑用户信息"
      width="500"
      @close="closeEditDialog"
    >
      <el-form :model="currentUser" label-width="auto">
        <el-form-item label="用户名">
          <el-input v-model="currentUser.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色">
           <el-select v-model="currentUser.role" placeholder="选择角色">
            <el-option label="普通用户" value="user"></el-option>
            <el-option label="维修人员" value="worker"></el-option>
            <el-option label="系统管理员" value="admin"></el-option>
          </el-select>
        </el-form-item>
        <!-- TODO: 添加其他需要编辑的字段 -->
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveEdit" :loading="adminStore.loadingUserAction">保存</el-button>
        </div>
      </template>
    </el-dialog>

  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef } from 'vue'
import { useAdminStore } from '@/stores/admin' // 导入 admin store
import { ElMessage, ElMessageBox } from 'element-plus'

const adminStore = useAdminStore() // 使用 store

const roleText = {
  user: '普通用户',
  worker: '维修人员',
  admin: '管理员'
}

const roleTagType = {
  user: 'info',
  worker: 'warning',
  admin: 'success'
}

// 删除用户处理
const userActionUserId = ref(null) // 用于跟踪正在进行操作（删除或编辑）的用户ID

const handleDeleteUser = async (user) => {
  ElMessageBox.confirm(
    `确定要删除用户 "${user.username}" 吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(async () => {
    try {
      userActionUserId.value = user.id; // 记录当前操作的用户ID
      await adminStore.deleteUser(user.id);
      ElMessage.success('删除成功');
    } catch (error) {
      ElMessage.error(error.message || '删除失败');
    } finally {
      userActionUserId.value = null; // 重置用户ID
    }
  }).catch(() => {
    ElMessage.info('已取消删除');
  });
}

// 编辑用户处理
const editDialogVisible = ref(false)
const currentUser = ref({}) // 存放当前正在编辑的用户数据

const openEditDialog = (user) => {
  currentUser.value = { ...user }; // 复制用户数据到对话框表单
  editDialogVisible.value = true;
}

const closeEditDialog = () => {
  currentUser.value = {}; // 清空当前用户数据
}

const saveEdit = async () => {
  try {
    userActionUserId.value = currentUser.value.id; // 记录当前操作的用户ID
    // 调用 store 的更新用户 action
    await adminStore.updateUser(currentUser.value.id, currentUser.value);
    ElMessage.success('保存成功');
    editDialogVisible.value = false; // 关闭对话框
  } catch (error) {
    ElMessage.error(error.message || '保存失败');
  } finally {
    userActionUserId.value = null; // 重置用户ID
  }
}

// 组件挂载后获取用户列表
onMounted(() => {
  adminStore.fetchUsers()
})

// 移除了模拟数据，现在数据来自 store
// const users = ref([...])
</script>

<style scoped>
.user-management {
  padding: 20px;
}
</style>