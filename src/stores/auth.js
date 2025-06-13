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
  getters: {
    username: (state) => state.user?.username || null,
  },
  actions: {
        async login(credentials) {
            const { username, password, role } = credentials;
            try {
                let response;
                const loginPayload = { username, password };

                console.log(`auth.js: Calling login API for role '${role}' with payload:`, loginPayload);

                if (role === 'admin') {
                    response = await adminLogin(loginPayload);
                } else if (role === 'worker') {
                    response = await repairmanLogin(loginPayload);
                } else if (role === 'user') {
                    response = await userLogin(loginPayload);
                } else {
                    throw new Error('未知角色');
                }

                console.log("auth.js: Backend login response:", response);

                let successFlag = false;
                let responseToken = null;
                let responseUserObject = null;
                let responseMessage = '登录失败或响应格式不正确';

                if (response && response.data) {
                    // ✅ 分支1: 处理管理员登录响应
                    if (response.data.admin && response.data.token) {
                        successFlag = true;
                        responseToken = response.data.token;
                        responseUserObject = response.data.admin; // 保存 admin 对象
                        responseMessage = '管理员登录成功';
                    }
                    // ✅ 分支2: 处理工作人员登录响应
                    else if (response.data.repairman && response.data.token) {
                        successFlag = true;
                        responseToken = response.data.token;
                        responseUserObject = response.data.repairman; // 保存 repairman 对象
                        responseMessage = '工作人员登录成功';
                    }
                    // 分支3: 处理其他通用响应格式 (例如普通用户)
                    else if (response.data.success === true && response.data.token) {
                        successFlag = true;
                        responseToken = response.data.token;
                        // 确保用户对象包含用户名
                        responseUserObject = {
                            username: username,
                            ...(response.data.user || {})
                        };
                        responseMessage = response.data.message || '登录成功';
                    }
                    // 分支4: 处理另一种通用响应格式
                    else if (response.data.code === 200 && response.data.data && response.data.data.token) {
                        successFlag = true;
                        responseToken = response.data.data.token;
                        // 确保用户对象包含用户名
                        responseUserObject = {
                            username: username,
                            ...(response.data.data.user || {})
                        };
                        responseMessage = response.data.message || '登录成功';
                    }
                    // 最终，如果格式都不对，但有 message，则使用它
                    else if (response.data.message) {
                        responseMessage = response.data.message;
                    }
                }

                if (successFlag && responseToken) {
                    this.token = responseToken;
                    localStorage.setItem('token', responseToken);

                    // 确保用户对象包含必要的字段
                    this.user = {
                        username: username,
                        ...responseUserObject
                    };
                    this.role = role;

                    localStorage.setItem('user', JSON.stringify(this.user));
                    localStorage.setItem('role', this.role);

                    return {
                        success: true,
                        message: responseMessage,
                        token: responseToken,
                        user: this.user
                    };
                } else {
                    throw new Error(responseMessage);
                }
            } catch (error) {
                this.clearAuth();
                console.error('auth.js: Login action error:', error);
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