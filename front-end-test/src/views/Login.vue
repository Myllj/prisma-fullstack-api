<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="dot-matrix"></div>
      <div class="glow-orb glow-1"></div>
      <div class="glow-orb glow-2"></div>
      <div class="float-ring ring-1"></div>
      <div class="float-ring ring-2"></div>
      <div class="float-ring ring-3"></div>
    </div>

    <canvas ref="starCanvas" class="star-canvas"></canvas>

    <div class="login-card">
      <!-- Logo 区 -->
      <div class="card-header">
        <div class="logo">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs>
              <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
              <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.1"/>
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="32" height="32" rx="8" fill="url(#lg2)"/>
            <rect x="8" y="8" width="24" height="24" rx="5" fill="url(#lg)"/>
            <path d="M14 20l4 4 8-8" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2>Prisma Fullstack</h2>
        <p class="subtitle">登录您的账号以继续</p>
      </div>

      <!-- 登录表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" label-width="0" size="large">
        <el-form-item prop="email">
          <el-input
            v-model="form.email"
            placeholder="请输入邮箱"
            :prefix-icon="Message"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="loading" class="login-btn" @click="handleLogin">
            登 录
          </el-button>
        </el-form-item>
      </el-form>

      <!-- 其他登录方式 -->
      <div class="divider-row">
        <span class="divider-line"></span>
        <span class="divider-text">其他方式</span>
        <span class="divider-line"></span>
      </div>

      <div class="oauth-row">
        <button class="github-btn" @click="handleGithubLogin" title="GitHub 登录">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        </button>
        <button class="wechat-btn" @click="handleWechatLogin" title="微信登录">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.61 2.38c-3.346 0-5.812 2.429-5.812 5.425 0 2.92 2.307 5.198 5.812 5.198.495 0 .979-.05 1.439-.146l1.36.795a.276.276 0 00.143.039c.136 0 .245-.113.245-.252 0-.06-.03-.12-.04-.18l-.333-1.248a.535.535 0 01.182-.568c1.313-1.02 2.004-2.263 2.004-3.638 0-2.996-2.467-5.425-5.813-5.425zm-2.167 2.72c.553 0 1 .455 1 1.016s-.447 1.016-1 1.016-1-.455-1-1.016.447-1.016 1-1.016zm4.333 0c.553 0 1 .455 1 1.016s-.447 1.016-1 1.016-1-.455-1-1.016.447-1.016 1-1.016z"/>
          </svg>
        </button>
      </div>

      <p class="switch-link">
        还没有账号？<router-link to="/register">立即注册</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Message, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import api from '../api'
import { useParticles } from '../composables/useParticles'

const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const starCanvas = ref<HTMLCanvasElement | null>(null)

useParticles(starCanvas)

const form = reactive({
  email: '',
  password: ''
})

const rules: FormRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

async function handleLogin() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  loading.value = true
  try {
    const res = await api.post('/auth/login', form)
    const { token, user } = res.data.data
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    ElMessage.success('登录成功')
    router.push('/posts')
  } catch {
    /* 拦截器已处理 */
  } finally {
    loading.value = false
  }
}

function handleGithubLogin() {
  window.location.href = 'http://localhost:3000/api/auth/oauth/github'
}

function handleWechatLogin() {
  window.location.href = 'http://localhost:3000/api/auth/oauth/wechat'
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

/* === 星空画布 === */
.star-canvas {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

/* === 背景装饰 === */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.dot-matrix {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(#e2e8f0 1px, transparent 1px);
  background-size: 32px 32px;
  animation: dotPulse 8s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.6; }
}

.glow-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
}

.glow-1 {
  width: 400px;
  height: 400px;
  background: #6366f1;
  opacity: 0.12;
  top: -100px;
  right: -80px;
  animation: drift1 12s ease-in-out infinite;
}

.glow-2 {
  width: 300px;
  height: 300px;
  background: #8b5cf6;
  opacity: 0.1;
  bottom: -80px;
  left: -60px;
  animation: drift2 15s ease-in-out infinite;
}

@keyframes drift1 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(40px, -30px) scale(1.1); }
  50% { transform: translate(20px, 20px) scale(0.95); }
  75% { transform: translate(-30px, -10px) scale(1.05); }
}

