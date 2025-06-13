### 车辆维修管理系统 Vue3 前端实现方案

#### 一、技术栈配置
```bash
# 核心依赖
npm install vue@3.3.4
npm install vue-router@4.2.5
npm install pinia@2.1.7
npm install axios@1.5.0
npm install element-plus@2.3.14
npm install echarts@5.4.3  # 数据可视化需求[^1]
```

#### 二、核心模块实现

##### 1. 权限路由配置 (router/index.js)
```javascript
const routes = [
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    children: [
      // 用户路由
      { path: 'repair-order', component: RepairOrder, meta: { roles: ['user'] } },
      // 维修人员路由
      { path: 'staff/orders', component: StaffOrderList, meta: { roles: ['staff'] } },
      // 管理员路由
      { path: 'dashboard', component: AdminDashboard, meta: { roles: ['admin'] } }
    ]
  }
]

router.beforeEach((to, from) => {
  const userStore = useUserStore()
  if (!userStore.roles.some(role => to.meta.roles.includes(role))) {
    return '/403'
  }
})
```

##### 2. 工单管理组件 (components/OrderTable.vue)
```vue
<template>
  <el-table :data="orders">
    <el-table-column prop="id" label="工单号" width="120" />
    <el-table-column label="状态">
      <template #default="{row}">
        <el-tag :type="statusColor[row.status]">{{ statusMap[row.status] }}</el-tag>
      </template>
    </el-table-column>
    <el-table-column label="操作">
      <template #default="{row}">
        <el-button v-if="userStore.isStaff" @click="acceptOrder(row)">接单</el-button>
        <el-button @click="showDetail(row)">详情</el-button>
      </template>
    </el-table-column>
  </el-table>
</template>

<script setup>
const statusMap = {
  pending: '待处理',
  processing: '维修中',
  completed: '已完成'
}
</script>
```

##### 3. 维修材料记录组件 (components/MaterialForm.vue)
```vue
<template>
  <el-form :model="form">
    <el-form-item label="材料名称">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item label="单价">
      <el-input-number v-model="form.price" :precision="2" />
    </el-form-item>
    <el-button type="primary" @click="submit">提交记录</el-button>
  </el-form>
</template>
```

#### 三、关键业务逻辑实现

##### 1. 工单状态机（Pinia Store）
```javascript
// stores/order.js
export const useOrderStore = defineStore('order', {
  actions: {
    async updateStatus(orderId, newStatus) {
      await axios.patch(`/api/orders/${orderId}`, { status: newStatus })
      // 状态改为已完成时自动计算费用[^2]
      if (newStatus === 'completed') {
        await this.calculateFee(orderId)
      }
    }
  }
})
```

##### 2. 数据统计看板
```vue
<template>
  <div ref="chart" style="width: 600px;height:400px;"></div>
</template>

<script setup>
import * as echarts from 'echarts'
const chart = ref(null)

onMounted(() => {
  const myChart = echarts.init(chart.value)
  myChart.setOption({
    tooltip: { trigger: 'item' },
    series: [{
      type: 'pie',
      data: [
        { value: 65, name: '工时费' },
        { value: 35, name: '材料费' }
      ]
    }]
  })
})
</script>
```

#### 四、界面效果示例
```text
├── src
│   ├── views
│   │   ├── User
│   │   │   ├── RepairApply.vue      # 报修申请表单
│   │   │   └── OrderHistory.vue     # 历史记录查询
│   │   ├── Staff
│   │   │   ├── OrderList.vue        # 待处理工单
│   │   │   └── MaterialRecord.vue  # 材料消耗记录
│   │   └── Admin
│   │       ├── Dashboard.vue       # 数据看板
│   │       └── UserManage.vue      # 用户管理
└── └── components
        ├── StatusTag.vue           # 工单状态标签
        └── FeeCalculator.vue       # 费用计算组件
```

---
