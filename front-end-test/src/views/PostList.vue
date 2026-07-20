<template>
  <div class="page">
    <el-card>
      <template #header>
        <div class="list-header">
          <span>文章管理</span>
          <el-button type="primary" @click="$router.push('/posts/create')">新增文章</el-button>
        </div>
      </template>

      <!-- 搜索框 -->
      <div class="search-bar">
        <el-input v-model="keyword" placeholder="搜索文章标题..." clearable
          @keyup.enter="handleSearch" @clear="handleSearch" />
        <el-button type="primary" class="search-btn" @click="handleSearch">搜 索</el-button>
      </div>

      <el-table :data="posts" stripe v-loading="loading" max-height="calc(100vh - 300px)">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="title" label="标题" show-overflow-tooltip />
        <el-table-column label="作者" width="120">
          <template #default="{ row }">{{ row.user?.name || '-' }}</template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="170" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" link @click="$router.push(`/posts/${row.id}`)">详情</el-button>
            <el-button type="primary" link @click="$router.push(`/posts/${row.id}/edit`)">编辑</el-button>
            <el-popconfirm title="确定删除该文章？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button type="danger" link>删除</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>

      <!-- 底部分页 -->
      <div class="pagination-bottom">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[5, 10, 20]"
          layout="total, sizes, prev, pager, next"
          @change="fetchPosts"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../api'

interface Post {
  id: number
  title: string
  content: string
  createdAt: string
  user?: { id: number; name: string; email: string }
}

const posts = ref<Post[]>([])
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

async function fetchPosts() {
  loading.value = true
  try {
    const res = await api.get('/post/list', {
      params: { page: page.value, pageSize: pageSize.value, keyword: keyword.value }
    })
    const data = res.data.data
    posts.value = data.list || data
    total.value = data.total || 0
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  page.value = 1
  fetchPosts()
}

async function handleDelete(id: number) {
  try {
    await api.delete(`/post/${id}`)
    fetchPosts()
  } catch { /* empty */ }
}

onMounted(fetchPosts)
</script>

<style scoped>
.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-bar {
  display: flex;
  gap: 10px;
  max-width: 420px;
  margin-bottom: 12px;
}

.search-bar .el-input {
  flex: 1;
}

.search-btn {
  font-weight: 600 !important;
  letter-spacing: 2px;
  padding: 0 20px !important;
  border-radius: 8px !important;
}

.pagination-bottom {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
