// src/stores/auth.js (Pinia store)
import { defineStore } from 'pinia';
// 确保这些 API 函数已正确导入且能正常工作
import { adminLogin } from '@/api/admin';
import { repairmanLogin } from '@/api/repairman';
import { userLogin } from '@/api/user';
import router from '@/router';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    role: localStorage.getItem('role') || null,
    token: localStorage.getItem('token') || null,
  }),
  actions: {
    async login(credentials) { // credentials 是从 LoginView.vue 传来的 { username, password, role }
      const { username, password, role } = credentials; // 解构参数
      try {
        let response;
        const loginPayload = { username, password }; // <--- 构造只包含 username 和 password 的对象给 API 调用

        console.log(`auth.js: Calling login API for role '${role}' with payload:`, loginPayload);

        if (role === 'admin') {
          response = await adminLogin(loginPayload);
        } else if (role === 'worker') {
          response = await repairmanLogin(loginPayload); // <--- 确保 repairmanLogin 发送 loginPayload
        } else if (role === 'user') {
          response = await userLogin(loginPayload);
        } else {
          throw new Error('未知角色');
        }

        console.log("auth.js: Backend login response:", response);

        // 检查后端响应是否成功，并包含 token
        // 假设后端成功响应结构为 { success: true, message: "...", token: "..." }
        // 或者像您之前提供的成功注册响应 { code: 200, message: "...", data: { token: "..." } }
        // 我们需要统一或兼容这两种结构
        let successFlag = false;
        let responseToken = null;
        let responseMessage = '登录失败或响应格式不正确';

        if (response && response.data) { // 普遍的 Axios 响应结构
            if (response.data.success === true && response.data.token) { // 结构 1
                successFlag = true;
                responseToken = response.data.token;
                responseMessage = response.data.message || '登录成功';
            } else if (response.data.code === 200 && response.data.data && response.data.data.token) { // 结构 2 (类似注册成功)
                successFlag = true;
                responseToken = response.data.data.token;
                responseMessage = response.data.message || '登录成功';
            } else if (response.data.message) { // 如果有错误消息
                responseMessage = response.data.message;
            }
        } else if (response && response.token) { // 如果 token 直接在 response 下 (不常见于 Axios)
            successFlag = true;
            responseToken = response.token;
            responseMessage = response.message || '登录成功';
        }


        if (successFlag && responseToken) {
          this.token = responseToken;
          localStorage.setItem('token', responseToken);

          // 更新 store 中的 user 和 role 信息
          this.user = {
            username: username, // 使用登录时传入的 username
            // 如果后端在登录成功响应中返回了用户ID或其他信息，可以在这里合并
            // 例如: id: response.data.data.userId (如果后端返回了这个)
          };
          this.role = role; // 使用登录时传入的 role

          localStorage.setItem('user', JSON.stringify(this.user));
          localStorage.setItem('role', this.role);

          return {
            success: true,
            message: responseMessage,
            token: responseToken,
            user: this.user // 可以选择性地返回更新后的 user 对象
          };
        } else {
          // 后端返回了数据，但 success 不为 true，或者缺少 token，或者响应结构不符合预期
          throw new Error(responseMessage);
        }
      } catch (error) {
        this.clearAuth(); // 登录失败时清除认证信息
        console.error('auth.js: Login action error:', error);
        // 尝试从 error.response.data.message 获取更具体的后端错误信息
        const errorMessage = (error.response && error.response.data && error.response.data.message)
                              ? error.response.data.message
                              : (error.message || '登录请求失败');
        throw new Error(errorMessage);
      }
    },

    clearAuth() {
      this.token = null;
      this.user = null;
      this.role = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('role');
    },

    logout() {
      this.clearAuth();
      router.push('/login');
    },
  },
});