<template>
  <div class="order-management">
    <div class="brand-statistics" v-if="brandStats && Object.keys(brandStats).length">
      <el-card>
        <template #header>品牌维修统计</template>
        <el-table :data="brandStatsTable" size="small" style="width: 400px;">
          <el-table-column prop="brand" label="品牌" width="120" />
          <el-table-column prop="count" label="维修次数" width="100" />
          <el-table-column prop="avgCost" label="平均费用" width="120">
            <template #default="{ row }">¥{{ row.avgCost }}</template>
          </el-table-column>
        </el-table>
      </el-card>
    </div>
    <el-tabs v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="维修工单管理" name="orders">
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
      </el-tab-pane>

      <el-tab-pane label="待处理维修请求" name="pendingRequests">
        <el-table
          v-loading="loading"
          :data="pendingRequests"
          style="width: 100%"
          border
        >
          <el-table-column prop="id" label="请求ID" width="80" />
          <el-table-column prop="vehicle.plateNumber" label="车牌号" width="120" />
          <el-table-column prop="vehicle.brand" label="品牌" width="120" />
          <el-table-column prop="vehicle.model" label="型号" width="120" />
          <el-table-column prop="description" label="故障描述" min-width="200" show-overflow-tooltip />
          <el-table-column prop="user.username" label="用户" width="120" />
          <el-table-column prop="createTime" label="申请时间" width="180">
            <template #default="{ row }">
              {{ formatDate(row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="success" @click="handleConvert(row)">转为工单</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

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

    <!-- 转换为工单对话框 -->
    <el-dialog
      title="转换为工单"
      v-model="showConvertDialog"
      width="500px"
    >
      <el-form
        ref="convertFormRef"
        :model="convertForm"
        :rules="convertRules"
        label-width="100px"
      >
        <el-form-item label="请求ID">
          <el-input v-model="convertForm.requestId" disabled />
        </el-form-item>
        <el-form-item label="故障描述">
          <el-input v-model="convertForm.description" type="textarea" disabled />
        </el-form-item>
        <el-form-item label="选择维修人员" prop="repairmanId">
          <el-select v-model="convertForm.repairmanId" placeholder="请选择维修人员">
            <el-option
              v-for="repairman in repairmen"
              :key="repairman.id"
              :label="repairman.username"
              :value="repairman.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showConvertDialog = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitConversion">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  getAllRepairOrders, 
  updateRepairOrder, 
  deleteRepairOrder,
  exportOrders,
  getAllRepairmen,
  getPendingRepairRequests,
  convertRepairRequestToOrder,
  getBrandRepairStatistics
} from '@/api/admin'

const loading = ref(false)
const orders = ref([])
const pendingRequests = ref([])
const repairmen = ref([])
const dialogVisible = ref(false)
const dialogType = ref('edit')
const formRef = ref(null)

const activeTab = ref('orders')

const showConvertDialog = ref(false)
const convertFormRef = ref(null)
const currentPendingRequest = ref(null)

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

const convertForm = reactive({
  requestId: null,
  repairmanId: null,
  description: ''
})

const rules = {
  repairmanId: [{ required: true, message: '请选择维修人员', trigger: 'change' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }],
  description: [{ required: true, message: '请输入维修描述', trigger: 'blur' }],
  totalHours: [{ required: true, message: '请输入总工时', trigger: 'blur' }],
  laborCost: [{ required: true, message: '请输入人工费用', trigger: 'blur' }],
  materialCost: [{ required: true, message: '请输入材料费用', trigger: 'blur' }]
}

const convertRules = reactive({
  repairmanId: [{ required: true, message: '请选择维修人员', trigger: 'change' }],
})

const brandStats = ref(null)
const brandStatsTable = computed(() => {
  if (!brandStats.value) return []
  return Object.entries(brandStats.value).map(([brand, stat]) => ({
    brand,
    count: stat.count,
    avgCost: stat.avgCost
  }))
})

// 获取工单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const response = await getAllRepairOrders()
    orders.value = response.data
  } catch (error) {
    ElMessage.error('获取工单列表失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 获取待处理维修请求列表
const fetchPendingRequests = async () => {
  try {
    loading.value = true
    const response = await getPendingRepairRequests()
    pendingRequests.value = response.data
  } catch (error) {
    ElMessage.error('获取待处理维修请求失败：' + (error.message || '未知错误'))
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
    ElMessage.error('获取维修人员列表失败：' + (error.message || '未知错误'))
  }
}

// Tab 切换处理
const handleTabChange = (name) => {
  if (name === 'orders') {
    fetchOrders()
  } else if (name === 'pendingRequests') {
    fetchPendingRequests()
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
      ElMessage.error('删除失败：' + (error.message || '未知错误'))
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
    ElMessage.error('操作失败：' + (error.message || '未知错误'))
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
    ElMessage.error('导出失败：' + (error.message || '未知错误'))
  }
}

// 处理转换为工单
const handleConvert = (request) => {
  currentPendingRequest.value = request
  Object.assign(convertForm, {
    requestId: request.id,
    description: request.description,
    repairmanId: null
  })
  showConvertDialog.value = true
}

// 提交转换为工单
const handleSubmitConversion = async () => {
  if (!convertFormRef.value) return
  
  try {
    await convertFormRef.value.validate()
    
    const payload = {
      requestId: convertForm.requestId,
      repairmanId: convertForm.repairmanId,
      description: convertForm.description
    }
    
    await convertRepairRequestToOrder(convertForm.requestId, payload)
    ElMessage.success('成功转换为工单')
    showConvertDialog.value = false
    fetchPendingRequests()
    fetchOrders()
  } catch (error) {
    ElMessage.error('转换为工单失败：' + (error.response?.data || error.message || '未知错误'))
    console.error(error)
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

const fetchBrandStats = async () => {
  try {
    const res = await getBrandRepairStatistics()
    brandStats.value = res.data
  } catch (e) {
    // 可选：ElMessage.error('获取品牌统计失败')
  }
}

onMounted(() => {
  fetchOrders()
  fetchRepairmen()
  if (activeTab.value === 'pendingRequests') {
    fetchPendingRequests()
  }
  fetchBrandStats()
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