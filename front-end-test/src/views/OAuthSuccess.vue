<template>
  <div class="oauth-page">
    <div class="oauth-card">
      <el-icon :size="48" color="#67c23a"><CircleCheckFilled /></el-icon>
      <h2>登录成功</h2>
      <p>正在跳转...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

onMounted(() => {
  const token = route.query.token as string
  if (token) {
    localStorage.setItem('token', token)
    router.replace('/posts')
  } else {
    router.replace('/login')
  }
})
</script>

<style scoped>
.oauth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #e8edf5 0%, #f0f4fa 100%);
}

.oauth-card {
  text-align: center;
  background: #fff;
  padding: 48px 64px;
  border-radius: 12px;
  box-shadow: 0 2px 24px rgba(0, 0, 0, 0.06);
}

.oauth-card h2 {
  margin: 16px 0 8px;
  font-size: 20px;
  color: #303133;
}

.oauth-card p {
  color: #909399;
  font-size: 14px;
}
</style>
