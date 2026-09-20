// ============================================
// 知一 - API兼容层
// 统一各模块的API接口，供app.js调用
// 注意：const声明的全局变量不在window对象上，需用typeof检查
// ============================================
(function() {
'use strict';

// ========== Storage 兼容层 ==========
(function patchStorage() {
  if (typeof Storage === 'undefined') return;

  // 添加 init 方法
  Storage.init = function() {
    try {
      if (typeof Storage.initDeptProgress === 'function') {
        Storage.initDeptProgress();
      }
    } catch(e) {
      console.warn('Storage init warning:', e);
    }
  };

  // 添加每日活动记录
  Storage.recordDailyActivity = function(correctCount) {
    const today = new Date().toISOString().slice(0, 10);
    const records = Storage.get('dailyRecords', {});
    if (!records[today]) {
      records[today] = { total: 0, correct: 0, wrong: 0 };
    }
    records[today].total++;
    if (correctCount) {
      records[today].correct += correctCount;
    } else {
      records[today].wrong++;
    }
    Storage.set('dailyRecords', records);

    // 更新总体统计
    try {
      const stats = Storage.getOverallStats();
      stats.totalAnswered = (stats.totalAnswered || 0) + 1;
      if (correctCount) {
        stats.totalCorrect = (stats.totalCorrect || 0) + 1;
      }
      if (typeof Storage.updateOverallStats === 'function') {
        Storage.updateOverallStats(stats);
      }
    } catch(e) {}
  };

  // 包装 get/set 以支持 'settings' 键映射到 zhiyi_settings
  const origGet = Storage.get.bind(Storage);
  const origSet = Storage.set.bind(Storage);

  Storage.get = function(key, defaultValue) {
    if (key === 'settings') {
      if (Storage.getSettings) {
        try {
          return Storage.getSettings();
        } catch(e) {
          return defaultValue;
        }
      }
      return origGet('zhiyi_settings', defaultValue);
    }
    return origGet(key, defaultValue);
  };

  Storage.set = function(key, value) {
    if (key === 'settings') {
      if (Storage.saveSettings) {
        try {
          return Storage.saveSettings(value);
        } catch(e) {
          return false;
        }
      }
      return origSet('zhiyi_settings', value);
    }
    return origSet(key, value);
  };

  // 添加 clearMistakes 别名
  if (!Storage.clearMistakes && Storage.getMistakes) {
    Storage.clearMistakes = function() {
      const mistakes = Storage.getMistakes() || [];
      [...mistakes].forEach(id => Storage.removeMistake(id));
    };
  }
})();

// ========== QuizEngine 兼容层 ==========
(function patchQuizEngine() {
  if (typeof QuizEngine === 'undefined') return;

  // 添加 session 属性的getter
  Object.defineProperty(QuizEngine, 'session', {
    get: function() {
      return {
        options: this._options || {},
        questions: this._questions || [],
        currentIndex: this._currentIndex || 0,
        answers: this._answers || []
      };
    },
    configurable: true
  });

  // 公开定时器控制方法
  QuizEngine.startTimer = function() {
    if (typeof this._startTimer === 'function') {
      this._startTimer();
    }
  };

  QuizEngine.stopTimer = function() {
    if (typeof this._stopTimer === 'function') {
      this._stopTimer();
    }
  };

  QuizEngine.resetTimer = function() {
    if (typeof this._restartTimer === 'function') {
      this._restartTimer();
    }
  };
})();

// ========== Stats 兼容层 ==========
(function patchStats() {
  if (typeof Stats === 'undefined') return;

  // 确保Stats.getOverview返回的字段与app.js期望一致
  const origGetOverview = Stats.getOverview;
  Stats.getOverview = function() {
    let result = {};
    try {
      result = origGetOverview ? origGetOverview.call(this) : {};
    } catch(e) { result = {}; }

    const totalQ = (typeof QUESTION_BANK !== 'undefined' && QUESTION_BANK) ? QUESTION_BANK.length : 0;
    const totalAns = result.totalAnswered || result.answered || 0;
    const totalCor = result.totalCorrect || result.correct || 0;

    return {
      totalQuestions: result.totalQuestions || totalQ,
      totalAnswered: totalAns,
      totalCorrect: totalCor,
      accuracy: result.accuracy !== undefined ? result.accuracy :
                (totalAns ? totalCor / totalAns : 0),
      studyDaysCount: result.studyDaysCount || result.studyDays || 0,
      streak: result.streak || result.continuousDays || 0,
      progress: result.progress !== undefined ? result.progress :
                (totalQ ? totalAns / totalQ : 0),
      todayCount: result.todayCount || 0
    };
  };

  // 标准化getByDept，如果为空则从题库+Storage计算
  const origGetByDept = Stats.getByDept;
  Stats.getByDept = function() {
    let result = [];
    try {
      result = origGetByDept ? origGetByDept.call(this) : [];
    } catch(e) { result = []; }

    if (!result || result.length === 0) {
      // 从题库计算各部门总题数
      const depts = {};
      const qBank = typeof QUESTION_BANK !== 'undefined' ? QUESTION_BANK : [];
      qBank.forEach(q => {
        if (!depts[q.dept]) {
          depts[q.dept] = { name: q.dept, total: 0, done: 0, progress: 0 };
        }
        depts[q.dept].total++;
      });
      // 尝试从Storage获取已做题数
      try {
        const deptProgress = Storage.getDeptProgress();
        if (deptProgress && Array.isArray(deptProgress)) {
          deptProgress.forEach(d => {
            const name = d.name || d.dept;
            if (depts[name]) {
              depts[name].done = d.done || d.answered || 0;
              depts[name].progress = depts[name].total ? depts[name].done / depts[name].total : 0;
            }
          });
        }
      } catch(e) {}
      return Object.values(depts);
    }

    return result.map(d => ({
      name: d.name || d.dept || '',
      total: d.total || 0,
      done: d.done || d.answered || 0,
      progress: d.progress !== undefined ? d.progress : (d.total ? d.done / d.total : 0)
    }));
  };

  // 标准化getByType，如果为空则从题库计算
  const origGetByType = Stats.getByType;
  Stats.getByType = function() {
    let result = [];
    try {
      result = origGetByType ? origGetByType.call(this) : [];
    } catch(e) { result = []; }

    if (!result || result.length === 0) {
      // 从题库计算各题型总题数
      const types = {};
      const qBank = typeof QUESTION_BANK !== 'undefined' ? QUESTION_BANK : [];
      qBank.forEach(q => {
        if (!types[q.type]) {
          types[q.type] = { name: q.type, total: 0, correct: 0, accuracy: 0 };
        }
        types[q.type].total++;
      });
      return Object.values(types);
    }

    return result.map(t => ({
      name: t.name || t.type || '',
      total: t.total || 0,
      correct: t.correct || 0,
      accuracy: t.accuracy !== undefined ? t.accuracy : (t.total ? t.correct / t.total : 0)
    }));
  };
})();

// ========== ThemeManager 兼容层 ==========
(function patchThemes() {
  if (typeof ThemeManager === 'undefined') return;

  // 主题颜色key到CSS变量名的映射
  const colorVarMap = {
    bgPrimary: '--bg-primary',
    bgSecondary: '--bg-secondary',
    bgTertiary: '--bg-tertiary',
    textPrimary: '--text-primary',
    textSecondary: '--text-secondary',
    textMuted: '--text-muted',
    accentPrimary: '--accent-primary',
    accentSecondary: '--accent-secondary',
    accentSuccess: '--accent-success',
    accentError: '--accent-error',
    accentWarning: '--accent-warning',
    borderColor: '--border-color',
    shadowColor: '--shadow-color'
  };

  // 包装apply方法，确保设置正确的CSS变量名
  const origApply = ThemeManager.apply.bind(ThemeManager);
  ThemeManager.apply = function(themeId) {
    const result = origApply(themeId);
    const theme = this.getCurrent();
    if (theme && theme.colors) {
      const root = document.documentElement;
      // 先清除旧的内联样式变量
      Object.values(colorVarMap).forEach(cssVar => {
        root.style.removeProperty(cssVar);
      });
      // 设置新的
      Object.entries(theme.colors).forEach(([key, value]) => {
        const cssVar = colorVarMap[key];
        if (cssVar) {
          root.style.setProperty(cssVar, value);
        }
      });
      // 设置data-theme属性用于暗色主题判断
      const isDark = theme.category === 'dark' || theme.id.includes('dark') ||
                     theme.id.includes('night') || theme.id.includes('cyber') ||
                     theme.id.includes('hacker') || theme.id.includes('hud') ||
                     theme.id.includes('space') || theme.id.includes('gothic') ||
                     theme.id.includes('matrix');
      if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }

      // 保存到settings
      try {
        const settings = Storage.get('settings', {});
        settings.theme = themeId;
        Storage.set('settings', settings);
      } catch(e) {}
    }
    return result;
  };

  // 包装getCategories，返回对象格式 {id, name}
  const origGetCategories = ThemeManager.getCategories.bind(ThemeManager);
  ThemeManager.getCategories = function() {
    let cats = [];
    try {
      cats = origGetCategories() || [];
    } catch(e) { cats = []; }
    return cats.map(cat => {
      if (typeof cat === 'string') {
        return { id: cat, name: cat };
      }
      return cat;
    });
  };

  // 包装getByCategory，支持字符串分类名
  const origGetByCategory = ThemeManager.getByCategory.bind(ThemeManager);
  ThemeManager.getByCategory = function(catId) {
    let result = [];
    try {
      result = origGetByCategory(catId) || [];
    } catch(e) { result = []; }
    // 如果返回空，尝试所有主题中按category字段过滤
    if (!result || result.length === 0) {
      try {
        const all = this.getAll();
        result = all.filter(t => t.category === catId);
      } catch(e) { result = []; }
    }
    return result;
  };
})();

// ========== SoundManager 兼容层 ==========
(function patchSoundManager() {
  if (typeof SoundManager === 'undefined') return;

  // 确保playPageSwitch存在
  if (!SoundManager.playPageSwitch) {
    SoundManager.playPageSwitch = function() {
      if (SoundManager.playClick) SoundManager.playClick();
    };
  }
})();

console.log('[知一] API兼容层已加载');

})();
