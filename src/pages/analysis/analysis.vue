<template>
  <view class="analysis-container">
    <view class="upload-section">
      <view class="upload-card" @tap="chooseFile">
        <view class="upload-icon">📁</view>
        <view class="upload-content">
          <text class="upload-title">{{ fileName || '上传成绩CSV文件' }}</text>
          <text class="upload-desc">支持.csv格式文件</text>
        </view>
        <view class="upload-arrow">›</view>
      </view>
      <view class="sample-section">
        <text class="sample-title">示例数据格式：</text>
        <view class="sample-code">
          <text class="code-text">姓名,高等数学,英语,计算机\n张三,85,90,78\n李四,72,88,92\n王五,58,75,80</text>
        </view>
      </view>
    </view>

    <view class="result-section" v-if="analysisResult">
      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ analysisResult.average }}</text>
          <text class="stat-label">平均分</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ analysisResult.failRate }}%</text>
          <text class="stat-label">挂科率</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ analysisResult.highScoreCount }}</text>
          <text class="stat-label">高分人数</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ analysisResult.lowScoreCount }}</text>
          <text class="stat-label">挂科人数</text>
        </view>
      </view>

      <view class="chart-section">
        <text class="section-title">成绩分布</text>
        <view class="bar-chart">
          <view 
            v-for="item in analysisResult.scoreDistribution" 
            :key="item.range"
            class="bar-item"
          >
            <text class="bar-label">{{ item.range }}</text>
            <view class="bar-wrapper">
              <view 
                class="bar-fill" 
                :style="{ width: getBarWidth(item.count) + '%' }"
              ></view>
            </view>
            <text class="bar-value">{{ item.count }}</text>
          </view>
        </view>
      </view>

      <view class="subject-section">
        <text class="section-title">各科统计</text>
        <view class="subject-list">
          <view 
            v-for="subject in analysisResult.subjectStats" 
            :key="subject.name"
            class="subject-item"
          >
            <view class="subject-info">
              <text class="subject-name">{{ subject.name }}</text>
              <text class="subject-average">平均分: {{ subject.average }}</text>
            </view>
            <text class="subject-fail" :class="{ warning: subject.failCount > 0 }">
              挂科: {{ subject.failCount }}人
            </text>
          </view>
        </view>
      </view>
    </view>

    <view class="empty-state" v-else>
      <view class="empty-icon">📊</view>
      <text class="empty-title">上传CSV文件开始分析</text>
      <text class="empty-desc">支持姓名、科目、成绩等数据格式</text>
    </view>

    <view class="action-section" v-if="analysisResult">
      <view class="refresh-btn" @tap="resetAnalysis">
        <text class="btn-text">重新上传</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { parseCSV, analyzeScores, AnalysisResult } from '@/services/ai'

const fileName = ref('')
const analysisResult = ref<AnalysisResult | null>(null)

const mockCSV = `姓名,高等数学,英语,计算机,物理,化学
张三,85,90,78,82,76
李四,72,88,92,75,80
王五,58,75,80,62,55
赵六,92,85,88,90,85
钱七,68,72,65,70,68
孙八,88,95,90,88,92
周九,55,62,58,52,60
吴十,78,82,85,76,80`

function chooseFile() {
  uni.showActionSheet({
    itemList: ['从相册选择', '使用示例数据'],
    success: (res) => {
      if (res.tapIndex === 0) {
        uni.chooseMessageFile({
          count: 1,
          type: 'file',
          success: (result) => {
            const file = result.tempFiles[0]
            fileName.value = file.name
            readFile(file.path)
          },
          fail: () => {
            uni.showToast({ title: '选择文件失败', icon: 'none' })
          }
        })
      } else {
        fileName.value = '示例数据.csv'
        processCSV(mockCSV)
      }
    }
  })
}

function readFile(filePath: string) {
  uni.getFileSystemManager().readFile({
    filePath,
    encoding: 'utf-8',
    success: (res) => {
      processCSV(res.data)
    },
    fail: () => {
      uni.showToast({ title: '读取文件失败', icon: 'none' })
    }
  })
}

