<template>
  <div class="order-rating">
    <el-dialog
      v-model="dialogVisible"
      title="评价维修服务"
      width="500px"
    >
      <el-form
        :model="ratingForm"
        :rules="rules"
        ref="ratingFormRef"
        label-width="100px"
      >
        <el-form-item label="评分" prop="rating">
          <el-rate
            v-model="ratingForm.rating"
            :max="5"
            :texts="['很差', '较差', '一般', '较好', '很好']"
            show-text
          />
        </el-form-item>
        
        <el-form-item label="评价内容" prop="comment">
          <el-input
            v-model="ratingForm.comment"
            type="textarea"
            :rows="4"
            placeholder="请输入您的评价内容"
          />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">提交评价</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { addReview } from '@/api/review'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  orderId: {
    type: [Number, String],
    required: true
  },
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'rated'])

const authStore = useAuthStore()
const dialogVisible = ref(props.visible)
const ratingFormRef = ref(null)

const ratingForm = reactive({
  rating: 5,
  comment: ''
})

const rules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  comment: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 5, max: 200, message: '评价内容长度在5到200个字符之间', trigger: 'blur' }
  ]
}

watch(() => props.visible, (newVal) => {
  dialogVisible.value = newVal
})

watch(() => dialogVisible.value, (newVal) => {
  emit('update:visible', newVal)
})

const handleSubmit = async () => {
  if (!ratingFormRef.value) return
  
  await ratingFormRef.value.validate(async (valid) => {
    if (valid) {
      try {
        const reviewData = {
          userId: authStore.user.id,
          repairOrderId: props.orderId,
          rating: ratingForm.rating,
          comment: ratingForm.comment
        }
        await addReview(reviewData)
        
        ElMessage.success('评价成功')
        dialogVisible.value = false
        emit('rated')
        // 重置表单
        ratingForm.rating = 5
        ratingForm.comment = ''
      } catch (error) {
        console.error('提交评价失败:', error)
        if (error.response?.data?.code === 400) {
          ElMessage.error(error.response.data.msg || '该工单已经评价过了')
        } else {
          ElMessage.error('评价失败')
        }
      }
    }
  })
}
</script>

<style scoped>
.order-rating {
  display: inline-block;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 