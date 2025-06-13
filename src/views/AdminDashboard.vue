<template>
  <div class="admin-dashboard">
    <el-container>
      <el-aside width="200px">
        <el-menu
          :default-active="$route.path"
          router
          class="admin-menu"
        >
          <el-menu-item index="/admin/dashboard/workers">
            <el-icon><User /></el-icon>
            <span>维修人员管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/dashboard/user">
            <el-icon><User /></el-icon>
            <span>用户管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/dashboard/vehicles">
            <el-icon><Van /></el-icon>
            <span>车辆管理</span>
          </el-menu-item>
          <el-menu-item index="/admin/dashboard/orders">
            <el-icon><Document /></el-icon>
            <span>工单管理</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { User, Van, Document } from '@element-plus/icons-vue'
import UserManagementView from './UserManagementView.vue'
</script>

<style scoped>
.admin-dashboard {
  height: 100vh;
}

.el-aside {
  background-color: #f5f7fa;
  border-right: solid 1px #e6e6e6;
}

.admin-menu {
  border-right: none;
}

.el-main {
  padding: 20px;
  background-color: #fff;
}
</style>