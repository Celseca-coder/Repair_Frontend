<template>
  <div class="vehicle-list">
    <el-button type="primary" @click="showAddDialog" style="margin-bottom: 20px;">添加车辆</el-button>
    
    <el-table :data="vehicles" v-loading="isLoading" style="width: 100%">
      <el-table-column prop="licensePlate" label="车牌号" />
      <el-table-column prop="brand" label="品牌" />
      <el-table-column prop="model" label="型号" />
      <el-table-column prop="purchaseDate" label="购买日期" />
      <el-table-column prop="mileage" label="当前里程（km）" />
      <el-table-column label="操作" width="180">
        <template #default="scope">
          <el-button size="small" @click="showEditDialog(scope.row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="dialogVisible" :title="isEditMode ? '编辑车辆' : '新增车辆'" width="500px">
      <el-form :model="currentVehicle" ref="vehicleFormRef" :rules="rules" label-width="100px">
        <el-form-item label="车牌号" prop="licensePlate" required>
          <el-input v-model="currentVehicle.licensePlate" />
        </el-form-item>
        <el-form-item label="品牌" prop="brand">
          <el-input v-model="currentVehicle.brand" />
        </el-form-item>
        <el-form-item label="型号" prop="model">
          <el-input v-model="currentVehicle.model" />
        </el-form-item>
        <el-form-item label="购买年份" prop="year">
          <el-input-number v-model="currentVehicle.year" :min="1980" :max="2025" />
        </el-form-item>
        <el-form-item label="颜色" prop="color">
          <el-input v-model="currentVehicle.color" />
        </el-form-item>
        <el-form-item label="VIN码" prop="vin">
          <el-input v-model="currentVehicle.vin" />
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
import { ref, reactive, onMounted } from 'vue'; // 引入 onMounted
import { ElMessage, ElMessageBox } from 'element-plus'; // 引入 ElMessageBox 用于确认删除
import { getVehicles, addVehicle, editVehicle, deleteVehicle } from '@/api/vehicle'; // **【修改1】导入API函数**
import { useAuthStore } from '@/stores/auth'; // **【修改2】导入auth store以获取用户信息**

const authStore = useAuthStore();
const vehicles = ref([]);
const isLoading = ref(false); // **【修改3】添加加载状态**

const dialogVisible = ref(false);
const isEditMode = ref(false);
const vehicleFormRef = ref(null); // 用于引用表单

// 用于表单的数据对象
const currentVehicle = reactive({
  id: null, // 用于存储编辑时车辆的ID
  licensePlate: '',
  brand: '',
  model: '',
  year: new Date().getFullYear(),
  color: '',
  vin: ''
});

// 表单校验规则
const rules = reactive({
  licensePlate: [{ required: true, message: '车牌号不能为空', trigger: 'blur' }],
  brand: [{ required: true, message: '品牌不能为空', trigger: 'blur' }],
});

// **【修改4】新增获取车辆列表的函数**
const fetchVehicles = async () => {
  // 添加一个更详细的检查和日志
  if (!authStore.user || !authStore.user.username) {
    ElMessage.error('无法获取用户信息，请重新登录。');
    console.error("fetchVehicles 中断：authStore.user 或 authStore.user.username 无效。");
    return;
  }
  
  const payload = { username: authStore.user.username };
  console.log("即将发送到 /vehicles/getVehicles 的 payload:", payload); // <--- 关键日志

  isLoading.value = true;
  try {
    const response = await getVehicles(authStore.user.username); 
    vehicles.value = response.data;
  } catch (error) {
    ElMessage.error('获取车辆列表失败');
    console.error(error); // 打印完整的 Axios 错误对象
    // 可以尝试打印后端返回的具体错误信息
    if (error.response && error.response.data) {
        console.error("后端返回的错误详情:", error.response.data);
    }
  } finally {
    isLoading.value = false;
  }
};

// **【修改5】在组件挂载时自动获取数据**
onMounted(() => {
  fetchVehicles();
});

const showAddDialog = () => {
  isEditMode.value = false;
  // 重置表单对象，确保字段名一致
  Object.assign(currentVehicle, {
    id: null, licensePlate: '', brand: '', model: '', year: new Date().getFullYear(), color: '', vin: ''
  });
  dialogVisible.value = true;
};

const showEditDialog = (vehicle) => {
  isEditMode.value = true;
  // 将选中的车辆数据填充到表单对象中
  Object.assign(currentVehicle, vehicle);
  dialogVisible.value = true;
};

// **【修改6】修改提交函数，使其调用API**
const submitVehicle = async () => {
  if (!vehicleFormRef.value) return;
  // 先进行表单校验
  await vehicleFormRef.value.validate();
  
  try {
    if (isEditMode.value) {
      // 编辑车辆：匹配 editVehicles API 的 payload
      const payloadForEdit = {
        username: authStore.user.username,
        vehicleId: currentVehicle.id, // 后端期望 vehicleId
        licencePlate: currentVehicle.licensePlate, // 后端期望 licencePlate (带c)
        brand: currentVehicle.brand,
        model: currentVehicle.model,
        year: currentVehicle.year,
        color: currentVehicle.color,
        vin: currentVehicle.vin
      }; 
      await editVehicle(payloadForEdit);
      ElMessage.success('修改成功');
    } else {
      // 新增车辆：匹配 addVehicles API 的 payload
      const payloadForAdd = {
        username: authStore.user.username,
        licensePlate: currentVehicle.licensePlate, // 后端期望 licensePlate (带s)
        brand: currentVehicle.brand,
        model: currentVehicle.model,
        year: currentVehicle.year,
        color: currentVehicle.color,
        vin: currentVehicle.vin
      };
      await addVehicle(payloadForAdd);
      ElMessage.success('添加成功');
    }
    dialogVisible.value = false;
    fetchVehicles(); // **操作成功后，重新获取列表以刷新页面**
  } catch (error) {
    ElMessage.error('操作失败：' + (error.response?.data || error.message || '未知错误'));
    console.error(error);
  }
};

// **【修改7】修改删除函数，使其调用API**
const handleDelete = async (idToDelete) => {
  try {
    await ElMessageBox.confirm('您确定要删除这辆车吗？此操作不可逆。', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });

    // 删除车辆：匹配 deleteVehicles API 的 payload
    await deleteVehicle({ username: authStore.user.username, vehicleId: idToDelete });
    ElMessage.success('删除成功');
    fetchVehicles(); // **删除成功后，重新获取列表以刷新页面**
  } catch (error) {
    if (error !== 'cancel') { // 用户点击取消时，ElMessageBox会reject一个'cancel'字符串
      ElMessage.error('删除失败');
      console.error(error);
    }
  }
};
</script>

<style scoped>
.vehicle-list {
  padding: 20px;
}
</style>