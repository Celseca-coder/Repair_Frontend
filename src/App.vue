<script setup>
import { RouterView } from 'vue-router'
</script>

<template>
  <div class="app-container">
    <!-- 添加调试信息 -->
    <div v-if="$route.path === '/'" style="color: red">
      当前路由状态：{{ $route.path }}，即将跳转到登录页...
    </div>
    <nav class="main-nav">
      <router-link to="/login">登录</router-link>
      <router-link to="/register">注册</router-link>
      <router-link to="/dashboard">用户中心</router-link>
      <router-link to="/worker/dashboard">维修工单</router-link>
      <router-link to="/admin/dashboard">管理后台</router-link>
    </nav>

    <!-- 主要内容区域 -->
    <router-view></router-view>  <!-- 确保存在路由视图 -->
  </div>
</template>

<style>
.app-container {
  max-width: 1200px;
  margin: 0 auto;
}

.main-nav {
  padding: 1rem;
  background: #f0f0f0;
  margin-bottom: 2rem;
}

.main-nav a {
  margin-right: 1rem;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background: #e0e0e0;
}
</style>
