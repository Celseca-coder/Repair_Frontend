<template>
  <div class="worker-management">
    <div class="header">
      <h2>维修人员管理</h2>
      <el-button type="primary" @click="handleExport">导出数据</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="repairmen"
      style="width: 100%"
      border
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="username" label="用户名" width="120" />
      <el-table-column prop="workType.description" label="工种" width="120" />
      <el-table-column prop="hourlyRate" label="时薪" width="100">
        <template #default="{ row }">
          ¥{{ row.hourlyRate }}
        </template>
      </el-table-column>
      <el-table-column prop="status.description" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status?.description }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button-group>
            <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
          </el-button-group>
        </template>
      </el-table-column>
    </el-table>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogType === 'edit' ? '编辑维修人员' : '新增维修人员'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" />
        </el-form-item>
        <el-form-item label="工种" prop="workType">
          <el-select v-model="form.workType" placeholder="请选择工种">
            <el-option label="机械维修" value="MECHANICAL" />
            <el-option label="电气维修" value="ELECTRICAL" />
            <el-option label="钣金喷漆" value="BODY_PAINT" />
          </el-select>
        </el-form-item>
        <el-form-item label="时薪" prop="hourlyRate">
          <el-input-number v-model="form.hourlyRate" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="在职" value="ACTIVE" />
            <el-option label="休假" value="ON_LEAVE" />
            <el-option label="离职" value="INACTIVE" />
          </el-select>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAllRepairmen, 
  updateRepairman, 
  deleteRepairman,
  exportRepairmen 
} from '@/api/admin'

const loading = ref(false)
const repairmen = ref([])
const dialogVisible = ref(false)
const dialogType = ref('edit')
const formRef = ref(null)

const form = ref({
  id: null,
  username: '',
  workType: '',
  hourlyRate: 0,
  status: ''
})

const rules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  workType: [{ required: true, message: '请选择工种', trigger: 'change' }],
  hourlyRate: [{ required: true, message: '请输入时薪', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 获取维修人员列表
const fetchRepairmen = async () => {
  try {
    loading.value = true
    const response = await getAllRepairmen()
    repairmen.value = response.data
  } catch (error) {
    ElMessage.error('获取维修人员列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 处理编辑
const handleEdit = (row) => {
  dialogType.value = 'edit'
  form.value = { ...row }
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除该维修人员吗？', '提示', {
      type: 'warning'
    })
    await deleteRepairman(row.id)
    ElMessage.success('删除成功')
    fetchRepairmen()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败：' + error.message)
    }
  }
}

// 处理提交
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    if (dialogType.value === 'edit') {
      await updateRepairman(form.value.id, form.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchRepairmen()
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  }
}

// 处理导出
const handleExport = async () => {
  try {
    const response = await exportRepairmen()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'repairmen.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  }
}

// 获取状态标签类型
const getStatusType = (status) => {
  const types = {
    'ACTIVE': 'success',
    'ON_LEAVE': 'warning',
    'INACTIVE': 'danger'
  }
  return types[status?.code] || 'info'
}

onMounted(() => {
  fetchRepairmen()
})
</script>

<style scoped>
.worker-management {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 