<template>
  <!-- 未登录：登录页 -->
  <div v-if="!isAuthenticated">
    <router-view />
  </div>

  <!-- 已登录：后台布局 -->
  <!-- 上下结构：顶部 header 通栏，下面左侧边栏 + 右侧内容 -->
  <el-container v-else class="layout">
    <!-- 顶部：全宽 header -->
    <el-header class="header">
      <div class="header-left">
        <svg class="logo-icon" viewBox="0 0 32 32" width="28" height="28">
          <defs>
            <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#409eff"/>
              <stop offset="100%" stop-color="#2d6cdf"/>
            </linearGradient>
          </defs>
          <path d="M16 2 L28 10 L28 22 L16 30 L4 22 L4 10 Z" fill="url(#lg)" stroke="#2d6cdf" stroke-width="0.5"/>
          <line x1="16" y1="2" x2="16" y2="30" stroke="rgba(255,255,255,0.5)" stroke-width="0.8"/>
        </svg>
        <span>Prisma Admin</span>
      </div>
      <div class="header-right">
        <span class="welcome">欢迎回来</span>
        <el-avatar :size="32" class="avatar">{{ userName?.charAt(0) || 'U' }}</el-avatar>
        <span v-if="userName" class="user-name">{{ userName }}</span>
        <el-button class="logout-btn" text @click="handleLogout">退出</el-button>
      </div>
    </el-header>

    <!-- 下面：左侧边栏 + 右侧内容 -->
    <el-container class="body-container">
      <el-aside width="220px" class="aside">
        <el-menu :default-active="activeMenu" router class="side-menu">
          <el-menu-item index="/posts">
            <span>文章管理</span>
          </el-menu-item>
          <el-menu-item index="/users">
            <span>用户列表</span>
          </el-menu-item>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const isAuthenticated = ref(false)

// 侧边栏高亮：子路由匹配父级菜单（如 /posts/1/edit → /posts）
const activeMenu = computed(() => {
  const path = route.path
  if (path.startsWith('/posts')) return '/posts'
  if (path.startsWith('/users')) return '/users'
  return path
})

watch(
  () => route.fullPath,
  () => {
    const token = localStorage.getItem('token')
    isAuthenticated.value = !!token && token !== 'undefined' && token !== 'null'
  },
  { immediate: true }
)

const userName = computed(() => {
  try {
    return JSON.parse(localStorage.getItem('user') || '{}').name || ''
  } catch {
    return ''
  }
})

function handleLogout() {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  router.push('/login')
}
</script>

<style>
/* ========== 全局重置 ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ========== 最外层：上下结构，固定高度防止整页滚动 ========== */
.layout {
  height: 100vh;
  overflow: hidden;
  flex-direction: column;
}

/* ========== 顶部 header（全宽，固定） ========== */
.header {
  height: 60px !important;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px !important;
  background: linear-gradient(135deg, #eef3f9 0%, #e8eef6 100%);
  border-bottom: 1px solid #dce3ec;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  letter-spacing: 1px;
}

.logo-icon {
  flex-shrink: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.welcome {
  color: #606266;
  font-size: 13px;
  font-weight: 500;
}

.avatar {
  background: linear-gradient(135deg, #409eff, #66b1ff) !important;
  color: #fff !important;
  font-weight: 600;
}

.user-name {
  color: #303133;
  font-size: 14px;
  font-weight: 600;
}

.logout-btn {
  color: #909399 !important;
  font-size: 13px;
  font-weight: 500;
}

.logout-btn:hover {
  color: #e06060 !important;
}

/* ========== 下面：侧边栏 + 内容 ========== */
.body-container {
  flex: 1;
  overflow: hidden;
}

/* ========== 侧边栏（固定，自身可滚动） ========== */
.aside {
  background: #fff !important;
  border-right: 1px solid #eef1f5;
  overflow-y: auto;
}

.side-menu {
  border-right: none !important;
  padding-top: 8px;
}

.side-menu .el-menu-item {
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  margin: 2px 8px;
  border-radius: 8px;
  height: 42px;
  line-height: 42px;
}

.side-menu .el-menu-item:hover {
  color: #409eff;
  background: #e6f4ff !important;
}

.side-menu .el-menu-item.is-active {
  color: #409eff !important;
  background: #d6eaff !important;
  font-weight: 600;
}

/* ========== 主内容区（只有这里滚动） ========== */
.main-content {
  height: 100%;
  padding: 24px 28px !important;
  background: #f0f3f7;
  overflow-y: auto;
}

/* ========== Element Plus 全局美化 ========== */
.el-card {
  border: 1px solid #eef1f5 !important;
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04) !important;
}

.el-card__header {
  border-bottom: 1px solid #f0f2f5 !important;
  font-weight: 600;
  font-size: 15px;
}

.el-table {
  --el-table-header-bg-color: #eef1f6 !important;
  --el-table-border-color: #eef1f5 !important;
}

.el-table th.el-table__cell {
  background-color: #eef1f6 !important;
  color: #303133 !important;
  font-weight: 600 !important;
  font-size: 13px;
}

.el-table__body tr:hover > td.el-table__cell {
  background-color: #f5f7fa !important;
}

.el-input__wrapper {
  border-radius: 8px !important;
}

.el-button--primary {
  border-radius: 8px !important;
}

.el-button--default {
  border-radius: 8px !important;
}

.el-pagination .btn-prev,
.el-pagination .btn-next,
.el-pagination .el-pager li {
  border-radius: 6px !important;
}

.el-page-header {
  margin-bottom: 16px;
}

.el-divider--horizontal {
  border-color: #eef1f5 !important;
}
</style>
