<template>
  <div class="repairman-profile">
    <el-card>
      <template #header>
        <span>个人信息</span>
      </template>
      <el-descriptions v-if="repairman" :column="1" border>
        <el-descriptions-item label="用户名">{{ repairman.username }}</el-descriptions-item>
        <el-descriptions-item label="工种">{{ workTypeText(repairman.workType) }}</el-descriptions-item>
        <el-descriptions-item label="时薪">{{ repairman.hourlyRate }} 元/小时</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="statusType(repairman.status)">{{ statusText(repairman.status) }}</el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div v-else style="text-align:center;padding:2em;">正在加载...</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCurrentRepairman } from '@/api/repairman'
import { ElMessage } from 'element-plus'

const repairman = ref(null)

const fetchProfile = async () => {
  try {
    const res = await getCurrentRepairman()
    console.log('getCurrentRepairman返回:', res)
    console.log('res.data:', res.data)
    repairman.value = res.data
  } catch (e) {
    ElMessage.error('获取个人信息失败')
    console.error(e)
  }
}

onMounted(fetchProfile)

const workTypeText = (type) => {
  const map = { PAINTER: '喷漆工', MECHANIC: '机械工', ELECTRICIAN: '电工', OTHER: '其他' }
  return map[type] || type
}
const statusText = (status) => {
  const map = { IDLE: '空闲', BUSY: '忙碌', OFFLINE: '离线' }
  return map[status] || status
}
const statusType = (status) => {
  const map = { IDLE: 'success', BUSY: 'warning', OFFLINE: 'info' }
  return map[status] || 'info'
}
</script>

<style scoped>
.repairman-profile {
  max-width: 500px;
  margin: 40px auto;
}
</style> 