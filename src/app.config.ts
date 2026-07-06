export default defineAppConfig({
  pages: [
    'pages/index/index',
    'pages/recommend/index',
    'pages/content/index',
    'pages/cover/index',
    'pages/publish-confirm/index',
    'pages/publish-success/index',
    'pages/orders/index',
    'pages/review/index',
    'pages/next-plan/index',
    'pages/memory/index',
    'pages/week-plan/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#FAF9F6',
    navigationBarTitleText: '礼有方',
    navigationBarTextStyle: 'black',
    backgroundColor: '#FAF9F6'
  },
  tabBar: {
    color: '#6B7280',
    selectedColor: '#23B26D',
    backgroundColor: '#FAF9F6',
    borderStyle: 'white',
    list: [
      { pagePath: 'pages/index/index', text: 'AI 对话' },
      { pagePath: 'pages/recommend/index', text: '探索' },
      { pagePath: 'pages/content/index', text: '创作' },
      { pagePath: 'pages/memory/index', text: '我的' }
    ]
  },
  requiredBackgroundModes: [],
  permission: {}
});
