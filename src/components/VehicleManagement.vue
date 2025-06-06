<template>
  <div class="vehicle-management">
    <div class="header">
      <h2>车辆管理</h2>
      <el-button type="primary" @click="handleExport">导出数据</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="vehicles"
      style="width: 100%"
      border
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="licensePlate" label="车牌号" width="120" />
      <el-table-column prop="brand" label="品牌" width="120" />
      <el-table-column prop="model" label="型号" width="120" />
      <el-table-column prop="year" label="年份" width="100" />
      <el-table-column prop="color" label="颜色" width="100" />
      <el-table-column prop="vin" label="VIN码" width="180" />
      <el-table-column prop="lastMaintenanceDate" label="最后维护时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.lastMaintenanceDate) }}
        </template>
      </el-table-column>
      <el-table-column prop="ownerName" label="车主姓名" width="120" />
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
      :title="dialogType === 'edit' ? '编辑车辆信息' : '新增车辆'"
      width="500px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="车牌号" prop="licensePlate">
          <el-input v-model="form.licensePlate" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="form.brand" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="form.model" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input-number v-model="form.year" :min="1900" :max="new Date().getFullYear()" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="form.color" />
        </el-form-item>
        <el-form-item label="VIN码" prop="vin">
          <el-input v-model="form.vin" />
        </el-form-item>
        <el-form-item label="最后维护时间" prop="lastMaintenanceDate">
          <el-date-picker
            v-model="form.lastMaintenanceDate"
            type="datetime"
            placeholder="选择日期时间"
          />
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
  getAllVehicles, 
  updateVehicle, 
  deleteVehicle,
  exportVehicles 
} from '@/api/admin'

const loading = ref(false)
const vehicles = ref([])
const dialogVisible = ref(false)
const dialogType = ref('edit')
const formRef = ref(null)

const form = ref({
  id: null,
  licensePlate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  vin: '',
  lastMaintenanceDate: null
})

const rules = {
  licensePlate: [{ required: true, message: '请输入车牌号', trigger: 'blur' }],
  brand: [{ required: true, message: '请输入品牌', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  year: [{ required: true, message: '请输入年份', trigger: 'blur' }],
  color: [{ required: true, message: '请输入颜色', trigger: 'blur' }],
  vin: [{ required: true, message: '请输入VIN码', trigger: 'blur' }]
}

// 获取车辆列表
const fetchVehicles = async () => {
  try {
    loading.value = true
    const response = await getAllVehicles()
    vehicles.value = response.data
  } catch (error) {
    ElMessage.error('获取车辆列表失败：' + error.message)
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
    await ElMessageBox.confirm('确定要删除该车辆信息吗？', '提示', {
      type: 'warning'
    })
    await deleteVehicle(row.id)
    ElMessage.success('删除成功')
    fetchVehicles()
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
      await updateVehicle(form.value.id, form.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchVehicles()
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  }
}

// 处理导出
const handleExport = async () => {
  try {
    const response = await exportVehicles()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'vehicles.xlsx')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error('导出失败：' + error.message)
  }
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

onMounted(() => {
  fetchVehicles()
})
</script>

<style scoped>
.vehicle-management {
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