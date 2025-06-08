<template>
  <div class="user-home">
    <el-row :gutter="20">
      <!-- 欢迎卡片 -->
      <el-col :span="24">
        <el-card class="welcome-card">
          <template #header>
            <div class="welcome-header">
              <h2>欢迎回来，{{ username }}</h2>
              <p class="welcome-time">{{ currentTime }}</p>
            </div>
          </template>
          <div class="welcome-content">
            <p>您可以在本系统中管理您的车辆信息、提交维修申请、查看维修订单等。</p>
          </div>
        </el-card>
      </el-col>

      <!-- 统计卡片 -->
      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">
              <el-icon><Van /></el-icon>
              <span>我的车辆</span>
            </div>
          </template>
          <div class="stat-content">
            <h3>{{ vehicleCount }}</h3>
            <p>已登记的车辆数量</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">
              <el-icon><Tools /></el-icon>
              <span>维修申请</span>
            </div>
          </template>
          <div class="stat-content">
            <h3>{{ repairCount }}</h3>
            <p>待处理的维修申请</p>
          </div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card class="stat-card">
          <template #header>
            <div class="stat-header">
              <el-icon><List /></el-icon>
              <span>维修订单</span>
            </div>
          </template>
          <div class="stat-content">
            <h3>{{ orderCount }}</h3>
            <p>历史维修订单</p>
          </div>
        </el-card>
      </el-col>

      <!-- 最近订单 -->
      <el-col :span="24">
        <el-card class="recent-orders">
          <template #header>
            <div class="card-header">
              <div class="header-left">
                <span>维修订单</span>
                <el-select
                  v-model="selectedVehicleId"
                  placeholder="选择车辆"
                  class="vehicle-select"
                  @change="handleVehicleChange"
                >
                  <el-option
                    v-for="vehicle in vehicles"
                    :key="vehicle.id"
                    :label="vehicle.licensePlate"
                    :value="vehicle.id"
                  />
                </el-select>
              </div>
              <el-button type="primary" link @click="viewAllOrders">
                查看全部
              </el-button>
            </div>
          </template>
          <el-table :data="recentOrders" style="width: 100%" v-loading="loading">
            <el-table-column prop="orderId" label="订单编号" width="180" />
            <el-table-column prop="licensePlate" label="车牌号" width="120" />
            <el-table-column prop="repairType" label="维修类型" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)">
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createTime" label="申请时间" width="180">
              <template #default="{ row }">
                {{ formatDate(row.createTime) }}
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="{ row }">
                <el-button type="primary" link @click="viewOrderDetail(row)">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Van, Tools, List } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { getRecentOrders } from '@/api/user'
import { getVehicles } from '@/api/vehicle'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)

// 用户名
const username = computed(() => authStore.username || '用户')

// 当前时间
const currentTime = computed(() => {
  const now = new Date()
  return now.toLocaleString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
})

// 车辆列表和选中的车辆
const vehicles = ref([])
const selectedVehicleId = ref(null)

// 统计数据
const vehicleCount = ref(0)
const repairCount = ref(0)
const orderCount = ref(0)
const recentOrders = ref([])

// 获取用户车辆列表
const fetchVehicles = async () => {
  try {
    if (!authStore.username) {
      throw new Error('用户未登录');
    }
    const response = await getVehicles(authStore.username)
    vehicles.value = response.data || []
    if (vehicles.value.length > 0) {
      selectedVehicleId.value = vehicles.value[0].id
      fetchRecentOrders(selectedVehicleId.value)
    }
  } catch (error) {
    ElMessage.error('获取车辆列表失败：' + (error.message || '未知错误'))
  }
}

// 处理车辆选择变化
const handleVehicleChange = (vehicleId) => {
  fetchRecentOrders(vehicleId)
}

// 获取最近订单
const fetchRecentOrders = async (vehicleId) => {
  try {
    loading.value = true
    const response = await getRecentOrders(vehicleId)
    recentOrders.value = response.data || []
    
    // 更新统计数据
    vehicleCount.value = vehicles.value.length || 0
    repairCount.value = recentOrders.value.filter(order => order.status === 'PENDING').length || 0
    orderCount.value = recentOrders.value.length || 0
  } catch (error) {
    ElMessage.error('获取订单失败：' + error.message)
  } finally {
    loading.value = false
  }
}

// 查看所有订单
const viewAllOrders = () => {
  router.push('/user-dashboard/orders')
}

// 查看订单详情
const viewOrderDetail = (order) => {
  router.push(`/user-dashboard/orders/${order.orderId}`)
}

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleString('zh-CN')
}

// 获取状态类型
const getStatusType = (status) => {
  const statusMap = {
    'PENDING': 'warning',
    'PROCESSING': 'primary',
    'COMPLETED': 'success',
    'CANCELLED': 'info'
  }
  return statusMap[status] || 'info'
}

// 获取状态文本
const getStatusText = (status) => {
  const statusMap = {
    'PENDING': '待处理',
    'PROCESSING': '处理中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消'
  }
  return statusMap[status] || status
}

onMounted(() => {
  fetchVehicles()
})
</script>

<style scoped>
.user-home {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.welcome-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.welcome-header h2 {
  margin: 0;
  font-size: 24px;
  color: #303133;
}

.welcome-time {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.welcome-content {
  color: #606266;
  line-height: 1.6;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: #303133;
}

.stat-content {
  text-align: center;
  padding: 20px 0;
}

.stat-content h3 {
  margin: 0;
  font-size: 28px;
  color: #409EFF;
}

.stat-content p {
  margin: 8px 0 0;
  color: #909399;
}

.recent-orders {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header span {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.vehicle-select {
  width: 200px;
}
</style> 