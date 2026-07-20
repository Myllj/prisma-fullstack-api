<template>
  <div class="register-page">
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

    <div class="register-card">
      <!-- Logo 区 -->
      <div class="card-header">
        <div class="logo">
          <svg viewBox="0 0 40 40" width="40" height="40">
            <defs>
              <linearGradient id="rg" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
              <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.3"/>
                <stop offset="100%" stop-color="#6366f1" stop-opacity="0.1"/>
              </linearGradient>
            </defs>
            <rect x="4" y="4" width="32" height="32" rx="8" fill="url(#rg2)"/>
            <rect x="8" y="8" width="24" height="24" rx="5" fill="url(#rg)"/>
            <path d="M15 22h10M15 18h10" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="12" cy="20" r="2" fill="#fff"/>
            <circle cx="12" cy="16" r="2" fill="#fff"/>
          </svg>
        </div>
        <h2>创建账号</h2>
        <p class="subtitle">注册一个新的账号开始使用</p>
      </div>

      <!-- 注册表单 -->
      <el-form ref="formRef" :model="form" :rules="rules" size="large" @submit.prevent="handleRegister">
        <el-form-item prop="name">
          <el-input v-model="form.name" placeholder="用户名" :prefix-icon="User" />
        </el-form-item>
        <el-form-item prop="email">
          <el-input v-model="form.email" placeholder="邮箱" :prefix-icon="Message" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="密码（至少6位）" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item prop="confirmPassword">
          <el-input v-model="form.confirmPassword" type="password" placeholder="确认密码" :prefix-icon="Lock" show-password />
        </el-form-item>
        <el-button type="primary" native-type="submit" :loading="loading" class="submit-btn">注 册</el-button>
      </el-form>

      <p class="switch-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Message, Lock } from '@element-plus/icons-vue'
import request from '../api/index'
import { useParticles } from '../composables/useParticles'

const router = useRouter()
const loading = ref(false)
const starCanvas = ref<HTMLCanvasElement | null>(null)

useParticles(starCanvas)

const form = reactive({ name: '', email: '', password: '', confirmPassword: '' })

const validateConfirm = (_rule: any, value: string, cb: any) => {
  if (value !== form.password) cb(new Error('两次密码不一致'))
  else cb()
}

const rules = {
  name: [{ required: true, message: '用户名不能为空', trigger: 'blur' }],
  email: [
    { required: true, message: '邮箱不能为空', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, message: '邮箱格式不正确', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '密码不能为空', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认密码', trigger: 'blur' },
    { validator: validateConfirm, trigger: 'blur' }
  ]
}

async function handleRegister() {
  loading.value = true
  try {
    await request.post('/auth/register', {
      name: form.name,
      email: form.email,
      password: form.password
    })
    ElMessage.success('注册成功，请登录')
    router.push('/login')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  position: relative;
  overflow: hidden;
}

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
.register-card {
  position: relative;
  z-index: 1;
  width: 400px;
  padding: 40px 40px 34px;
  background: #fff;
  border-radius: 20px;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.04),
    0 4px 24px rgba(0, 0, 0, 0.04),
    0 20px 60px rgba(99, 102, 241, 0.06);
}

.card-header {
  text-align: center;
  margin-bottom: 28px;
}

.logo {
  margin-bottom: 16px;
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

/* === 按钮 === */
.submit-btn {
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

.submit-btn:hover {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
  transform: translateY(-1px);
}

/* === 跳转链接 === */
.switch-link {
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
  margin: 20px 0 0;
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
