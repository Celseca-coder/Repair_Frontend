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
          <template v-if="isRepairmanView && row.status === 'PENDING'">
            <el-button
              type="primary"
              size="small"
              @click="emit('accept', row.orderId)"
            >接受</el-button>
          <el-button
              type="danger"
            size="small"
              @click="emit('reject', row.orderId)"
            >拒绝</el-button>
          </template>
          <template v-else-if="isRepairmanView && row.status === 'ACCEPTED'">
            <el-button
              type="success"
              size="small"
              @click="emit('complete', row.orderId)"
            >完成</el-button>
          </template>
          <template v-if="isRepairmanView && ['COMPLETED', 'ACCEPTED', 'IN_PROGRESS'].includes(row.status)">
            <el-button
              type="info"
              size="small"
              @click="showMaterialDialog(row)"
            >记录材料</el-button>
          </template>
          <!-- 用户视图的催单按钮 -->
          <template v-if="!isRepairmanView && row.status === 'ACCEPTED'">
            <el-button
              type="warning"
              size="small"
              @click="emit('urge', row.orderId)"
            >催单</el-button>
          </template>
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
          <el-descriptions-item label="材料使用" :span="2">
            <ul v-if="currentOrder.materialUsages && currentOrder.materialUsages.length">
              <li v-for="material in currentOrder.materialUsages" :key="material.id">
                {{ material.materialName }} x {{ material.quantity }} (单价: ¥{{ material.unitPrice?.toFixed(2) || '-' }}, 总价: ¥{{ material.totalPrice?.toFixed(2) || '-' }}) - {{ material.usageDescription }}
              </li>
            </ul>
            <span v-else>暂无材料记录</span>
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

    <!-- 记录材料对话框 -->
    <el-dialog
      v-model="materialDialogVisible"
      title="记录材料"
      width="500px"
      @close="resetMaterialForm"
    >
      <el-form 
        ref="materialFormRef"
        :model="materialForm"
        :rules="materialFormRules"
        label-width="100px"
      >
        <el-form-item label="材料名称" prop="materialName">
          <el-input v-model="materialForm.materialName" />
        </el-form-item>
        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="materialForm.quantity" :min="1" />
        </el-form-item>
        <el-form-item label="单价" prop="unitPrice">
          <el-input-number v-model="materialForm.unitPrice" :min="0" :precision="2" />
        </el-form-item>
        <el-form-item label="使用描述" prop="usageDescription">
          <el-input 
            v-model="materialForm.usageDescription"
            type="textarea"
            :rows="3"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="materialDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleMaterialSubmit">确定</el-button>
        </span>
      </template>
    </el-dialog>

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
  },
  orders: {
    type: Array,
    default: () => []
  },
  loading: {
    type: Boolean,
    default: false
  },
  showMaterial: {
    type: Boolean,
    default: false
  },
  isRepairmanView: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['accept', 'reject', 'complete', 'recordMaterial', 'urge'])

const authStore = useAuthStore()
const detailDialogVisible = ref(false)
const ratingDialogVisible = ref(false)
const materialDialogVisible = ref(false)
const currentOrder = ref(null)
const materialFormRef = ref(null)
const materialForm = ref({
  repairOrderId: null,
  materialName: '',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0,
  usageDescription: ''
})

const materialFormRules = {
  materialName: [{ required: true, message: '请输入材料名称', trigger: 'blur' }],
  quantity: [{ required: true, message: '请输入数量', trigger: 'blur' }],
  unitPrice: [{ required: true, message: '请输入单价', trigger: 'blur' }],
}

const getStatusType = (status) => {
  const types = {
    'PENDING': 'warning',
    'IN_PROGRESS': 'info',
    'COMPLETED': 'success',
    'CANCELLED': 'danger',
    'ACCEPTED': 'primary'
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    'PENDING': '待处理',
    'IN_PROGRESS': '维修中',
    'COMPLETED': '已完成',
    'CANCELLED': '已取消',
    'ACCEPTED': '已接受'
  }
  return texts[status] || status
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleString()
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
  //   fetchOrders() // 重新获取工单列表 // 此处也应处理，或由父组件决定是否刷新
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
      // fetchOrders()
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('取消失败')
    }
  }
}

const showMaterialDialog = (order) => {
  currentOrder.value = order
  materialForm.value.repairOrderId = order.orderId
  materialDialogVisible.value = true
}

const resetMaterialForm = () => {
  materialFormRef.value?.resetFields()
  materialForm.value = {
    repairOrderId: null,
    materialName: '',
    quantity: 1,
    unitPrice: 0,
    totalPrice: 0,
    usageDescription: ''
  }
}

const handleMaterialSubmit = async () => {
  if (!materialFormRef.value) return
  try {
    await materialFormRef.value.validate()
    materialForm.value.totalPrice = materialForm.value.quantity * materialForm.value.unitPrice
    emit('recordMaterial', materialForm.value.repairOrderId, materialForm.value)
    materialDialogVisible.value = false
    resetMaterialForm()
  } catch (error) {
    ElMessage.error('请填写所有必填项。')
  }
}

onMounted(() => {
  // fetchOrders()
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
