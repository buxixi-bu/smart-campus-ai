export interface ChatMessage {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: number
}

export interface AnalysisResult {
  average: number
  failRate: number
  highScoreCount: number
  lowScoreCount: number
  scoreDistribution: { range: string; count: number }[]
  subjectStats: { name: string; average: number; failCount: number }[]
}

export const mockChatResponses: Record<string, string[]> = {
  '教务': [
    '教务处位于行政楼3楼，办公时间为周一至周五8:30-17:30。',
    '选课系统开放时间为每学期开学前两周，请关注教务处通知。',
    '成绩查询可通过校园网教务系统进行，一般在考试后两周公布。'
  ],
  '图书馆': [
    '图书馆开放时间：周一至周日8:00-22:00，节假日另行通知。',
    '借书期限为30天，可续借一次，续借期限15天。',
    '图书馆设有自习室、电子阅览室和研讨室，均可预约使用。'
  ],
  '宿舍': [
    '宿舍门禁时间为23:00，请按时返回宿舍。',
    '宿舍水电费每月结算一次，可通过校园APP缴纳。',
    '宿舍维修可通过后勤服务中心报修，一般24小时内处理。'
  ],
  '奖学金': [
    '国家奖学金每年评选一次，名额由教育部分配。',
    '校级奖学金分为一等奖、二等奖、三等奖，奖金分别为5000、3000、1000元。',
    '申请奖学金需提交成绩单、获奖证书等材料，截止日期为每年10月。'
  ],
  'default': [
    '很高兴为您服务！请问您有什么问题？',
    '我可以帮您解答校园相关的各种问题，包括教务、图书馆、宿舍、奖学金等。',
    '请随时提出您的问题，我会尽力为您解答。'
  ]
}

export function generateChatResponse(question: string): string {
  const keywords = ['教务', '图书馆', '宿舍', '奖学金']
  for (const keyword of keywords) {
    if (question.includes(keyword)) {
      const responses = mockChatResponses[keyword]
      return responses[Math.floor(Math.random() * responses.length)]
    }
  }
  const defaults = mockChatResponses['default']
  return defaults[Math.floor(Math.random() * defaults.length)]
}

export function generateDocument(type: string, requirements: string): string {
  const templates: Record<string, (req: string) => string> = {
    '活动通知': (req) => `【活动通知】\n\n亲爱的同学们：\n\n${req}\n\n请同学们积极参与，如有疑问请联系活动负责人。\n\n特此通知。\n\n学生会\n${new Date().toLocaleDateString()}`,
    '请假条': (req) => `【请假条】\n\n尊敬的老师：\n\n您好！我是${req.split('|')[0] || 'XXX'}班学生${req.split('|')[1] || 'XXX'}，因${req.split('|')[2] || '个人原因'}，需请假${req.split('|')[3] || '1天'}（${req.split('|')[4] || '2024年X月X日'}）。\n\n请假期间，我会按时完成作业，不会影响学习进度。恳请老师批准！\n\n此致\n敬礼！\n\n学生：XXX\n日期：${new Date().toLocaleDateString()}`,
    '社团招新': (req) => `【${req.split('|')[0] || '社团名称'}招新啦！】\n\n✨${req.split('|')[1] || '加入我们，开启精彩校园生活！'}\n\n📢招新对象：全体在校学生\n📍招新地点：${req.split('|')[2] || '大学生活动中心'}\n⏰招新时间：${req.split('|')[3] || '本周六上午9点'}\n\n🌟社团亮点：\n• 丰富的活动体验\n• 结识志同道合的朋友\n• 提升个人能力\n\n📮报名方式：现场报名或扫码加入招新群\n\n期待你的加入！🎉\n\n${req.split('|')[0] || '社团名称'}宣\n${new Date().toLocaleDateString()}`
  }
  return templates[type]?.(requirements) || '请选择文案类型并输入需求'
}

export function parseCSV(csvText: string): string[][] {
  const lines = csvText.split('\n').filter(line => line.trim())
  return lines.map(line => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        inQuotes = !inQuotes
      } else if (char === ',' && !inQuotes) {
        result.push(current)
        current = ''
      } else {
        current += char
      }
    }
    result.push(current)
    return result
  })
}

export function analyzeScores(csvData: string[][]): AnalysisResult {
  if (csvData.length < 2) {
    return {
      average: 0,
      failRate: 0,
      highScoreCount: 0,
      lowScoreCount: 0,
      scoreDistribution: [],
      subjectStats: []
    }
  }

  const headers = csvData[0]
  const subjectColumns = headers.slice(1)
  const scores: number[][] = []
  const subjectStats: { name: string; average: number; failCount: number }[] = []

  for (let i = 1; i < csvData.length; i++) {
    const row = csvData[i]
    const rowScores = row.slice(1).map(s => parseFloat(s) || 0)
    scores.push(rowScores)
  }

  let totalScore = 0
  let totalCount = 0
  let failCount = 0
  let highScoreCount = 0
  let lowScoreCount = 0

  for (let col = 0; col < subjectColumns.length; col++) {
    let colTotal = 0
    let colCount = 0
    let colFailCount = 0

    for (let row = 0; row < scores.length; row++) {
      const score = scores[row][col]
      if (!isNaN(score)) {
        colTotal += score
        colCount++
        totalScore += score
        totalCount++

        if (score < 60) {
          colFailCount++
          failCount++
        }
        if (score >= 90) {
          highScoreCount++
        }
        if (score < 60) {
          lowScoreCount++
        }
      }
    }

    subjectStats.push({
      name: subjectColumns[col],
      average: colCount > 0 ? Math.round(colTotal / colCount * 10) / 10 : 0,
      failCount: colFailCount
    })
  }

  const distribution = [
    { range: '0-59', count: 0 },
    { range: '60-69', count: 0 },
    { range: '70-79', count: 0 },
    { range: '80-89', count: 0 },
    { range: '90-100', count: 0 }
  ]

  for (const row of scores) {
    for (const score of row) {
      if (!isNaN(score)) {
        if (score < 60) distribution[0].count++
        else if (score < 70) distribution[1].count++
        else if (score < 80) distribution[2].count++
        else if (score < 90) distribution[3].count++
        else distribution[4].count++
      }
    }
  }

  return {
    average: totalCount > 0 ? Math.round(totalScore / totalCount * 10) / 10 : 0,
    failRate: totalCount > 0 ? Math.round(failCount / totalCount * 1000) / 10 : 0,
    highScoreCount,
    lowScoreCount,
    scoreDistribution: distribution,
    subjectStats
  }
}
