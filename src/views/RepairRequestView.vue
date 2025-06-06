<template>
  <div class="repair-request">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>维修请求</span>
          <el-button type="primary" @click="showRequestDialog">发起维修请求</el-button>
        </div>
      </template>

      <!-- 维修请求列表 -->
      <el-tabs v-model="activeTab">
        <el-tab-pane label="待处理" name="pending">
          <el-table :data="filteredRequests('PENDING')" style="width: 100%" v-loading="loading">
            <el-table-column prop="vehicle.plateNumber" label="车牌号" />
            <el-table-column prop="description" label="故障描述" />
            <el-table-column prop="createTime" label="创建时间">
              <template #default="{ row }">
                {{ new Date(row.createTime).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button-group>
                  <el-button type="primary" size="small" @click="handleUrge(row)">
                    催单
                  </el-button>
                  <el-button type="danger" size="small" @click="handleCancel(row)">
                    取消
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="处理中" name="processing">
          <el-table :data="filteredRequests('PROCESSING')" style="width: 100%" v-loading="loading">
            <el-table-column prop="vehicle.plateNumber" label="车牌号" />
            <el-table-column prop="description" label="故障描述" />
            <el-table-column prop="createTime" label="创建时间">
              <template #default="{ row }">
                {{ new Date(row.createTime).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="repairman.username" label="维修人员" />
            <el-table-column label="操作" width="200">
              <template #default="{ row }">
                <el-button-group>
                  <el-button type="primary" size="small" @click="handleUrge(row)">
                    催单
                  </el-button>
                  <el-button type="success" size="small" @click="handleReview(row)">
                    评价
                  </el-button>
                </el-button-group>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane label="已完成" name="completed">
          <el-table :data="filteredRequests('COMPLETED')" style="width: 100%" v-loading="loading">
            <el-table-column prop="vehicle.plateNumber" label="车牌号" />
            <el-table-column prop="description" label="故障描述" />
            <el-table-column prop="createTime" label="创建时间">
              <template #default="{ row }">
                {{ new Date(row.createTime).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="repairman.username" label="维修人员" />
            <el-table-column prop="rating" label="评分">
              <template #default="{ row }">
                <el-rate v-model="row.rating" disabled />
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 发起维修请求对话框 -->
    <el-dialog
      title="发起维修请求"
      v-model="requestDialogVisible"
      width="500px"
    >
      <el-form
        ref="requestFormRef"
        :model="requestForm"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="选择车辆" prop="vehicleId">
          <el-select v-model="requestForm.vehicleId" placeholder="请选择车辆">
            <el-option
              v-for="vehicle in vehicles"
              :key="vehicle.id"
              :label="vehicle.plateNumber"
              :value="vehicle.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="故障描述" prop="description">
          <el-input
            v-model="requestForm.description"
            type="textarea"
            :rows="4"
            placeholder="请详细描述车辆故障情况"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="requestDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitRequest" :loading="submitting">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 评价对话框 -->
    <el-dialog
      title="维修评价"
      v-model="reviewDialogVisible"
      width="500px"
    >
      <el-form
        ref="reviewFormRef"
        :model="reviewForm"
        :rules="reviewRules"
        label-width="100px"
      >
        <el-form-item label="评分" prop="rating">
          <el-rate v-model="reviewForm.rating" />
        </el-form-item>
        <el-form-item label="评价内容" prop="comment">
          <el-input
            v-model="reviewForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="reviewDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitReview" :loading="submitting">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 催单对话框 -->
    <el-dialog
      title="催单"
      v-model="urgeDialogVisible"
      width="500px"
    >
      <el-form
        ref="urgeFormRef"
        :model="urgeForm"
        label-width="100px"
      >
        <el-form-item label="备注" prop="remark">
          <el-input
            v-model="urgeForm.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入催单备注（选填）"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="urgeDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmitUrge" :loading="submitting">
            提交
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { getVehicles } from '@/api/vehicle'
import { addRepairRequest, getRepairRequests } from '@/api/repair'
import { urgeOrder } from '@/api/urge'
import { addReview } from '@/api/review'

const authStore = useAuthStore()
const loading = ref(false)
const submitting = ref(false)
const activeTab = ref('pending')
const requestDialogVisible = ref(false)
const reviewDialogVisible = ref(false)
const urgeDialogVisible = ref(false)
const requestFormRef = ref(null)
const reviewFormRef = ref(null)
const urgeFormRef = ref(null)
const vehicles = ref([])
const requests = ref([])
const currentRequest = ref(null)

// 表单数据
const requestForm = reactive({
  vehicleId: '',
  description: ''
})

const reviewForm = reactive({
  rating: 5,
  comment: ''
})

const urgeForm = reactive({
  remark: ''
})

// 表单验证规则
const rules = {
  vehicleId: [
    { required: true, message: '请选择车辆', trigger: 'change' }
  ],
  description: [
    { required: true, message: '请输入故障描述', trigger: 'blur' },
    { min: 10, message: '描述至少10个字符', trigger: 'blur' }
  ]
}

const reviewRules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 5, message: '评价至少5个字符', trigger: 'blur' }
  ]
}

// 根据状态过滤请求
const filteredRequests = (status) => {
  return requests.value.filter(request => request.status === status)
}

// 获取车辆列表
const fetchVehicles = async () => {
  try {
    const response = await getVehicles(authStore.user.username)
    vehicles.value = response.data
  } catch (error) {
    ElMessage.error('获取车辆列表失败')
  }
}

// 获取维修请求列表
const fetchRequests = async () => {
  try {
    loading.value = true
    const response = await getRepairRequests(authStore.user.username)
    requests.value = response.data
  } catch (error) {
    ElMessage.error('获取维修请求列表失败')
  } finally {
    loading.value = false
  }
}

// 显示发起维修请求对话框
const showRequestDialog = () => {
  if (vehicles.value.length === 0) {
    ElMessage.warning('请先添加车辆')
    return
  }
  requestForm.vehicleId = ''
  requestForm.description = ''
  requestDialogVisible.value = true
}

// 提交维修请求
const handleSubmitRequest = async () => {
  if (!requestFormRef.value) return
  
  try {
    await requestFormRef.value.validate()
    submitting.value = true
    
    await addRepairRequest(requestForm)
    ElMessage.success('维修请求已提交')
    requestDialogVisible.value = false
    fetchRequests()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '提交失败')
  } finally {
    submitting.value = false
  }
}

// 处理催单
const handleUrge = (row) => {
  currentRequest.value = row
  urgeForm.remark = ''
  urgeDialogVisible.value = true
}

// 提交催单
const handleSubmitUrge = async () => {
  try {
    submitting.value = true
    await urgeOrder(currentRequest.value.id, {
      username: authStore.user.username,
      remark: urgeForm.remark
    })
    ElMessage.success('催单成功')
    urgeDialogVisible.value = false
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '催单失败')
  } finally {
    submitting.value = false
  }
}

// 处理评价
const handleReview = (row) => {
  currentRequest.value = row
  reviewForm.rating = 5
  reviewForm.comment = ''
  reviewDialogVisible.value = true
}

// 提交评价
const handleSubmitReview = async () => {
  if (!reviewFormRef.value) return
  
  try {
    await reviewFormRef.value.validate()
    submitting.value = true
    
    await addReview({
      orderId: currentRequest.value.id,
      rating: reviewForm.rating,
      comment: reviewForm.comment
    })
    
    ElMessage.success('评价成功')
    reviewDialogVisible.value = false
    fetchRequests()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '评价失败')
  } finally {
    submitting.value = false
  }
}

// 处理取消请求
const handleCancel = async (row) => {
  try {
    await ElMessageBox.confirm('确定要取消这个维修请求吗？', '提示', {
      type: 'warning'
    })
    
    // TODO: 实现取消维修请求的 API
    ElMessage.success('取消成功')
    fetchRequests()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

onMounted(() => {
  fetchVehicles()
  fetchRequests()
})
</script>

<style scoped>
.repair-request {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 