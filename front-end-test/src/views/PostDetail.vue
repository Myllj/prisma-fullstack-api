<template>
  <div class="page">
    <el-page-header @back="$router.push('/posts')" title="返回列表" :content="post?.title || '文章详情'" />
    <el-card v-loading="loading" class="detail-card">
      <template v-if="post">
        <h2 class="detail-title">{{ post.title }}</h2>
        <div class="detail-meta">
          <span class="meta-item">作者：{{ post.user?.name || '-' }}</span>
          <span class="meta-divider">|</span>
          <span class="meta-item">创建于 {{ post.createdAt }}</span>
          <span class="meta-divider">|</span>
          <span class="meta-item">更新于 {{ post.updatedAt }}</span>
        </div>
        <div class="detail-divider"></div>
        <div class="detail-content">{{ post.content }}</div>
      </template>
      <el-empty v-else description="文章不存在" />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import api from '../api'

const route = useRoute()
const post = ref<any>(null)
const loading = ref(false)

async function fetchPost() {
  loading.value = true
  try {
    const res = await api.get(`/post/${route.params.id}`)
    post.value = res.data.data
  } finally {
    loading.value = false
  }
}

onMounted(fetchPost)
</script>

<style scoped>
.detail-card {
  margin-top: 16px;
}

.detail-title {
  font-size: 22px;
  font-weight: 700;
  color: #303133;
  margin-bottom: 16px;
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #a8abb2;
  font-size: 13px;
  margin-bottom: 24px;
}

.meta-divider {
  color: #dcdfe6;
}

.detail-divider {
  height: 1px;
  background: #eee;
  margin-bottom: 24px;
}

.detail-content {
  white-space: pre-wrap;
  line-height: 2;
  font-size: 15px;
  color: #4a4d52;
  min-height: 200px;
}
</style>
