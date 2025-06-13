import axios from 'axios';
import { useAuthStore } from '@/stores/auth';
import router from '@/router'; // 导入 router 实例，用于重定向

const api = axios.create({
  baseURL: 'http://localhost:8080', // 后端 API 的基础 URL
  timeout: 10000, // 请求超时时间
});

// 请求拦截器：在发送请求前添加 Authorization 头
api.interceptors.request.use(
  config => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误响应，特别是 401 未认证错误
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      // 处理未认证错误：清空 auth store，并重定向到登录页
      const authStore = useAuthStore();
      authStore.clearAuth(); // 假设你在 auth store 中有 clearAuth action 来清空认证信息
      // 避免在登录页因为 401 无限重定向
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login');
      }
    }
    // 如果是其他错误，继续抛出以便组件中处理
    return Promise.reject(error);
  }
);

export default api; 