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