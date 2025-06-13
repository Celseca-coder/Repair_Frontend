<template>
  <div class="worker-dashboard">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待处理工单" name="pending">
        <OrderTable 
          :orders="pendingOrders"
          :username="authStore.username"
          :loading="loading"
          @accept="handleAccept"
          @reject="handleReject"
        />
      </el-tab-pane>
      
      <el-tab-pane label="维修记录" name="history">
        <OrderTable 
          :orders="completedOrders"
          :username="authStore.username"
          :loading="loading"
          show-material
          @complete="handleCompleteOrder"
        />
      </el-tab-pane>
      
      <el-tab-pane label="工时统计" name="statistics">
        <WorkerStatistics :worker-id="authStore.user.id" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import OrderTable from '@/components/OrderTable.vue'
import WorkerStatistics from '@/components/WorkerStatistics.vue'
import { getRepairmanHistory, acceptOrder, rejectOrder, updateRepairResult } from '@/api/repairman'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const activeTab = ref('pending')

// 工单数据
const allOrders = ref([])
const loading = ref(false)

// 获取维修人员的历史工单
const fetchRepairmanHistory = async () => {
  try {
    loading.value = true
    const response = await getRepairmanHistory(authStore.user.id)
    console.log('后端原始响应数据:', response.data)
    
    // 转换数据以匹配 OrderTable 组件的期望格式
    allOrders.value = response.data.map(order => ({
      orderId: order.id, // 映射 id 到 orderId
      status: order.status, // 状态保持一致
      description: order.description,
      createdAt: order.createTime, // 修正：映射 createTime 到 createdAt
      completedAt: order.completeTime, // 映射 completeTime 到 completedAt
      // 以下字段在当前后端数据中可能没有，提供默认值
      vehicleInfo: order.vehicleInfo || '暂无车辆信息', // 如果后端不返回此字段，提供默认值
      repairmanName: '-', // 维修人员名称，后端数据中没有，暂时设为'-'
      totalCost: (order.laborCost || 0) + (order.materialCost || 0), // 计算总费用，确保null值处理
      ...order // 保留其他原有字段
    }))
    console.log('映射后的 allOrders:', allOrders.value)
    
  } catch (error) {
    console.error('获取历史工单失败:', error)
    ElMessage.error('获取历史工单失败')
  } finally {
    loading.value = false
  }
}

// 在组件挂载时获取数据
onMounted(() => {
  fetchRepairmanHistory()
})

const pendingOrders = computed(() => {
  const filtered = allOrders.value.filter(o => o.status === 'PENDING')
  console.log('待处理工单 (pendingOrders):', filtered)
  return filtered
})

const completedOrders = computed(() => {
  const filtered = allOrders.value.filter(o => o.status !== 'PENDING')
  console.log('维修记录 (completedOrders):', filtered)
  return filtered
})

const handleAccept = async (orderId) => {
  try {
    await acceptOrder(authStore.user.id, orderId)
    ElMessage.success('工单已接受')
    fetchRepairmanHistory() // 重新获取工单列表以更新UI
  } catch (error) {
    console.error('接受工单失败:', error)
    ElMessage.error('接受工单失败')
  }
}

const handleReject = async (orderId) => {
  try {
    await rejectOrder(authStore.user.id, orderId)
    ElMessage.success('工单已拒绝')
    fetchRepairmanHistory() // 重新获取工单列表以更新UI
  } catch (error) {
    console.error('拒绝工单失败:', error)
    ElMessage.error('拒绝工单失败')
  }
}

const handleCompleteOrder = async (orderId) => {
  try {
    await updateRepairResult(authStore.user.id, orderId, 'COMPLETED')
    ElMessage.success('工单已完成')
    fetchRepairmanHistory() // 重新获取工单列表以更新UI
  } catch (error) {
    console.error('完成工单失败:', error)
    ElMessage.error('完成工单失败')
  }
}
</script>

<style scoped>
.worker-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>