<template>
  <div class="order-management">
    <div class="header">
      <h2>维修工单管理</h2>
      <el-button type="primary" @click="handleExport">导出数据</el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="orders"
      style="width: 100%"
      border
    >
      <el-table-column prop="id" label="工单号" width="80" />
      <el-table-column prop="repairmanId" label="维修人员ID" width="100" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">{{ row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="维修描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="createTime" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="acceptTime" label="接受时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.acceptTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="completeTime" label="完成时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.completeTime) }}
        </template>
      </el-table-column>
      <el-table-column prop="totalHours" label="总工时" width="100">
        <template #default="{ row }">
          {{ row.totalHours }}小时
        </template>
      </el-table-column>
      <el-table-column prop="laborCost" label="人工费用" width="100">
        <template #default="{ row }">
          ¥{{ row.laborCost }}
        </template>
      </el-table-column>
      <el-table-column prop="materialCost" label="材料费用" width="100">
        <template #default="{ row }">
          ¥{{ row.materialCost }}
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
      :title="dialogType === 'edit' ? '编辑工单' : '新增工单'"
      width="600px"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="维修人员" prop="repairmanId">
          <el-select v-model="form.repairmanId" placeholder="请选择维修人员">
            <el-option
              v-for="repairman in repairmen"
              :key="repairman.id"
              :label="repairman.username"
              :value="repairman.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="form.status" placeholder="请选择状态">
            <el-option label="待接受" value="PENDING" />
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已取消" value="CANCELLED" />
          </el-select>
        </el-form-item>
        <el-form-item label="维修描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="请输入维修描述"
          />
        </el-form-item>
        <el-form-item label="总工时" prop="totalHours">
          <el-input-number v-model="form.totalHours" :min="0" :precision="1" />
        </el-form-item>
        <el-form-item label="人工费用" prop="laborCost">
          <el-input-number v-model="form.laborCost" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="材料费用" prop="materialCost">
          <el-input-number v-model="form.materialCost" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="维修结果" prop="repairResult">
          <el-input
            v-model="form.repairResult"
            type="textarea"
            :rows="3"
            placeholder="请输入维修结果"
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
  getAllRepairOrders, 
  updateRepairOrder, 
  deleteRepairOrder,
  exportOrders,
  getAllRepairmen 
} from '@/api/admin'

const loading = ref(false)
const orders = ref([])
const repairmen = ref([])
const dialogVisible = ref(false)
const dialogType = ref('edit')
const formRef = ref(null)

const form = ref({
  id: null,
  repairmanId: null,
  status: '',
  description: '',
  totalHours: 0,
  laborCost: 0,
  materialCost: 0,
  repairResult: ''
})

const rules = {
  repairmanId: [{ required: true, message: '请选择维修人员', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  description: [{ required: true, message: '请输入维修描述', trigger: 'blur' }],
  totalHours: [{ required: true, message: '请输入总工时', trigger: 'blur' }],
  laborCost: [{ required: true, message: '请输入人工费用', trigger: 'blur' }],
  materialCost: [{ required: true, message: '请输入材料费用', trigger: 'blur' }]
}

// 获取工单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const response = await getAllRepairOrders()
    orders.value = response.data
  } catch (error) {
    ElMessage.error('获取工单列表失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 获取维修人员列表
const fetchRepairmen = async () => {
  try {
    const response = await getAllRepairmen()
    repairmen.value = response.data
  } catch (error) {
    ElMessage.error('获取维修人员列表失败：' + error.message)
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
    await ElMessageBox.confirm('确定要删除该工单吗？', '提示', {
      type: 'warning'
    })
    await deleteRepairOrder(row.id)
    ElMessage.success('删除成功')
    fetchOrders()
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
      await updateRepairOrder(form.value.id, form.value)
      ElMessage.success('更新成功')
    }
    dialogVisible.value = false
    fetchOrders()
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  }
}

// 处理导出
const handleExport = async () => {
  try {
    const response = await exportOrders()
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', 'repair_orders.xlsx')
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
    'PENDING': 'info',
    'IN_PROGRESS': 'warning',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return types[status] || 'info'
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString()
}

onMounted(() => {
  fetchOrders()
  fetchRepairmen()
})
</script>

<style scoped>
.order-management {
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