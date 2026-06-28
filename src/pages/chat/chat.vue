<template>
  <view class="chat-container">
    <scroll-view 
      class="chat-messages" 
      scroll-y 
      :scroll-into-view="scrollToId"
      scroll-with-animation
    >
      <view class="message-list">
        <view class="welcome-message">
          <view class="avatar">🤖</view>
          <view class="message-content">
            <text class="message-text">您好！我是校园智能助手，请问有什么可以帮您的？</text>
          </view>
        </view>

        <view 
          v-for="(msg, index) in messages" 
          :key="msg.id"
          :id="'msg-' + msg.id"
          class="message-item"
          :class="{ 'user-message': msg.role === 'user', 'assistant-message': msg.role === 'assistant' }"
        >
          <view class="avatar">{{ msg.role === 'user' ? '👤' : '🤖' }}</view>
          <view class="message-content">
            <text class="message-text">{{ msg.content }}</text>
            <text class="message-time">{{ formatTime(msg.timestamp) }}</text>
          </view>
        </view>

        <view v-if="isLoading" class="loading-message">
          <view class="loading-dots">
            <view class="dot"></view>
            <view class="dot"></view>
            <view class="dot"></view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view class="input-area">
      <view class="quick-tags">
        <view 
          v-for="tag in quickTags" 
          :key="tag" 
          class="quick-tag"
          @tap="sendQuickMessage(tag)"
        >
          {{ tag }}
        </view>
      </view>
      <view class="input-row">
        <input 
          v-model="inputMessage"
          class="message-input"
          placeholder="请输入您的问题..."
          @confirm="sendMessage"
        />
        <view class="send-btn" :class="{ active: inputMessage.trim() }" @tap="sendMessage">
          <text class="send-icon">➤</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { ChatMessage, generateChatResponse } from '@/services/ai'

const messages = ref<ChatMessage[]>([])
const inputMessage = ref('')
const isLoading = ref(false)
const scrollToId = ref('')

const quickTags = ['教务', '图书馆', '宿舍', '奖学金']

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

async function sendMessage() {
  if (!inputMessage.value.trim() || isLoading.value) return

  const userMessage: ChatMessage = {
    id: generateId(),
    content: inputMessage.value.trim(),
    role: 'user',
    timestamp: Date.now()
  }

  messages.value.push(userMessage)
  inputMessage.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  await new Promise(resolve => setTimeout(resolve, 1000))

  const assistantMessage: ChatMessage = {
    id: generateId(),
    content: generateChatResponse(userMessage.content),
    role: 'assistant',
    timestamp: Date.now()
  }

  messages.value.push(assistantMessage)
  isLoading.value = false

  await nextTick()
  scrollToBottom()
}

function sendQuickMessage(tag: string) {
  inputMessage.value = `请问${tag}相关的问题`
  sendMessage()
}

function scrollToBottom() {
  const lastMsg = messages.value[messages.value.length - 1]
  if (lastMsg) {
    scrollToId.value = 'msg-' + lastMsg.id
  }
}

onMounted(() => {
  const pages = getCurrentPages()
  const currentPage = pages[pages.length - 1]
  const options = (currentPage as any).$page?.options || {}
  if (options.question) {
    inputMessage.value = decodeURIComponent(options.question)
    sendMessage()
  }
})
</script>

<style lang="scss">
.chat-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F5F5;
}

.chat-messages {
  flex: 1;
  padding: 24rpx;
}

.message-list {
  padding-bottom: 40rpx;
}

.welcome-message {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;
}

.avatar {
  width: 72rpx;
  height: 72rpx;
  border-radius: 50%;
  background: #E8EEFF;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32rpx;
  flex-shrink: 0;
}

.message-content {
  max-width: 75%;
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.message-text {
  font-size: 28rpx;
  line-height: 1.6;
}

.message-time {
  font-size: 20rpx;
  color: #BBBFC4;
}

.message-item {
  display: flex;
  gap: 16rpx;
  margin-bottom: 32rpx;

  &.user-message {
    flex-direction: row-reverse;

    .avatar {
      background: #4F7CFF;
    }

    .message-content {
      align-items: flex-end;

      .message-text {
        background: #4F7CFF;
        color: #fff;
        padding: 20rpx 28rpx;
        border-radius: 24rpx 8rpx 24rpx 24rpx;
      }
    }
  }

  &.assistant-message {
    .message-content {
      align-items: flex-start;

      .message-text {
        background: #fff;
        color: #1F2329;
        padding: 20rpx 28rpx;
        border-radius: 8rpx 24rpx 24rpx 24rpx;
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
      }
    }
  }
}

.loading-message {
  display: flex;
  justify-content: flex-start;
  padding-left: 88rpx;
}

.loading-dots {
  display: flex;
  gap: 12rpx;
  padding: 20rpx 32rpx;
  background: #fff;
  border-radius: 32rpx;
}

.dot {
  width: 12rpx;
  height: 12rpx;
  background: #4F7CFF;
  border-radius: 50%;
  animation: loading 1.4s infinite ease-in-out both;

  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
}

@keyframes loading {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.input-area {
  background: #fff;
  padding: 24rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  border-top: 1rpx solid #E5E6EB;
}

.quick-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 20rpx;
}

.quick-tag {
  padding: 12rpx 24rpx;
  background: #F5F5F5;
  border-radius: 24rpx;
  font-size: 24rpx;
  color: #646A73;

  &:active {
    background: #E8EEFF;
    color: #4F7CFF;
  }
}

.input-row {
  display: flex;
  gap: 16rpx;
}

.message-input {
  flex: 1;
  height: 80rpx;
  background: #F5F5F5;
  border-radius: 40rpx;
  padding: 0 32rpx;
  font-size: 28rpx;
}

.send-btn {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background: #E5E6EB;
  display: flex;
  align-items: center;
  justify-content: center;

  &.active {
    background: #4F7CFF;
  }
}

.send-icon {
  font-size: 32rpx;
  color: #fff;
}
</style>
