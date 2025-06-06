<template>
  <el-form :model="repairForm" label-width="120px">
    <el-form-item label="选择车辆" required>
      <el-select 
        v-model="repairForm.vehicleId" 
        placeholder="请选择报修车辆"
        class="full-width"
      >
        <el-option 
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          :label="`${vehicle.licensePlate} (${vehicle.brand})`"
          :value="vehicle.id"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="故障类型" required>
      <el-select
        v-model="repairForm.faultType"
        placeholder="请选择故障类型"
        class="full-width"
      >
        <el-option label="发动机故障" value="engine" />
        <el-option label="电气系统" value="electrical" />
        <el-option label="车身外观" value="body" />
        <el-option label="其他故障" value="others" />
      </el-select>
    </el-form-item>

    <el-form-item label="故障描述" required>
      <el-input
        v-model="repairForm.description"
        type="textarea"
        :rows="4"
        placeholder="请详细描述故障现象"
      />
    </el-form-item>

    <el-form-item label="紧急程度">
      <el-rate
        v-model="repairForm.urgency"
        :max="3"
        :texts="['普通', '紧急', '特急']"
        show-text
      />
    </el-form-item>

    <el-form-item>
      <el-button type="primary" @click="submitRepair">提交申请</el-button>
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

// 模拟车辆数据
const vehicles = ref([
  { 
    id: 1,
    licensePlate: '沪A12345',
    brand: '大众 帕萨特 2020款'
  }
])

const repairForm = reactive({
  userId: authStore.user.id,
  vehicleId: null,
  faultType: '',
  description: '',
  urgency: 1
})

const submitRepair = () => {
  // 调用API提交逻辑
  ElMessage.success('报修申请已提交')
  Object.assign(repairForm, {
    vehicleId: null,
    faultType: '',
    description: '',
    urgency: 1
  })
}
</script>