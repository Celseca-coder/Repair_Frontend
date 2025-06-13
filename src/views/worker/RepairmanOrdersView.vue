<template>
  <div class="repairman-orders-container">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>我的工单</span>
        </div>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 待处理工单 -->
        <el-tab-pane label="待处理工单" name="pending">
          <el-table :data="pendingOrders" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="工单编号" width="100" />
            <el-table-column prop="vehicle.plateNumber" label="车牌号" width="120" />
            <el-table-column prop="description" label="故障描述" />
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.createTime).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200" fixed="right">
              <template #default="{ row }">
                <el-button-group>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="handleAccept(row)"
                    :disabled="row.status !== 'PENDING'"
                  >
                    接受
                  </el-button>
                  <el-button 
                    type="danger" 
                    size="small" 
                    @click="handleReject(row)"
                    :disabled="row.status !== 'PENDING'"
                  >
                    拒绝
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 维修记录 -->
        <el-tab-pane label="维修记录" name="history">
          <el-table :data="historyOrders" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="工单编号" width="100" />
            <el-table-column prop="vehicle.plateNumber" label="车牌号" width="120" />
            <el-table-column prop="description" label="故障描述" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="创建时间" width="180">
              <template #default="{ row }">
                {{ new Date(row.createTime).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="completeTime" label="完成时间" width="180">
              <template #default="{ row }">
                {{ row.completeTime ? new Date(row.completeTime).toLocaleString() : '-' }}
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 拒绝工单对话框 -->
    <el-dialog
      v-model="rejectDialogVisible"
      title="拒绝工单"
      width="500px"
    >
      <el-form
        ref="rejectFormRef"
        :model="rejectForm"
        :rules="rejectRules"
        label-width="100px"
      >
        <el-form-item label="拒绝原因" prop="reason">
          <el-input
            v-model="rejectForm.reason"
            type="textarea"
            :rows="3"
            placeholder="请输入拒绝原因"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="rejectDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitReject" :loading="submitting">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getRepairmanHistory, acceptRepairOrder, rejectRepairOrder } from '@/api/repairman'

const authStore = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('pending')
const rejectDialogVisible = ref(false)
const rejectFormRef = ref(null)
const currentOrder = ref(null)

const rejectForm = ref({
  reason: ''
})

const rejectRules = {
  reason: [
    { required: true, message: '请输入拒绝原因', trigger: 'blur' },
    { min: 5, message: '拒绝原因至少5个字符', trigger: 'blur' }
  ]
}

// 获取所有工单
const orders = ref([])

// 根据状态过滤工单
const pendingOrders = computed(() => {
  return orders.value.filter(order => order.status === 'PENDING')
})

const historyOrders = computed(() => {
  return orders.value.filter(order => 
    ['REJECTED', 'COMPLETED', 'CANCELLED','ACCEPTED'].includes(order.status)
  )
})

// 获取工单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const response = await getRepairmanHistory(authStore.user.id)
    orders.value = response.data
  } catch (error) {
    ElMessage.error('获取工单列表失败：' + (error.message || '未知错误'))
  } finally {
    loading.value = false
  }
}

// 处理接受工单
const handleAccept = async (row) => {
  try {
    await ElMessageBox.confirm('确定接受该工单吗？', '提示', {
      type: 'warning'
    })
    
    submitting.value = true
    await acceptRepairOrder(authStore.user.id, row.id)
    
    ElMessage.success('已接受工单')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败：' + (error.message || '未知错误'))
    }
  } finally {
    submitting.value = false
  }
}

// 处理拒绝工单
const handleReject = (row) => {
  currentOrder.value = row
  rejectForm.value.reason = ''
  rejectDialogVisible.value = true
}

// 提交拒绝
const submitReject = async () => {
  if (!rejectFormRef.value) return
  
  try {
    await rejectFormRef.value.validate()
    submitting.value = true
    
    await rejectRepairOrder(
      authStore.user.id,
      currentOrder.value.id,
      rejectForm.value.reason
    )
    
    ElMessage.success('已拒绝工单')
    rejectDialogVisible.value = false
    fetchOrders()
  } catch (error) {
    ElMessage.error('操作失败：' + (error.message || '未知错误'))
  } finally {
    submitting.value = false
  }
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'PENDING': 'warning',
    'ACCEPTED': 'primary',
    'REJECTED': 'danger',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '待处理',
    'ACCEPTED': '已接受',
    'REJECTED': '已拒绝',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.repairman-orders-container {
  padding: 20px;
}

.box-card {
  margin-bottom: 20px;
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