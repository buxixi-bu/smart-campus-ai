<template>
  <view class="writer-container">
    <view class="type-selector">
      <view 
        v-for="type in documentTypes" 
        :key="type.value"
        class="type-item"
        :class="{ active: selectedType === type.value }"
        @tap="selectedType = type.value"
      >
        <text class="type-icon">{{ type.icon }}</text>
        <text class="type-name">{{ type.name }}</text>
      </view>
    </view>

    <view class="input-section">
      <text class="section-title">输入需求</text>
      <textarea 
        v-model="requirements"
        class="requirement-input"
        :placeholder="placeholders[selectedType]"
        :maxlength="500"
      />
      <text class="char-count">{{ requirements.length }}/500</text>
    </view>

    <view class="preview-section">
      <text class="section-title">生成结果</text>
      <view class="preview-card" v-if="generatedContent">
        <scroll-view scroll-y class="preview-content">
          <text class="preview-text">{{ generatedContent }}</text>
        </scroll-view>
      </view>
      <view class="empty-preview" v-else>
        <text class="empty-icon">📝</text>
        <text class="empty-text">生成的文案将在这里显示</text>
      </view>
    </view>

    <view class="action-section">
      <view class="generate-btn" :class="{ active: canGenerate }" @tap="generateDocument">
        <text class="btn-text">生成文案</text>
      </view>
      <view class="copy-btn" v-if="generatedContent" @tap="copyToClipboard">
        <text class="btn-text">复制文案</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { generateDocument } from '@/services/ai'

const selectedType = ref('活动通知')
const requirements = ref('')
const generatedContent = ref('')

const documentTypes = [
  { value: '活动通知', name: '活动通知', icon: '📢' },
  { value: '请假条', name: '请假条', icon: '📋' },
  { value: '社团招新', name: '社团招新', icon: '🌟' }
]

const placeholders: Record<string, string> = {
  '活动通知': '请输入活动主题、时间、地点等信息，例如："举办校园文化节，时间10月15日，地点体育馆"',
  '请假条': '请输入班级|姓名|请假原因|请假天数|请假日期，例如："计算机1班|张三|生病|3天|2024年10月1日"',
  '社团招新': '请输入社团名称|宣传语|招新地点|招新时间，例如："篮球社|以球会友|篮球场|周六上午9点"'
}

const canGenerate = computed(() => {
  return requirements.value.trim().length > 0
})

function generateDocument() {
  if (!canGenerate.value) return
  
  generatedContent.value = generateDocument(selectedType.value, requirements.value)
}

function copyToClipboard() {
  uni.setClipboardData({
    data: generatedContent.value,
    success: () => {
      uni.showToast({
        title: '复制成功',
        icon: 'success'
      })
    }
  })
}
</script>

<style lang="scss">
.writer-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: calc(200rpx + env(safe-area-inset-bottom));
}

.type-selector {
  display: flex;
  gap: 24rpx;
  padding: 32rpx;
  background: #fff;
}

.type-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
  padding: 24rpx 16rpx;
  border-radius: 16rpx;
  background: #F5F5F5;
  transition: all 0.3s;

  &.active {
    background: #E8EEFF;

    .type-name {
      color: #4F7CFF;
      font-weight: 600;
    }
  }
}

.type-icon {
  font-size: 40rpx;
}

.type-name {
  font-size: 24rpx;
  color: #646A73;
}

.input-section {
  margin: 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2329;
  margin-bottom: 20rpx;
}

.requirement-input {
  width: 100%;
  height: 240rpx;
  background: #F5F5F5;
  border-radius: 16rpx;
  padding: 20rpx;
  font-size: 28rpx;
  line-height: 1.6;
  box-sizing: border-box;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 22rpx;
  color: #BBBFC4;
  margin-top: 12rpx;
}

.preview-section {
  margin: 0 24rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.preview-card {
  background: #F9F9F9;
  border-radius: 16rpx;
  min-height: 300rpx;
}

.preview-content {
  height: 400rpx;
  padding: 24rpx;
}

.preview-text {
  font-size: 28rpx;
  line-height: 1.8;
  color: #1F2329;
  white-space: pre-wrap;
}

.empty-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx;
}

.empty-icon {
  font-size: 64rpx;
  margin-bottom: 20rpx;
}

.empty-text {
  font-size: 26rpx;
  color: #BBBFC4;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 24rpx;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #E5E6EB;
}

.generate-btn {
  flex: 1;
  height: 88rpx;
  background: #E5E6EB;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: #4F7CFF;

    .btn-text {
      color: #fff;
    }
  }
}

.copy-btn {
  flex: 1;
  height: 88rpx;
  background: #E8EEFF;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;

  .btn-text {
    color: #4F7CFF;
  }
}

.btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #BBBFC4;
}
</style>
