<template>
  <div class="order-table">
    <el-table :data="orders" style="width: 100%" v-loading="loading">
      <el-table-column prop="orderId" label="工单号" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template #default="{row}">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="vehicleInfo" label="车辆信息" min-width="180" />
      <el-table-column prop="description" label="维修描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="repairmanName" label="维修人员" width="120" />
      <el-table-column prop="totalCost" label="维修费用" width="120">
        <template #default="{row}">
          ¥{{ row.totalCost?.toFixed(2) || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{row}">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column prop="completedAt" label="完成时间" width="180">
        <template #default="{row}">
          {{ formatDate(row.completedAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250" fixed="right">
        <template #default="{row}">
          <el-button 
            size="small" 
            @click="viewDetail(row)"
          >查看详情</el-button>
          <el-button
            v-if="row.status === 'PENDING'"
            type="warning"
            size="small"
            @click="urgeOrder(row)"
          >催单</el-button>
          <el-button
            v-if="row.status === 'COMPLETED' && !row.rating"
            type="success"
            size="small"
            @click="showRatingDialog(row)"
          >评价</el-button>
          <el-button
            v-if="row.status === 'PENDING'"
            type="danger"
            size="small"
            @click="cancelOrder(row)"
          >取消工单</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 工单详情对话框 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="工单详情"
      width="600px"
    >
      <template v-if="currentOrder">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="工单号">{{ currentOrder.orderId }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(currentOrder.status)">
              {{ getStatusText(currentOrder.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="车辆信息">{{ currentOrder.vehicleInfo }}</el-descriptions-item>
          <el-descriptions-item label="维修人员">{{ currentOrder.repairmanName || '-' }}</el-descriptions-item>
          <el-descriptions-item label="维修描述" :span="2">{{ currentOrder.description }}</el-descriptions-item>
          <el-descriptions-item label="维修费用">¥{{ currentOrder.totalCost?.toFixed(2) || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(currentOrder.createdAt) }}</el-descriptions-item>
          <el-descriptions-item label="完成时间">{{ formatDate(currentOrder.completedAt) }}</el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.rating" label="评分" :span="2">
            <el-rate
              v-model="currentOrder.rating"
              disabled
              show-score
              text-color="#ff9900"
            />
          </el-descriptions-item>
          <el-descriptions-item v-if="currentOrder.comment" label="评价内容" :span="2">
            {{ currentOrder.comment }}
          </el-descriptions-item>
        </el-descriptions>
      </template>
    </el-dialog>

    <!-- 评价对话框 -->
    <order-rating
      v-if="ratingDialogVisible"
      v-model:visible="ratingDialogVisible"
      :order-id="currentOrder?.orderId"
      @rated="handleRated"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import axios from 'axios'
import OrderRating from './OrderRating.vue'

const props = defineProps({
  username: {
    type: String,
    required: true
  }
})

const authStore = useAuthStore()
const loading = ref(false)
const orders = ref([])
const detailDialogVisible = ref(false)
const ratingDialogVisible = ref(false)
const currentOrder = ref(null)

const getStatusType = (status) => {
  const types = {
    'PENDING': 'warning',
    'IN_PROGRESS': 'info',
    'COMPLETED': 'success',
    'CANCELLED': 'danger'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': '待处理',
    'IN_PROGRESS': '维修中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
}

const fetchOrders = async () => {
  try {
    loading.value = true
    const response = await axios.get(`/api/repairs/history?username=${props.username}`, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response.data.code === 200) {
      orders.value = response.data.data
    }
  } catch (error) {
    ElMessage.error('获取工单历史失败')
  } finally {
    loading.value = false
  }
}

const viewDetail = (order) => {
  currentOrder.value = order
  detailDialogVisible.value = true
}

const urgeOrder = async (order) => {
  try {
    const response = await axios.post(`/api/repairs/${order.orderId}/urge`, {
      username: props.username,
      remark: '请尽快处理，车辆急需使用'
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response.data.code === 200) {
      ElMessage.success('催单成功')
    }
  } catch (error) {
    if (error.response?.data?.code === 400) {
      ElMessage.error('每小时只能催单一次')
    } else {
      ElMessage.error('催单失败')
    }
  }
}

const showRatingDialog = (order) => {
  currentOrder.value = order
  ratingDialogVisible.value = true
}

const handleRated = () => {
  fetchOrders() // 重新获取工单列表
}

const cancelOrder = async (order) => {
  try {
    await ElMessageBox.confirm('确定要取消该工单吗？', '提示', {
      type: 'warning'
    })
    const response = await axios.post(`/api/repairs/${order.orderId}/cancel`, {
      username: props.username
    }, {
      headers: {
        Authorization: `Bearer ${authStore.token}`
      }
    })
    if (response.data.code === 200) {
      ElMessage.success('取消成功')
      fetchOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-table {
  margin: 20px 0;
}

.el-descriptions {
  margin: 20px 0;
}
</style>
