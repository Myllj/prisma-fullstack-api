<template>
  <div class="page">
    <el-page-header @back="$router.push('/posts')" title="返回列表"
      :content="isEdit ? '编辑文章' : '新增文章'" />
    <el-card style="margin-top: 16px; max-width: 800px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" v-loading="loading">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入文章标题" />
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="10" placeholder="请输入文章内容" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            {{ isEdit ? '保存修改' : '发布文章' }}
          </el-button>
          <el-button @click="$router.push('/posts')">取消</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import api from '../api'

const route = useRoute()
const router = useRouter()
const formRef = ref<FormInstance>()
const loading = ref(false)
const submitting = ref(false)

const isEdit = computed(() => route.name === 'PostEdit')

const form = reactive({
  title: '',
  content: ''
})

const rules: FormRules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  content: [{ required: true, message: '请输入内容', trigger: 'blur' }]
}

// 编辑模式：加载已有文章
onMounted(async () => {
  if (isEdit.value) {
    loading.value = true
    try {
      const res = await api.get(`/post/${route.params.id}`)
      const post = res.data.data
      form.title = post.title
      form.content = post.content
    } finally {
      loading.value = false
    }
  }
})

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  try {
    if (isEdit.value) {
      await api.put(`/post/${route.params.id}`, form)
      ElMessage.success('修改成功')
    } else {
      await api.post('/post/create', form)
      ElMessage.success('发布成功')
    }
    router.push('/posts')
  } finally {
    submitting.value = false
  }
}
</script>