function processCSV(csvText: string) {
  try {
    const csvData = parseCSV(csvText)
    analysisResult.value = analyzeScores(csvData)
  } catch (e) {
    uni.showToast({ title: '解析文件失败', icon: 'none' })
  }
}

function getBarWidth(count: number): number {
  if (!analysisResult.value) return 0
  const maxCount = Math.max(...analysisResult.value.scoreDistribution.map(item => item.count))
  if (maxCount === 0) return 0
  return (count / maxCount) * 100
}

function resetAnalysis() {
  fileName.value = ''
  analysisResult.value = null
}
</script>

<style lang="scss">
.analysis-container {
  min-height: 100vh;
  background: #F5F5F5;
  padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
}

.upload-section {
  padding: 32rpx;
}

.upload-card {
  background: #fff;
  border-radius: 24rpx;
  padding: 40rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.05);
}

.upload-icon {
  width: 80rpx;
  height: 80rpx;
  background: #E8EEFF;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
}

.upload-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.upload-title {
  font-size: 30rpx;
  font-weight: 600;
  color: #1F2329;
}

.upload-desc {
  font-size: 24rpx;
  color: #BBBFC4;
  margin-top: 8rpx;
}

.upload-arrow {
  font-size: 40rpx;
  color: #BBBFC4;
}

.sample-section {
  margin-top: 24rpx;
  background: #fff;
  border-radius: 16rpx;
  padding: 24rpx;
}

.sample-title {
  font-size: 24rpx;
  color: #646A73;
  margin-bottom: 16rpx;
}

.sample-code {
  background: #F5F5F5;
  border-radius: 12rpx;
  padding: 20rpx;
}

.code-text {
  font-size: 22rpx;
  color: #646A73;
  font-family: monospace;
  white-space: pre-wrap;
}

.result-section {
  padding: 0 32rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20rpx;
}

.stat-card {
  background: #fff;
  border-radius: 20rpx;
  padding: 32rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.05);
}

.stat-value {
  font-size: 48rpx;
  font-weight: bold;
  color: #4F7CFF;
}

.stat-label {
  font-size: 24rpx;
  color: #646A73;
  margin-top: 8rpx;
}

.chart-section {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.section-title {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2329;
  margin-bottom: 24rpx;
}

.bar-chart {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.bar-label {
  width: 100rpx;
  font-size: 24rpx;
  color: #646A73;
  text-align: right;
}

.bar-wrapper {
  flex: 1;
  height: 32rpx;
  background: #F0F0F0;
  border-radius: 16rpx;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #4F7CFF 0%, #667EEA 100%);
  border-radius: 16rpx;
  transition: width 0.3s ease;
}

.bar-value {
  width: 60rpx;
  font-size: 24rpx;
  color: #1F2329;
  text-align: center;
}

.subject-section {
  margin-top: 32rpx;
  background: #fff;
  border-radius: 24rpx;
  padding: 32rpx;
}

.subject-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.subject-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  background: #F9F9F9;
  border-radius: 16rpx;
}

.subject-info {
  display: flex;
  flex-direction: column;
}

.subject-name {
  font-size: 28rpx;
  font-weight: 600;
  color: #1F2329;
}

.subject-average {
  font-size: 24rpx;
  color: #646A73;
  margin-top: 4rpx;
}

.subject-fail {
  font-size: 24rpx;
  color: #646A73;

  &.warning {
    color: #FF4D4F;
    font-weight: 600;
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 120rpx 32rpx;
}

.empty-icon {
  font-size: 120rpx;
  margin-bottom: 32rpx;
}

.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  color: #1F2329;
  margin-bottom: 16rpx;
}

.empty-desc {
  font-size: 26rpx;
  color: #BBBFC4;
}

.action-section {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 24rpx 32rpx;
  padding-bottom: calc(24rpx + env(safe-area-inset-bottom));
  background: #fff;
  border-top: 1rpx solid #E5E6EB;
}

.refresh-btn {
  height: 88rpx;
  background: #4F7CFF;
  border-radius: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-text {
  font-size: 30rpx;
  font-weight: 600;
  color: #fff;
}
</style>
