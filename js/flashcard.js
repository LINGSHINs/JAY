/**
 * Flashcard - 闪卡记忆与游戏记忆模式模块
 * 提供闪卡翻转记忆、连连看、记忆翻牌、打字挑战、限时速答等游戏化学习模式
 */
(function (window) {
  'use strict';

  // ---------- 工具函数 ----------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i];
      a[i] = a[j];
      a[j] = temp;
    }
    return a;
  }

  function formatAnswer(question) {
    var ans = question.answer;
    var opts = question.options;
    if (!opts) return ans;
    // 把答案字母转换为选项文本
    if (question.type === '判断') {
      return ans;
    }
    var parts = [];
    for (var i = 0; i < ans.length; i++) {
      var letter = ans[i];
      if (opts[letter]) parts.push(letter + '. ' + opts[letter]);
    }
    return parts.length > 0 ? parts.join('\n') : ans;
  }

  function createElement(tag, className, html) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  // ============================================================
  // Flashcard - 闪卡记忆模式
  // ============================================================
  var Flashcard = {
    _questions: [],
    _currentIndex: 0,
    _isFlipped: false,
    _known: {},       // 已记住的题目id
    _unknown: {},     // 未记住的题目id
    _container: null,
    _onUpdate: null,

    /**
     * 初始化闪卡
     * @param {Array} questions - 题目列表
     * @param {HTMLElement|string} container - 容器元素或ID
     * @param {Function} onUpdate - 更新回调
     */
    init: function (questions, container, onUpdate) {
      this._questions = shuffle(questions || []);
      this._currentIndex = 0;
      this._isFlipped = false;
      this._known = {};
      this._unknown = {};
      this._onUpdate = onUpdate || null;

      if (typeof container === 'string') {
        this._container = document.getElementById(container);
      } else {
        this._container = container;
      }

      if (this._container) {
        this._render();
      }
      return this;
    },

    /**
     * 获取当前题目
     */
    getCurrent: function () {
      return this._questions[this._currentIndex] || null;
    },

    /**
     * 下一张
     */
    next: function () {
      if (this._currentIndex < this._questions.length - 1) {
        this._currentIndex++;
        this._isFlipped = false;
        this._render();
        this._notify();
      }
      return this;
    },

    /**
     * 上一张
     */
    prev: function () {
      if (this._currentIndex > 0) {
        this._currentIndex--;
        this._isFlipped = false;
        this._render();
        this._notify();
      }
      return this;
    },

    /**
     * 翻转卡片
     */
    flip: function () {
      this._isFlipped = !this._isFlipped;
      this._render();
      return this;
    },

    /**
     * 标记已记住
     */
    markKnown: function () {
      var q = this.getCurrent();
      if (q) {
        this._known[q.id] = true;
        delete this._unknown[q.id];
      }
      this._notify();
      return this;
    },

    /**
     * 标记未记住
     */
    markUnknown: function () {
      var q = this.getCurrent();
      if (q) {
        this._unknown[q.id] = true;
        delete this._known[q.id];
      }
      this._notify();
      return this;
    },

    /**
     * 获取进度
     */
    getProgress: function () {
      var total = this._questions.length;
      var knownCount = Object.keys(this._known).length;
      var unknownCount = Object.keys(this._unknown).length;
      return {
        total: total,
        current: this._currentIndex + 1,
        known: knownCount,
        unknown: unknownCount,
        remaining: total - knownCount - unknownCount,
        percentage: total > 0 ? Math.round(((this._currentIndex + 1) / total) * 100) : 0
      };
    },

    _render: function () {
      if (!this._container) return;
      var q = this.getCurrent();
      if (!q) {
        this._container.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;">没有题目</div>';
        return;
      }

      this._container.innerHTML = '';

      var card = createElement('div', 'flashcard-wrapper');
      card.style.cssText = 'perspective:1000px;width:100%;height:320px;cursor:pointer;';

      var inner = createElement('div', 'flashcard-inner');
      inner.style.cssText = 'position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform 0.6s;';
      if (this._isFlipped) {
        inner.style.transform = 'rotateY(180deg)';
      }

      // 正面 - 题目
      var front = createElement('div', 'flashcard-front');
      front.style.cssText = 'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:24px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.15);';

      var typeTag = createElement('span', '', '【' + q.type + '】' + (q.dept || ''));
      typeTag.style.cssText = 'font-size:13px;opacity:0.9;margin-bottom:12px;';
      front.appendChild(typeTag);

      var qText = createElement('div', '', q.question);
      qText.style.cssText = 'font-size:17px;line-height:1.6;';
      front.appendChild(qText);

      var hint = createElement('div', '', '点击卡片查看答案');
      hint.style.cssText = 'font-size:13px;opacity:0.7;margin-top:auto;text-align:center;';
      front.appendChild(hint);

      // 背面 - 答案
      var back = createElement('div', 'flashcard-back');
      back.style.cssText = 'position:absolute;width:100%;height:100%;backface-visibility:hidden;border-radius:12px;background:linear-gradient(135deg,#11998e,#38ef7d);color:#fff;padding:24px;box-sizing:border-box;transform:rotateY(180deg);display:flex;flex-direction:column;justify-content:center;box-shadow:0 8px 24px rgba(0,0,0,0.15);';

      var ansLabel = createElement('div', '', '正确答案');
      ansLabel.style.cssText = 'font-size:13px;opacity:0.9;margin-bottom:10px;';
      back.appendChild(ansLabel);

      var ansText = createElement('div', '', formatAnswer(q).replace(/\n/g, '<br>'));
      ansText.style.cssText = 'font-size:16px;line-height:1.6;';
      back.appendChild(ansText);

      inner.appendChild(front);
      inner.appendChild(back);
      card.appendChild(inner);
      this._container.appendChild(card);

      // 点击翻转
      var self = this;
      card.addEventListener('click', function () {
        self.flip();
      });
    },

    _notify: function () {
      if (typeof this._onUpdate === 'function') {
        this._onUpdate(this.getProgress(), this.getCurrent());
      }
    }
  };


  // ============================================================
  // GameModes - 游戏记忆模式
  // ============================================================
  var GameModes = {

    // ---------- 1. 连连看模式 ----------
    matching: function (questions, container, onComplete) {
      var containerEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (!containerEl) return;

      var count = Math.min(questions.length, 6); // 6对卡片
      var selected = shuffle(questions).slice(0, count);

      // 创建卡片对（题目卡 + 答案卡）
      var cards = [];
      for (var i = 0; i < selected.length; i++) {
        var q = selected[i];
        var ansText = q.type === '判断' ? q.answer : q.answer;
        cards.push({ id: 'q_' + q.id, pairId: q.id, text: q.question.substring(0, 30) + '...', type: 'question' });
        cards.push({ id: 'a_' + q.id, pairId: q.id, text: ansText, type: 'answer' });
      }
      cards = shuffle(cards);

      var state = {
        matched: 0,
        firstCard: null,
        secondCard: null,
        locked: false,
        moves: 0,
        total: selected.length
      };

      function render() {
        containerEl.innerHTML = '';
        var title = createElement('div', '', '连连看模式 - 找出题目和答案的配对');
        title.style.cssText = 'text-align:center;font-size:16px;font-weight:600;margin-bottom:16px;color:#1f2937;';
        containerEl.appendChild(title);

        var info = createElement('div', '', '已配对: ' + state.matched + '/' + state.total + ' | 步数: ' + state.moves);
        info.style.cssText = 'text-align:center;font-size:13px;color:#6b7280;margin-bottom:12px;';
        info.id = 'match-info';
        containerEl.appendChild(info);

        var grid = createElement('div', 'match-grid');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(4,1fr);gap:8px;';

        for (var i = 0; i < cards.length; i++) {
          var cardData = cards[i];
          var card = createElement('div', 'match-card', cardData.text);
          card.dataset.id = cardData.id;
          card.dataset.pairId = cardData.pairId;
          card.dataset.type = cardData.type;
          card.style.cssText = 'padding:10px 8px;font-size:12px;border-radius:8px;background:#f3f4f6;color:#374151;cursor:pointer;min-height:70px;display:flex;align-items:center;justify-content:center;text-align:center;transition:all 0.3s;line-height:1.4;';
          if (cardData.matched) {
            card.style.background = '#10b981';
            card.style.color = '#fff';
          }
          card.addEventListener('click', function () {
            handleCardClick(this);
          });
          grid.appendChild(card);
        }
        containerEl.appendChild(grid);
      }

      function handleCardClick(cardEl) {
        if (state.locked) return;
        if (cardEl.dataset.matched === 'true') return;
        if (cardEl === state.firstCard) return;

        cardEl.style.background = '#3b82f6';
        cardEl.style.color = '#fff';

        if (!state.firstCard) {
          state.firstCard = cardEl;
        } else {
          state.secondCard = cardEl;
          state.moves++;
          state.locked = true;
          updateInfo();

          var pair1 = state.firstCard.dataset.pairId;
          var pair2 = state.secondCard.dataset.pairId;
          var type1 = state.firstCard.dataset.type;
          var type2 = state.secondCard.dataset.type;

          if (pair1 === pair2 && type1 !== type2) {
            // 配对成功
            setTimeout(function () {
              state.firstCard.dataset.matched = 'true';
              state.secondCard.dataset.matched = 'true';
              state.firstCard.style.background = '#10b981';
              state.secondCard.style.background = '#10b981';
              state.matched++;
              resetTurn();
              updateInfo();

              if (state.matched >= state.total) {
                setTimeout(function () {
                  if (onComplete) onComplete({ moves: state.moves, success: true });
                }, 500);
              }
            }, 400);
          } else {
            // 配对失败
            setTimeout(function () {
              state.firstCard.style.background = '#f3f4f6';
              state.firstCard.style.color = '#374151';
              state.secondCard.style.background = '#f3f4f6';
              state.secondCard.style.color = '#374151';
              resetTurn();
            }, 800);
          }
        }
      }

      function resetTurn() {
        state.firstCard = null;
        state.secondCard = null;
        state.locked = false;
      }

      function updateInfo() {
        var info = document.getElementById('match-info');
        if (info) info.textContent = '已配对: ' + state.matched + '/' + state.total + ' | 步数: ' + state.moves;
      }

      render();

      return {
        getState: function () { return state; }
      };
    },

    // ---------- 2. 记忆翻牌模式 ----------
    memory: function (questions, count, container, onComplete) {
      var containerEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (!containerEl) return;

      count = count || 8;
      var pairCount = count / 2;
      var selected = shuffle(questions).slice(0, pairCount);

      // 每对卡片显示相同的答案文本
      var cards = [];
      for (var i = 0; i < selected.length; i++) {
        var q = selected[i];
        var displayText = q.type === '判断' ? q.answer : (q.options[q.answer[0]] || q.answer);
        cards.push({ id: 'c1_' + q.id, pairId: q.id, text: displayText });
        cards.push({ id: 'c2_' + q.id, pairId: q.id, text: displayText });
      }
      cards = shuffle(cards);

      var state = {
        matched: 0,
        firstCard: null,
        secondCard: null,
        locked: true, // 初始锁定，先展示再隐藏
        moves: 0,
        total: pairCount,
        phase: 'preview' // preview / play
      };

      function render() {
        containerEl.innerHTML = '';
        var cols = cards.length <= 8 ? 4 : (cards.length <= 12 ? 4 : 4);

        var title = createElement('div', '', '记忆翻牌 - 记住答案位置');
        title.style.cssText = 'text-align:center;font-size:16px;font-weight:600;margin-bottom:12px;color:#1f2937;';
        containerEl.appendChild(title);

        var info = createElement('div', '', '准备记忆...');
        info.id = 'memory-info';
        info.style.cssText = 'text-align:center;font-size:13px;color:#6b7280;margin-bottom:12px;';
        containerEl.appendChild(info);

        var grid = createElement('div', 'memory-grid');
        grid.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:8px;';
        grid.id = 'memory-grid';

        for (var i = 0; i < cards.length; i++) {
          var cardData = cards[i];
          var card = createElement('div', 'memory-card');
          card.dataset.id = cardData.id;
          card.dataset.pairId = cardData.pairId;
          card.dataset.text = cardData.text;
          card.style.cssText = 'aspect-ratio:3/2;padding:6px;font-size:12px;border-radius:8px;background:#3b82f6;color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;text-align:center;transition:all 0.3s;line-height:1.3;';
          card.textContent = cardData.text; // 预览时显示
          grid.appendChild(card);
        }
        containerEl.appendChild(grid);
      }

      function startPreview() {
        state.phase = 'preview';
        var info = document.getElementById('memory-info');
        var countdown = 3;
        info.textContent = '记住答案位置... ' + countdown + 's';

        var timer = setInterval(function () {
          countdown--;
          if (countdown > 0) {
            info.textContent = '记住答案位置... ' + countdown + 's';
          } else {
            clearInterval(timer);
            hideAllCards();
          }
        }, 1000);
      }

      function hideAllCards() {
        var grid = document.getElementById('memory-grid');
        if (!grid) return;
        var cardEls = grid.querySelectorAll('.memory-card');
        for (var i = 0; i < cardEls.length; i++) {
          cardEls[i].textContent = '?';
          cardEls[i].style.background = '#6b7280';
          cardEls[i].addEventListener('click', handleCardClick);
        }
        state.locked = false;
        state.phase = 'play';
        var info = document.getElementById('memory-info');
        if (info) info.textContent = '开始翻牌配对！已配对: 0/' + state.total;
      }

      function handleCardClick(e) {
        if (state.locked || state.phase !== 'play') return;
        var cardEl = e.target;
        if (cardEl.dataset.matched === 'true') return;
        if (cardEl === state.firstCard) return;

        cardEl.textContent = cardEl.dataset.text;
        cardEl.style.background = '#3b82f6';

        if (!state.firstCard) {
          state.firstCard = cardEl;
        } else {
          state.secondCard = cardEl;
          state.moves++;
          state.locked = true;

          var pair1 = state.firstCard.dataset.pairId;
          var pair2 = state.secondCard.dataset.pairId;

          if (pair1 === pair2) {
            setTimeout(function () {
              state.firstCard.dataset.matched = 'true';
              state.secondCard.dataset.matched = 'true';
              state.firstCard.style.background = '#10b981';
              state.secondCard.style.background = '#10b981';
              state.matched++;
              resetTurn();
              updateInfo();
              if (state.matched >= state.total) {
                setTimeout(function () {
                  if (onComplete) onComplete({ moves: state.moves, success: true });
                }, 500);
              }
            }, 400);
          } else {
            setTimeout(function () {
              state.firstCard.textContent = '?';
              state.secondCard.textContent = '?';
              state.firstCard.style.background = '#6b7280';
              state.secondCard.style.background = '#6b7280';
              resetTurn();
            }, 800);
          }
        }
      }

      function resetTurn() {
        state.firstCard = null;
        state.secondCard = null;
        state.locked = false;
      }

      function updateInfo() {
        var info = document.getElementById('memory-info');
        if (info) info.textContent = '已配对: ' + state.matched + '/' + state.total + ' | 步数: ' + state.moves;
      }

      render();
      setTimeout(startPreview, 300);

      return {
        getState: function () { return state; }
      };
    },

    // ---------- 3. 打字挑战模式 ----------
    typing: function (questions, container, onComplete) {
      var containerEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (!containerEl) return;

      var pool = shuffle(questions);
      var currentIndex = 0;
      var score = 0;
      var total = Math.min(pool.length, 20);

      function getAnswerKey(q) {
        if (q.type === '判断') {
          return q.answer === '正确' ? 'T' : 'F';
        }
        return q.answer.substring(0, 1).toUpperCase(); // 取第一个选项字母
      }

      function render() {
        containerEl.innerHTML = '';

        var title = createElement('div', '', '打字挑战 - 快速输入答案首字母');
        title.style.cssText = 'text-align:center;font-size:16px;font-weight:600;margin-bottom:12px;color:#1f2937;';
        containerEl.appendChild(title);

        var info = createElement('div', '', '得分: 0 | 进度: 0/' + total);
        info.id = 'typing-info';
        info.style.cssText = 'text-align:center;font-size:13px;color:#6b7280;margin-bottom:16px;';
        containerEl.appendChild(info);

        var qBox = createElement('div', 'typing-question');
        qBox.id = 'typing-question';
        qBox.style.cssText = 'background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;font-size:16px;line-height:1.6;min-height:80px;';
        containerEl.appendChild(qBox);

        var optionsBox = createElement('div', 'typing-options');
        optionsBox.id = 'typing-options';
        optionsBox.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:8px;margin-bottom:16px;';
        containerEl.appendChild(optionsBox);

        var hint = createElement('div', '', '输入答案选项字母 (如 A/B/C/D/T/F)');
        hint.style.cssText = 'text-align:center;font-size:13px;color:#9ca3af;';
        containerEl.appendChild(hint);

        var input = document.createElement('input');
        input.type = 'text';
        input.id = 'typing-input';
        input.maxLength = 1;
        input.style.cssText = 'position:absolute;left:-9999px;opacity:0;';
        containerEl.appendChild(input);

        showQuestion();

        input.addEventListener('keydown', function (e) {
          var key = e.key.toUpperCase();
          if (/^[A-Z]$/.test(key) || key === 'T' || key === 'F') {
            e.preventDefault();
            checkAnswer(key);
          }
        });

        // 自动聚焦
        setTimeout(function () { input.focus(); }, 100);
        containerEl.addEventListener('click', function () { input.focus(); });
      }

      function showQuestion() {
        if (currentIndex >= total) {
          finish();
          return;
        }
        var q = pool[currentIndex];
        var qBox = document.getElementById('typing-question');
        var optsBox = document.getElementById('typing-options');

        qBox.innerHTML = '<span style="color:#6b7280;font-size:13px;">【' + q.type + '】</span><br>' + q.question;
        optsBox.innerHTML = '';

        var optKeys = Object.keys(q.options || {});
        for (var i = 0; i < optKeys.length; i++) {
          var key = optKeys[i];
          var optEl = createElement('div', '', '<strong>' + key + '.</strong> ' + q.options[key]);
          optEl.style.cssText = 'padding:8px 12px;background:#f9fafb;border-radius:8px;font-size:14px;color:#374151;';
          optsBox.appendChild(optEl);
        }

        updateInfo();
      }

      function checkAnswer(key) {
        var q = pool[currentIndex];
        var correctKey = getAnswerKey(q);
        var optsBox = document.getElementById('typing-options');
        var optEls = optsBox.querySelectorAll('div');

        // 判断题特殊处理
        if (q.type === '判断') {
          var isCorrect = (key === 'T' && correctKey === 'T') || (key === 'F' && correctKey === 'F');
          if (isCorrect) score++;
          showFeedback(isCorrect);
        } else {
          // 单选或多选（取第一个正确答案）
          var isCorrect = key === correctKey;
          if (isCorrect) score++;
          showFeedback(isCorrect);
        }

        currentIndex++;
        setTimeout(showQuestion, 400);
      }

      function showFeedback(isCorrect) {
        var qBox = document.getElementById('typing-question');
        var originalBorder = qBox.style.borderColor;
        qBox.style.borderColor = isCorrect ? '#10b981' : '#ef4444';
        qBox.style.background = isCorrect ? '#ecfdf5' : '#fef2f2';
        setTimeout(function () {
          qBox.style.borderColor = '#e5e7eb';
          qBox.style.background = '#fff';
        }, 300);
      }

      function updateInfo() {
        var info = document.getElementById('typing-info');
        if (info) info.textContent = '得分: ' + score + ' | 进度: ' + currentIndex + '/' + total;
      }

      function finish() {
        var qBox = document.getElementById('typing-question');
        qBox.innerHTML = '<div style="text-align:center;"><div style="font-size:24px;font-weight:bold;margin-bottom:8px;">挑战完成!</div><div style="font-size:16px;">得分: ' + score + '/' + total + '</div><div style="font-size:14px;color:#6b7280;margin-top:4px;">正确率: ' + Math.round(score / total * 100) + '%</div></div>';
        document.getElementById('typing-options').innerHTML = '';
        document.getElementById('typing-info').textContent = '游戏结束';
        if (onComplete) onComplete({ score: score, total: total, accuracy: Math.round(score / total * 100) });
      }

      render();

      return {
        getState: function () { return { score: score, current: currentIndex, total: total }; }
      };
    },

    // ---------- 4. 限时速答模式 ----------
    speedRound: function (questions, seconds, container, onComplete) {
      var containerEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (!containerEl) return;

      seconds = seconds || 60;
      var pool = shuffle(questions);
      var currentIndex = 0;
      var score = 0;
      var timeLeft = seconds;
      var timerId = null;
      var answered = 0;

      function render() {
        containerEl.innerHTML = '';

        var header = createElement('div', '');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;';

        var scoreEl = createElement('div', '', '得分: <strong id="speed-score">0</strong>');
        scoreEl.style.cssText = 'font-size:15px;color:#374151;';
        header.appendChild(scoreEl);

        var timeEl = createElement('div', '', '⏱ <strong id="speed-time">' + seconds + '</strong>s');
        timeEl.style.cssText = 'font-size:15px;color:#ef4444;font-weight:600;';
        header.appendChild(timeEl);

        containerEl.appendChild(header);

        var qBox = createElement('div', 'speed-question');
        qBox.id = 'speed-question';
        qBox.style.cssText = 'background:#fff;border:2px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:16px;font-size:16px;line-height:1.6;min-height:80px;';
        containerEl.appendChild(qBox);

        var optsBox = createElement('div', 'speed-options');
        optsBox.id = 'speed-options';
        optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
        containerEl.appendChild(optsBox);

        showQuestion();
        startTimer();
      }

      function showQuestion() {
        if (currentIndex >= pool.length) {
          endGame();
          return;
        }
        var q = pool[currentIndex];
        var qBox = document.getElementById('speed-question');
        var optsBox = document.getElementById('speed-options');

        qBox.innerHTML = '<span style="color:#6b7280;font-size:13px;">【' + q.type + '】第 ' + (currentIndex + 1) + '题</span><br><br>' + q.question;
        optsBox.innerHTML = '';

        var optKeys = Object.keys(q.options || {});
        for (var i = 0; i < optKeys.length; i++) {
          var key = optKeys[i];
          var btn = createElement('button', '', '<strong>' + key + '.</strong> ' + q.options[key]);
          btn.dataset.key = key;
          btn.style.cssText = 'padding:12px 16px;text-align:left;border:2px solid #e5e7eb;border-radius:10px;background:#fff;cursor:pointer;font-size:14px;color:#374151;transition:all 0.2s;';
          btn.addEventListener('mouseenter', function () {
            this.style.borderColor = '#3b82f6';
            this.style.background = '#eff6ff';
          });
          btn.addEventListener('mouseleave', function () {
            this.style.borderColor = '#e5e7eb';
            this.style.background = '#fff';
          });
          btn.addEventListener('click', function () {
            checkAnswer(this.dataset.key);
          });
          optsBox.appendChild(btn);
        }
      }

      function checkAnswer(selectedKey) {
        var q = pool[currentIndex];
        answered++;
        var isCorrect = false;

        if (q.type === '判断') {
          var selectedText = q.options[selectedKey];
          isCorrect = selectedText === q.answer;
        } else if (q.type === '单选') {
          isCorrect = selectedKey === q.answer;
        } else {
          // 多选题简化：选对一个即得分（简单模式）
          isCorrect = q.answer.indexOf(selectedKey) !== -1;
        }

        if (isCorrect) {
          score++;
          document.getElementById('speed-score').textContent = score;
        }

        currentIndex++;
        showQuestion();
      }

      function startTimer() {
        timerId = setInterval(function () {
          timeLeft--;
          var timeEl = document.getElementById('speed-time');
          if (timeEl) timeEl.textContent = timeLeft;

          if (timeLeft <= 10) {
            if (timeEl) timeEl.style.color = '#dc2626';
          }

          if (timeLeft <= 0) {
            endGame();
          }
        }, 1000);
      }

      function endGame() {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }

        var qBox = document.getElementById('speed-question');
        var optsBox = document.getElementById('speed-options');

        qBox.innerHTML = '<div style="text-align:center;padding:20px;">' +
          '<div style="font-size:28px;font-weight:bold;margin-bottom:12px;">时间到!</div>' +
          '<div style="font-size:18px;margin-bottom:8px;">最终得分: <strong style="color:#3b82f6;">' + score + '</strong> 分</div>' +
          '<div style="font-size:14px;color:#6b7280;">共答 ' + answered + ' 题 | 正确 ' + score + ' 题 | 正确率 ' + (answered > 0 ? Math.round(score / answered * 100) : 0) + '%</div>' +
          '</div>';
        optsBox.innerHTML = '';

        if (onComplete) {
          onComplete({
            score: score,
            answered: answered,
            accuracy: answered > 0 ? Math.round(score / answered * 100) : 0,
            time: seconds
          });
        }
      }

      render();

      return {
        getState: function () {
          return { score: score, timeLeft: timeLeft, answered: answered };
        },
        stop: function () {
          if (timerId) clearInterval(timerId);
        }
      };
    }
  };

  // 暴露到全局
  window.Flashcard = Flashcard;
  window.GameModes = GameModes;

})(window);
