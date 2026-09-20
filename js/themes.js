/**
 * themes.js - 主题皮肤系统
 * 50种精心设计的主题，涵盖简约、游戏、自然、艺术、科技、季节节日、质感七大系列
 * 每个主题包含配色方案、粒子特效、图标风格、推荐字体
 */

// ========== 50种主题定义 ==========
const THEMES = [
  // ===== 1. 简约系列（5种） =====
  {
    id: 'minimal-white',
    name: '极简白',
    category: '简约系列',
    colors: {
      bgPrimary: '#FFFFFF',
      bgSecondary: '#F8F9FA',
      bgTertiary: '#E9ECEF',
      textPrimary: '#212529',
      textSecondary: '#495057',
      textMuted: '#ADB5BD',
      accentPrimary: '#3B82F6',
      accentSecondary: '#60A5FA',
      accentSuccess: '#10B981',
      accentError: '#EF4444',
      accentWarning: '#F59E0B',
      borderColor: '#DEE2E6',
      shadowColor: 'rgba(0, 0, 0, 0.08)'
    },
    particle: { type: 'none', color: '#3B82F6', count: 0, speed: 0, size: 0 },
    iconStyle: 'icon-minimal',
    font: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'dark-night',
    name: '暗夜黑',
    category: '简约系列',
    colors: {
      bgPrimary: '#0F0F0F',
      bgSecondary: '#1A1A1A',
      bgTertiary: '#262626',
      textPrimary: '#F5F5F5',
      textSecondary: '#A3A3A3',
      textMuted: '#525252',
      accentPrimary: '#3B82F6',
      accentSecondary: '#60A5FA',
      accentSuccess: '#10B981',
      accentError: '#EF4444',
      accentWarning: '#F59E0B',
      borderColor: '#333333',
      shadowColor: 'rgba(0, 0, 0, 0.5)'
    },
    particle: { type: 'stars', color: '#FFFFFF', count: 50, speed: 0.3, size: 2 },
    iconStyle: 'icon-dark',
    font: 'system-ui, -apple-system, sans-serif'
  },
  {
    id: 'morandi',
    name: '莫兰迪',
    category: '简约系列',
    colors: {
      bgPrimary: '#E8E4DE',
      bgSecondary: '#D9D4CC',
      bgTertiary: '#C9C2B8',
      textPrimary: '#4A4543',
      textSecondary: '#6B6560',
      textMuted: '#9A948D',
      accentPrimary: '#8B7D6B',
      accentSecondary: '#A89880',
      accentSuccess: '#7D8471',
      accentError: '#B07A6F',
      accentWarning: '#B8A07A',
      borderColor: '#BFB7AD',
      shadowColor: 'rgba(74, 69, 67, 0.15)'
    },
    particle: { type: 'dust', color: '#BFB7AD', count: 20, speed: 0.2, size: 3 },
    iconStyle: 'icon-morandi',
    font: 'Georgia, serif'
  },
  {
    id: 'nordic',
    name: '北欧风',
    category: '简约系列',
    colors: {
      bgPrimary: '#FAFAFA',
      bgSecondary: '#F0F2F5',
      bgTertiary: '#E4E7EB',
      textPrimary: '#2C3E50',
      textSecondary: '#5D6D7E',
      textMuted: '#AEB6BF',
      accentPrimary: '#5DADE2',
      accentSecondary: '#85C1E9',
      accentSuccess: '#58D68D',
      accentError: '#EC7063',
      accentWarning: '#F5B041',
      borderColor: '#D5D8DC',
      shadowColor: 'rgba(44, 62, 80, 0.08)'
    },
    particle: { type: 'snow', color: '#FFFFFF', count: 30, speed: 0.5, size: 3 },
    iconStyle: 'icon-nordic',
    font: 'Helvetica Neue, Arial, sans-serif'
  },
  {
    id: 'japanese-minimal',
    name: '日系简约',
    category: '简约系列',
    colors: {
      bgPrimary: '#F7F5F0',
      bgSecondary: '#EDEAE3',
      bgTertiary: '#E0DCD2',
      textPrimary: '#3D3A36',
      textSecondary: '#6B655D',
      textMuted: '#A8A298',
      accentPrimary: '#C45C5C',
      accentSecondary: '#D98880',
      accentSuccess: '#7DA87B',
      accentError: '#C0392B',
      accentWarning: '#D4A017',
      borderColor: '#D4CFC5',
      shadowColor: 'rgba(61, 58, 54, 0.1)'
    },
    particle: { type: 'sakura', color: '#FADADD', count: 25, speed: 0.4, size: 4 },
    iconStyle: 'icon-japanese',
    font: 'Hiragino Sans, Yu Gothic, sans-serif'
  },

  // ===== 2. 游戏系列（8种） =====
  {
    id: 'pokemon-gba',
    name: '宝可梦GBA点阵',
    category: '游戏系列',
    colors: {
      bgPrimary: '#8BBC25',
      bgSecondary: '#5C942C',
      bgTertiary: '#35654D',
      textPrimary: '#F8F8F8',
      textSecondary: '#E0E0E0',
      textMuted: '#A0A0A0',
      accentPrimary: '#FFCB05',
      accentSecondary: '#3B4CCA',
      accentSuccess: '#4CAF50',
      accentError: '#E53935',
      accentWarning: '#FF9800',
      borderColor: '#2D5016',
      shadowColor: 'rgba(0, 0, 0, 0.3)'
    },
    particle: { type: 'pixel', color: '#FFCB05', count: 30, speed: 1, size: 4 },
    iconStyle: 'icon-pixel',
    font: 'Press Start 2P, monospace'
  },
  {
    id: 'cyberpunk-neon',
    name: '赛博朋克霓虹',
    category: '游戏系列',
    colors: {
      bgPrimary: '#0D0221',
      bgSecondary: '#1A0533',
      bgTertiary: '#2A0A4C',
      textPrimary: '#00FFFF',
      textSecondary: '#FF00FF',
      textMuted: '#6B21A8',
      accentPrimary: '#FF00FF',
      accentSecondary: '#00FFFF',
      accentSuccess: '#39FF14',
      accentError: '#FF073A',
      accentWarning: '#FFFF00',
      borderColor: '#FF00FF',
      shadowColor: 'rgba(255, 0, 255, 0.5)'
    },
    particle: { type: 'neon-lines', color: '#FF00FF', count: 20, speed: 2, size: 2 },
    iconStyle: 'icon-neon',
    font: 'Orbitron, sans-serif'
  },
  {
    id: 'stardew-valley',
    name: '星露谷像素',
    category: '游戏系列',
    colors: {
      bgPrimary: '#5A8F3C',
      bgSecondary: '#4A7A30',
      bgTertiary: '#3D6628',
      textPrimary: '#FFF3C4',
      textSecondary: '#E6D5A8',
      textMuted: '#A89870',
      accentPrimary: '#FFD700',
      accentSecondary: '#FFA500',
      accentSuccess: '#90EE90',
      accentError: '#FF6B6B',
      accentWarning: '#FFB347',
      borderColor: '#8B4513',
      shadowColor: 'rgba(0, 0, 0, 0.3)'
    },
    particle: { type: 'pixel', color: '#FFD700', count: 15, speed: 0.5, size: 3 },
    iconStyle: 'icon-pixel',
    font: 'VT323, monospace'
  },
  {
    id: 'minecraft',
    name: '我的世界',
    category: '游戏系列',
    colors: {
      bgPrimary: '#7EC850',
      bgSecondary: '#5D9B3C',
      bgTertiary: '#4A7A2E',
      textPrimary: '#FFFFFF',
      textSecondary: '#E0E0E0',
      textMuted: '#909090',
      accentPrimary: '#8B4513',
      accentSecondary: '#A0522D',
      accentSuccess: '#32CD32',
      accentError: '#DC143C',
      accentWarning: '#FFD700',
      borderColor: '#654321',
      shadowColor: 'rgba(0, 0, 0, 0.4)'
    },
    particle: { type: 'pixel', color: '#8B4513', count: 25, speed: 0.8, size: 5 },
    iconStyle: 'icon-pixel-block',
    font: 'Minecraft, monospace'
  },
  {
    id: 'animal-crossing',
    name: '动物森友会',
    category: '游戏系列',
    colors: {
      bgPrimary: '#B8E6B8',
      bgSecondary: '#98D898',
      bgTertiary: '#78C878',
      textPrimary: '#5D4037',
      textSecondary: '#795548',
      textMuted: '#A1887F',
      accentPrimary: '#FF8A80',
      accentSecondary: '#FFAB91',
      accentSuccess: '#81C784',
      accentError: '#E57373',
      accentWarning: '#FFB74D',
      borderColor: '#8D6E63',
      shadowColor: 'rgba(93, 64, 55, 0.2)'
    },
    particle: { type: 'leaves', color: '#90EE90', count: 20, speed: 0.6, size: 5 },
    iconStyle: 'icon-cute',
    font: 'Comic Sans MS, cursive'
  },
  {
    id: 'zelda',
    name: '塞尔达风',
    category: '游戏系列',
    colors: {
      bgPrimary: '#1A3A2A',
      bgSecondary: '#2D5A42',
      bgTertiary: '#3F7A5A',
      textPrimary: '#F0E68C',
      textSecondary: '#D4C86A',
      textMuted: '#A89B5C',
      accentPrimary: '#FFD700',
      accentSecondary: '#FFA500',
      accentSuccess: '#32CD32',
      accentError: '#DC143C',
      accentWarning: '#FF8C00',
      borderColor: '#8B7355',
      shadowColor: 'rgba(0, 0, 0, 0.5)'
    },
    particle: { type: 'fairy', color: '#FFD700', count: 15, speed: 0.8, size: 4 },
    iconStyle: 'icon-fantasy',
    font: 'Triforce, serif'
  },
  {
    id: 'final-fantasy',
    name: '最终幻想',
    category: '游戏系列',
    colors: {
      bgPrimary: '#1A1A2E',
      bgSecondary: '#16213E',
      bgTertiary: '#0F3460',
      textPrimary: '#E8E8E8',
      textSecondary: '#B8B8B8',
      textMuted: '#787878',
      accentPrimary: '#E94560',
      accentSecondary: '#FF6B6B',
      accentSuccess: '#4ECDC4',
      accentError: '#E94560',
      accentWarning: '#FFE66D',
      borderColor: '#533483',
      shadowColor: 'rgba(233, 69, 96, 0.3)'
    },
    particle: { type: 'magic', color: '#E94560', count: 25, speed: 1.2, size: 3 },
    iconStyle: 'icon-fantasy',
    font: 'Cinzel, serif'
  },
  {
    id: 'pixel-dungeon',
    name: '像素地牢',
    category: '游戏系列',
    colors: {
      bgPrimary: '#2C1810',
      bgSecondary: '#3D2317',
      bgTertiary: '#4E2E1E',
      textPrimary: '#C9A227',
      textSecondary: '#A08020',
      textMuted: '#706030',
      accentPrimary: '#C9A227',
      accentSecondary: '#E6B800',
      accentSuccess: '#4CAF50',
      accentError: '#D32F2F',
      accentWarning: '#FF9800',
      borderColor: '#5D4037',
      shadowColor: 'rgba(0, 0, 0, 0.6)'
    },
    particle: { type: 'torch', color: '#FF6600', count: 10, speed: 1.5, size: 5 },
    iconStyle: 'icon-pixel',
    font: 'Pixel Operator, monospace'
  },

  // ===== 3. 自然系列（7种） =====
  {
    id: 'forest-green',
    name: '森林绿',
    category: '自然系列',
    colors: {
      bgPrimary: '#1B4332',
      bgSecondary: '#2D6A4F',
      bgTertiary: '#40916C',
      textPrimary: '#D8F3DC',
      textSecondary: '#B7E4C7',
      textMuted: '#74C69D',
      accentPrimary: '#95D5B2',
      accentSecondary: '#52B788',
      accentSuccess: '#40916C',
      accentError: '#E07A5F',
      accentWarning: '#F2CC8F',
      borderColor: '#2D6A4F',
      shadowColor: 'rgba(27, 67, 50, 0.5)'
    },
    particle: { type: 'leaves', color: '#52B788', count: 20, speed: 0.5, size: 6 },
    iconStyle: 'icon-nature',
    font: 'Georgia, serif'
  },
  {
    id: 'ocean-blue',
    name: '海洋蓝',
    category: '自然系列',
    colors: {
      bgPrimary: '#03045E',
      bgSecondary: '#023E8A',
      bgTertiary: '#0077B6',
      textPrimary: '#CAF0F8',
      textSecondary: '#90E0EF',
      textMuted: '#48CAE4',
      accentPrimary: '#00B4D8',
      accentSecondary: '#0096C7',
      accentSuccess: '#2EC4B6',
      accentError: '#FF6B6B',
      accentWarning: '#FFD93D',
      borderColor: '#0077B6',
      shadowColor: 'rgba(3, 4, 94, 0.5)'
    },
    particle: { type: 'bubble', color: '#48CAE4', count: 25, speed: 0.8, size: 5 },
    iconStyle: 'icon-ocean',
    font: 'Segoe UI, sans-serif'
  },
  {
    id: 'sunset-orange',
    name: '日落橙',
    category: '自然系列',
    colors: {
      bgPrimary: '#5C2018',
      bgSecondary: '#8B3125',
      bgTertiary: '#BC4A3C',
      textPrimary: '#F5E6D3',
      textSecondary: '#E8D5B7',
      textMuted: '#D4B896',
      accentPrimary: '#F4A261',
      accentSecondary: '#E76F51',
      accentSuccess: '#81B29A',
      accentError: '#E76F51',
      accentWarning: '#F2CC8F',
      borderColor: '#BC4A3C',
      shadowColor: 'rgba(92, 32, 24, 0.5)'
    },
    particle: { type: 'sunset', color: '#F4A261', count: 15, speed: 0.3, size: 8 },
    iconStyle: 'icon-warm',
    font: 'Palatino, serif'
  },
  {
    id: 'lavender-purple',
    name: '薰衣草紫',
    category: '自然系列',
    colors: {
      bgPrimary: '#E6E6FA',
      bgSecondary: '#D8BFD8',
      bgTertiary: '#DDA0DD',
      textPrimary: '#4B0082',
      textSecondary: '#663399',
      textMuted: '#9370DB',
      accentPrimary: '#9370DB',
      accentSecondary: '#BA55D3',
      accentSuccess: '#8FBC8F',
      accentError: '#DB7093',
      accentWarning: '#DDA0DD',
      borderColor: '#D8BFD8',
      shadowColor: 'rgba(75, 0, 130, 0.15)'
    },
    particle: { type: 'petal', color: '#DDA0DD', count: 30, speed: 0.6, size: 5 },
    iconStyle: 'icon-soft',
    font: 'Times New Roman, serif'
  },
  {
    id: 'sakura-pink',
    name: '樱花粉',
    category: '自然系列',
    colors: {
      bgPrimary: '#FFF0F5',
      bgSecondary: '#FFE4E9',
      bgTertiary: '#FFD1DC',
      textPrimary: '#8B4557',
      textSecondary: '#A85C6F',
      textMuted: '#C9899C',
      accentPrimary: '#FF69B4',
      accentSecondary: '#FFB6C1',
      accentSuccess: '#98D8AA',
      accentError: '#FF6B6B',
      accentWarning: '#FFD93D',
      borderColor: '#FFB6C1',
      shadowColor: 'rgba(139, 69, 87, 0.15)'
    },
    particle: { type: 'sakura', color: '#FFB7C5', count: 35, speed: 0.7, size: 6 },
    iconStyle: 'icon-cute',
    font: 'Sakura, cursive'
  },
  {
    id: 'desert-gold',
    name: '沙漠金',
    category: '自然系列',
    colors: {
      bgPrimary: '#C19A6B',
      bgSecondary: '#D4A574',
      bgTertiary: '#E6B87E',
      textPrimary: '#3E2723',
      textSecondary: '#5D4037',
      textMuted: '#8D6E63',
      accentPrimary: '#FF8C00',
      accentSecondary: '#FFA500',
      accentSuccess: '#6B8E23',
      accentError: '#CD5C5C',
      accentWarning: '#DAA520',
      borderColor: '#A0826D',
      shadowColor: 'rgba(62, 39, 35, 0.2)'
    },
    particle: { type: 'sand', color: '#F5DEB3', count: 20, speed: 1, size: 2 },
    iconStyle: 'icon-desert',
    font: 'Georgia, serif'
  },
  {
    id: 'aurora',
    name: '极光',
    category: '自然系列',
    colors: {
      bgPrimary: '#0A1128',
      bgSecondary: '#001F54',
      bgTertiary: '#034078',
      textPrimary: '#E0FFFF',
      textSecondary: '#B0E0E6',
      textMuted: '#87CEEB',
      accentPrimary: '#00FF7F',
      accentSecondary: '#7FFFD4',
      accentSuccess: '#00FA9A',
      accentError: '#FF6B6B',
      accentWarning: '#FFD700',
      borderColor: '#034078',
      shadowColor: 'rgba(0, 255, 127, 0.3)'
    },
    particle: { type: 'aurora', color: '#00FF7F', count: 30, speed: 0.5, size: 10 },
    iconStyle: 'icon-glow',
    font: 'Arial, sans-serif'
  },

  // ===== 4. 艺术系列（8种） =====
  {
    id: 'ink-wash',
    name: '水墨风',
    category: '艺术系列',
    colors: {
      bgPrimary: '#F5F5F0',
      bgSecondary: '#E8E8E0',
      bgTertiary: '#D8D8D0',
      textPrimary: '#1C1C1C',
      textSecondary: '#3C3C3C',
      textMuted: '#6C6C6C',
      accentPrimary: '#2C2C2C',
      accentSecondary: '#5C5C5C',
      accentSuccess: '#4A6741',
      accentError: '#8B0000',
      accentWarning: '#B8860B',
      borderColor: '#B8B8B0',
      shadowColor: 'rgba(28, 28, 28, 0.2)'
    },
    particle: { type: 'ink-diffusion', color: '#2C2C2C', count: 10, speed: 0.3, size: 15 },
    iconStyle: 'icon-ink',
    font: 'STKaiti, KaiTi, serif'
  },
  {
    id: 'makoto-shinkai',
    name: '新海诚漫画',
    category: '艺术系列',
    colors: {
      bgPrimary: '#87CEEB',
      bgSecondary: '#6BB3D9',
      bgTertiary: '#4A90C2',
      textPrimary: '#FFFFFF',
      textSecondary: '#E8F4F8',
      textMuted: '#B8D4E3',
      accentPrimary: '#FF6B9D',
      accentSecondary: '#FFB6C1',
      accentSuccess: '#98FB98',
      accentError: '#FF6347',
      accentWarning: '#FFD700',
      borderColor: '#4A90C2',
      shadowColor: 'rgba(74, 144, 194, 0.3)'
    },
    particle: { type: 'cloud', color: '#FFFFFF', count: 12, speed: 0.2, size: 20 },
    iconStyle: 'icon-anime',
    font: 'Hiragino Kaku Gothic Pro, sans-serif'
  },
  {
    id: 'van-gogh-starry',
    name: '梵高星空',
    category: '艺术系列',
    colors: {
      bgPrimary: '#1A1A4E',
      bgSecondary: '#2A2A6E',
      bgTertiary: '#3A3A8E',
      textPrimary: '#FFE4B5',
      textSecondary: '#DEB887',
      textMuted: '#C4A35A',
      accentPrimary: '#FFD700',
      accentSecondary: '#FFA500',
      accentSuccess: '#4CAF50',
      accentError: '#E53935',
      accentWarning: '#FF9800',
      borderColor: '#4A4A9E',
      shadowColor: 'rgba(26, 26, 78, 0.5)'
    },
    particle: { type: 'swirl', color: '#FFD700', count: 25, speed: 0.8, size: 4 },
    iconStyle: 'icon-artistic',
    font: 'Georgia, serif'
  },
  {
    id: 'monet-waterlily',
    name: '莫奈睡莲',
    category: '艺术系列',
    colors: {
      bgPrimary: '#B8D4E3',
      bgSecondary: '#A8C4D3',
      bgTertiary: '#98B4C3',
      textPrimary: '#2E4A3E',
      textSecondary: '#4A6B5D',
      textMuted: '#7A9B8D',
      accentPrimary: '#8FBC8F',
      accentSecondary: '#90EE90',
      accentSuccess: '#3CB371',
      accentError: '#CD5C5C',
      accentWarning: '#DAA520',
      borderColor: '#88AAB8',
      shadowColor: 'rgba(46, 74, 62, 0.2)'
    },
    particle: { type: 'ripple', color: '#8FBC8F', count: 15, speed: 0.4, size: 12 },
    iconStyle: 'icon-impressionist',
    font: 'Bodoni MT, serif'
  },
  {
    id: 'ukiyo-e',
    name: '浮世绘',
    category: '艺术系列',
    colors: {
      bgPrimary: '#E8D5B7',
      bgSecondary: '#D4C4A8',
      bgTertiary: '#C0B399',
      textPrimary: '#2C1810',
      textSecondary: '#5C3A28',
      textMuted: '#8C6A48',
      accentPrimary: '#C41E3A',
      accentSecondary: '#E85D75',
      accentSuccess: '#2E8B57',
      accentError: '#C41E3A',
      accentWarning: '#DAA520',
      borderColor: '#A89070',
      shadowColor: 'rgba(44, 24, 16, 0.3)'
    },
    particle: { type: 'wave', color: '#1E90FF', count: 12, speed: 0.6, size: 8 },
    iconStyle: 'icon-ukiyo',
    font: 'Yu Mincho, serif'
  },
  {
    id: 'pop-art',
    name: '波普艺术',
    category: '艺术系列',
    colors: {
      bgPrimary: '#FFD700',
      bgSecondary: '#FF69B4',
      bgTertiary: '#00CED1',
      textPrimary: '#000000',
      textSecondary: '#333333',
      textMuted: '#666666',
      accentPrimary: '#FF1493',
      accentSecondary: '#00BFFF',
      accentSuccess: '#32CD32',
      accentError: '#FF0000',
      accentWarning: '#FFA500',
      borderColor: '#000000',
      shadowColor: 'rgba(0, 0, 0, 0.3)'
    },
    particle: { type: 'dot', color: '#FF1493', count: 40, speed: 0.5, size: 6 },
    iconStyle: 'icon-pop',
    font: 'Impact, sans-serif'
  },
  {
    id: 'minimalism',
    name: '极简主义',
    category: '艺术系列',
    colors: {
      bgPrimary: '#FFFFFF',
      bgSecondary: '#FAFAFA',
      bgTertiary: '#F5F5F5',
      textPrimary: '#000000',
      textSecondary: '#333333',
      textMuted: '#999999',
      accentPrimary: '#000000',
      accentSecondary: '#666666',
      accentSuccess: '#333333',
      accentError: '#666666',
      accentWarning: '#999999',
      borderColor: '#E5E5E5',
      shadowColor: 'rgba(0, 0, 0, 0.05)'
    },
    particle: { type: 'none', color: '#000000', count: 0, speed: 0, size: 0 },
    iconStyle: 'icon-minimal-line',
    font: 'Helvetica, Arial, sans-serif'
  },
  {
    id: 'gothic',
    name: '哥特风',
    category: '艺术系列',
    colors: {
      bgPrimary: '#0A0A0A',
      bgSecondary: '#1A1A1A',
      bgTertiary: '#2A2A2A',
      textPrimary: '#C0C0C0',
      textSecondary: '#808080',
      textMuted: '#505050',
      accentPrimary: '#8B0000',
      accentSecondary: '#DC143C',
      accentSuccess: '#2F4F4F',
      accentError: '#8B0000',
      accentWarning: '#8B7355',
      borderColor: '#4A4A4A',
      shadowColor: 'rgba(139, 0, 0, 0.4)'
    },
    particle: { type: 'bat', color: '#2A2A2A', count: 15, speed: 1.5, size: 8 },
    iconStyle: 'icon-gothic',
    font: 'Blackletter, Old English, serif'
  },

  // ===== 5. 科技系列（7种） =====
  {
    id: 'ios-liquid',
    name: 'iOS液态玻璃',
    category: '科技系列',
    colors: {
      bgPrimary: '#F2F2F7',
      bgSecondary: '#FFFFFF',
      bgTertiary: '#E5E5EA',
      textPrimary: '#000000',
      textSecondary: '#3C3C43',
      textMuted: '#8E8E93',
      accentPrimary: '#007AFF',
      accentSecondary: '#5AC8FA',
      accentSuccess: '#34C759',
      accentError: '#FF3B30',
      accentWarning: '#FF9500',
      borderColor: 'rgba(60, 60, 67, 0.18)',
      shadowColor: 'rgba(0, 0, 0, 0.1)'
    },
    particle: { type: 'bubble', color: 'rgba(90, 200, 250, 0.5)', count: 20, speed: 0.3, size: 6 },
    iconStyle: 'icon-ios',
    font: '-apple-system, BlinkMacSystemFont, sans-serif'
  },
  {
    id: 'macos',
    name: 'MacOS风',
    category: '科技系列',
    colors: {
      bgPrimary: '#ECECEC',
      bgSecondary: '#F5F5F7',
      bgTertiary: '#DDDDDD',
      textPrimary: '#1D1D1F',
      textSecondary: '#515154',
      textMuted: '#86868B',
      accentPrimary: '#0071E3',
      accentSecondary: '#4285F4',
      accentSuccess: '#34C759',
      accentError: '#FF3B30',
      accentWarning: '#FF9500',
      borderColor: '#D2D2D7',
      shadowColor: 'rgba(0, 0, 0, 0.12)'
    },
    particle: { type: 'aura', color: 'rgba(0, 113, 227, 0.3)', count: 5, speed: 0.2, size: 50 },
    iconStyle: 'icon-mac',
    font: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
  },
  {
    id: 'windows-11',
    name: 'Windows11',
    category: '科技系列',
    colors: {
      bgPrimary: '#F3F3F3',
      bgSecondary: '#FFFFFF',
      bgTertiary: '#E8E8E8',
      textPrimary: '#000000',
      textSecondary: '#5C5C5C',
      textMuted: '#9E9E9E',
      accentPrimary: '#0078D4',
      accentSecondary: '#2D8EF5',
      accentSuccess: '#107C10',
      accentError: '#D13438',
      accentWarning: '#FF8C00',
      borderColor: '#D1D1D1',
      shadowColor: 'rgba(0, 0, 0, 0.08)'
    },
    particle: { type: 'fluffy', color: 'rgba(0, 120, 212, 0.2)', count: 8, speed: 0.15, size: 30 },
    iconStyle: 'icon-win',
    font: 'Segoe UI, Tahoma, sans-serif'
  },
  {
    id: 'android-material',
    name: 'Android Material',
    category: '科技系列',
    colors: {
      bgPrimary: '#FAFAFA',
      bgSecondary: '#FFFFFF',
      bgTertiary: '#F5F5F5',
      textPrimary: '#212121',
      textSecondary: '#424242',
      textMuted: '#757575',
      accentPrimary: '#6200EE',
      accentSecondary: '#03DAC6',
      accentSuccess: '#00C853',
      accentError: '#B00020',
      accentWarning: '#FF6D00',
      borderColor: '#E0E0E0',
      shadowColor: 'rgba(0, 0, 0, 0.14)'
    },
    particle: { type: 'ripple', color: 'rgba(98, 0, 238, 0.3)', count: 10, speed: 1, size: 20 },
    iconStyle: 'icon-material',
    font: 'Roboto, sans-serif'
  },
  {
    id: 'hacker-terminal',
    name: '黑客终端',
    category: '科技系列',
    colors: {
      bgPrimary: '#0D0D0D',
      bgSecondary: '#1A1A1A',
      bgTertiary: '#2D2D2D',
      textPrimary: '#00FF00',
      textSecondary: '#00CC00',
      textMuted: '#006600',
      accentPrimary: '#00FF00',
      accentSecondary: '#00FF66',
      accentSuccess: '#00FF00',
      accentError: '#FF0000',
      accentWarning: '#FFFF00',
      borderColor: '#004400',
      shadowColor: 'rgba(0, 255, 0, 0.3)'
    },
    particle: { type: 'matrix-rain', color: '#00FF00', count: 40, speed: 2, size: 12 },
    iconStyle: 'icon-terminal',
    font: 'Consolas, Monaco, monospace'
  },
  {
    id: 'hud-tech',
    name: 'HUD科技感',
    category: '科技系列',
    colors: {
      bgPrimary: '#0A1628',
      bgSecondary: '#0D2137',
      bgTertiary: '#102A43',
      textPrimary: '#00D4FF',
      textSecondary: '#00A8CC',
      textMuted: '#006688',
      accentPrimary: '#00D4FF',
      accentSecondary: '#00FF88',
      accentSuccess: '#00FF88',
      accentError: '#FF4444',
      accentWarning: '#FFAA00',
      borderColor: '#00D4FF',
      shadowColor: 'rgba(0, 212, 255, 0.4)'
    },
    particle: { type: 'scanline', color: 'rgba(0, 212, 255, 0.1)', count: 5, speed: 0.5, size: 2 },
    iconStyle: 'icon-hud',
    font: 'Orbitron, sans-serif'
  },
  {
    id: 'space-odyssey',
    name: '太空漫游',
    category: '科技系列',
    colors: {
      bgPrimary: '#0B0B2B',
      bgSecondary: '#161640',
      bgTertiary: '#202060',
      textPrimary: '#E0E0FF',
      textSecondary: '#B0B0D0',
      textMuted: '#8080A0',
      accentPrimary: '#7B68EE',
      accentSecondary: '#9370DB',
      accentSuccess: '#00CED1',
      accentError: '#FF6347',
      accentWarning: '#FFD700',
      borderColor: '#483D8B',
      shadowColor: 'rgba(123, 104, 238, 0.3)'
    },
    particle: { type: 'meteor', color: '#FFFFFF', count: 35, speed: 1.5, size: 2 },
    iconStyle: 'icon-space',
    font: 'Audiowide, cursive'
  },

  // ===== 6. 季节节日（7种） =====
  {
    id: 'spring-festival',
    name: '春节红',
    category: '季节节日',
    colors: {
      bgPrimary: '#8B0000',
      bgSecondary: '#A52A2A',
      bgTertiary: '#CD5C5C',
      textPrimary: '#FFD700',
      textSecondary: '#FFC125',
      textMuted: '#DAA520',
      accentPrimary: '#FFD700',
      accentSecondary: '#FF6347',
      accentSuccess: '#FFD700',
      accentError: '#FF4500',
      accentWarning: '#FFA500',
      borderColor: '#FFD700',
      shadowColor: 'rgba(255, 215, 0, 0.3)'
    },
    particle: { type: 'firework', color: '#FFD700', count: 15, speed: 1.2, size: 6 },
    iconStyle: 'icon-festival',
    font: 'STKaiti, KaiTi, serif'
  },
  {
    id: 'christmas',
    name: '圣诞绿',
    category: '季节节日',
    colors: {
      bgPrimary: '#165B33',
      bgSecondary: '#1A6B3D',
      bgTertiary: '#1E7B47',
      textPrimary: '#FFFFFF',
      textSecondary: '#E0E0E0',
      textMuted: '#A0A0A0',
      accentPrimary: '#BB2528',
      accentSecondary: '#F8B229',
      accentSuccess: '#146B3A',
      accentError: '#BB2528',
      accentWarning: '#F8B229',
      borderColor: '#BB2528',
      shadowColor: 'rgba(22, 91, 51, 0.5)'
    },
    particle: { type: 'snow', color: '#FFFFFF', count: 40, speed: 0.8, size: 4 },
    iconStyle: 'icon-christmas',
    font: 'Mountains of Christmas, cursive'
  },
  {
    id: 'halloween',
    name: '万圣节',
    category: '季节节日',
    colors: {
      bgPrimary: '#1C1C1C',
      bgSecondary: '#2D2D2D',
      bgTertiary: '#3E3E3E',
      textPrimary: '#FF7518',
      textSecondary: '#FFA500',
      textMuted: '#CD853F',
      accentPrimary: '#FF7518',
      accentSecondary: '#8B008B',
      accentSuccess: '#32CD32',
      accentError: '#8B0000',
      accentWarning: '#FF7518',
      borderColor: '#FF7518',
      shadowColor: 'rgba(255, 117, 24, 0.4)'
    },
    particle: { type: 'pumpkin', color: '#FF7518', count: 20, speed: 0.5, size: 8 },
    iconStyle: 'icon-halloween',
    font: 'Creepster, cursive'
  },
  {
    id: 'valentines',
    name: '情人节',
    category: '季节节日',
    colors: {
      bgPrimary: '#FFE4E1',
      bgSecondary: '#FFD1CC',
      bgTertiary: '#FFBEB8',
      textPrimary: '#8B0000',
      textSecondary: '#B22222',
      textMuted: '#CD5C5C',
      accentPrimary: '#DC143C',
      accentSecondary: '#FF69B4',
      accentSuccess: '#FF69B4',
      accentError: '#DC143C',
      accentWarning: '#FFB6C1',
      borderColor: '#FFB6C1',
      shadowColor: 'rgba(220, 20, 60, 0.2)'
    },
    particle: { type: 'heart', color: '#FF1493', count: 25, speed: 0.7, size: 6 },
    iconStyle: 'icon-love',
    font: 'Dancing Script, cursive'
  },
  {
    id: 'summer-cool',
    name: '夏日清凉',
    category: '季节节日',
    colors: {
      bgPrimary: '#E0F7FA',
      bgSecondary: '#B2EBF2',
      bgTertiary: '#80DEEA',
      textPrimary: '#006064',
      textSecondary: '#00838F',
      textMuted: '#00ACC1',
      accentPrimary: '#00BCD4',
      accentSecondary: '#26C6DA',
      accentSuccess: '#4DD0E1',
      accentError: '#EF5350',
      accentWarning: '#FFCA28',
      borderColor: '#80DEEA',
      shadowColor: 'rgba(0, 96, 100, 0.15)'
    },
    particle: { type: 'ice', color: '#E0F7FA', count: 20, speed: 0.6, size: 5 },
    iconStyle: 'icon-summer',
    font: 'Quicksand, sans-serif'
  },
  {
    id: 'winter-warm',
    name: '冬日暖阳',
    category: '季节节日',
    colors: {
      bgPrimary: '#3E2723',
      bgSecondary: '#4E342E',
      bgTertiary: '#5D4037',
      textPrimary: '#FFF8E1',
      textSecondary: '#FFECB3',
      textMuted: '#FFD54F',
      accentPrimary: '#FF8C00',
      accentSecondary: '#FFA726',
      accentSuccess: '#66BB6A',
      accentError: '#EF5350',
      accentWarning: '#FFB300',
      borderColor: '#6D4C41',
      shadowColor: 'rgba(255, 140, 0, 0.3)'
    },
    particle: { type: 'firefly', color: '#FFD54F', count: 15, speed: 0.8, size: 4 },
    iconStyle: 'icon-warm',
    font: 'Merriweather, serif'
  },
  {
    id: 'mid-autumn',
    name: '中秋月',
    category: '季节节日',
    colors: {
      bgPrimary: '#1A1A3E',
      bgSecondary: '#2A2A4E',
      bgTertiary: '#3A3A5E',
      textPrimary: '#FFFACD',
      textSecondary: '#F0E68C',
      textMuted: '#DAA520',
      accentPrimary: '#FFD700',
      accentSecondary: '#FFA500',
      accentSuccess: '#98FB98',
      accentError: '#F08080',
      accentWarning: '#FFD700',
      borderColor: '#DAA520',
      shadowColor: 'rgba(255, 215, 0, 0.3)'
    },
    particle: { type: 'moon', color: '#FFFACD', count: 25, speed: 0.4, size: 3 },
    iconStyle: 'icon-moon',
    font: 'STKaiti, KaiTi, serif'
  },

  // ===== 7. 质感系列（8种） =====
  {
    id: 'frosted-glass',
    name: '磨砂玻璃',
    category: '质感系列',
    colors: {
      bgPrimary: 'rgba(255, 255, 255, 0.7)',
      bgSecondary: 'rgba(255, 255, 255, 0.5)',
      bgTertiary: 'rgba(255, 255, 255, 0.3)',
      textPrimary: '#1C1C1C',
      textSecondary: '#4A4A4A',
      textMuted: '#7A7A7A',
      accentPrimary: '#5B8DEF',
      accentSecondary: '#7BA3F3',
      accentSuccess: '#58D68D',
      accentError: '#EC7063',
      accentWarning: '#F5B041',
      borderColor: 'rgba(255, 255, 255, 0.3)',
      shadowColor: 'rgba(0, 0, 0, 0.1)'
    },
    particle: { type: 'glow', color: 'rgba(91, 141, 239, 0.4)', count: 15, speed: 0.2, size: 15 },
    iconStyle: 'icon-glass',
    font: 'SF Pro Display, -apple-system, sans-serif'
  },
  {
    id: 'metallic',
    name: '金属质感',
    category: '质感系列',
    colors: {
      bgPrimary: '#2C3E50',
      bgSecondary: '#34495E',
      bgTertiary: '#41576A',
      textPrimary: '#ECF0F1',
      textSecondary: '#BDC3C7',
      textMuted: '#95A5A6',
      accentPrimary: '#C0C0C0',
      accentSecondary: '#D4D4D4',
      accentSuccess: '#27AE60',
      accentError: '#E74C3C',
      accentWarning: '#F39C12',
      borderColor: '#5D6D7E',
      shadowColor: 'rgba(0, 0, 0, 0.4)'
    },
    particle: { type: 'shine', color: 'rgba(255, 255, 255, 0.6)', count: 10, speed: 0.5, size: 10 },
    iconStyle: 'icon-metal',
    font: 'Roboto Condensed, sans-serif'
  },
  {
    id: 'wood-grain',
    name: '木纹',
    category: '质感系列',
    colors: {
      bgPrimary: '#8B4513',
      bgSecondary: '#A0522D',
      bgTertiary: '#CD853F',
      textPrimary: '#FFF8DC',
      textSecondary: '#F5DEB3',
      textMuted: '#DEB887',
      accentPrimary: '#DEB887',
      accentSecondary: '#F4A460',
      accentSuccess: '#6B8E23',
      accentError: '#B22222',
      accentWarning: '#DAA520',
      borderColor: '#654321',
      shadowColor: 'rgba(139, 69, 19, 0.5)'
    },
    particle: { type: 'wood-knot', color: '#654321', count: 8, speed: 0, size: 20 },
    iconStyle: 'icon-wood',
    font: 'Georgia, serif'
  },
  {
    id: 'leather',
    name: '皮革',
    category: '质感系列',
    colors: {
      bgPrimary: '#3C2415',
      bgSecondary: '#4E3020',
      bgTertiary: '#604030',
      textPrimary: '#F5DEB3',
      textSecondary: '#DEB887',
      textMuted: '#C4A35A',
      accentPrimary: '#D2691E',
      accentSecondary: '#CD853F',
      accentSuccess: '#8FBC8F',
      accentError: '#CD5C5C',
      accentWarning: '#DAA520',
      borderColor: '#2C1810',
      shadowColor: 'rgba(60, 36, 21, 0.6)'
    },
    particle: { type: 'texture', color: 'rgba(0, 0, 0, 0.1)', count: 50, speed: 0, size: 2 },
    iconStyle: 'icon-leather',
    font: 'Playfair Display, serif'
  },
  {
    id: 'paper',
    name: '纸质感',
    category: '质感系列',
    colors: {
      bgPrimary: '#F5F1E8',
      bgSecondary: '#EDE8DA',
      bgTertiary: '#E5DFC8',
      textPrimary: '#2C2C2C',
      textSecondary: '#4C4C4C',
      textMuted: '#7C7C7C',
      accentPrimary: '#8B4513',
      accentSecondary: '#A0522D',
      accentSuccess: '#556B2F',
      accentError: '#8B0000',
      accentWarning: '#B8860B',
      borderColor: '#D4C8B0',
      shadowColor: 'rgba(44, 44, 44, 0.15)'
    },
    particle: { type: 'paper-fiber', color: 'rgba(139, 69, 19, 0.05)', count: 40, speed: 0, size: 15 },
    iconStyle: 'icon-paper',
    font: 'Times New Roman, serif'
  },
  {
    id: 'marble',
    name: '大理石',
    category: '质感系列',
    colors: {
      bgPrimary: '#F5F5F5',
      bgSecondary: '#EDEDED',
      bgTertiary: '#E0E0E0',
      textPrimary: '#2F2F2F',
      textSecondary: '#505050',
      textMuted: '#808080',
      accentPrimary: '#708090',
      accentSecondary: '#778899',
      accentSuccess: '#6B8E23',
      accentError: '#B22222',
      accentWarning: '#DAA520',
      borderColor: '#C0C0C0',
      shadowColor: 'rgba(47, 47, 47, 0.15)'
    },
    particle: { type: 'vein', color: 'rgba(112, 128, 144, 0.3)', count: 12, speed: 0, size: 30 },
    iconStyle: 'icon-marble',
    font: 'Cormorant Garamond, serif'
  },
  {
    id: 'silk',
    name: '丝绸',
    category: '质感系列',
    colors: {
      bgPrimary: '#2C1810',
      bgSecondary: '#3D2317',
      bgTertiary: '#4E2E1E',
      textPrimary: '#FFD700',
      textSecondary: '#FFC125',
      textMuted: '#DAA520',
      accentPrimary: '#FFD700',
      accentSecondary: '#FFA500',
      accentSuccess: '#9ACD32',
      accentError: '#DC143C',
      accentWarning: '#FF8C00',
      borderColor: '#8B7355',
      shadowColor: 'rgba(255, 215, 0, 0.3)'
    },
    particle: { type: 'wave-sheen', color: 'rgba(255, 215, 0, 0.4)', count: 15, speed: 0.3, size: 25 },
    iconStyle: 'icon-silk',
    font: 'Noto Serif SC, serif'
  },
  {
    id: 'neon-tube',
    name: '霓虹灯管',
    category: '质感系列',
    colors: {
      bgPrimary: '#0A0A0A',
      bgSecondary: '#141414',
      bgTertiary: '#1E1E1E',
      textPrimary: '#FF1493',
      textSecondary: '#FF69B4',
      textMuted: '#C71585',
      accentPrimary: '#00FFFF',
      accentSecondary: '#FF1493',
      accentSuccess: '#00FF7F',
      accentError: '#FF0000',
      accentWarning: '#FFFF00',
      borderColor: '#FF1493',
      shadowColor: 'rgba(255, 20, 147, 0.6)'
    },
    particle: { type: 'neon-glow', color: '#FF1493', count: 20, speed: 0.5, size: 8 },
    iconStyle: 'icon-neon-tube',
    font: 'Neon, cursive'
  }
];

