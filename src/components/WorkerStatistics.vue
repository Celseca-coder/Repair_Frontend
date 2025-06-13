<template>
  <div class="worker-statistics">
    <el-card v-loading="loading">
      <template #header>
        <span>工时统计</span>
      </template>
      <div class="statistics-content">
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
import { getRepairmanIncome } from '@/api/repairman'
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
    const incomeResponse = await getRepairmanIncome(authStore.user.id)
    const totalIncome = incomeResponse.data // 假设直接返回数字

    statsData.value.totalIncome = totalIncome
    statsData.value.totalHours = totalIncome / 2 // 根据需求计算工时

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