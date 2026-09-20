/**
 * Modes - 刷题模式模块
 * 实现多种刷题模式，每种模式有配置界面和题目生成逻辑
 */
(function (window) {
  'use strict';

  // ========== 工具函数 ==========

  function shuffleArray(array) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function getAllQuestions() {
    return window.QUESTION_BANK || [];
  }

  function getDepts() {
    const questions = getAllQuestions();
    const deptSet = new Set();
    questions.forEach(q => deptSet.add(q.dept));
    return Array.from(deptSet);
  }

  function getTypes() {
    const questions = getAllQuestions();
    const typeSet = new Set();
    questions.forEach(q => typeSet.add(q.type));
    return Array.from(typeSet);
  }

  function getQuestionsByDept(depts) {
    const questions = getAllQuestions();
    if (!depts || depts.length === 0) return questions.slice();
    const deptSet = new Set(depts);
    return questions.filter(q => deptSet.has(q.dept));
  }

  function getQuestionsByType(type) {
    const questions = getAllQuestions();
    return questions.filter(q => q.type === type);
  }

  // ========== 模式定义 ==========

  const modeDefinitions = {

    // ---- 1. 顺序刷题 ----
    sequential: {
      id: 'sequential',
      name: '顺序刷题',
      icon: '📋',
      description: '按题号顺序依次刷题，适合系统学习',

      getConfigUI() {
        const total = getAllQuestions().length;
        return `
          <div class="mode-config">
            <div class="config-item">
              <label>起始题号</label>
              <input type="number" id="cfg-start" value="1" min="1" max="${total}" class="config-input">
              <span class="config-hint">共 ${total} 题</span>
            </div>
            <div class="config-item">
              <label>题目数量</label>
              <input type="number" id="cfg-count" value="${total}" min="1" max="${total}" class="config-input">
              <span class="config-hint">0 表示全部</span>
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const questions = getAllQuestions();
        const start = Math.max(1, parseInt(config.start) || 1);
        let count = parseInt(config.count) || 0;
        const startIdx = start - 1;
        if (count <= 0 || count > questions.length - startIdx) {
          count = questions.length - startIdx;
        }
        return questions.slice(startIdx, startIdx + count);
      },

      getSessionOptions(config) {
        return {
          mode: 'sequential',
          shuffle: false,
          showAnswerImmediately: true,
          timeLimit: 0,
        };
      },
    },

    // ---- 2. 乱序刷题 ----
    shuffle: {
      id: 'shuffle',
      name: '乱序刷题',
      icon: '🔀',
      description: '打乱题目顺序，随机练习',

      getConfigUI() {
        const total = getAllQuestions().length;
        return `
          <div class="mode-config">
            <div class="config-item">
              <label>题目数量</label>
              <input type="number" id="cfg-count" value="${total}" min="1" max="${total}" class="config-input">
              <span class="config-hint">0 表示全部</span>
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const questions = getAllQuestions();
        let count = parseInt(config.count) || 0;
        const shuffled = shuffleArray(questions);
        if (count <= 0 || count >= shuffled.length) {
          return shuffled;
        }
        return shuffled.slice(0, count);
      },

      getSessionOptions(config) {
        return {
          mode: 'shuffle',
          shuffle: false, // 已经在 generateQuestions 中打乱了
          showAnswerImmediately: true,
          timeLimit: 0,
        };
      },
    },

    // ---- 3. 按部门刷题 ----
    byDept: {
      id: 'byDept',
      name: '按部门刷题',
      icon: '🏢',
      description: '选择一个或多个部门，从这些部门选题练习',

      getConfigUI() {
        const depts = getDepts();
        const questions = getAllQuestions();
        const deptOptions = depts.map(dept => {
          const count = questions.filter(q => q.dept === dept).length;
          return `
            <label class="dept-checkbox">
              <input type="checkbox" name="dept" value="${dept}" data-count="${count}">
              <span>${dept}</span>
              <span class="dept-count">${count}题</span>
            </label>
          `;
        }).join('');

        return `
          <div class="mode-config">
            <div class="config-item">
              <label>选择部门（可多选）</label>
              <div class="dept-list">
                ${deptOptions}
              </div>
              <div class="config-actions">
                <button type="button" class="btn-select-all" data-target="dept">全选</button>
                <button type="button" class="btn-select-none" data-target="dept">全不选</button>
              </div>
            </div>
            <div class="config-item">
              <label>题目数量</label>
              <input type="number" id="cfg-count" value="0" min="0" class="config-input">
              <span class="config-hint">0 表示所选部门全部题目</span>
            </div>
            <div class="config-item">
              <label>
                <input type="checkbox" id="cfg-shuffle"> 乱序出题
              </label>
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const depts = config.depts || [];
        let questions = getQuestionsByDept(depts);
        let count = parseInt(config.count) || 0;

        if (config.shuffle) {
          questions = shuffleArray(questions);
        }

        if (count > 0 && count < questions.length) {
          return questions.slice(0, count);
        }
        return questions;
      },

      getSessionOptions(config) {
        return {
          mode: 'byDept',
          shuffle: false,
          showAnswerImmediately: true,
          timeLimit: 0,
        };
      },
    },

    // ---- 4. 组卷刷题 ----
    exam: {
      id: 'exam',
      name: '组卷刷题',
      icon: '📝',
      description: '从各题型按比例抽题组成模拟试卷',

      getConfigUI() {
        const types = getTypes();
        const questions = getAllQuestions();
        const total = questions.length;

        const typeRows = types.map(type => {
          const count = questions.filter(q => q.type === type).length;
          return `
            <div class="type-row">
              <span class="type-name">${type}题</span>
              <span class="type-total">共 ${count} 题</span>
              <input type="number" class="type-count" data-type="${type}" value="0" min="0" max="${count}">
              <span class="config-hint">道</span>
            </div>
          `;
        }).join('');

        return `
          <div class="mode-config">
            <div class="config-item">
              <label>各题型题量设置</label>
              <div class="type-list">
                ${typeRows}
              </div>
            </div>
            <div class="config-item">
              <label>
                <input type="checkbox" id="cfg-shuffle"> 打乱题目顺序
              </label>
            </div>
            <div class="config-summary">
              已选 <span id="exam-total">0</span> / ${total} 题
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const typeConfig = config.types || {};
        let result = [];

        for (const type in typeConfig) {
          const count = parseInt(typeConfig[type]) || 0;
          if (count <= 0) continue;

          const typeQuestions = getQuestionsByType(type);
          const shuffled = shuffleArray(typeQuestions);
          const selected = shuffled.slice(0, count);
          result = result.concat(selected);
        }

        if (config.shuffle) {
          result = shuffleArray(result);
        }

        return result;
      },

      getSessionOptions(config) {
        return {
          mode: 'exam',
          shuffle: false,
          showAnswerImmediately: false, // 组卷模式不立即显示答案
          timeLimit: 0,
        };
      },
    },

    // ---- 5. 遗忘曲线刷题 ----
    forgetting: {
      id: 'forgetting',
      name: '遗忘曲线刷题',
      icon: '📉',
      description: '基于艾宾浩斯遗忘曲线，优先复习快要遗忘的题目',

      getConfigUI() {
        const total = getAllQuestions().length;
        return `
          <div class="mode-config">
            <div class="config-item">
              <label>复习题数</label>
              <input type="number" id="cfg-count" value="50" min="1" max="${total}" class="config-input">
              <span class="config-hint">道</span>
            </div>
            <div class="config-item">
              <label>
                <input type="checkbox" id="cfg-include-new" checked>
                包含未做过的新题
              </label>
            </div>
            <div class="config-desc">
              系统会根据你的答题记录，计算每道题的遗忘程度，优先安排遗忘度高的题目复习。
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const questions = getAllQuestions();
        const count = parseInt(config.count) || 50;
        const includeNew = config.includeNew !== false;

        // 计算每题的遗忘度
        const questionsWithScore = questions.map(q => {
          const record = QuizEngine.storage.getRecord(q.id);
          let forgetting = 1; // 未答过的默认遗忘度最高

          if (record) {
            forgetting = QuizEngine.storage.calculateForgetting(q.id);
          } else if (!includeNew) {
            forgetting = -1; // 排除新题
          }

          return { question: q, forgetting: forgetting };
        });

        // 过滤掉排除的题，按遗忘度降序排列
        const filtered = questionsWithScore
          .filter(item => item.forgetting >= 0)
          .sort((a, b) => b.forgetting - a.forgetting);

        return filtered.slice(0, count).map(item => item.question);
      },

      getSessionOptions(config) {
        return {
          mode: 'forgetting',
          shuffle: false,
          showAnswerImmediately: true,
          timeLimit: 0,
        };
      },
    },

    // ---- 6. 选题模式 ----
    picker: {
      id: 'picker',
      name: '选题模式',
      icon: '🎯',
      description: '显示答题卡，可自由选择题号跳转练习',

      getConfigUI() {
        const depts = getDepts();
        const questions = getAllQuestions();
        const deptOptions = depts.map(dept => {
          const count = questions.filter(q => q.dept === dept).length;
          return `
            <label class="dept-checkbox">
              <input type="checkbox" name="picker-dept" value="${dept}" data-count="${count}" checked>
              <span>${dept}</span>
              <span class="dept-count">${count}题</span>
            </label>
          `;
        }).join('');

        return `
          <div class="mode-config">
            <div class="config-item">
              <label>选择部门范围</label>
              <div class="dept-list">
                ${deptOptions}
              </div>
            </div>
            <div class="config-desc">
              进入后显示答题卡，可点击任意题号直接跳转。
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const depts = config.depts || getDepts();
        return getQuestionsByDept(depts);
      },

      getSessionOptions(config) {
        return {
          mode: 'picker',
          shuffle: false,
          showAnswerImmediately: true,
          timeLimit: 0,
        };
      },
    },

    // ---- 7. 循环刷题 ----
    loop: {
      id: 'loop',
      name: '循环刷题',
      icon: '🔄',
      description: '循环刷题，错题按遗忘曲线再次出现，直到完全掌握',

      getConfigUI() {
        const depts = getDepts();
        const questions = getAllQuestions();

        const deptOptions = depts.map(dept => {
          const count = questions.filter(q => q.dept === dept).length;
          return `
            <label class="dept-checkbox">
              <input type="checkbox" name="loop-dept" value="${dept}" data-count="${count}">
              <span>${dept}</span>
              <span class="dept-count">${count}题</span>
            </label>
          `;
        }).join('');

        return `
          <div class="mode-config">
            <div class="config-item">
              <label>选择部门（可多选）</label>
              <div class="dept-list">
                ${deptOptions}
              </div>
            </div>
            <div class="config-item">
              <label>题号范围</label>
              <div class="range-inputs">
                <input type="number" id="cfg-range-start" value="1" min="1" class="config-input small">
                <span> - </span>
                <input type="number" id="cfg-range-end" value="100" min="1" class="config-input small">
              </div>
              <span class="config-hint">在所选部门内的题号范围</span>
            </div>
            <div class="config-item">
              <label>每轮题数</label>
              <input type="number" id="cfg-loop-count" value="20" min="5" max="200" class="config-input">
              <span class="config-hint">道</span>
            </div>
            <div class="config-item">
              <label>掌握度阈值</label>
              <input type="number" id="cfg-mastery" value="90" min="50" max="100" class="config-input">
              <span class="config-hint">%（达到后从循环中移除）</span>
            </div>
            <div class="config-desc">
              错题会按遗忘曲线间隔重新加入队列，掌握度达到阈值后自动移出循环。
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const depts = config.depts || [];
        let questions = getQuestionsByDept(depts);

        // 题号范围（在筛选后的列表中按索引取范围）
        const rangeStart = Math.max(1, parseInt(config.rangeStart) || 1);
        const rangeEnd = parseInt(config.rangeEnd) || questions.length;
        const startIdx = rangeStart - 1;
        const endIdx = Math.min(rangeEnd, questions.length);

        if (startIdx > 0 || endIdx < questions.length) {
          questions = questions.slice(startIdx, endIdx);
        }

        // 排除已掌握的题目
        const masteryThreshold = (parseInt(config.mastery) || 90) / 100;
        const remaining = questions.filter(q => {
          const record = QuizEngine.storage.getRecord(q.id);
          if (!record) return true;
          return record.mastery < masteryThreshold;
        });

        // 每轮题数
        const loopCount = parseInt(config.loopCount) || 20;

        // 按遗忘度排序，优先安排遗忘度高的
        const withScore = remaining.map(q => ({
          question: q,
          forgetting: QuizEngine.storage.calculateForgetting(q.id),
        }));

        withScore.sort((a, b) => b.forgetting - a.forgetting);

        // 取前 loopCount 道
        const result = withScore.slice(0, loopCount).map(item => item.question);

        // 打乱顺序做题
        return shuffleArray(result);
      },

      getSessionOptions(config) {
        return {
          mode: 'loop',
          shuffle: false,
          showAnswerImmediately: true,
          timeLimit: 0,
          loopConfig: {
            depts: config.depts || [],
            rangeStart: config.rangeStart,
            rangeEnd: config.rangeEnd,
            loopCount: config.loopCount,
            mastery: config.mastery,
          },
        };
      },
    },

    // ---- 8. 背题模式 ----
    memorize: {
      id: 'memorize',
      name: '背题模式',
      icon: '🧠',
      description: '显示题目和答案，用于背诵记忆，可标记掌握状态',

      getConfigUI() {
        const depts = getDepts();
        const questions = getAllQuestions();

        const deptOptions = depts.map(dept => {
          const count = questions.filter(q => q.dept === dept).length;
          return `
            <label class="dept-checkbox">
              <input type="checkbox" name="mem-dept" value="${dept}" data-count="${count}">
              <span>${dept}</span>
              <span class="dept-count">${count}题</span>
            </label>
          `;
        }).join('');

        return `
          <div class="mode-config">
            <div class="config-item">
              <label>选择部门（可多选）</label>
              <div class="dept-list">
                ${deptOptions}
              </div>
            </div>
            <div class="config-item">
              <label>
                <input type="checkbox" id="cfg-mem-shuffle"> 乱序背题
              </label>
            </div>
            <div class="config-item">
              <label>
                <input type="checkbox" id="cfg-mem-only-unmastered">
                只背未掌握的题
              </label>
            </div>
            <div class="config-desc">
              背题模式下直接显示答案，可标记"已记住/未记住"，系统会记录你的掌握情况。
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        const depts = config.depts || [];
        let questions = getQuestionsByDept(depts);

        // 只背未掌握的
        if (config.onlyUnmastered) {
          questions = questions.filter(q => {
            const record = QuizEngine.storage.getRecord(q.id);
            if (!record) return true; // 未答过也算未掌握
            return record.mastery < 0.8; // 80% 以下算未掌握
          });
        }

        if (config.shuffle) {
          questions = shuffleArray(questions);
        }

        return questions;
      },

      getSessionOptions(config) {
        return {
          mode: 'memorize',
          shuffle: false,
          showAnswerImmediately: true, // 背题模式直接显示答案
          timeLimit: 0,
          memorizeMode: true,
        };
      },
    },

    // ---- 9. 快答模式 ----
    quick: {
      id: 'quick',
      name: '快答模式',
      icon: '⚡',
      description: '限时答题，超时自动显示答案并跳下一题',

      getConfigUI() {
        const total = getAllQuestions().length;
        return `
          <div class="mode-config">
            <div class="config-item">
              <label>每题限时</label>
              <div class="time-options">
                <label class="time-option">
                  <input type="radio" name="time-limit" value="5"> 5秒
                </label>
                <label class="time-option">
                  <input type="radio" name="time-limit" value="10" checked> 10秒
                </label>
                <label class="time-option">
                  <input type="radio" name="time-limit" value="15"> 15秒
                </label>
                <label class="time-option">
                  <input type="radio" name="time-limit" value="30"> 30秒
                </label>
              </div>
            </div>
            <div class="config-item">
              <label>题目数量</label>
              <input type="number" id="cfg-quick-count" value="30" min="1" max="${total}" class="config-input">
              <span class="config-hint">道</span>
            </div>
            <div class="config-item">
              <label>题目来源</label>
              <select id="cfg-quick-source" class="config-input">
                <option value="all">全部题库</option>
                <option value="wrong">只练错题</option>
                <option value="unanswered">只练未答过</option>
              </select>
            </div>
            <div class="config-desc">
              时间到自动显示答案并进入下一题，锻炼快速反应能力。
            </div>
          </div>
        `;
      },

      generateQuestions(config) {
        let questions = getAllQuestions();
        const count = parseInt(config.count) || 30;
        const source = config.source || 'all';

        if (source === 'wrong') {
          questions = questions.filter(q => {
            const record = QuizEngine.storage.getRecord(q.id);
            if (!record) return false;
            return record.correctCount < record.totalCount;
          });
        } else if (source === 'unanswered') {
          questions = questions.filter(q => {
            const record = QuizEngine.storage.getRecord(q.id);
            return !record || record.totalCount === 0;
          });
        }

        const shuffled = shuffleArray(questions);
        return shuffled.slice(0, Math.min(count, shuffled.length));
      },

      getSessionOptions(config) {
        return {
          mode: 'quick',
          shuffle: false,
          showAnswerImmediately: true,
          timeLimit: parseInt(config.timeLimit) || 10,
        };
      },
    },
  };

  // ========== 循环模式管理 ==========

  const LoopManager = {
    /**
     * 检查是否还有下一轮
     */
    hasNextRound(config) {
      const questions = modeDefinitions.loop.generateQuestions(config);
      return questions.length > 0;
    },

    /**
     * 获取循环进度
     */
    getProgress(config) {
      const depts = config.depts || [];
      let allQuestions = getQuestionsByDept(depts);

      const rangeStart = Math.max(1, parseInt(config.rangeStart) || 1);
      const rangeEnd = parseInt(config.rangeEnd) || allQuestions.length;
      allQuestions = allQuestions.slice(rangeStart - 1, Math.min(rangeEnd, allQuestions.length));

      const masteryThreshold = (parseInt(config.mastery) || 90) / 100;

      let mastered = 0;
      let inProgress = 0;
      let notStarted = 0;

      allQuestions.forEach(q => {
        const record = QuizEngine.storage.getRecord(q.id);
        if (!record) {
          notStarted++;
        } else if (record.mastery >= masteryThreshold) {
          mastered++;
        } else {
          inProgress++;
        }
      });

      return {
        total: allQuestions.length,
        mastered: mastered,
        inProgress: inProgress,
        notStarted: notStarted,
        percent: allQuestions.length > 0
          ? Math.round((mastered / allQuestions.length) * 100)
          : 0,
      };
    },
  };

  // ========== 配置收集辅助函数 ==========

  const ConfigCollector = {
    /**
     * 从DOM中收集顺序模式配置
     */
    collectSequential(container) {
      return {
        start: parseInt(container.querySelector('#cfg-start')?.value) || 1,
        count: parseInt(container.querySelector('#cfg-count')?.value) || 0,
      };
    },

    /**
     * 从DOM中收集乱序模式配置
     */
    collectShuffle(container) {
      return {
        count: parseInt(container.querySelector('#cfg-count')?.value) || 0,
      };
    },

    /**
     * 从DOM中收集部门相关配置（通用）
     */
    collectDepts(container, checkboxName) {
      const checkboxes = container.querySelectorAll(`input[name="${checkboxName}"]:checked`);
      return Array.from(checkboxes).map(cb => cb.value);
    },

    /**
     * 从DOM中收集按部门刷题配置
     */
    collectByDept(container) {
      return {
        depts: this.collectDepts(container, 'dept'),
        count: parseInt(container.querySelector('#cfg-count')?.value) || 0,
        shuffle: container.querySelector('#cfg-shuffle')?.checked || false,
      };
    },

    /**
     * 从DOM中收集组卷模式配置
     */
    collectExam(container) {
      const typeInputs = container.querySelectorAll('.type-count');
      const types = {};
      typeInputs.forEach(input => {
        const type = input.dataset.type;
        const count = parseInt(input.value) || 0;
        if (count > 0) types[type] = count;
      });
      return {
        types: types,
        shuffle: container.querySelector('#cfg-shuffle')?.checked || false,
      };
    },

    /**
     * 从DOM中收集遗忘曲线模式配置
     */
    collectForgetting(container) {
      return {
        count: parseInt(container.querySelector('#cfg-count')?.value) || 50,
        includeNew: container.querySelector('#cfg-include-new')?.checked !== false,
      };
    },

    /**
     * 从DOM中收集选题模式配置
     */
    collectPicker(container) {
      return {
        depts: this.collectDepts(container, 'picker-dept'),
      };
    },

    /**
     * 从DOM中收集循环模式配置
     */
    collectLoop(container) {
      return {
        depts: this.collectDepts(container, 'loop-dept'),
        rangeStart: parseInt(container.querySelector('#cfg-range-start')?.value) || 1,
        rangeEnd: parseInt(container.querySelector('#cfg-range-end')?.value) || 100,
        loopCount: parseInt(container.querySelector('#cfg-loop-count')?.value) || 20,
        mastery: parseInt(container.querySelector('#cfg-mastery')?.value) || 90,
      };
    },

    /**
     * 从DOM中收集背题模式配置
     */
    collectMemorize(container) {
      return {
        depts: this.collectDepts(container, 'mem-dept'),
        shuffle: container.querySelector('#cfg-mem-shuffle')?.checked || false,
        onlyUnmastered: container.querySelector('#cfg-mem-only-unmastered')?.checked || false,
      };
    },

    /**
     * 从DOM中收集快答模式配置
     */
    collectQuick(container) {
      const timeRadio = container.querySelector('input[name="time-limit"]:checked');
      return {
        timeLimit: timeRadio ? parseInt(timeRadio.value) : 10,
        count: parseInt(container.querySelector('#cfg-quick-count')?.value) || 30,
        source: container.querySelector('#cfg-quick-source')?.value || 'all',
      };
    },

    /**
     * 从DOM中收集指定模式的配置
     */
    collect(modeId, container) {
      const map = {
        sequential: 'collectSequential',
        shuffle: 'collectShuffle',
        byDept: 'collectByDept',
        exam: 'collectExam',
        forgetting: 'collectForgetting',
        picker: 'collectPicker',
        loop: 'collectLoop',
        memorize: 'collectMemorize',
        quick: 'collectQuick',
      };
      const method = map[modeId];
      if (method && typeof this[method] === 'function') {
        return this[method](container);
      }
      return {};
    },
  };

  // ========== 对外 API ==========

  const Modes = {
    /**
     * 获取所有模式列表
     */
    getAll() {
      return Object.keys(modeDefinitions).map(id => modeDefinitions[id]);
    },

    /**
     * 获取指定模式
     */
    getMode(modeId) {
      return modeDefinitions[modeId] || null;
    },

    /**
     * 根据模式和配置生成题目列表
     */
    generateQuestions(modeId, config) {
      const mode = modeDefinitions[modeId];
      if (!mode) {
        console.warn('未知模式:', modeId);
        return [];
      }
      return mode.generateQuestions(config || {});
    },

    /**
     * 获取模式的会话配置
     */
    getSessionOptions(modeId, config) {
      const mode = modeDefinitions[modeId];
      if (!mode) return {};
      return mode.getSessionOptions(config || {});
    },

    /**
     * 获取模式的配置界面HTML
     */
    getConfigUI(modeId) {
      const mode = modeDefinitions[modeId];
      if (!mode) return '';
      return mode.getConfigUI();
    },

    /**
     * 从DOM收集配置
     */
    collectConfig(modeId, container) {
      return ConfigCollector.collect(modeId, container);
    },

    // 循环模式管理
    LoopManager: LoopManager,

    // 配置收集器
    ConfigCollector: ConfigCollector,

    // 工具函数
    utils: {
      getAllQuestions: getAllQuestions,
      getDepts: getDepts,
      getTypes: getTypes,
      getQuestionsByDept: getQuestionsByDept,
      getQuestionsByType: getQuestionsByType,
      shuffleArray: shuffleArray,
    },
  };

  // 暴露到全局
  window.Modes = Modes;

})(window);