@keyframes drift2 {
  0%, 100% { transform: translate(0, 0) scale(1); }
  25% { transform: translate(-30px, 20px) scale(1.08); }
  50% { transform: translate(20px, -10px) scale(0.92); }
  75% { transform: translate(-10px, -30px) scale(1.03); }
}

/* === 浮动圆环 === */
.float-ring {
  position: absolute;
  border-radius: 50%;
  border: 1.5px solid rgba(99, 102, 241, 0.08);
  pointer-events: none;
}

.ring-1 {
  width: 120px;
  height: 120px;
  top: 15%;
  left: 8%;
  animation: floatUp 9s ease-in-out infinite;
}

.ring-2 {
  width: 80px;
  height: 80px;
  top: 70%;
  right: 10%;
  animation: floatUp 7s ease-in-out 2s infinite;
  border-color: rgba(139, 92, 246, 0.1);
}

.ring-3 {
  width: 160px;
  height: 160px;
  bottom: 15%;
  left: 60%;
  animation: floatUp 11s ease-in-out 4s infinite;
  border-color: rgba(99, 102, 241, 0.06);
}

@keyframes floatUp {
  0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.5; }
  50% { transform: translateY(-20px) rotate(10deg); opacity: 1; }
}

/* === 卡片 === */
.login-card {
  position: relative;
  z-index: 1;
  width: 400px;
  padding: 44px 40px 36px;
  background: #fff;
  border-radius: 20px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 24px rgba(0, 0, 0, 0.04),
    0 20px 60px rgba(99, 102, 241, 0.06);
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  margin-bottom: 20px;
}

.card-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 6px;
  letter-spacing: -0.5px;
}

.subtitle {
  margin: 0;
  font-size: 13px;
  color: #94a3b8;
  font-weight: 400;
}

/* === 表单 === */
.login-btn {
  width: 100%;
  height: 44px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 6px;
  border-radius: 12px !important;
  margin-top: 6px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6) !important;
  border: none !important;
  box-shadow: 0 4px 14px rgba(99, 102, 241, 0.3) !important;
  transition: all 0.3s;
}

.login-btn:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
  transform: translateY(-1px);
}

/* === 分割线 === */
.divider-row {
  display: flex;
  align-items: center;
  margin: 24px 0 16px;
}

.divider-line {
  flex: 1;
  height: 1px;
  background: #e8ecf0;
}

.divider-text {
  padding: 0 14px;
  font-size: 12px;
  color: #c0c4cc;
}

/* === 第三方登录 === */
.oauth-row {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 20px;
}

.github-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  color: #475569;
  cursor: pointer;
  transition: all 0.25s;
}

.github-btn:hover {
  background: #1e293b;
  color: #fff;
  border-color: #1e293b;
  box-shadow: 0 4px 16px rgba(30, 41, 59, 0.2);
  transform: translateY(-2px);
}

/* 微信按钮 */
.wechat-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border: 1.5px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  color: #07c160;
  cursor: pointer;
  transition: all 0.25s;
}

.wechat-btn:hover {
  background: #07c160;
  color: #fff;
  border-color: #07c160;
  box-shadow: 0 4px 16px rgba(7, 193, 96, 0.25);
  transform: translateY(-2px);
}

/* === 跳转链接 === */
.switch-link {
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.switch-link a {
  color: #6366f1;
  text-decoration: none;
  font-weight: 600;
  margin-left: 2px;
  transition: color 0.2s;
}

.switch-link a:hover {
  color: #4f46e5;
}

/* === 覆盖浏览器自动填充样式 === */
:deep(.el-input__inner:-webkit-autofill),
:deep(.el-input__inner:-webkit-autofill:hover),
:deep(.el-input__inner:-webkit-autofill:focus),
:deep(.el-input__inner:-webkit-autofill:active) {
  -webkit-box-shadow: 0 0 0 30px #fff inset !important;
  box-shadow: 0 0 0 30px #fff inset !important;
  -webkit-text-fill-color: #334155 !important;
  transition: background-color 5000s ease-in-out 0s;
}

/* === 输入框微调 === */
:deep(.el-input__wrapper) {
  border-radius: 10px !important;
  box-shadow: 0 0 0 1px #e2e8f0 inset !important;
  transition: all 0.25s;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset !important;
}

:deep(.el-input.is-focus .el-input__wrapper) {
  box-shadow: 0 0 0 1.5px #6366f1 inset, 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
}
</style>
