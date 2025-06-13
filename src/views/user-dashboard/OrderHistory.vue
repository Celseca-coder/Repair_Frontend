<template>
  <div class="order-history">
    <h2>维修订单历史</h2>
    <OrderTable 
      :orders="orders" 
      :username="username" 
      :loading="loading"
      @urge="handleUrgeOrder"
      @rated="fetchOrders"  
    ></OrderTable>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import OrderTable from '@/components/OrderTable.vue'
import { getRepairRequests, urgeOrder } from '@/api/repair'
import { addReview } from '@/api/review' // 导入评价API
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const username = computed(() => authStore.username)

const orders = ref([])
const loading = ref(false)

const fetchOrders = async () => {
  if (!username.value) {
    ElMessage.error('无法获取用户名，请重新登录。')
    return
  }
  try {
    loading.value = true
    const response = await getRepairRequests(username.value)
    
    // 映射数据以匹配 OrderTable 组件的期望格式
    orders.value = response.data.map(order => ({
      orderId: order.id,
      status: order.status === 'APPROVED' ? 'ACCEPTED' : order.status, // 将APPROVED映射为ACCEPTED
      description: order.description,
      createdAt: order.createdAt,
      // 以下字段在 getRequest 接口中可能没有，或需要额外获取，这里提供默认值
      vehicleInfo: `车辆ID: ${order.vehicleId || '-'}`,
      repairmanName: '-', // 此接口不提供维修人员信息
      totalCost: null, // 此接口不提供总费用信息
      completedAt: null, // 此接口不提供完成时间信息
      materialUsages: [] // 此接口不提供材料使用信息
      // ...order // 保留其他原有字段，尽管此处可能不常用
    }))

  } catch (error) {
    console.error('获取维修订单历史失败:', error)
    ElMessage.error('获取维修订单历史失败')
  } finally {
    loading.value = false
  }
}

const handleUrgeOrder = async (orderId) => {
  try {
    // 备注可以根据需要自定义，这里使用默认值
    await urgeOrder(orderId, username.value, '请尽快处理我的订单。')
    ElMessage.success('催单成功！')
    fetchOrders() // 催单后刷新订单列表
  } catch (error) {
    console.error('催单失败:', error)
    ElMessage.error('催单失败！')
  }
}

// handleRated 事件在 OrderTable.vue 的 OrderRating 组件中处理，这里只需在评价成功后刷新列表
// OrderRating组件会发出 rated 事件，OrderTable会监听并转发给OrderHistory，所以在OrderHistory中直接监听rated并刷新即可

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-history {
  padding: 20px;
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style> 