// ========== 主题管理器 ==========
const ThemeManager = (function () {
  'use strict';

  let currentTheme = null;
  const STORAGE_KEY = 'zhiyi_theme';

  /**
   * 获取所有主题
   * @returns {Array} 主题数组
   */
  function getAll() {
    return THEMES;
  }

  /**
   * 按分类获取主题
   * @param {string} category - 分类名称
   * @returns {Array} 主题数组
   */
  function getByCategory(category) {
    return THEMES.filter(theme => theme.category === category);
  }

  /**
   * 获取所有分类
   * @returns {Array} 分类名称数组
   */
  function getCategories() {
    const categories = [...new Set(THEMES.map(theme => theme.category))];
    return categories;
  }

  /**
   * 根据ID获取主题
   * @param {string} themeId - 主题ID
   * @returns {object|null} 主题对象
   */
  function getById(themeId) {
    return THEMES.find(theme => theme.id === themeId) || null;
  }

  /**
   * 获取当前主题
   * @returns {object} 当前主题对象
   */
  function getCurrent() {
    if (!currentTheme) {
      // 尝试从localStorage读取
      const savedThemeId = localStorage.getItem(STORAGE_KEY);
      if (savedThemeId) {
        const theme = getById(savedThemeId);
        if (theme) {
          currentTheme = theme;
          return currentTheme;
        }
      }
      // 默认使用极简白
      currentTheme = THEMES[0];
    }
    return currentTheme;
  }

  /**
   * 应用主题
   * 将主题颜色变量设置到document根元素的CSS变量中
   * @param {string} themeId - 主题ID
   * @returns {boolean} 是否成功
   */
  function apply(themeId) {
    const theme = getById(themeId);
    if (!theme) {
      console.warn('Theme not found:', themeId);
      return false;
    }

    currentTheme = theme;

    // 设置CSS变量
    const root = document.documentElement;

    // 颜色变量
    Object.entries(theme.colors).forEach(([key, value]) => {
      const cssVar = `--color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
      root.style.setProperty(cssVar, value);
    });

    // 字体
    root.style.setProperty('--font-family', theme.font);

    // 图标风格类名
    document.body.className = document.body.className.replace(/icon-style-\S+/g, '');
    document.body.classList.add(`icon-style-${theme.iconStyle}`);

    // 保存到localStorage
    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch (e) {
      console.warn('Failed to save theme to localStorage:', e);
    }

    // 触发主题变更事件
    const event = new CustomEvent('themechange', {
      detail: { theme }
    });
    document.dispatchEvent(event);

    return true;
  }

  /**
   * 初始化主题（从localStorage恢复或使用默认）
   * @returns {object} 当前主题
   */
  function init() {
    const theme = getCurrent();
    apply(theme.id);
    return theme;
  }

  /**
   * 获取粒子配置
   * @returns {object} 粒子配置
   */
  function getParticleConfig() {
    return getCurrent().particle;
  }

  /**
   * 获取主题数量
   * @returns {number}
   */
  function getCount() {
    return THEMES.length;
  }

  // 公开API
  return {
    getAll,
    getByCategory,
    getCategories,
    getById,
    getCurrent,
    apply,
    init,
    getParticleConfig,
    getCount
  };
})();

// 支持ES模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { THEMES, ThemeManager };
}
