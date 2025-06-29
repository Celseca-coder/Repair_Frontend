import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    redirect: '/login'  // 添加根路径重定向
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue')
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('@/views/RegisterView.vue')
  },
  {
    path: '/user-dashboard',
    name: 'UserDashboard',
    component: () => import('@/views/UserDashboard.vue'),
    meta: { requiresAuth: true, role: 'user' },
    children: [
      {
        path: '',
        name: 'UserHome',
        component: () => import('@/views/UserHome.vue')
      },
      {
        path: 'profile',
        name: 'UserProfile',
        component: () => import('@/components/UserProfile.vue')
      },
      {
        path: 'vehicles',
        name: 'VehicleList',
        component: () => import('@/components/VehicleList.vue')
      },
      {
        path: 'repair',
        name: 'RepairForm',
        component: () => import('@/components/RepairForm.vue')
      },
      {
        path: 'orders',
        name: 'OrderHistory',
        component: () => import('@/views/user-dashboard/OrderHistory.vue')
      }
    ]
  },
  {
    path: '/worker/dashboard',
    name: 'WorkerDashboard',
    component: () => import('@/views/WorkerDashboard.vue'),
    meta: { requiresAuth: true, role: 'worker' },
    children: [
      {
        path: '',
        name: 'WorkerOrders',
        component: () => import('@/views/worker/RepairmanOrdersView.vue')
      },
      {
        path: 'profile',
        name: 'RepairmanProfile',
        component: () => import('@/views/worker/RepairmanProfile.vue')
      }
    ]
  },
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: () => import('@/views/AdminDashboard.vue'),
    meta: { requiresAuth: true, role: 'admin' },
    children: [
      {
        path: 'workers',
        name: 'WorkerManagement',
        component: () => import('@/components/WorkerManagement.vue')
      },
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/UserManagementView.vue')
      },
      {
        path: 'vehicles',
        name: 'VehicleManagement',
        component: () => import('@/components/VehicleManagement.vue')
      },
      {
        path: 'orders',
        name: 'OrderManagement',
        component: () => import('@/components/OrderManagement.vue')
      }
    ]
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue')
  }
]

// 创建路由实例
const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const requiredRole = to.meta.role

  if (requiresAuth && !authStore.token) {
    next('/login')
  } else if (requiresAuth && requiredRole && authStore.role !== requiredRole) {
    next('/login')
  } else {
    next()
  }
})

export default router