<template>
  <div class="dashboard-container">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="activeMenu"
          class="dashboard-menu"
          @select="handleMenuSelect"
        >
          <el-menu-item index="profile">
            <el-icon><User /></el-icon>
            <span>个人信息</span>
          </el-menu-item>
          <el-menu-item index="vehicles">
            <el-icon><Van /></el-icon>
            <span>我的车辆</span>
          </el-menu-item>
          <el-menu-item index="repair">
            <el-icon><Tools /></el-icon>
            <span>报修申请</span>
          </el-menu-item>
          <el-menu-item index="orders">
            <el-icon><Document /></el-icon>
            <span>工单记录</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main>
        <div v-if="activeMenu === 'profile'">
          <user-profile />
        </div>
        <div v-else-if="activeMenu === 'vehicles'">
          <vehicle-list />
        </div>
        <div v-else-if="activeMenu === 'repair'">
          <repair-form />
        </div>
        <div v-else-if="activeMenu === 'orders'">
          <order-table :username="authStore.username" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { User, Van, Tools, Document } from '@element-plus/icons-vue'
import OrderTable from '@/components/OrderTable.vue'
import RepairForm from '@/components/RepairForm.vue'
import UserProfile from '@/components/UserProfile.vue'
import VehicleList from '@/components/VehicleList.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 根据路由路径确定当前激活的菜单项
const activeMenu = computed(() => {
  const path = route.path
  if (path.includes('/profile')) return 'profile'
  if (path.includes('/vehicles')) return 'vehicles'
  if (path.includes('/repair')) return 'repair'
  if (path.includes('/orders')) return 'orders'
  return 'profile' // 默认显示个人信息
})

const handleMenuSelect = (index) => {
  router.push(`/dashboard/${index}`)
}
</script>

<style scoped>
.dashboard-container {
  height: 100vh;
  background-color: #f5f7fa;
}

.el-aside {
  background-color: #fff;
  border-right: solid 1px #e6e6e6;
}

.dashboard-menu {
  border-right: none;
}

.el-main {
  padding: 20px;
  background-color: #fff;
  margin: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.el-menu-item {
  display: flex;
  align-items: center;
}

.el-icon {
  margin-right: 8px;
}
</style>