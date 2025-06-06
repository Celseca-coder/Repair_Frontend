<template>
  <div class="vehicle-list">
    <el-button type="primary" @click="showAddDialog">添加车辆</el-button>
    
    <el-table :data="vehicles" style="width: 100%">
      <el-table-column prop="licensePlate" label="车牌号" />
      <el-table-column prop="brand" label="品牌型号" />
      <el-table-column prop="purchaseDate" label="购买日期" />
      <el-table-column prop="mileage" label="当前里程（km）" />
      <el-table-column label="操作">
        <template #default="scope">
          <el-button size="small" @click="editVehicle(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="deleteVehicle(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑车辆' : '新增车辆'">
      <el-form :model="currentVehicle">
        <el-form-item label="车牌号" required>
          <el-input v-model="currentVehicle.licensePlate" />
        </el-form-item>
        <el-form-item label="品牌型号">
          <el-input v-model="currentVehicle.brand" />
        </el-form-item>
        <el-form-item label="购买日期">
          <el-date-picker 
            v-model="currentVehicle.purchaseDate"
            type="date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item label="当前里程">
          <el-input-number v-model="currentVehicle.mileage" :min="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitVehicle">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

// 模拟数据
const vehicles = ref([
  { 
    id: 1,
    licensePlate: '沪A12345',
    brand: '大众 帕萨特 2020款',
    purchaseDate: '2020-05-01',
    mileage: 25680
  }
])

const dialogVisible = ref(false)
const isEdit = ref(false)
const currentVehicle = reactive({
  id: null,
  licensePlate: '',
  brand: '',
  purchaseDate: '',
  mileage: 0
})

const showAddDialog = () => {
  Object.assign(currentVehicle, {
    id: null,
    licensePlate: '',
    brand: '',
    purchaseDate: '',
    mileage: 0
  })
  isEdit.value = false
  dialogVisible.value = true
}

const editVehicle = (vehicle) => {
  Object.assign(currentVehicle, vehicle)
  isEdit.value = true
  dialogVisible.value = true
}

const submitVehicle = () => {
  if(isEdit.value) {
    const index = vehicles.value.findIndex(v => v.id === currentVehicle.id)
    vehicles.value.splice(index, 1, {...currentVehicle})
  } else {
    vehicles.value.push({
      ...currentVehicle,
      id: Date.now()
    })
  }
  dialogVisible.value = false
  ElMessage.success('操作成功')
}

const deleteVehicle = (id) => {
  vehicles.value = vehicles.value.filter(v => v.id !== id)
  ElMessage.success('删除成功')
}
</script>