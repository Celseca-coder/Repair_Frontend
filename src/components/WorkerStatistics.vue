<template>
  <div class="worker-statistics">
    <el-card v-loading="loading">
      <template #header>
        <span>工时统计</span>
      </template>
      <div class="statistics-content">
        <p>时薪：{{ statsData.hourlyRate || '-' }} 元/小时</p>
        <p>总工时：{{ statsData.totalHours?.toFixed(2) || '-' }} 小时</p>
        <p>总收入：¥{{ statsData.totalIncome?.toFixed(2) || '-' }}</p>
        <!-- 统计图表实现 -->
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { getRepairmanIncome, getCurrentRepairman } from '@/api/repairman'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()
const loading = ref(false)

const statsData = ref({
  totalHours: null,
  hourlyRate: null,
  totalIncome: null
})

const fetchStatistics = async () => {
  try {
    loading.value = true
    // 先获取hourlyRate
    const profileRes = await getCurrentRepairman()
    const hourlyRate = profileRes.data.hourlyRate
    statsData.value.hourlyRate = hourlyRate
    // 再获取总收入
    const incomeResponse = await getRepairmanIncome(authStore.user.id)
    const totalIncome = incomeResponse.data // 假设直接返回数字
    statsData.value.totalIncome = totalIncome
    // 用hourlyRate计算总工时
    statsData.value.totalHours = hourlyRate ? (totalIncome / hourlyRate) : 0
  } catch (error) {
    console.error('获取工时统计失败:', error)
    ElMessage.error('获取工时统计失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.worker-statistics {
  padding: 20px;
}

.statistics-content {
  font-size: 16px;
  line-height: 1.8;
}
</style>