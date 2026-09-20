/**
 * QuizEngine - 刷题核心引擎
 * 管理当前刷题会话的状态、答题判断逻辑、题目切换等
 */
(function (window) {
  'use strict';

  // ========== 工具函数 ==========

  /**
   * Fisher-Yates 洗牌算法
   */
  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  /**
   * 比较两个集合是否相等（字符串数组）
   */
  function setsEqual(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    const setA = new Set(a.map(String));
    const setB = new Set(b.map(String));
    if (setA.size !== setB.size) return false;
    for (const item of setA) {
      if (!setB.has(item)) return false;
    }
    return true;
  }

  // ========== 答题记录存储 ==========

  const STORAGE_KEY = 'quiz_answer_records';

  function loadRecords() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function saveRecords(records) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    } catch (e) {
      // ignore
    }
  }

  /**
   * 更新单题答题记录
   * record: { lastTime, correctStreak, totalCount, correctCount, mastery }
   */
  function updateRecord(questionId, isCorrect) {
    const records = loadRecords();
    const now = Date.now();
    const prev = records[questionId] || {
      lastTime: 0,
      correctStreak: 0,
      totalCount: 0,
      correctCount: 0,
      mastery: 0,
    };

    prev.totalCount += 1;
    prev.lastTime = now;
    if (isCorrect) {
      prev.correctCount += 1;
      prev.correctStreak += 1;
    } else {
      prev.correctStreak = 0;
    }

    // 掌握度计算：综合正确率和连续答对次数
    const accuracy = prev.totalCount > 0 ? prev.correctCount / prev.totalCount : 0;
    const streakBonus = Math.min(prev.correctStreak * 0.1, 0.3);
    prev.mastery = Math.min(1, accuracy * 0.7 + streakBonus);

    records[questionId] = prev;
    saveRecords(records);
    return prev;
  }

  function getRecord(questionId) {
    const records = loadRecords();
    return records[questionId] || null;
  }

  // ========== 遗忘曲线计算 ==========

  /**
   * 艾宾浩斯遗忘曲线 - 计算遗忘度
   * 遗忘度 = f(上次答题时间, 答对连续次数, 历史正确率)
   * 返回 0~1，值越高表示越需要复习
   */
  function calculateForgetting(questionId) {
    const record = getRecord(questionId);
    if (!record) {
      // 未答过的题，遗忘度最高
      return 1;
    }

    const now = Date.now();
    const daysSinceLast = (now - record.lastTime) / (1000 * 60 * 60 * 24);

    // 艾宾浩斯遗忘曲线公式简化版: R = e^(-t / S)
    // S 为记忆强度，由连续答对次数和正确率决定
    const accuracy = record.totalCount > 0 ? record.correctCount / record.totalCount : 0;
    const memoryStrength = 1 + record.correctStreak * 2 + accuracy * 3;

    // 遗忘度: 1 - 保留率
    const retention = Math.exp(-daysSinceLast / memoryStrength);
    const forgetting = 1 - retention;

    // 掌握度高的题遗忘度降低
    const masteryFactor = 1 - record.mastery * 0.5;

    return Math.max(0, Math.min(1, forgetting * masteryFactor));
  }

  // ========== QuizEngine 核心 ==========

  const QuizEngine = {
    // 会话状态
    _questions: [],
    _currentIndex: 0,
    _answers: [],       // 每题的答题记录: { selected, isCorrect, submitted }
    _options: {},
    _startTime: 0,
    _timer: null,
    _timeRemaining: 0,
    _onTimerTick: null,
    _onTimeUp: null,

    /**
     * 初始化刷题会话
     * @param {Array} questions - 题目列表
     * @param {Object} options - 配置选项
     *   - mode: 模式标识
     *   - shuffle: 是否打乱顺序
     *   - showAnswerImmediately: 是否答完立即显示答案
     *   - timeLimit: 每题限时（秒），0 表示不限时
     *   - onTimerTick: 倒计时回调
     *   - onTimeUp: 超时回调
     */
    init(questions, options) {
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('题目列表不能为空');
      }

      this._options = Object.assign({
        mode: 'sequential',
        shuffle: false,
        showAnswerImmediately: true,
        timeLimit: 0,
      }, options || {});

      this._questions = this._options.shuffle
        ? shuffleArray(questions)
        : questions.slice();

      this._currentIndex = 0;
      this._answers = this._questions.map(() => ({
        selected: [],
        isCorrect: false,
        submitted: false,
      }));
      this._startTime = Date.now();
      this._onTimerTick = this._options.onTimerTick || null;
      this._onTimeUp = this._options.onTimeUp || null;

      this._stopTimer();
      if (this._options.timeLimit > 0) {
        this._startTimer();
      }

      return this;
    },

    /**
     * 获取当前题目
     */
    getCurrentQuestion() {
      if (this._questions.length === 0) return null;
      return this._questions[this._currentIndex];
    },

    /**
     * 获取当前题目索引（0-based）
     */
    getCurrentIndex() {
      return this._currentIndex;
    },

    /**
     * 提交答案
     * @param {string|Array} selectedOptions - 选中的选项（单选传字符串，多选传数组）
     * @returns {Object} { isCorrect, correctAnswer, question }
     */
    submitAnswer(selectedOptions) {
      const question = this.getCurrentQuestion();
      if (!question) return { isCorrect: false, correctAnswer: null };

      // 规范化选中项为数组
      const selected = Array.isArray(selectedOptions)
        ? selectedOptions.map(String)
        : [String(selectedOptions)];

      const isCorrect = this._checkAnswer(question, selected);

      this._answers[this._currentIndex] = {
        selected: selected,
        isCorrect: isCorrect,
        submitted: true,
      };

      // 更新答题记录（用于遗忘曲线）
      updateRecord(question.id, isCorrect);

      // 停止当前题的计时器
      this._stopTimer();

      return {
        isCorrect: isCorrect,
        correctAnswer: this._getCorrectAnswer(question),
        question: question,
      };
    },

    /**
     * 检查答案是否正确
     */
    _checkAnswer(question, selected) {
      const type = question.type;
      const answer = question.answer;

      if (type === '判断') {
        // 判断题：答案是"正确"或"错误"
        // 选项A=正确，选项B=错误
        const userAnswer = selected[0] === 'A' ? '正确' : selected[0] === 'B' ? '错误' : selected[0];
        return userAnswer === answer;
      }

      if (type === '单选') {
        if (selected.length !== 1) return false;
        return selected[0] === answer;
      }

      if (type === '多选') {
        // 正确答案可能是 "ABC" 形式的字符串
        const correctArr = typeof answer === 'string'
          ? answer.split('')
          : Array.isArray(answer) ? answer : [answer];
        return setsEqual(selected, correctArr);
      }

      return false;
    },

    /**
     * 获取正确答案的标准化形式
     */
    _getCorrectAnswer(question) {
      const type = question.type;
      const answer = question.answer;

      if (type === '判断') {
        return answer === '正确' ? ['A'] : ['B'];
      }

      if (type === '单选') {
        return [answer];
      }

      if (type === '多选') {
        return typeof answer === 'string' ? answer.split('') : answer;
      }

      return [answer];
    },

    /**
     * 下一题
     */
    next() {
      if (this._currentIndex < this._questions.length - 1) {
        this._currentIndex++;
        this._restartTimer();
        return true;
      }
      return false;
    },

    /**
     * 上一题
     */
    prev() {
      if (this._currentIndex > 0) {
        this._currentIndex--;
        this._restartTimer();
        return true;
      }
      return false;
    },

    /**
     * 跳转到指定题（0-based 索引）
     */
    jumpTo(index) {
      if (index >= 0 && index < this._questions.length) {
        this._currentIndex = index;
        this._restartTimer();
        return true;
      }
      return false;
    },

    /**
     * 是否是最后一题
     */
    isLast() {
      return this._currentIndex >= this._questions.length - 1;
    },

    /**
     * 是否是第一题
     */
    isFirst() {
      return this._currentIndex <= 0;
    },

    /**
     * 获取进度信息
     */
    getProgress() {
      const total = this._questions.length;
      const current = this._currentIndex + 1;
      const answered = this._answers.filter(a => a.submitted).length;
      const correct = this._answers.filter(a => a.submitted && a.isCorrect).length;
      const wrong = answered - correct;

      return {
        total: total,
        current: current,
        currentIndex: this._currentIndex,
        answered: answered,
        correct: correct,
        wrong: wrong,
        unanswered: total - answered,
        percent: total > 0 ? Math.round((current / total) * 100) : 0,
        accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
      };
    },

    /**
     * 获取答题卡数据
     * 每题状态：'unanswered' | 'correct' | 'wrong' | 'current'
     */
    getAnswerSheet() {
      return this._questions.map((q, idx) => {
        const ans = this._answers[idx];
        let status = 'unanswered';
        if (idx === this._currentIndex) {
          status = 'current';
        } else if (ans.submitted) {
          status = ans.isCorrect ? 'correct' : 'wrong';
        }
        return {
          index: idx,
          number: idx + 1,
          id: q.id,
          type: q.type,
          status: status,
        };
      });
    },

    /**
     * 获取会话结果统计
     */
    getResults() {
      const total = this._questions.length;
      const answered = this._answers.filter(a => a.submitted).length;
      const correct = this._answers.filter(a => a.submitted && a.isCorrect).length;
      const wrong = answered - correct;
      const elapsed = Math.round((Date.now() - this._startTime) / 1000);

      // 按题型统计
      const byType = {};
      this._questions.forEach((q, idx) => {
        const type = q.type;
        if (!byType[type]) {
          byType[type] = { total: 0, correct: 0, wrong: 0, unanswered: 0 };
        }
        byType[type].total++;
        const ans = this._answers[idx];
        if (ans.submitted) {
          if (ans.isCorrect) byType[type].correct++;
          else byType[type].wrong++;
        } else {
          byType[type].unanswered++;
        }
      });

      return {
        total: total,
        answered: answered,
        correct: correct,
        wrong: wrong,
        unanswered: total - answered,
        accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0,
        elapsed: elapsed,
        byType: byType,
        details: this._answers.map((ans, idx) => ({
          question: this._questions[idx],
          selected: ans.selected,
          isCorrect: ans.isCorrect,
          submitted: ans.submitted,
        })),
      };
    },

    /**
     * 获取当前题的答题状态
     */
    getCurrentAnswerState() {
      return this._answers[this._currentIndex] || {
        selected: [],
        isCorrect: false,
        submitted: false,
      };
    },

    /**
     * 获取题目总数
     */
    getTotalCount() {
      return this._questions.length;
    },

    /**
     * 重置当前题的答案（用于重新作答）
     */
    resetCurrentAnswer() {
      this._answers[this._currentIndex] = {
        selected: [],
        isCorrect: false,
        submitted: false,
      };
      this._restartTimer();
    },

    // ========== 计时器 ==========

    _startTimer() {
      if (this._options.timeLimit <= 0) return;
      this._timeRemaining = this._options.timeLimit;
      this._stopTimer();
      this._timer = setInterval(() => {
        this._timeRemaining--;
        if (this._onTimerTick) {
          this._onTimerTick(this._timeRemaining);
        }
        if (this._timeRemaining <= 0) {
          this._stopTimer();
          if (this._onTimeUp) {
            this._onTimeUp();
          }
        }
      }, 1000);
    },

    _stopTimer() {
      if (this._timer) {
        clearInterval(this._timer);
        this._timer = null;
      }
    },

    _restartTimer() {
      this._stopTimer();
      if (this._options.timeLimit > 0 && !this._answers[this._currentIndex].submitted) {
        this._startTimer();
      }
    },

    getTimeRemaining() {
      return this._timeRemaining;
    },

    // ========== 暴露存储相关方法 ==========

    storage: {
      getRecord: getRecord,
      updateRecord: updateRecord,
      calculateForgetting: calculateForgetting,
      loadRecords: loadRecords,
      saveRecords: saveRecords,
      STORAGE_KEY: STORAGE_KEY,
    },
  };

  // 暴露到全局
  window.QuizEngine = QuizEngine;

})(window);
