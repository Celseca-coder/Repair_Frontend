<template>
  <div class="dashboard-container">
    <!-- 侧边栏导航 -->
    <el-menu
      class="sidebar-menu"
      :default-active="activeMenu"
      router
      :collapse="isCollapse"
    >
      <div class="logo-container">
        <h2 class="title" v-if="!isCollapse">车辆维修系统</h2>
      </div>

      <el-menu-item index="/user-dashboard">
        <el-icon><HomeFilled /></el-icon>
        <template #title>首页</template>
      </el-menu-item>

      <el-menu-item index="/user-dashboard/profile">
        <el-icon><User /></el-icon>
        <template #title>个人资料</template>
      </el-menu-item>

      <el-menu-item index="/user-dashboard/vehicles">
        <el-icon><Van /></el-icon>
        <template #title>我的车辆</template>
      </el-menu-item>

      <el-menu-item index="/user-dashboard/repair">
        <el-icon><Tools /></el-icon>
        <template #title>维修申请</template>
      </el-menu-item>

      <el-menu-item index="/user-dashboard/orders">
        <el-icon><List /></el-icon>
        <template #title>维修订单</template>
      </el-menu-item>
    </el-menu>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <!-- 顶部导航栏 -->
      <div class="top-nav">
        <el-button
          type="text"
          @click="toggleSidebar"
          class="collapse-btn"
        >
          <el-icon>
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
        </el-button>

        <div class="user-info">
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ username }}
              <el-icon><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人资料</el-dropdown-item>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>

      <!-- 路由视图 -->
      <div class="content-wrapper">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessageBox } from 'element-plus'
import {
  HomeFilled,
  User,
  Van,
  Tools,
  List,
  Expand,
  Fold,
  ArrowDown
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 侧边栏折叠状态
const isCollapse = ref(false)
const toggleSidebar = () => {
  isCollapse.value = !isCollapse.value
}

// 当前激活的菜单项
const activeMenu = computed(() => route.path)

// 用户名
const username = computed(() => authStore.username || '用户')

// 处理下拉菜单命令
const handleCommand = async (command) => {
  if (command === 'profile') {
    router.push('/user-dashboard/profile')
  } else if (command === 'logout') {
    try {
      await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      })
      await authStore.logout()
      router.push('/login')
    } catch (error) {
      if (error !== 'cancel') {
        console.error('退出登录失败:', error)
      }
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
}

.sidebar-menu {
  height: 100%;
  border-right: solid 1px #e6e6e6;
  background-color: #fff;
  transition: width 0.3s;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 240px;
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  border-bottom: 1px solid #e6e6e6;
}

.title {
  margin: 0;
  font-size: 18px;
  color: #303133;
  text-align: center;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.top-nav {
  height: 60px;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.collapse-btn {
  font-size: 20px;
  padding: 0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-dropdown {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #606266;
}

.user-dropdown .el-icon {
  margin-left: 4px;
}

.content-wrapper {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

/* 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>