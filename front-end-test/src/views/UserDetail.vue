<template>
  <div class="page">
    <el-page-header @back="$router.push('/users')" title="返回列表" :content="`用户 #${user?.id}`" />
    <el-card v-loading="loading" style="margin-top: 16px">
      <template v-if="user">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="ID">{{ user.id }}</el-descriptions-item>
          <el-descriptions-item label="用户名">{{ user.name }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ user.email }}</el-descriptions-item>
          <el-descriptions-item label="角色">{{ user.role }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ user.createdAt }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ user.updatedAt }}</el-descriptions-item>
        </el-descriptions>
      </template>
      <el-empty v-else description="用户不存在" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const user = ref<any>(null)
const loading = ref(false)

async function fetchUser() {
  loading.value = true
  try {
    const res = await api.get(`/user/${route.params.id}`)
    user.value = res.data.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchUser)
</script>
