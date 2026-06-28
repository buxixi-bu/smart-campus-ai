<template>
  <view class="container">
    <view class="header">
      <view class="logo">
        <view class="logo-icon">🎓</view>
        <view class="logo-text">
          <text class="title">校园智能问答</text>
          <text class="subtitle">AI驱动的校园服务助手</text>
        </view>
      </view>
    </view>

    <view class="quick-actions">
      <view class="action-card" @tap="navigateTo('/pages/chat/chat')">
        <view class="action-icon chat-icon">💬</view>
        <view class="action-content">
          <text class="action-title">智能问答</text>
          <text class="action-desc">多轮对话，解答校园问题</text>
        </view>
        <view class="action-arrow">›</view>
      </view>

      <view class="action-card" @tap="navigateTo('/pages/writer/writer')">
        <view class="action-icon writer-icon">✍️</view>
        <view class="action-content">
          <text class="action-title">文案生成</text>
          <text class="action-desc">活动通知、请假条一键生成</text>
        </view>
        <view class="action-arrow">›</view>
      </view>

      <view class="action-card" @tap="navigateTo('/pages/analysis/analysis')">
        <view class="action-icon analysis-icon">📊</view>
        <view class="action-content">
          <text class="action-title">学情分析</text>
          <text class="action-desc">成绩统计、可视化图表</text>
        </view>
        <view class="action-arrow">›</view>
      </view>
    </view>

    <view class="faq-section">
      <text class="section-title">常见问题</text>
      <view class="faq-list">
        <view class="faq-item" v-for="(faq, index) in faqs" :key="index" @tap="goToChat(faq.question)">
          <view class="faq-question">{{ faq.question }}</view>
          <view class="faq-arrow">›</view>
        </view>
      </view>
    </view>

    <view class="tips-section">
      <view class="tips-card">
        <view class="tips-icon">💡</view>
        <view class="tips-content">
          <text class="tips-title">使用提示</text>
          <text class="tips-text">您可以询问关于教务、图书馆、宿舍、奖学金等方面的问题，AI会为您提供专业的回答。</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const faqs = ref([
  { question: '教务处在哪里？办公时间是多少？' },
  { question: '图书馆借书期限是多久？' },
  { question: '宿舍门禁时间是几点？' },
  { question: '如何申请奖学金？' }
])

function navigateTo(url: string) {
  uni.navigateTo({ url })
}

function goToChat(question: string) {
  uni.navigateTo({ url: `/pages/chat/chat?question=${encodeURIComponent(question)}` })
}
</script>

<style lang="scss">
.container {
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(180deg, #4F7CFF 0%, #E8EEFF 30%, #F5F5F5 100%);
}

.header {
  padding: 60rpx 32rpx 80rpx;
}

.logo {
  display: flex;
  align-items: center;
  gap: 24rpx;
}

.logo-icon {
  width: 100rpx;
  height: 100rpx;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48rpx;
}

.logo-text {
  display: flex;
  flex-direction: column;
}

.title {
  font-size: 40rpx;
  font-weight: bold;
  color: #fff;
}

.subtitle {
  font-size: 24rpx;
  color: rgba(255, 255, 255, 0.85);
  margin-top: 8rpx;
}

.quick-actions {
  padding: 0 32rpx;
  margin-top: -40rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.action-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 8rpx 32rpx rgba(79, 124, 255, 0.15);
}

.action-icon {
  width: 96rpx;
  height: 96rpx;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40rpx;
}

.chat-icon {
  background: linear-gradient(135deg, #667EEA 0%, #764BA2 100%);
}

.writer-icon {
  background: linear-gradient(135deg, #F093FB 0%, #F5576C 100%);
}

.analysis-icon {
  background: linear-gradient(135deg, #4FACFE 0%, #00F2FE 100%);
}

.action-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.action-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2329;
}

.action-desc {
  font-size: 24rpx;
  color: #646A73;
  margin-top: 8rpx;
}

.action-arrow {
  font-size: 40rpx;
  color: #BBBFC4;
}

.faq-section {
  padding: 48rpx 32rpx;
}

.section-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2329;
  margin-bottom: 24rpx;
}

.faq-list {
  background: #fff;
  border-radius: 24rpx;
  overflow: hidden;
}

.faq-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32rpx;
  border-bottom: 1rpx solid #E5E6EB;

  &:last-child {
    border-bottom: none;
  }
}

.faq-question {
  font-size: 28rpx;
  color: #1F2329;
}

.faq-arrow {
  font-size: 36rpx;
  color: #BBBFC4;
}

.tips-section {
  padding: 0 32rpx 120rpx;
}

.tips-card {
  background: linear-gradient(135deg, #FFF7E6 0%, #FFF1CC 100%);
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  gap: 20rpx;
}

.tips-icon {
  font-size: 40rpx;
}

.tips-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.tips-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #D48806;
}

.tips-text {
  font-size: 24rpx;
  color: #AD8B00;
  margin-top: 8rpx;
  line-height: 1.6;
}
</style>
