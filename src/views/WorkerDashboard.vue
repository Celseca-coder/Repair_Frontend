<template>
  <div class="worker-dashboard">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="待处理工单" name="pending">
        <OrderTable 
          :orders="pendingOrders"
          @accept="handleAccept"
          @reject="handleReject"
        />
      </el-tab-pane>
      
      <el-tab-pane label="维修记录" name="history">
        <OrderTable 
          :orders="completedOrders"
          show-material
        />
      </el-tab-pane>
      
      <el-tab-pane label="工时统计" name="statistics">
        <WorkerStatistics :worker-id="authStore.user.id" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import OrderTable from '@/components/OrderTable.vue'
import WorkerStatistics from '@/components/WorkerStatistics.vue'

const authStore = useAuthStore()
const activeTab = ref('pending')

// 模拟数据
const allOrders = ref([])

const pendingOrders = computed(() => 
  allOrders.value.filter(o => o.status === 'pending')
)

const completedOrders = computed(() =>
  allOrders.value.filter(o => ['completed', 'rejected'].includes(o.status))
)

const handleAccept = (orderId) => {
  const order = allOrders.value.find(o => o.id === orderId)
  order.status = 'accepted'
}

const handleReject = (orderId) => {
  const order = allOrders.value.find(o => o.id === orderId)
  order.status = 'rejected'
}
</script>

<style scoped>
.worker-dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}
</style>