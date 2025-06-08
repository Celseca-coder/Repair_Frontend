<template>
  <el-form :model="repairForm" label-width="120px" ref="repairFormRef">
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
import { ref, reactive, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import { getVehicles } from '@/api/vehicle'
import { addRepairRequest } from '@/api/repair'

const authStore = useAuthStore()
const vehicles = ref([])

// 获取车辆列表
const fetchVehicles = async () => {
  try {
    const response = await getVehicles(authStore.username)
    vehicles.value = response.data || []
  } catch (error) {
    ElMessage.error('获取车辆列表失败：' + (error.message || '未知错误'))
  }
}

const repairForm = reactive({
  userId: authStore.user.id,
  vehicleId: null,
  faultType: '',
  description: '',
  urgency: 1
})

const repairFormRef = ref(null);
const rules = reactive({
  vehicleId: [{ required: true, message: '请选择车辆', trigger: 'change' }],
  faultType: [{ required: true, message: '请选择故障类型', trigger: 'change' }],
  description: [
    { required: true, message: '请输入故障描述', trigger: 'blur' },
    { min: 5, message: '描述至少5个字符', trigger: 'blur' }
  ],
});

const submitRepair = async () => {
  if (!repairFormRef.value) return;
  
  try {
    await repairFormRef.value.validate();
    
    const payload = {
      vehicleId: repairForm.vehicleId,
      username: authStore.username,
      description: repairForm.description
    };
    
    await addRepairRequest(payload);
    ElMessage.success('报修申请已提交');
    
    Object.assign(repairForm, {
      vehicleId: null,
      faultType: '',
      description: '',
      urgency: 1
    });
  } catch (error) {
    ElMessage.error('提交失败：' + (error.response?.data || error.message || '未知错误'));
    console.error(error);
  }
}

onMounted(() => {
  fetchVehicles()
})
</script>