<template>
  <div class="vehicle-management">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>我的车辆</span>
          <el-button type="primary" @click="showAddDialog">添加车辆</el-button>
        </div>
      </template>

      <!-- 车辆列表 -->
      <el-table :data="vehicles" style="width: 100%" v-loading="loading">
        <el-table-column prop="plateNumber" label="车牌号" />
        <el-table-column prop="brand" label="品牌" />
        <el-table-column prop="model" label="型号" />
        <el-table-column prop="color" label="颜色" />
        <el-table-column prop="year" label="年份" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button-group>
              <el-button type="primary" size="small" @click="handleEdit(row)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </el-button-group>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加/编辑车辆对话框 -->
    <el-dialog
      :title="dialogType === 'add' ? '添加车辆' : '编辑车辆'"
      v-model="dialogVisible"
      width="500px"
    >
      <el-form
        ref="vehicleFormRef"
        :model="vehicleForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="车牌号" prop="plateNumber">
          <el-input v-model="vehicleForm.plateNumber" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="vehicleForm.brand" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="vehicleForm.model" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="vehicleForm.color" />
        </el-form-item>
        <el-form-item label="年份" prop="year">
          <el-input-number v-model="vehicleForm.year" :min="1900" :max="new Date().getFullYear()" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getVehicles, addVehicle, editVehicle, deleteVehicle } from '@/api/vehicle'

const authStore = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const dialogType = ref('add')
const vehicleFormRef = ref(null)
const vehicles = ref([])

const vehicleForm = reactive({
  plateNumber: '',
  brand: '',
  model: '',
  color: '',
  year: new Date().getFullYear()
})

const rules = {
  plateNumber: [
    { required: true, message: '请输入车牌号', trigger: 'blur' },
    { pattern: /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4,5}[A-Z0-9挂学警港澳]$/, message: '请输入正确的车牌号', trigger: 'blur' }
  ],
  brand: [
    { required: true, message: '请输入品牌', trigger: 'blur' }
  ],
  model: [
    { required: true, message: '请输入型号', trigger: 'blur' }
  ],
  color: [
    { required: true, message: '请输入颜色', trigger: 'blur' }
  ],
  year: [
    { required: true, message: '请输入年份', trigger: 'blur' }
  ]
}

// 获取车辆列表
const fetchVehicles = async () => {
  try {
    loading.value = true
    const response = await getVehicles(authStore.user.username)
    vehicles.value = response.data
  } catch (error) {
    ElMessage.error('获取车辆列表失败')
  } finally {
    loading.value = false
  }
}

// 显示添加对话框
const showAddDialog = () => {
  dialogType.value = 'add'
  Object.assign(vehicleForm, {
    plateNumber: '',
    brand: '',
    model: '',
    color: '',
    year: new Date().getFullYear()
  })
  dialogVisible.value = true
}

// 显示编辑对话框
const handleEdit = (row) => {
  dialogType.value = 'edit'
  Object.assign(vehicleForm, row)
  dialogVisible.value = true
}

// 处理删除
const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm('确定要删除这辆车吗？', '提示', {
      type: 'warning'
    })
    
    await deleteVehicle({ vehicleId: row.id })
    ElMessage.success('删除成功')
    fetchVehicles()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!vehicleFormRef.value) return
  
  try {
    await vehicleFormRef.value.validate()
    submitting.value = true
    
    if (dialogType.value === 'add') {
      await addVehicle(vehicleForm)
      ElMessage.success('添加成功')
    } else {
      await editVehicle(vehicleForm)
      ElMessage.success('修改成功')
    }
    
    dialogVisible.value = false
    fetchVehicles()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchVehicles()
})
</script>

<style scoped>
.vehicle-management {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 