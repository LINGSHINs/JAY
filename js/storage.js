/**
 * storage.js - 本地存储管理模块
 * 封装localStorage操作，管理用户设置、答题记录、错题集、学习统计、遗忘曲线数据
 */

const Storage = (function () {
  'use strict';

  // ========== 存储键名常量 ==========
  const KEYS = {
    SETTINGS: 'zhiyi_settings',
    QUESTION_STATS: 'zhiyi_question_stats',
    MISTAKES: 'zhiyi_mistakes',
    OVERALL_STATS: 'zhiyi_overall_stats',
    FORGETTING_DATA: 'zhiyi_forgetting_data',
    DEPT_PROGRESS: 'zhiyi_dept_progress'
  };

  // ========== 默认设置 ==========
  const DEFAULT_SETTINGS = {
    theme: 'minimal-white',
    font: 'system',
    soundEnabled: true,
    soundVolume: 0.5,
    bgCustom: null,
    dailyGoal: 30,
    shuffleMode: false,
    autoNext: true
  };

  // 艾宾浩斯遗忘曲线复习间隔（单位：分钟）
  const FORGETTING_INTERVALS = [
    5,        // 5分钟
    30,       // 30分钟
    720,      // 12小时
    1440,     // 1天
    2880,     // 2天
    5760,     // 4天
    10080,    // 7天
    21600     // 15天
  ];

  // ========== 基础工具方法 ==========

  /**
   * 安全获取localStorage数据
   * @param {string} key - 存储键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 解析后的数据
   */
  function get(key, defaultValue) {
    try {
      const value = localStorage.getItem(key);
      if (value === null || value === undefined) {
        return defaultValue;
      }
      return JSON.parse(value);
    } catch (e) {
      console.warn('Storage.get 解析失败:', key, e);
      return defaultValue;
    }
  }

  /**
   * 安全设置localStorage数据
   * @param {string} key - 存储键名
   * @param {*} value - 要存储的值
   * @returns {boolean} 是否成功
   */
  function set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn('Storage.set 存储失败:', key, e);
      return false;
    }
  }

  /**
   * 删除指定键
   * @param {string} key - 存储键名
   */
  function remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('Storage.remove 失败:', key, e);
    }
  }

  /**
   * 清空所有智益相关数据
   */
  function clearAll() {
    Object.values(KEYS).forEach(key => remove(key));
  }

  // ========== 用户设置 ==========

  /**
   * 获取用户设置
   * @returns {object} 设置对象
   */
  function getSettings() {
    return get(KEYS.SETTINGS, { ...DEFAULT_SETTINGS });
  }

  /**
   * 保存用户设置
   * @param {object} settings - 设置对象（合并更新）
   */
  function saveSettings(settings) {
    const current = getSettings();
    const merged = { ...current, ...settings };
    set(KEYS.SETTINGS, merged);
    return merged;
  }

  // ========== 答题记录 ==========

  /**
   * 获取所有题目答题统计
   * @returns {object} 题目统计对象 { questionId: stats }
   */
  function getAllQuestionStats() {
    return get(KEYS.QUESTION_STATS, {});
  }

  /**
   * 获取单道题的答题统计
   * @param {number|string} id - 题目ID
   * @returns {object} 统计对象 { correctCount, wrongCount, lastAnswerTime, mastery }
   */
  function getQuestionStats(id) {
    const allStats = getAllQuestionStats();
    const key = String(id);
    return allStats[key] || {
      correctCount: 0,
      wrongCount: 0,
      lastAnswerTime: null,
      mastery: 0
    };
  }

  /**
   * 更新题目答题统计
   * @param {number|string} id - 题目ID
   * @param {boolean} isCorrect - 是否答对
   * @returns {object} 更新后的统计对象
   */
  function updateQuestionStats(id, isCorrect) {
    const allStats = getAllQuestionStats();
    const key = String(id);
    const current = allStats[key] || {
      correctCount: 0,
      wrongCount: 0,
      lastAnswerTime: null,
      mastery: 0
    };

    const now = Date.now();
    current.lastAnswerTime = now;

    if (isCorrect) {
      current.correctCount++;
    } else {
      current.wrongCount++;
    }

    // 重新计算掌握度
    current.mastery = calculateMasteryFromStats(current);

    allStats[key] = current;
    set(KEYS.QUESTION_STATS, allStats);

    // 更新总体统计
    updateOverallStats(isCorrect);

    // 更新遗忘曲线数据
    updateForgettingData(id, isCorrect);

    return current;
  }

  // ========== 错题集 ==========

  /**
   * 获取错题列表
   * @returns {Array} 错题ID数组
   */
  function getMistakes() {
    return get(KEYS.MISTAKES, []);
  }

  /**
   * 添加错题
   * @param {number|string} questionId - 题目ID
   * @returns {boolean} 是否添加成功
   */
  function addMistake(questionId) {
    const mistakes = getMistakes();
    const id = String(questionId);
    if (!mistakes.includes(id)) {
      mistakes.push(id);
      set(KEYS.MISTAKES, mistakes);
      return true;
    }
    return false;
  }

  /**
   * 移除错题
   * @param {number|string} questionId - 题目ID
   * @returns {boolean} 是否移除成功
   */
  function removeMistake(questionId) {
    const mistakes = getMistakes();
    const id = String(questionId);
    const index = mistakes.indexOf(id);
    if (index > -1) {
      mistakes.splice(index, 1);
      set(KEYS.MISTAKES, mistakes);
      return true;
    }
    return false;
  }

  /**
   * 检查题目是否在错题集中
   * @param {number|string} questionId - 题目ID
   * @returns {boolean}
   */
  function isMistake(questionId) {
    const mistakes = getMistakes();
    return mistakes.includes(String(questionId));
  }

  /**
   * 清空错题集
   */
  function clearMistakes() {
    set(KEYS.MISTAKES, []);
  }

  // ========== 掌握度计算 ==========

  /**
   * 计算题目掌握度 (0-100)
   * 基于正确次数、总次数、最近答题表现综合计算
   * @param {number|string} questionId - 题目ID
   * @returns {number} 掌握度 0-100
   */
  function calculateMastery(questionId) {
    const stats = getQuestionStats(questionId);
    return calculateMasteryFromStats(stats);
  }

  /**
   * 从统计数据计算掌握度
   * @param {object} stats - 统计对象
   * @returns {number} 掌握度 0-100
   */
  function calculateMasteryFromStats(stats) {
    const { correctCount, wrongCount, lastAnswerTime } = stats;
    const total = correctCount + wrongCount;

    if (total === 0) return 0;

    // 基础正确率得分
    const accuracy = correctCount / total;
    let baseScore = accuracy * 70;

    // 练习次数加成（最多30分）
    const practiceBonus = Math.min(total * 3, 30);
    baseScore += practiceBonus;

    // 连续正确加成（通过最近答题时间和正确率推断）
    // 如果最近一次答题时间较近且正确率高，有额外加成
    if (lastAnswerTime) {
      const daysSinceLast = (Date.now() - lastAnswerTime) / (1000 * 60 * 60 * 24);
      // 最近7天内答过题且正确率高，加5分
      if (daysSinceLast <= 7 && accuracy >= 0.8) {
        baseScore = Math.min(baseScore + 5, 100);
      }
    }

    return Math.round(Math.min(baseScore, 100));
  }

  // ========== 遗忘曲线 ==========

  /**
   * 获取所有遗忘曲线数据
   * @returns {object} { questionId: { stage, lastReviewTime, nextReviewTime } }
   */
  function getAllForgettingData() {
    return get(KEYS.FORGETTING_DATA, {});
  }

  /**
   * 获取单道题的遗忘曲线数据
   * @param {number|string} questionId - 题目ID
   * @returns {object}
   */
  function getForgettingData(questionId) {
    const allData = getAllForgettingData();
    const key = String(questionId);
    return allData[key] || {
      stage: 0,
      lastReviewTime: null,
      nextReviewTime: null
    };
  }

  /**
   * 更新遗忘曲线数据
   * @param {number|string} questionId - 题目ID
   * @param {boolean} isCorrect - 是否答对
   */
  function updateForgettingData(questionId, isCorrect) {
    const allData = getAllForgettingData();
    const key = String(questionId);
    const current = allData[key] || {
      stage: 0,
      lastReviewTime: null,
      nextReviewTime: null
    };

    const now = Date.now();
    current.lastReviewTime = now;

    if (isCorrect) {
      // 答对，进入下一阶段
      current.stage = Math.min(current.stage + 1, FORGETTING_INTERVALS.length - 1);
    } else {
      // 答错，退回第0阶段重新开始
      current.stage = 0;
    }

    // 计算下次复习时间
    const intervalMinutes = FORGETTING_INTERVALS[current.stage];
    current.nextReviewTime = now + intervalMinutes * 60 * 1000;

    allData[key] = current;
    set(KEYS.FORGETTING_DATA, allData);
  }

  /**
   * 获取需要复习的题目队列
   * @param {number} limit - 最大返回数量
   * @returns {Array} 需要复习的题目ID数组，按紧急程度排序
   */
  function getForgettingQueue(limit = 50) {
    const allData = getAllForgettingData();
    const now = Date.now();
    const queue = [];

    for (const [questionId, data] of Object.entries(allData)) {
      if (data.nextReviewTime && data.nextReviewTime <= now) {
        queue.push({
          questionId,
          nextReviewTime: data.nextReviewTime,
          stage: data.stage
        });
      }
    }

    // 按下次复习时间排序（越早越紧急）
    queue.sort((a, b) => a.nextReviewTime - b.nextReviewTime);

    return queue.slice(0, limit).map(item => item.questionId);
  }

  /**
   * 重置某道题的遗忘曲线
   * @param {number|string} questionId - 题目ID
   */
  function resetForgettingData(questionId) {
    const allData = getAllForgettingData();
    const key = String(questionId);
    delete allData[key];
    set(KEYS.FORGETTING_DATA, allData);
  }

  // ========== 总体统计 ==========

  /**
   * 获取总体统计数据
   * @returns {object}
   */
  function getOverallStats() {
    return get(KEYS.OVERALL_STATS, {
      totalAnswered: 0,
      totalCorrect: 0,
      totalWrong: 0,
      streakDays: 0,
      lastStudyDate: null,
      todayAnswered: 0,
      todayCorrect: 0,
      studyDays: 0
    });
  }

  /**
   * 更新总体统计
   * @param {boolean} isCorrect - 是否答对
   */
  function updateOverallStats(isCorrect) {
    const stats = getOverallStats();
    const now = new Date();
    const todayStr = now.toDateString();

    stats.totalAnswered++;

    if (isCorrect) {
      stats.totalCorrect++;
    } else {
      stats.totalWrong++;
    }

    // 更新今日数据
    if (stats.lastStudyDate !== todayStr) {
      // 新的一天
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toDateString();

      if (stats.lastStudyDate === yesterdayStr) {
        // 连续学习
        stats.streakDays++;
      } else if (stats.lastStudyDate === null) {
        // 第一次学习
        stats.streakDays = 1;
        stats.studyDays = 1;
      } else {
        // 断签了
        stats.streakDays = 1;
        stats.studyDays++;
      }

      stats.lastStudyDate = todayStr;
      stats.todayAnswered = 1;
      stats.todayCorrect = isCorrect ? 1 : 0;
    } else {
      // 同一天
      stats.todayAnswered++;
      if (isCorrect) {
        stats.todayCorrect++;
      }
    }

    set(KEYS.OVERALL_STATS, stats);
    return stats;
  }

  // ========== 部门进度 ==========

  /**
   * 获取各部门进度
   * @returns {object} { deptName: { total, answered, correct } }
   */
  function getDeptProgress() {
    return get(KEYS.DEPT_PROGRESS, {});
  }

  /**
   * 更新部门进度
   * @param {string} dept - 部门名称
   * @param {boolean} isCorrect - 是否答对
   * @param {number} totalQuestions - 该部门总题数（可选，用于初始化）
   */
  function updateDeptProgress(dept, isCorrect, totalQuestions = null) {
    const deptProgress = getDeptProgress();
    const current = deptProgress[dept] || {
      total: totalQuestions || 0,
      answered: 0,
      correct: 0
    };

    if (totalQuestions !== null) {
      current.total = totalQuestions;
    }

    current.answered++;
    if (isCorrect) {
      current.correct++;
    }

    deptProgress[dept] = current;
    set(KEYS.DEPT_PROGRESS, deptProgress);
    return current;
  }

  /**
   * 初始化部门进度（从题目数据中统计各部门题数）
   * @param {Array} questions - 题目数组
   */
  function initDeptProgress(questions) {
    const deptProgress = getDeptProgress();
    const deptCounts = {};

    // 统计各部门总题数
    questions.forEach(q => {
      if (!deptCounts[q.dept]) {
        deptCounts[q.dept] = 0;
      }
      deptCounts[q.dept]++;
    });

    // 更新各部门总题数（保留已有的答题数据）
    for (const [dept, count] of Object.entries(deptCounts)) {
      if (!deptProgress[dept]) {
        deptProgress[dept] = {
          total: count,
          answered: 0,
          correct: 0
        };
      } else {
        deptProgress[dept].total = count;
      }
    }

    set(KEYS.DEPT_PROGRESS, deptProgress);
    return deptProgress;
  }

  // ========== 数据导出/导入 ==========

  /**
   * 导出所有数据
   * @returns {object} 完整数据对象
   */
  function exportData() {
    return {
      settings: getSettings(),
      questionStats: getAllQuestionStats(),
      mistakes: getMistakes(),
      overallStats: getOverallStats(),
      forgettingData: getAllForgettingData(),
      deptProgress: getDeptProgress(),
      exportTime: new Date().toISOString()
    };
  }

  /**
   * 导入数据
   * @param {object} data - 数据对象
   * @param {boolean} merge - 是否合并（true合并，false覆盖）
   * @returns {boolean} 是否成功
   */
  function importData(data, merge = false) {
    try {
      if (merge) {
        // 合并模式：简单合并顶层数据
        if (data.settings) {
          const current = getSettings();
          set(KEYS.SETTINGS, { ...current, ...data.settings });
        }
        if (data.questionStats) {
          const current = getAllQuestionStats();
          set(KEYS.QUESTION_STATS, { ...current, ...data.questionStats });
        }
        if (data.mistakes) {
          const current = getMistakes();
          const merged = [...new Set([...current, ...data.mistakes])];
          set(KEYS.MISTAKES, merged);
        }
        if (data.overallStats) {
          const current = getOverallStats();
          set(KEYS.OVERALL_STATS, { ...current, ...data.overallStats });
        }
        if (data.forgettingData) {
          const current = getAllForgettingData();
          set(KEYS.FORGETTING_DATA, { ...current, ...data.forgettingData });
        }
        if (data.deptProgress) {
          const current = getDeptProgress();
          set(KEYS.DEPT_PROGRESS, { ...current, ...data.deptProgress });
        }
      } else {
        // 覆盖模式
        if (data.settings) set(KEYS.SETTINGS, data.settings);
        if (data.questionStats) set(KEYS.QUESTION_STATS, data.questionStats);
        if (data.mistakes) set(KEYS.MISTAKES, data.mistakes);
        if (data.overallStats) set(KEYS.OVERALL_STATS, data.overallStats);
        if (data.forgettingData) set(KEYS.FORGETTING_DATA, data.forgettingData);
        if (data.deptProgress) set(KEYS.DEPT_PROGRESS, data.deptProgress);
      }
      return true;
    } catch (e) {
      console.error('导入数据失败:', e);
      return false;
    }
  }

  // ========== 公开API ==========
  return {
    // 基础方法
    get,
    set,
    remove,
    clearAll,

    // 设置
    getSettings,
    saveSettings,

    // 答题记录
    getQuestionStats,
    updateQuestionStats,
    getAllQuestionStats,

    // 错题集
    getMistakes,
    addMistake,
    removeMistake,
    isMistake,
    clearMistakes,

    // 掌握度
    calculateMastery,

    // 遗忘曲线
    getForgettingQueue,
    getForgettingData,
    updateForgettingData,
    resetForgettingData,
    FORGETTING_INTERVALS,

    // 总体统计
    getOverallStats,
    updateOverallStats,

    // 部门进度
    getDeptProgress,
    updateDeptProgress,
    initDeptProgress,

    // 数据导出导入
    exportData,
    importData,

    // 常量
    KEYS,
    DEFAULT_SETTINGS
  };
})();

// 支持ES模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Storage;
}
