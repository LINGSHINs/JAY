/**
 * EasterEggs - 彩蛋模式模块（20种天马行空的刷题方式）
 * 每种模式有独特的答题交互方式，简化实现但保证可玩
 */
(function (window) {
  'use strict';

  // ---------- 工具函数 ----------
  function shuffle(arr) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var temp = a[i]; a[i] = a[j]; a[j] = temp;
    }
    return a;
  }

  function createEl(tag, className, html) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (html !== undefined) el.innerHTML = html;
    return el;
  }

  function isCorrect(question, selectedKey) {
    if (question.type === '判断') {
      return question.options[selectedKey] === question.answer;
    }
    if (question.type === '单选') {
      return selectedKey === question.answer;
    }
    // 多选题：选中的是正确答案之一即算对（简化）
    return question.answer.indexOf(selectedKey) !== -1;
  }

  function getCorrectKey(question) {
    if (question.type === '判断') {
      return question.answer === '正确' ? 'A' : 'B';
    }
    return question.answer.charAt(0);
  }

  // 简易音效（用Web Audio API生成）
  function playTone(freq, duration, type) {
    try {
      var ctx = new (window.AudioContext || window.webkitAudioContext)();
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = type || 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {}
  }

  function playCorrectSound() {
    playTone(523, 0.1);
    setTimeout(function () { playTone(659, 0.1); }, 100);
    setTimeout(function () { playTone(784, 0.15); }, 200);
  }

  function playWrongSound() {
    playTone(200, 0.2, 'sawtooth');
  }

  // ============================================================
  // 20种彩蛋模式定义
  // ============================================================
  var EGG_MODES = [
    { id: 'gravity', name: '重力答题', icon: '🍎', desc: '选项从上方掉落，点击正确答案接住' },
    { id: 'match3', name: '答题消消乐', icon: '🧩', desc: '答对消除一行，答错加行' },
    { id: 'runner', name: '奔跑答题', icon: '🏃', desc: '角色向前跑，答对加速答错减速' },
    { id: 'shooter', name: '射击答题', icon: '🎯', desc: '用子弹射击正确答案选项' },
    { id: 'puzzle', name: '拼图答题', icon: '🧠', desc: '把选项拖到正确位置' },
    { id: 'piano', name: '钢琴答题', icon: '🎹', desc: '每个选项是一个琴键，答对演奏旋律' },
    { id: 'maze', name: '迷宫答题', icon: '🌀', desc: '答对打开通路，答错走死胡同' },
    { id: 'fishing', name: '钓鱼答题', icon: '🎣', desc: '钓起正确答案的鱼' },
    { id: 'farming', name: '种菜答题', icon: '🌱', desc: '答对种出植物，答错枯萎' },
    { id: 'monster', name: '打怪答题', icon: '⚔️', desc: '答对造成伤害，答错被攻击' },
    { id: 'space', name: '星际穿越', icon: '🚀', desc: '太空背景，选项是星球' },
    { id: 'typewriter', name: '打字机模式', icon: '⌨️', desc: '题目逐字打出，复古打字机效果' },
    { id: 'invisible', name: '隐身模式', icon: '👻', desc: '选项逐渐消失，速度答题' },
    { id: 'mirror', name: '镜像模式', icon: '🪞', desc: '所有文字是反的，考验眼力' },
    { id: 'colorblind', name: '色盲模式', icon: '🎨', desc: '选项颜色相近考验分辨' },
    { id: 'shake', name: '震动模式', icon: '📳', desc: '屏幕随机震动增加难度' },
    { id: 'zoom', name: '缩放模式', icon: '🔍', desc: '题目随机放大缩小' },
    { id: 'mixed', name: '混合模式', icon: '🎰', desc: '随机切换各种效果' },
    { id: 'voice', name: '语音模式', icon: '🔊', desc: '题目被朗读出来' },
    { id: 'danmaku', name: '弹幕模式', icon: '💬', desc: '答案以弹幕形式飘过，点击正确的' }
  ];

  // ============================================================
  // 各模式实现
  // ============================================================
  var EggGames = {};

  // ---------- 1. 重力答题 ----------
  EggGames.gravity = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var animId = null;
    var fallingOptions = [];

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'position:relative;width:100%;height:400px;background:linear-gradient(180deg,#87ceeb 0%,#e0f6ff 100%);border-radius:12px;overflow:hidden;';

      var info = createEl('div', '', '得分: <span id="grav-score">0</span> | 第 <span id="grav-idx">1</span>/' + pool.length + '题');
      info.style.cssText = 'position:absolute;top:8px;left:8px;right:8px;display:flex;justify-content:space-between;font-size:13px;color:#374151;z-index:10;';
      container.appendChild(info);

      var qText = createEl('div', '', '');
      qText.id = 'grav-question';
      qText.style.cssText = 'position:absolute;top:36px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.9);padding:8px 16px;border-radius:20px;font-size:14px;color:#1f2937;max-width:90%;text-align:center;z-index:10;box-shadow:0 2px 8px rgba(0,0,0,0.1);';
      container.appendChild(qText);

      // 底部篮子
      var basket = createEl('div', '', '🧺');
      basket.id = 'grav-basket';
      basket.style.cssText = 'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);font-size:40px;z-index:10;';
      container.appendChild(basket);

      nextQuestion();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('grav-question').textContent = q.question.substring(0, 50);
      document.getElementById('grav-idx').textContent = idx + 1;

      var optKeys = Object.keys(q.options || {});
      fallingOptions = [];
      var correctKey = getCorrectKey(q);

      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        fallingOptions.push({
          key: key,
          text: key + '. ' + q.options[key].substring(0, 15),
          x: 10 + Math.random() * 80,
          y: -10 - Math.random() * 30,
          speed: 0.3 + Math.random() * 0.3,
          isCorrect: key === correctKey
        });
      }

      animate();
    }

    function animate() {
      var opts = container.querySelectorAll('.falling-opt');
      for (var i = 0; i < opts.length; i++) opts[i].remove();

      var allGone = true;
      for (var j = 0; j < fallingOptions.length; j++) {
        var opt = fallingOptions[j];
        if (opt.caught) continue;
        opt.y += opt.speed;

        if (opt.y > 85) {
          if (!opt.isCorrect) {
            opt.caught = true;
          } else {
            // 正确答案掉到底部 = 失败
            opt.caught = true;
            wrongAnswer();
            return;
          }
          continue;
        }

        allGone = false;
        var el = createEl('div', 'falling-opt', opt.text);
        el.style.cssText = 'position:absolute;left:' + opt.x + '%;top:' + opt.y + '%;transform:translateX(-50%);background:#fff;padding:6px 12px;border-radius:8px;font-size:12px;cursor:pointer;box-shadow:0 2px 6px rgba(0,0,0,0.15);white-space:nowrap;z-index:5;';
        (function (optData) {
          el.addEventListener('click', function () {
            optData.caught = true;
            if (optData.isCorrect) {
              correctAnswer();
            } else {
              wrongAnswer();
            }
          });
        })(opt);
        container.appendChild(el);
      }

      if (allGone) {
        idx++;
        setTimeout(nextQuestion, 500);
        return;
      }

      animId = requestAnimationFrame(animate);
    }

    function correctAnswer() {
      score++;
      document.getElementById('grav-score').textContent = score;
      playCorrectSound();
      if (animId) cancelAnimationFrame(animId);
      idx++;
      setTimeout(nextQuestion, 500);
    }

    function wrongAnswer() {
      playWrongSound();
      if (animId) cancelAnimationFrame(animId);
      idx++;
      setTimeout(nextQuestion, 500);
    }

    function endGame() {
      if (animId) cancelAnimationFrame(animId);
      container.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;"><div style="font-size:32px;margin-bottom:8px;">🎮</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (animId) cancelAnimationFrame(animId); } };
  };

  // ---------- 2. 答题消消乐 ----------
  EggGames.match3 = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var rows = 5;
    var cols = 6;
    var grid = [];
    var colors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#1f2937;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '得分: <strong id="m3-score">0</strong> | 第 <span id="m3-idx">1</span>/' + pool.length + '题');
      header.style.cssText = 'color:#fff;font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var qBox = createEl('div', '', '');
      qBox.id = 'm3-question';
      qBox.style.cssText = 'background:#374151;color:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:12px;min-height:50px;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'm3-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:6px;margin-bottom:12px;';
      container.appendChild(optsBox);

      var gridBox = createEl('div', '');
      gridBox.id = 'm3-grid';
      gridBox.style.cssText = 'display:grid;grid-template-columns:repeat(' + cols + ',1fr);gap:3px;background:#111827;padding:6px;border-radius:8px;';
      container.appendChild(gridBox);

      initGrid();
      nextQuestion();
    }

    function initGrid() {
      grid = [];
      var gridBox = document.getElementById('m3-grid');
      gridBox.innerHTML = '';
      for (var r = 0; r < rows; r++) {
        var row = [];
        for (var c = 0; c < cols; c++) {
          var color = colors[Math.floor(Math.random() * colors.length)];
          row.push(color);
          var cell = createEl('div', '');
          cell.style.cssText = 'aspect-ratio:1;background:' + color + ';border-radius:4px;';
          gridBox.appendChild(cell);
        }
        grid.push(row);
      }
    }

    function renderGrid() {
      var gridBox = document.getElementById('m3-grid');
      var cells = gridBox.querySelectorAll('div');
      var idx2 = 0;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          if (cells[idx2]) {
            cells[idx2].style.background = grid[r][c] || 'transparent';
          }
          idx2++;
        }
      }
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('m3-question').textContent = q.question;
      document.getElementById('m3-idx').textContent = idx + 1;

      var optsBox = document.getElementById('m3-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.style.cssText = 'padding:10px 14px;text-align:left;background:#4b5563;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score += 10;
        playCorrectSound();
        // 消除一行
        clearRow();
      } else {
        playWrongSound();
        // 加一行
        addRow();
      }
      document.getElementById('m3-score').textContent = score;
      idx++;
      setTimeout(nextQuestion, 400);
    }

    function clearRow() {
      grid.shift();
      var newRow = [];
      for (var c = 0; c < cols; c++) {
        newRow.push(colors[Math.floor(Math.random() * colors.length)]);
      }
      grid.push(newRow);
      renderGrid();
    }

    function addRow() {
      var newRow = [];
      for (var c = 0; c < cols; c++) {
        newRow.push(colors[Math.floor(Math.random() * colors.length)]);
      }
      grid.unshift(newRow);
      if (grid.length > rows) grid.pop();
      renderGrid();
    }

    function endGame() {
      container.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🎮</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">最终得分: ' + score + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 3. 奔跑答题 ----------
  EggGames.runner = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var speed = 2;
    var position = 0;
    var animId = null;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'position:relative;width:100%;height:350px;background:linear-gradient(180deg,#87ceeb 0%,#90ee90 70%,#228b22 100%);border-radius:12px;overflow:hidden;';

      var info = createEl('div', '', '得分: <span id="run-score">0</span> | 速度: <span id="run-speed">2</span>');
      info.style.cssText = 'position:absolute;top:8px;left:8px;right:8px;display:flex;justify-content:space-between;font-size:13px;color:#374151;z-index:10;';
      container.appendChild(info);

      // 跑道
      var track = createEl('div', '');
      track.id = 'run-track';
      track.style.cssText = 'position:absolute;bottom:60px;left:0;right:0;height:40px;';
      container.appendChild(track);

      // 终点旗
      var flag = createEl('div', '', '🏁');
      flag.style.cssText = 'position:absolute;right:20px;bottom:80px;font-size:36px;';
      container.appendChild(flag);

      // 角色
      var runner = createEl('div', '', '🏃');
      runner.id = 'runner';
      runner.style.cssText = 'position:absolute;bottom:80px;left:0;font-size:40px;transition:left 0.3s;z-index:5;';
      container.appendChild(runner);

      // 题目框
      var qBox = createEl('div', '', '');
      qBox.id = 'run-question';
      qBox.style.cssText = 'position:absolute;top:40px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.95);padding:12px 16px;border-radius:10px;font-size:14px;max-width:90%;width:360px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'run-options';
      optsBox.style.cssText = 'position:absolute;top:140px;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;gap:6px;width:360px;max-width:90%;z-index:10;';
      container.appendChild(optsBox);

      nextQuestion();
      animate();
    }

    function animate() {
      position += speed * 0.5;
      var runner = document.getElementById('runner');
      if (runner) runner.style.left = position + '%';

      if (position >= 85) {
        // 到达终点
        endGame(true);
        return;
      }

      animId = requestAnimationFrame(animate);
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(false); return; }
      var q = pool[idx];
      document.getElementById('run-question').textContent = q.question.substring(0, 60);

      var optsBox = document.getElementById('run-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key].substring(0, 20));
        btn.style.cssText = 'padding:8px 12px;text-align:left;background:#fff;border:2px solid #e5e7eb;border-radius:8px;cursor:pointer;font-size:13px;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        speed = Math.min(speed + 0.5, 6);
        playCorrectSound();
      } else {
        speed = Math.max(speed - 0.8, 0.5);
        playWrongSound();
      }
      document.getElementById('run-score').textContent = score;
      document.getElementById('run-speed').textContent = speed.toFixed(1);
      idx++;
      setTimeout(nextQuestion, 200);
    }

    function endGame(won) {
      if (animId) cancelAnimationFrame(animId);
      container.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;background:#fff;padding:24px;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.2);"><div style="font-size:32px;margin-bottom:8px;">' + (won ? '🏆 到达终点!' : '⏱ 时间到') + '</div><div style="font-size:18px;font-weight:bold;margin-bottom:8px;">得分: ' + score + '</div><div style="font-size:14px;color:#6b7280;">共答 ' + idx + ' 题</div></div>';
      if (onResult) onResult({ score: score, total: idx, won: won });
    }

    start();
    return { stop: function () { if (animId) cancelAnimationFrame(animId); } };
  };

  // ---------- 4. 射击答题 ----------
  EggGames.shooter = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var bullets = [];
    var targets = [];
    var animId = null;
    var playerX = 50;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'position:relative;width:100%;height:400px;background:linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);border-radius:12px;overflow:hidden;';

      // 星星背景
      for (var s = 0; s < 30; s++) {
        var star = createEl('div', '', '✦');
        star.style.cssText = 'position:absolute;left:' + Math.random() * 100 + '%;top:' + Math.random() * 70 + '%;color:rgba(255,255,255,' + (0.3 + Math.random() * 0.5) + ');font-size:' + (8 + Math.random() * 8) + 'px;';
        container.appendChild(star);
      }

      var info = createEl('div', '', '得分: <span id="shoot-score">0</span> | 第 <span id="shoot-idx">1</span>/' + pool.length);
      info.style.cssText = 'position:absolute;top:8px;left:8px;color:#fff;font-size:13px;z-index:10;';
      container.appendChild(info);

      // 题目
      var qBox = createEl('div', '', '');
      qBox.id = 'shoot-question';
      qBox.style.cssText = 'position:absolute;top:36px;left:50%;transform:translateX(-50%);color:#fff;font-size:13px;text-align:center;max-width:90%;z-index:10;';
      container.appendChild(qBox);

      // 玩家飞船
      var player = createEl('div', '', '🚀');
      player.id = 'shoot-player';
      player.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:32px;z-index:10;';
      container.appendChild(player);

      // 目标区域
      var targetArea = createEl('div', '');
      targetArea.id = 'shoot-targets';
      targetArea.style.cssText = 'position:absolute;top:80px;left:0;right:0;height:120px;';
      container.appendChild(targetArea);

      // 鼠标/触摸控制
      container.addEventListener('mousemove', function (e) {
        var rect = container.getBoundingClientRect();
        playerX = ((e.clientX - rect.left) / rect.width) * 100;
        playerX = Math.max(5, Math.min(95, playerX));
        player.style.left = playerX + '%';
      });

      container.addEventListener('click', function (e) {
        fireBullet();
      });

      nextQuestion();
      animate();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('shoot-question').textContent = q.question.substring(0, 50);
      document.getElementById('shoot-idx').textContent = idx + 1;

      var targetArea = document.getElementById('shoot-targets');
      targetArea.innerHTML = '';
      targets = [];

      var optKeys = shuffle(Object.keys(q.options || {}));
      var correctKey = getCorrectKey(q);

      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var x = 15 + (i * 70 / Math.max(optKeys.length - 1, 1));
        var target = {
          key: key,
          x: x,
          y: 20 + Math.random() * 40,
          text: key + '. ' + q.options[key].substring(0, 10),
          isCorrect: key === correctKey,
          hit: false
        };
        targets.push(target);

        var el = createEl('div', 'shoot-target', target.text);
        el.dataset.key = key;
        el.style.cssText = 'position:absolute;left:' + x + '%;top:' + target.y + 'px;transform:translateX(-50%);background:rgba(255,255,255,0.9);color:#1f2937;padding:6px 10px;border-radius:8px;font-size:11px;white-space:nowrap;';
        targetArea.appendChild(el);
      }
    }

    function fireBullet() {
      bullets.push({ x: playerX, y: 85, active: true });
      playTone(800, 0.05, 'square');
    }

    function animate() {
      // 更新子弹
      var bulletEls = container.querySelectorAll('.bullet');
      for (var b = 0; b < bulletEls.length; b++) bulletEls[b].remove();

      for (var i = bullets.length - 1; i >= 0; i--) {
        var bullet = bullets[i];
        if (!bullet.active) { bullets.splice(i, 1); continue; }
        bullet.y -= 2;

        if (bullet.y < 20) {
          bullet.active = false;
          continue;
        }

        // 检测碰撞
        for (var t = 0; t < targets.length; t++) {
          var target = targets[t];
          if (target.hit) continue;
          if (Math.abs(bullet.x - target.x) < 8 && bullet.y < target.y + 30 && bullet.y > target.y) {
            target.hit = true;
            bullet.active = false;
            handleHit(target);
            break;
          }
        }

        if (bullet.active) {
          var bEl = createEl('div', 'bullet', '');
          bEl.style.cssText = 'position:absolute;left:' + bullet.x + '%;top:' + bullet.y + '%;width:4px;height:16px;background:#fbbf24;border-radius:2px;transform:translateX(-50%);box-shadow:0 0 8px #fbbf24;';
          container.appendChild(bEl);
        }
      }

      animId = requestAnimationFrame(animate);
    }

    function handleHit(target) {
      // 隐藏被击中的目标
      var targetEls = document.querySelectorAll('.shoot-target');
      for (var i = 0; i < targetEls.length; i++) {
        if (targetEls[i].dataset.key === target.key) {
          targetEls[i].style.opacity = '0.3';
          targetEls[i].style.transform = 'translateX(-50%) scale(0.8)';
        }
      }

      if (target.isCorrect) {
        score++;
        document.getElementById('shoot-score').textContent = score;
        playCorrectSound();
        idx++;
        setTimeout(nextQuestion, 600);
      } else {
        playWrongSound();
      }
    }

    function endGame() {
      if (animId) cancelAnimationFrame(animId);
      container.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;text-align:center;"><div style="font-size:32px;margin-bottom:8px;">🎮</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (animId) cancelAnimationFrame(animId); } };
  };

  // ---------- 5. 拼图答题 ----------
  EggGames.puzzle = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#f8fafc;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '得分: <strong id="pz-score">0</strong> | 第 <span id="pz-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var qBox = createEl('div', '', '');
      qBox.id = 'pz-question';
      qBox.style.cssText = 'background:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:12px;border:2px solid #e5e7eb;';
      container.appendChild(qBox);

      // 答案区（目标槽位）
      var dropZone = createEl('div', '', '将正确答案拖到这里');
      dropZone.id = 'pz-dropzone';
      dropZone.style.cssText = 'border:3px dashed #94a3b8;border-radius:12px;padding:20px;text-align:center;color:#94a3b8;font-size:14px;margin-bottom:12px;min-height:50px;transition:all 0.3s;';
      container.appendChild(dropZone);

      // 选项区（可拖拽）
      var optsBox = createEl('div', '');
      optsBox.id = 'pz-options';
      optsBox.style.cssText = 'display:flex;flex-wrap:wrap;gap:8px;justify-content:center;';
      container.appendChild(optsBox);

      nextQuestion();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('pz-question').textContent = q.question;
      document.getElementById('pz-idx').textContent = idx + 1;

      var dropZone = document.getElementById('pz-dropzone');
      dropZone.textContent = '将正确答案拖到这里';
      dropZone.style.background = '';
      dropZone.style.borderColor = '#94a3b8';

      var optsBox = document.getElementById('pz-options');
      optsBox.innerHTML = '';
      var optKeys = shuffle(Object.keys(q.options || {}));

      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var piece = createEl('div', '', key + '. ' + q.options[key]);
        piece.draggable = true;
        piece.dataset.key = key;
        piece.style.cssText = 'padding:10px 16px;background:#3b82f6;color:#fff;border-radius:8px;cursor:grab;font-size:13px;user-select:none;';
        piece.addEventListener('dragstart', function (e) {
          e.dataTransfer.setData('key', this.dataset.key);
          this.style.opacity = '0.5';
        });
        piece.addEventListener('dragend', function () {
          this.style.opacity = '1';
        });
        optsBox.appendChild(piece);
      }

      dropZone.ondragover = function (e) {
        e.preventDefault();
        this.style.borderColor = '#3b82f6';
        this.style.background = '#eff6ff';
      };
      dropZone.ondragleave = function () {
        this.style.borderColor = '#94a3b8';
        this.style.background = '';
      };
      dropZone.ondrop = function (e) {
        e.preventDefault();
        var key = e.dataTransfer.getData('key');
        checkAnswer(key);
      };
    }

    function checkAnswer(key) {
      var q = pool[idx];
      var dropZone = document.getElementById('pz-dropzone');
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('pz-score').textContent = score;
        dropZone.textContent = '✓ 回答正确!';
        dropZone.style.borderColor = '#10b981';
        dropZone.style.background = '#ecfdf5';
        dropZone.style.color = '#10b981';
        playCorrectSound();
      } else {
        dropZone.textContent = '✗ 回答错误';
        dropZone.style.borderColor = '#ef4444';
        dropZone.style.background = '#fef2f2';
        dropZone.style.color = '#ef4444';
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 800);
    }

    function endGame() {
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🧩</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 6. 钢琴答题 ----------
  EggGames.piano = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var noteMap = { 'A': 261.63, 'B': 293.66, 'C': 329.63, 'D': 392.00 }; // C D E G

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#1a1a1a;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '得分: <strong id="piano-score" style="color:#fff;">0</strong> | 第 <span id="piano-idx" style="color:#fff;">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var qBox = createEl('div', '', '');
      qBox.id = 'piano-question';
      qBox.style.cssText = 'background:#2d2d2d;color:#fff;padding:14px;border-radius:8px;font-size:14px;margin-bottom:16px;min-height:50px;';
      container.appendChild(qBox);

      // 钢琴键
      var piano = createEl('div', '');
      piano.id = 'piano-keys';
      piano.style.cssText = 'display:flex;justify-content:center;gap:4px;height:140px;';
      container.appendChild(piano);

      nextQuestion();
    }

    function playNote(freq, duration) {
      playTone(freq, duration || 0.3, 'sine');
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('piano-question').textContent = q.question;
      document.getElementById('piano-idx').textContent = idx + 1;

      var piano = document.getElementById('piano-keys');
      piano.innerHTML = '';
      var optKeys = Object.keys(q.options || {});

      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var keyEl = createEl('div', '');
        keyEl.style.cssText = 'flex:1;max-width:70px;background:#fff;border-radius:0 0 6px 6px;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;padding-bottom:10px;font-size:12px;color:#333;transition:all 0.1s;box-shadow:0 4px 0 #999;';
        keyEl.innerHTML = '<div style="font-weight:bold;font-size:18px;">' + key + '</div><div style="font-size:10px;color:#666;margin-top:4px;">' + (q.options[key] || '').substring(0, 8) + '</div>';

        (function (k, freq) {
          keyEl.addEventListener('mousedown', function () {
            this.style.background = '#e0e0e0';
            this.style.transform = 'translateY(2px)';
            this.style.boxShadow = '0 2px 0 #999';
            playNote(freq);
          });
          keyEl.addEventListener('mouseup', function () {
            this.style.background = '#fff';
            this.style.transform = '';
            this.style.boxShadow = '0 4px 0 #999';
          });
          keyEl.addEventListener('mouseleave', function () {
            this.style.background = '#fff';
            this.style.transform = '';
            this.style.boxShadow = '0 4px 0 #999';
          });
          keyEl.addEventListener('click', function () {
            checkAnswer(k);
          });
        })(key, noteMap[key] || 300);

        piano.appendChild(keyEl);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('piano-score').textContent = score;
        // 播放胜利旋律
        var notes = [523, 659, 784, 1047];
        for (var i = 0; i < notes.length; i++) {
          (function (n, t) {
            setTimeout(function () { playTone(n, 0.15); }, t);
          })(notes[i], i * 100);
        }
      } else {
        playTone(150, 0.3, 'sawtooth');
      }
      idx++;
      setTimeout(nextQuestion, 600);
    }

    function endGame() {
      container.innerHTML = '<div style="color:#fff;text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🎹</div><div style="font-size:20px;font-weight:bold;">演奏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 7. 迷宫答题 ----------
  EggGames.maze = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var playerPos = { x: 0, y: 0 };
    var mazeSize = 7;
    var maze = [];

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#f8fafc;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '得分: <strong id="maze-score">0</strong> | 走出迷宫!');
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var mazeBox = createEl('div', '');
      mazeBox.id = 'maze-grid';
      mazeBox.style.cssText = 'display:grid;grid-template-columns:repeat(' + mazeSize + ',1fr);gap:2px;background:#333;padding:4px;border-radius:8px;margin-bottom:12px;';
      container.appendChild(mazeBox);

      var qBox = createEl('div', '', '');
      qBox.id = 'maze-question';
      qBox.style.cssText = 'background:#fff;padding:10px;border-radius:8px;font-size:13px;margin-bottom:8px;border:2px solid #e5e7eb;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'maze-options';
      optsBox.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
      container.appendChild(optsBox);

      generateMaze();
      renderMaze();
      nextQuestion();
    }

    function generateMaze() {
      maze = [];
      for (var y = 0; y < mazeSize; y++) {
        var row = [];
        for (var x = 0; x < mazeSize; x++) {
          row.push(1); // 1=墙, 0=通路
        }
        maze.push(row);
      }
      // 简单迷宫：打通一条从左上到右下的路径
      var x = 0, y = 0;
      maze[0][0] = 0;
      while (x < mazeSize - 1 || y < mazeSize - 1) {
        if (x < mazeSize - 1 && y < mazeSize - 1) {
          if (Math.random() > 0.5) x++; else y++;
        } else if (x < mazeSize - 1) {
          x++;
        } else {
          y++;
        }
        maze[y][x] = 0;
      }
      // 再加一些随机通路
      for (var i = 0; i < mazeSize * 2; i++) {
        var rx = Math.floor(Math.random() * mazeSize);
        var ry = Math.floor(Math.random() * mazeSize);
        maze[ry][rx] = 0;
      }
      maze[0][0] = 0;
      maze[mazeSize - 1][mazeSize - 1] = 2; // 终点
      playerPos = { x: 0, y: 0 };
    }

    function renderMaze() {
      var grid = document.getElementById('maze-grid');
      grid.innerHTML = '';
      for (var y = 0; y < mazeSize; y++) {
        for (var x = 0; x < mazeSize; x++) {
          var cell = createEl('div', '');
          cell.style.cssText = 'aspect-ratio:1;border-radius:2px;';
          if (x === playerPos.x && y === playerPos.y) {
            cell.style.background = '#3b82f6';
            cell.textContent = '😊';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '16px';
          } else if (maze[y][x] === 1) {
            cell.style.background = '#374151';
          } else if (maze[y][x] === 2) {
            cell.style.background = '#fbbf24';
            cell.textContent = '🏁';
            cell.style.display = 'flex';
            cell.style.alignItems = 'center';
            cell.style.justifyContent = 'center';
            cell.style.fontSize = '14px';
          } else {
            cell.style.background = '#e5e7eb';
          }
          grid.appendChild(cell);
        }
      }
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(false); return; }
      var q = pool[idx];
      document.getElementById('maze-question').textContent = q.question;

      var optsBox = document.getElementById('maze-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key].substring(0, 15));
        btn.style.cssText = 'padding:6px 10px;font-size:12px;background:#fff;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('maze-score').textContent = score;
        playCorrectSound();
        // 移动玩家向终点方向
        movePlayer();
      } else {
        playWrongSound();
        // 走错路，可能倒退
        if (Math.random() > 0.5 && playerPos.x > 0) playerPos.x--;
        else if (playerPos.y > 0) playerPos.y--;
      }
      renderMaze();
      idx++;

      if (playerPos.x >= mazeSize - 1 && playerPos.y >= mazeSize - 1) {
        setTimeout(function () { endGame(true); }, 500);
      } else {
        setTimeout(nextQuestion, 400);
      }
    }

    function movePlayer() {
      // 朝终点方向移动
      if (playerPos.x < mazeSize - 1 && maze[playerPos.y][playerPos.x + 1] !== 1) {
        playerPos.x++;
      } else if (playerPos.y < mazeSize - 1 && maze[playerPos.y + 1][playerPos.x] !== 1) {
        playerPos.y++;
      }
      // 检查是否到达终点
      if (maze[playerPos.y][playerPos.x] === 2) {
        maze[playerPos.y][playerPos.x] = 0;
      }
    }

    function endGame(won) {
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">' + (won ? '🏆 走出迷宫!' : '🌀') + '</div><div style="font-size:20px;font-weight:bold;">' + (won ? '恭喜通关' : '游戏结束') + '</div><div style="margin-top:8px;">得分: ' + score + '</div></div>';
      if (onResult) onResult({ score: score, total: idx, won: won });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 8. 钓鱼答题 ----------
  EggGames.fishing = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var fishList = [];
    var animId = null;
    var hookY = 30;
    var hookDir = 1;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'position:relative;width:100%;height:380px;background:linear-gradient(180deg,#87ceeb 0%,#4a90d9 30%,#1e5799 100%);border-radius:12px;overflow:hidden;';

      var info = createEl('div', '', '🐟 得分: <span id="fish-score">0</span>');
      info.style.cssText = 'position:absolute;top:8px;left:8px;color:#fff;font-size:14px;z-index:10;';
      container.appendChild(info);

      // 鱼竿
      var rod = createEl('div', '', '🎣');
      rod.style.cssText = 'position:absolute;top:0;left:50%;transform:translateX(-50%);font-size:36px;z-index:5;';
      container.appendChild(rod);

      // 鱼钩
      var hook = createEl('div', '', '🪝');
      hook.id = 'fish-hook';
      hook.style.cssText = 'position:absolute;top:' + hookY + '%;left:50%;transform:translateX(-50%);font-size:24px;z-index:5;';
      container.appendChild(hook);

      // 鱼群区域
      var fishArea = createEl('div', '');
      fishArea.id = 'fish-area';
      fishArea.style.cssText = 'position:absolute;top:50%;left:0;right:0;bottom:0;';
      container.appendChild(fishArea);

      // 题目
      var qBox = createEl('div', '', '');
      qBox.id = 'fish-question';
      qBox.style.cssText = 'position:absolute;bottom:10px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.95);padding:8px 14px;border-radius:8px;font-size:13px;max-width:90%;text-align:center;z-index:10;';
      container.appendChild(qBox);

      container.addEventListener('click', function () {
        tryCatchFish();
      });

      nextQuestion();
      animate();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('fish-question').textContent = q.question.substring(0, 40);

      var fishArea = document.getElementById('fish-area');
      fishArea.innerHTML = '';
      fishList = [];
      var optKeys = shuffle(Object.keys(q.options || {}));
      var correctKey = getCorrectKey(q);

      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var fish = {
          key: key,
          x: Math.random() * 80 + 10,
          y: 10 + Math.random() * 60,
          speed: (0.2 + Math.random() * 0.3) * (Math.random() > 0.5 ? 1 : -1),
          isCorrect: key === correctKey,
          text: key,
          emoji: ['🐟', '🐠', '🐡', '🦈'][i % 4]
        };
        fishList.push(fish);

        var fishEl = createEl('div', 'fish', fish.emoji + ' ' + fish.text);
        fishEl.dataset.key = key;
        fishEl.style.cssText = 'position:absolute;left:' + fish.x + '%;top:' + fish.y + '%;font-size:24px;cursor:pointer;white-space:nowrap;';
        fishArea.appendChild(fishEl);
      }
    }

    function animate() {
      // 鱼钩上下移动
      hookY += hookDir * 0.3;
      if (hookY > 60) hookDir = -1;
      if (hookY < 20) hookDir = 1;
      var hookEl = document.getElementById('fish-hook');
      if (hookEl) hookEl.style.top = hookY + '%';

      // 鱼游动
      var fishEls = document.querySelectorAll('.fish');
      for (var i = 0; i < fishList.length; i++) {
        var fish = fishList[i];
        if (fish.caught) continue;
        fish.x += fish.speed * 0.3;
        if (fish.x > 90 || fish.x < 5) fish.speed *= -1;
        if (fishEls[i]) {
          fishEls[i].style.left = fish.x + '%';
          fishEls[i].style.transform = fish.speed > 0 ? 'scaleX(1)' : 'scaleX(-1)';
        }
      }

      animId = requestAnimationFrame(animate);
    }

    function tryCatchFish() {
      // 找最靠近鱼钩的鱼
      var caught = null;
      for (var i = 0; i < fishList.length; i++) {
        var fish = fishList[i];
        if (fish.caught) continue;
        var fishY = 50 + fish.y * 0.5; // 鱼在水下
        if (Math.abs(fish.x - 50) < 12 && Math.abs(hookY - fishY) < 15) {
          caught = fish;
          break;
        }
      }

      if (caught) {
        caught.caught = true;
        var fishEls = document.querySelectorAll('.fish');
        for (var j = 0; j < fishEls.length; j++) {
          if (fishEls[j].dataset.key === caught.key) {
            fishEls[j].style.top = '-20%';
            fishEls[j].style.transition = 'top 0.5s';
          }
        }

        if (caught.isCorrect) {
          score++;
          document.getElementById('fish-score').textContent = score;
          playCorrectSound();
        } else {
          playWrongSound();
        }
        idx++;
        setTimeout(nextQuestion, 700);
      }
    }

    function endGame() {
      if (animId) cancelAnimationFrame(animId);
      container.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;text-align:center;"><div style="font-size:32px;margin-bottom:8px;">🎣</div><div style="font-size:20px;font-weight:bold;">钓鱼结束</div><div style="margin-top:8px;">钓到: ' + score + ' 条</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (animId) cancelAnimationFrame(animId); } };
  };

  // ---------- 9. 种菜答题 ----------
  EggGames.farming = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var plants = [];
    var maxPlants = 6;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:linear-gradient(180deg,#87ceeb 0%,#90ee90 70%,#8b4513 100%);border-radius:12px;padding:16px;';

      var header = createEl('div', '', '🌱 得分: <strong id="farm-score">0</strong> | 第 <span id="farm-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      // 菜地
      var farm = createEl('div', '');
      farm.id = 'farm-plots';
      farm.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:12px;';
      container.appendChild(farm);

      var qBox = createEl('div', '', '');
      qBox.id = 'farm-question';
      qBox.style.cssText = 'background:#fff;padding:10px;border-radius:8px;font-size:13px;margin-bottom:8px;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'farm-options';
      optsBox.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;';
      container.appendChild(optsBox);

      initPlots();
      nextQuestion();
    }

    function initPlots() {
      var farm = document.getElementById('farm-plots');
      farm.innerHTML = '';
      plants = [];
      for (var i = 0; i < maxPlants; i++) {
        plants.push({ stage: 0, withered: false });
        var plot = createEl('div', '', '🟫');
        plot.id = 'plot-' + i;
        plot.style.cssText = 'aspect-ratio:1;background:#8b4513;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:28px;';
        farm.appendChild(plot);
      }
    }

    function updatePlots() {
      for (var i = 0; i < plants.length; i++) {
        var plot = document.getElementById('plot-' + i);
        if (!plot) continue;
        var p = plants[i];
        if (p.withered) {
          plot.textContent = '🥀';
        } else if (p.stage === 0) {
          plot.textContent = '🟫';
        } else if (p.stage === 1) {
          plot.textContent = '🌱';
        } else if (p.stage === 2) {
          plot.textContent = '🌿';
        } else if (p.stage === 3) {
          plot.textContent = '🌻';
        } else {
          plot.textContent = '🌳';
        }
      }
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('farm-question').textContent = q.question;
      document.getElementById('farm-idx').textContent = idx + 1;

      var optsBox = document.getElementById('farm-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key].substring(0, 15));
        btn.style.cssText = 'padding:8px 12px;font-size:12px;background:#fff;border:1px solid #d1d5db;border-radius:6px;cursor:pointer;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('farm-score').textContent = score;
        playCorrectSound();
        // 种一棵新的或让一棵成长
        var emptyIdx = -1;
        var growIdx = -1;
        for (var i = 0; i < plants.length; i++) {
          if (plants[i].stage === 0 && !plants[i].withered && emptyIdx === -1) emptyIdx = i;
          if (plants[i].stage > 0 && plants[i].stage < 4 && !plants[i].withered) growIdx = i;
        }
        if (emptyIdx !== -1) {
          plants[emptyIdx].stage = 1;
        } else if (growIdx !== -1) {
          plants[growIdx].stage++;
        }
      } else {
        playWrongSound();
        // 让一棵枯萎
        for (var j = 0; j < plants.length; j++) {
          if (plants[j].stage > 0 && !plants[j].withered) {
            plants[j].withered = true;
            break;
          }
        }
      }
      updatePlots();
      idx++;
      setTimeout(nextQuestion, 400);
    }

    function endGame() {
      var harvest = 0;
      for (var i = 0; i < plants.length; i++) {
        if (!plants[i].withered && plants[i].stage >= 3) harvest++;
      }
      container.innerHTML = '<div style="text-align:center;padding:30px;"><div style="font-size:32px;margin-bottom:8px;">🌾</div><div style="font-size:20px;font-weight:bold;">收获季节</div><div style="margin-top:8px;">收获了 ' + harvest + ' 株成熟植物</div><div style="margin-top:4px;">答题得分: ' + score + '</div></div>';
      if (onResult) onResult({ score: score, harvest: harvest, total: pool.length });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 10. 打怪答题 ----------
  EggGames.monster = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var playerHP = 100;
    var monsterHP = 100;
    var monsterMaxHP = 100;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:linear-gradient(180deg,#2c1810 0%,#4a2c1a 100%);border-radius:12px;padding:16px;color:#fff;';

      // 怪物
      var monsterBox = createEl('div', '');
      monsterBox.style.cssText = 'text-align:center;margin-bottom:16px;';
      var monsterEmoji = createEl('div', '', '👹');
      monsterEmoji.id = 'monster-emoji';
      monsterEmoji.style.cssText = 'font-size:64px;transition:transform 0.2s;';
      monsterBox.appendChild(monsterEmoji);

      var mHPBar = createEl('div', '');
      mHPBar.style.cssText = 'background:#333;border-radius:10px;height:16px;overflow:hidden;margin:8px auto;max-width:200px;';
      var mHPFill = createEl('div', '');
      mHPFill.id = 'monster-hp';
      mHPFill.style.cssText = 'height:100%;background:linear-gradient(90deg,#ef4444,#f87171);width:100%;transition:width 0.3s;';
      mHPBar.appendChild(mHPFill);
      monsterBox.appendChild(mHPBar);

      var mHPText = createEl('div', '', '怪物: 100/100');
      mHPText.id = 'monster-hp-text';
      mHPText.style.cssText = 'font-size:12px;color:#fca5a5;';
      monsterBox.appendChild(mHPText);

      container.appendChild(monsterBox);

      // VS
      var vs = createEl('div', '', '⚔️ VS ⚔️');
      vs.style.cssText = 'text-align:center;font-size:18px;margin:8px 0;';
      container.appendChild(vs);

      // 玩家
      var playerBox = createEl('div', '');
      playerBox.style.cssText = 'text-align:center;margin-bottom:12px;';
      var playerEmoji = createEl('div', '', '🦸');
      playerEmoji.id = 'player-emoji';
      playerEmoji.style.cssText = 'font-size:48px;transition:transform 0.2s;';
      playerBox.appendChild(playerEmoji);

      var pHPBar = createEl('div', '');
      pHPBar.style.cssText = 'background:#333;border-radius:10px;height:14px;overflow:hidden;margin:6px auto;max-width:180px;';
      var pHPFill = createEl('div', '');
      pHPFill.id = 'player-hp';
      pHPFill.style.cssText = 'height:100%;background:linear-gradient(90deg,#10b981,#34d399);width:100%;transition:width 0.3s;';
      pHPBar.appendChild(pHPFill);
      playerBox.appendChild(pHPBar);

      var pHPText = createEl('div', '', '勇者: 100/100');
      pHPText.id = 'player-hp-text';
      pHPText.style.cssText = 'font-size:12px;color:#6ee7b7;';
      playerBox.appendChild(pHPText);

      container.appendChild(playerBox);

      // 题目
      var qBox = createEl('div', '', '');
      qBox.id = 'monster-question';
      qBox.style.cssText = 'background:rgba(0,0,0,0.4);padding:10px;border-radius:8px;font-size:13px;margin-bottom:8px;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'monster-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:6px;';
      container.appendChild(optsBox);

      nextQuestion();
    }

    function nextQuestion() {
      if (monsterHP <= 0) { endGame(true); return; }
      if (playerHP <= 0) { endGame(false); return; }
      if (idx >= pool.length) { endGame(monsterHP <= 0); return; }

      var q = pool[idx];
      document.getElementById('monster-question').textContent = q.question;

      var optsBox = document.getElementById('monster-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key].substring(0, 20));
        btn.style.cssText = 'padding:8px 12px;text-align:left;background:rgba(255,255,255,0.1);color:#fff;border:1px solid rgba(255,255,255,0.2);border-radius:6px;cursor:pointer;font-size:13px;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      var monsterEl = document.getElementById('monster-emoji');
      var playerEl = document.getElementById('player-emoji');

      if (isCorrect(q, key)) {
        score++;
        var damage = 15 + Math.floor(Math.random() * 10);
        monsterHP = Math.max(0, monsterHP - damage);
        playCorrectSound();
        // 攻击动画
        monsterEl.style.transform = 'translateX(10px)';
        setTimeout(function () { monsterEl.style.transform = ''; }, 200);
      } else {
        var dmg = 10 + Math.floor(Math.random() * 8);
        playerHP = Math.max(0, playerHP - dmg);
        playWrongSound();
        playerEl.style.transform = 'translateX(-10px)';
        setTimeout(function () { playerEl.style.transform = ''; }, 200);
      }

      updateHP();
      idx++;
      setTimeout(nextQuestion, 500);
    }

    function updateHP() {
      document.getElementById('monster-hp').style.width = (monsterHP / monsterMaxHP * 100) + '%';
      document.getElementById('monster-hp-text').textContent = '怪物: ' + monsterHP + '/' + monsterMaxHP;
      document.getElementById('player-hp').style.width = playerHP + '%';
      document.getElementById('player-hp-text').textContent = '勇者: ' + playerHP + '/100';
    }

    function endGame(won) {
      container.innerHTML = '<div style="text-align:center;padding:40px;color:#fff;"><div style="font-size:48px;margin-bottom:8px;">' + (won ? '🏆' : '💀') + '</div><div style="font-size:22px;font-weight:bold;">' + (won ? '胜利! 怪物被击败!' : '失败... 再接再厉') + '</div><div style="margin-top:12px;">答对: ' + score + ' 题</div></div>';
      if (onResult) onResult({ score: score, total: idx, won: won });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 11. 星际穿越 ----------
  EggGames.space = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var animId = null;
    var stars = [];

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'position:relative;width:100%;height:380px;background:#0a0a1a;border-radius:12px;overflow:hidden;';

      // 星星背景
      for (var s = 0; s < 50; s++) {
        var star = createEl('div', '', '');
        star.className = 'space-star';
        var size = 1 + Math.random() * 2;
        star.style.cssText = 'position:absolute;width:' + size + 'px;height:' + size + 'px;background:#fff;border-radius:50%;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;';
        stars.push({ el: star, speed: 0.1 + Math.random() * 0.3 });
        container.appendChild(star);
      }

      var info = createEl('div', '', '🚀 得分: <span id="space-score">0</span>');
      info.style.cssText = 'position:absolute;top:10px;left:10px;color:#fff;font-size:14px;z-index:10;';
      container.appendChild(info);

      // 飞船
      var ship = createEl('div', '', '🚀');
      ship.style.cssText = 'position:absolute;bottom:20px;left:50%;transform:translateX(-50%);font-size:36px;z-index:5;';
      container.appendChild(ship);

      // 题目
      var qBox = createEl('div', '', '');
      qBox.id = 'space-question';
      qBox.style.cssText = 'position:absolute;top:40px;left:50%;transform:translateX(-50%);color:#fff;font-size:13px;text-align:center;max-width:90%;z-index:10;background:rgba(0,0,0,0.5);padding:8px 12px;border-radius:8px;';
      container.appendChild(qBox);

      // 星球选项
      var planets = createEl('div', '');
      planets.id = 'space-planets';
      planets.style.cssText = 'position:absolute;top:100px;left:0;right:0;height:140px;';
      container.appendChild(planets);

      nextQuestion();
      animate();
    }

    function animate() {
      // 星星流动
      var starEls = container.querySelectorAll('.space-star');
      for (var i = 0; i < starEls.length; i++) {
        var s = stars[i];
        if (!s) continue;
        var top = parseFloat(starEls[i].style.top);
        top += s.speed;
        if (top > 100) {
          top = 0;
          starEls[i].style.left = Math.random() * 100 + '%';
        }
        starEls[i].style.top = top + '%';
      }

      // 星球旋转效果
      var planetEls = container.querySelectorAll('.planet');
      for (var j = 0; j < planetEls.length; j++) {
        var rot = parseFloat(planetEls[j].dataset.rot || '0') + 0.3;
        planetEls[j].dataset.rot = rot;
        planetEls[j].style.transform = 'translateX(-50%) rotate(' + rot + 'deg)';
      }

      animId = requestAnimationFrame(animate);
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('space-question').textContent = q.question.substring(0, 45);

      var planetsBox = document.getElementById('space-planets');
      planetsBox.innerHTML = '';
      var optKeys = shuffle(Object.keys(q.options || {}));
      var planetEmojis = ['🪐', '🌍', '🌙', '☀️', '⭐', '🌕'];
      var correctKey = getCorrectKey(q);

      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var x = 20 + (i * 60 / Math.max(optKeys.length - 1, 1));
        var planet = createEl('div', 'planet', planetEmojis[i % planetEmojis.length] + '<br><span style="font-size:10px;">' + key + '</span>');
        planet.dataset.key = key;
        planet.dataset.rot = Math.random() * 360;
        planet.style.cssText = 'position:absolute;left:' + x + '%;top:' + (20 + Math.random() * 40) + 'px;transform:translateX(-50%);font-size:36px;cursor:pointer;text-align:center;line-height:1;';
        (function (k) {
          planet.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        planetsBox.appendChild(planet);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('space-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 500);
    }

    function endGame() {
      if (animId) cancelAnimationFrame(animId);
      container.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;text-align:center;"><div style="font-size:36px;margin-bottom:8px;">🌌</div><div style="font-size:20px;font-weight:bold;">穿越完成</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (animId) cancelAnimationFrame(animId); } };
  };

  // ---------- 12. 打字机模式 ----------
  EggGames.typewriter = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var typingTimer = null;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#f5f0e1;border-radius:12px;padding:20px;font-family:"Courier New",monospace;';

      var header = createEl('div', '', '得分: <strong id="tw-score">0</strong> | 第 <span id="tw-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;color:#5d4e37;';
      container.appendChild(header);

      // 打字机纸张
      var paper = createEl('div', '');
      paper.style.cssText = 'background:#fffbe8;border:1px solid #d4c5a0;border-radius:4px;padding:20px;box-shadow:2px 2px 8px rgba(0,0,0,0.1);min-height:120px;position:relative;';

      var qText = createEl('div', '');
      qText.id = 'tw-question';
      qText.style.cssText = 'font-size:15px;line-height:1.7;color:#333;min-height:60px;';
      paper.appendChild(qText);

      var cursor = createEl('span', '', '█');
      cursor.id = 'tw-cursor';
      cursor.style.cssText = 'animation:blink 1s infinite;';
      paper.appendChild(cursor);

      container.appendChild(paper);

      var optsBox = createEl('div', '');
      optsBox.id = 'tw-options';
      optsBox.style.cssText = 'margin-top:16px;display:flex;flex-direction:column;gap:8px;';
      container.appendChild(optsBox);

      // 添加闪烁动画
      var style = createEl('style', '', '@keyframes blink{0%,50%{opacity:1;}51%,100%{opacity:0;}}');
      document.head.appendChild(style);

      nextQuestion();
    }

    function typeText(text, element, callback) {
      var i = 0;
      element.textContent = '';
      if (typingTimer) clearInterval(typingTimer);

      typingTimer = setInterval(function () {
        if (i < text.length) {
          element.textContent += text.charAt(i);
          // 打字机音效
          if (i % 3 === 0) playTone(800 + Math.random() * 200, 0.02, 'square');
          i++;
        } else {
          clearInterval(typingTimer);
          typingTimer = null;
          if (callback) callback();
        }
      }, 30);
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('tw-idx').textContent = idx + 1;

      var optsBox = document.getElementById('tw-options');
      optsBox.innerHTML = '';

      typeText(q.question, document.getElementById('tw-question'), function () {
        // 显示选项
        var optKeys = Object.keys(q.options || {});
        for (var i = 0; i < optKeys.length; i++) {
          var key = optKeys[i];
          var btn = createEl('button', '', key + ') ' + q.options[key]);
          btn.style.cssText = 'padding:8px 14px;text-align:left;background:#fffbe8;border:1px solid #d4c5a0;border-radius:4px;cursor:pointer;font-family:Courier New,monospace;font-size:13px;color:#5d4e37;';
          (function (k) {
            btn.addEventListener('click', function () { checkAnswer(k); });
          })(key);
          optsBox.appendChild(btn);
        }
      });
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (typingTimer) {
        clearInterval(typingTimer);
        typingTimer = null;
      }
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('tw-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 500);
    }

    function endGame() {
      if (typingTimer) clearInterval(typingTimer);
      container.innerHTML = '<div style="text-align:center;padding:40px;font-family:Courier New,monospace;"><div style="font-size:32px;margin-bottom:8px;">📜</div><div style="font-size:20px;font-weight:bold;">完稿</div><div style="margin-top:8px;">最终得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (typingTimer) clearInterval(typingTimer); } };
  };

  // ---------- 13. 隐身模式 ----------
  EggGames.invisible = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var fadeTimer = null;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#1a1a2e;border-radius:12px;padding:16px;color:#fff;';

      var header = createEl('div', '', '👻 得分: <strong id="inv-score">0</strong> | 第 <span id="inv-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var qBox = createEl('div', '', '');
      qBox.id = 'inv-question';
      qBox.style.cssText = 'background:#2d2d44;padding:14px;border-radius:8px;font-size:14px;margin-bottom:12px;min-height:50px;transition:opacity 0.5s;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'inv-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      container.appendChild(optsBox);

      nextQuestion();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('inv-idx').textContent = idx + 1;

      var qBox = document.getElementById('inv-question');
      qBox.style.opacity = '1';
      qBox.textContent = q.question;

      var optsBox = document.getElementById('inv-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.dataset.key = key;
        btn.style.cssText = 'padding:10px 14px;text-align:left;background:#3d3d5c;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;transition:opacity 2s linear;opacity:1;';
        (function (k, el) {
          el.addEventListener('click', function () { checkAnswer(k); });
        })(key, btn);
        optsBox.appendChild(btn);
      }

      // 启动逐渐消失
      if (fadeTimer) clearTimeout(fadeTimer);
      setTimeout(function () {
        var btns = optsBox.querySelectorAll('button');
        for (var j = 0; j < btns.length; j++) {
          btns[j].style.opacity = '0.1';
        }
      }, 1000);
    }

    function checkAnswer(key) {
      if (fadeTimer) clearTimeout(fadeTimer);
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('inv-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 400);
    }

    function endGame() {
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">👻</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (fadeTimer) clearTimeout(fadeTimer); } };
  };

  // ---------- 14. 镜像模式 ----------
  EggGames.mirror = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:linear-gradient(135deg,#667eea,#764ba2);border-radius:12px;padding:16px;color:#fff;';

      var header = createEl('div', '', '🪞 得分: <strong id="mir-score">0</strong> | 第 <span id="mir-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var mirrorBox = createEl('div', '');
      mirrorBox.style.cssText = 'background:rgba(255,255,255,0.1);border-radius:10px;padding:16px;transform:scaleX(-1);';

      var qBox = createEl('div', '', '');
      qBox.id = 'mir-question';
      qBox.style.cssText = 'font-size:15px;margin-bottom:12px;line-height:1.6;';
      mirrorBox.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'mir-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      mirrorBox.appendChild(optsBox);

      container.appendChild(mirrorBox);

      nextQuestion();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('mir-idx').textContent = idx + 1;
      document.getElementById('mir-question').textContent = q.question;

      var optsBox = document.getElementById('mir-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.style.cssText = 'padding:10px 14px;text-align:left;background:rgba(255,255,255,0.2);color:#fff;border:1px solid rgba(255,255,255,0.3);border-radius:8px;cursor:pointer;font-size:13px;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('mir-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 400);
    }

    function endGame() {
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🪞</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 15. 色盲模式 ----------
  EggGames.colorblind = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#f8fafc;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '🎨 得分: <strong id="cb-score">0</strong> | 第 <span id="cb-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var qBox = createEl('div', '', '');
      qBox.id = 'cb-question';
      qBox.style.cssText = 'background:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:12px;border:2px solid #e5e7eb;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'cb-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      container.appendChild(optsBox);

      nextQuestion();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('cb-idx').textContent = idx + 1;
      document.getElementById('cb-question').textContent = q.question;

      var optsBox = document.getElementById('cb-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});

      // 生成相近的颜色
      var baseHue = Math.random() * 360;
      var colors = [];
      for (var i = 0; i < optKeys.length; i++) {
        var hue = baseHue + (i * 15) - (optKeys.length * 7);
        colors.push('hsl(' + hue + ', 40%, 55%)');
      }
      colors = shuffle(colors);

      for (var j = 0; j < optKeys.length; j++) {
        var key = optKeys[j];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.style.cssText = 'padding:12px 16px;text-align:left;background:' + colors[j] + ';color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;text-shadow:0 1px 2px rgba(0,0,0,0.3);';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('cb-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 400);
    }

    function endGame() {
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🎨</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 16. 震动模式 ----------
  EggGames.shake = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var shakeTimer = null;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#fef2f2;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '📳 得分: <strong id="shk-score">0</strong> | 第 <span id="shk-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var shakeBox = createEl('div', '');
      shakeBox.id = 'shk-box';
      shakeBox.style.cssText = 'transition:transform 0.05s;';

      var qBox = createEl('div', '', '');
      qBox.id = 'shk-question';
      qBox.style.cssText = 'background:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:12px;border:2px solid #fecaca;';
      shakeBox.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'shk-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      shakeBox.appendChild(optsBox);

      container.appendChild(shakeBox);

      startShaking();
      nextQuestion();
    }

    function startShaking() {
      if (shakeTimer) clearInterval(shakeTimer);
      shakeTimer = setInterval(function () {
        var box = document.getElementById('shk-box');
        if (!box) return;
        var dx = (Math.random() - 0.5) * 8;
        var dy = (Math.random() - 0.5) * 6;
        box.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)';
      }, 80);
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('shk-idx').textContent = idx + 1;
      document.getElementById('shk-question').textContent = q.question;

      var optsBox = document.getElementById('shk-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.style.cssText = 'padding:10px 14px;text-align:left;background:#fff;border:2px solid #fecaca;border-radius:8px;cursor:pointer;font-size:13px;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('shk-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
        // 答错加强震动
        var box = document.getElementById('shk-box');
        if (box) {
          var orig = box.style.transform;
          var count = 0;
          var strongShake = setInterval(function () {
            box.style.transform = 'translate(' + ((Math.random() - 0.5) * 16) + 'px, ' + ((Math.random() - 0.5) * 12) + 'px)';
            count++;
            if (count > 6) {
              clearInterval(strongShake);
              box.style.transform = orig;
            }
          }, 50);
        }
      }
      idx++;
      setTimeout(nextQuestion, 400);
    }

    function endGame() {
      if (shakeTimer) clearInterval(shakeTimer);
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">📳</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (shakeTimer) clearInterval(shakeTimer); } };
  };

  // ---------- 17. 缩放模式 ----------
  EggGames.zoom = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var zoomTimer = null;
    var zoomLevel = 1;

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#eff6ff;border-radius:12px;padding:16px;overflow:hidden;';

      var header = createEl('div', '', '🔍 得分: <strong id="zm-score">0</strong> | 第 <span id="zm-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var zoomBox = createEl('div', '');
      zoomBox.id = 'zm-box';
      zoomBox.style.cssText = 'transition:transform 1.5s ease-in-out;transform-origin:center top;';

      var qBox = createEl('div', '', '');
      qBox.id = 'zm-question';
      qBox.style.cssText = 'background:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:12px;border:2px solid #bfdbfe;';
      zoomBox.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'zm-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      zoomBox.appendChild(optsBox);

      container.appendChild(zoomBox);

      startZooming();
      nextQuestion();
    }

    function startZooming() {
      if (zoomTimer) clearInterval(zoomTimer);
      zoomTimer = setInterval(function () {
        var box = document.getElementById('zm-box');
        if (!box) return;
        zoomLevel = 0.7 + Math.random() * 0.8; // 0.7 - 1.5
        box.style.transform = 'scale(' + zoomLevel + ')';
      }, 2000);
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('zm-idx').textContent = idx + 1;
      document.getElementById('zm-question').textContent = q.question;

      var optsBox = document.getElementById('zm-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.style.cssText = 'padding:10px 14px;text-align:left;background:#fff;border:2px solid #bfdbfe;border-radius:8px;cursor:pointer;font-size:13px;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('zm-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 400);
    }

    function endGame() {
      if (zoomTimer) clearInterval(zoomTimer);
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🔍</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (zoomTimer) clearInterval(zoomTimer); } };
  };

  // ---------- 18. 混合模式 ----------
  EggGames.mixed = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var currentEffect = '';
    var effects = ['mirror', 'shake', 'zoom', 'colorblind', 'invisible', 'normal'];

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#faf5ff;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '🎰 得分: <strong id="mix-score">0</strong> | 第 <span id="mix-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:8px;text-align:center;';
      container.appendChild(header);

      var effectLabel = createEl('div', '', '当前效果: <span id="mix-effect" style="font-weight:bold;color:#7c3aed;">普通</span>');
      effectLabel.style.cssText = 'font-size:12px;text-align:center;color:#6b7280;margin-bottom:12px;';
      container.appendChild(effectLabel);

      var gameBox = createEl('div', '');
      gameBox.id = 'mix-gamebox';
      gameBox.style.cssText = 'transition:all 0.5s;';
      container.appendChild(gameBox);

      nextQuestion();
    }

    function applyEffect(effect) {
      var box = document.getElementById('mix-gamebox');
      if (!box) return;

      // 重置样式
      box.style.transform = '';
      box.style.filter = '';
      box.style.opacity = '';
      box.style.animation = '';

      var label = '普通';
      switch (effect) {
        case 'mirror':
          box.style.transform = 'scaleX(-1)';
          label = '镜像';
          break;
        case 'shake':
          box.style.animation = 'mixShake 0.1s infinite';
          label = '震动';
          break;
        case 'zoom':
          box.style.transform = 'scale(' + (0.8 + Math.random() * 0.5) + ')';
          label = '缩放';
          break;
        case 'colorblind':
          box.style.filter = 'saturate(0.3) hue-rotate(' + Math.floor(Math.random() * 60) + 'deg)';
          label = '色盲';
          break;
        case 'invisible':
          box.style.opacity = '0.4';
          label = '隐身';
          break;
        default:
          label = '普通';
      }

      var effEl = document.getElementById('mix-effect');
      if (effEl) effEl.textContent = label;
    }

    // 注入震动动画
    var styleEl = createEl('style', '', '@keyframes mixShake{0%,100%{transform:translate(0,0);}25%{transform:translate(3px,-2px);}50%{transform:translate(-2px,2px);}75%{transform:translate(2px,3px);}}');
    document.head.appendChild(styleEl);

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('mix-idx').textContent = idx + 1;

      // 随机切换效果
      currentEffect = effects[Math.floor(Math.random() * effects.length)];
      applyEffect(currentEffect);

      var gameBox = document.getElementById('mix-gamebox');
      gameBox.innerHTML = '';

      var qBox = createEl('div', '', q.question);
      qBox.style.cssText = 'background:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:12px;border:2px solid #ddd6fe;';
      gameBox.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.style.cssText = 'padding:10px 14px;text-align:left;background:#fff;border:2px solid #ddd6fe;border-radius:8px;cursor:pointer;font-size:13px;';
        (function (k) {
          btn.addEventListener('click', function () { checkAnswer(k); });
        })(key);
        optsBox.appendChild(btn);
      }
      gameBox.appendChild(optsBox);
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('mix-score').textContent = score;
        playCorrectSound();
      } else {
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 500);
    }

    function endGame() {
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🎰</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () {} };
  };

  // ---------- 19. 语音模式 ----------
  EggGames.voice = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var synth = window.speechSynthesis;

    function speak(text) {
      if (!synth) return;
      synth.cancel();
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.1;
      synth.speak(utterance);
    }

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'background:#ecfeff;border-radius:12px;padding:16px;';

      var header = createEl('div', '', '🔊 得分: <strong id="vc-score">0</strong> | 第 <span id="vc-idx">1</span>/' + pool.length);
      header.style.cssText = 'font-size:14px;margin-bottom:12px;text-align:center;';
      container.appendChild(header);

      var playBtn = createEl('button', '', '🔊 重新朗读题目');
      playBtn.id = 'vc-replay';
      playBtn.style.cssText = 'display:block;margin:0 auto 12px;padding:8px 16px;background:#06b6d4;color:#fff;border:none;border-radius:8px;cursor:pointer;font-size:13px;';
      playBtn.addEventListener('click', function () {
        var q = pool[idx];
        if (q) speak(q.question);
      });
      container.appendChild(playBtn);

      var qBox = createEl('div', '', '');
      qBox.id = 'vc-question';
      qBox.style.cssText = 'background:#fff;padding:12px;border-radius:8px;font-size:14px;margin-bottom:12px;border:2px solid #a5f3fc;min-height:50px;';
      container.appendChild(qBox);

      var optsBox = createEl('div', '');
      optsBox.id = 'vc-options';
      optsBox.style.cssText = 'display:flex;flex-direction:column;gap:8px;';
      container.appendChild(optsBox);

      var hint = createEl('div', '', '💡 题目会被朗读出来，仔细听题作答');
      hint.style.cssText = 'font-size:12px;color:#6b7280;text-align:center;margin-top:8px;';
      container.appendChild(hint);

      nextQuestion();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('vc-idx').textContent = idx + 1;
      document.getElementById('vc-question').textContent = q.question;

      // 朗读题目
      speak(q.question);

      var optsBox = document.getElementById('vc-options');
      optsBox.innerHTML = '';
      var optKeys = Object.keys(q.options || {});
      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var btn = createEl('button', '', key + '. ' + q.options[key]);
        btn.style.cssText = 'padding:10px 14px;text-align:left;background:#fff;border:2px solid #a5f3fc;border-radius:8px;cursor:pointer;font-size:13px;';
        (function (k, txt) {
          btn.addEventListener('click', function () {
            speak('选择' + txt);
            setTimeout(function () { checkAnswer(k); }, 500);
          });
        })(key, q.options[key]);
        optsBox.appendChild(btn);
      }
    }

    function checkAnswer(key) {
      var q = pool[idx];
      if (synth) synth.cancel();
      if (isCorrect(q, key)) {
        score++;
        document.getElementById('vc-score').textContent = score;
        speak('回答正确');
        playCorrectSound();
      } else {
        speak('回答错误');
        playWrongSound();
      }
      idx++;
      setTimeout(nextQuestion, 1200);
    }

    function endGame() {
      if (synth) synth.cancel();
      container.innerHTML = '<div style="text-align:center;padding:40px;"><div style="font-size:32px;margin-bottom:8px;">🔊</div><div style="font-size:20px;font-weight:bold;">游戏结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (synth) synth.cancel(); } };
  };

  // ---------- 20. 弹幕模式 ----------
  EggGames.danmaku = function (container, questions, onResult) {
    var pool = shuffle(questions);
    var idx = 0;
    var score = 0;
    var animId = null;
    var danmakus = [];

    function start() {
      container.innerHTML = '';
      container.style.cssText = 'position:relative;width:100%;height:380px;background:#000;border-radius:12px;overflow:hidden;';

      var info = createEl('div', '', '💬 得分: <span id="dm-score">0</span> | 点击正确答案');
      info.style.cssText = 'position:absolute;top:8px;left:8px;color:#fff;font-size:13px;z-index:10;';
      container.appendChild(info);

      // 题目
      var qBox = createEl('div', '', '');
      qBox.id = 'dm-question';
      qBox.style.cssText = 'position:absolute;top:30px;left:50%;transform:translateX(-50%);color:#fff;font-size:14px;text-align:center;max-width:90%;z-index:10;background:rgba(0,0,0,0.7);padding:8px 14px;border-radius:8px;';
      container.appendChild(qBox);

      // 弹幕层
      var dmLayer = createEl('div', '');
      dmLayer.id = 'dm-layer';
      dmLayer.style.cssText = 'position:absolute;top:60px;left:0;right:0;bottom:0;overflow:hidden;';
      container.appendChild(dmLayer);

      nextQuestion();
      animate();
    }

    function nextQuestion() {
      if (idx >= pool.length) { endGame(); return; }
      var q = pool[idx];
      document.getElementById('dm-question').textContent = q.question.substring(0, 40);

      var dmLayer = document.getElementById('dm-layer');
      dmLayer.innerHTML = '';
      danmakus = [];

      var optKeys = shuffle(Object.keys(q.options || {}));
      var correctKey = getCorrectKey(q);
      var colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#a8e6cf', '#ff9ff3', '#54a0ff'];

      for (var i = 0; i < optKeys.length; i++) {
        var key = optKeys[i];
        var dm = {
          key: key,
          text: key + '. ' + q.options[key].substring(0, 15),
          x: 100 + Math.random() * 50, // 从屏幕右侧外开始
          y: 10 + (i * 80 / Math.max(optKeys.length - 1, 1)),
          speed: 0.3 + Math.random() * 0.2,
          color: colors[i % colors.length],
          isCorrect: key === correctKey,
          clicked: false
        };
        danmakus.push(dm);

        var dmEl = createEl('div', 'danmaku-item', dm.text);
        dmEl.dataset.key = key;
        dmEl.style.cssText = 'position:absolute;left:' + dm.x + '%;top:' + dm.y + '%;color:' + dm.color + ';font-size:16px;font-weight:bold;white-space:nowrap;cursor:pointer;text-shadow:1px 1px 2px rgba(0,0,0,0.5);z-index:5;';
        (function (keyVal) {
          dmEl.addEventListener('click', function () { checkAnswer(keyVal); });
        })(key);
        dmLayer.appendChild(dmEl);
      }

      // 再加一些干扰弹幕
      for (var j = 0; j < 6; j++) {
        var fakeTexts = ['选我选我!', '不可能的', '想想看', '再想想', '不对不对', '哈哈'];
        var fakeDm = {
          text: fakeTexts[j],
          x: 100 + Math.random() * 100,
          y: Math.random() * 80,
          speed: 0.2 + Math.random() * 0.3,
          color: '#666',
          isFake: true
        };
        danmakus.push(fakeDm);

        var fakeEl = createEl('div', 'danmaku-fake', fakeDm.text);
        fakeEl.style.cssText = 'position:absolute;left:' + fakeDm.x + '%;top:' + fakeDm.y + '%;color:#888;font-size:14px;white-space:nowrap;opacity:0.6;';
        dmLayer.appendChild(fakeEl);
      }
    }

    function animate() {
      var dmLayer = document.getElementById('dm-layer');
      if (!dmLayer) return;

      var dmItems = dmLayer.querySelectorAll('.danmaku-item, .danmaku-fake');
      var di = 0;

      for (var i = 0; i < danmakus.length; i++) {
        var dm = danmakus[i];
        if (dm.clicked) continue;
        dm.x -= dm.speed;

        if (dm.x < -30) {
          // 弹幕飘出屏幕，重新从右边进入
          dm.x = 100 + Math.random() * 30;
        }

        if (dmItems[di]) {
          dmItems[di].style.left = dm.x + '%';
        }
        di++;
      }

      animId = requestAnimationFrame(animate);
    }

    function checkAnswer(key) {
      var q = pool[idx];
      // 标记已点击
      for (var i = 0; i < danmakus.length; i++) {
        if (danmakus[i].key === key) {
          danmakus[i].clicked = true;
          break;
        }
      }

      var dmItems = document.querySelectorAll('.danmaku-item');
      for (var j = 0; j < dmItems.length; j++) {
        if (dmItems[j].dataset.key === key) {
          dmItems[j].style.fontSize = '24px';
          dmItems[j].style.transform = 'scale(1.2)';
          dmItems[j].style.transition = 'all 0.2s';
        }
      }

      if (isCorrect(q, key)) {
        score++;
        document.getElementById('dm-score').textContent = score;
        playCorrectSound();
        idx++;
        setTimeout(nextQuestion, 600);
      } else {
        playWrongSound();
      }
    }

    function endGame() {
      if (animId) cancelAnimationFrame(animId);
      container.innerHTML = '<div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;text-align:center;"><div style="font-size:32px;margin-bottom:8px;">💬</div><div style="font-size:20px;font-weight:bold;">弹幕结束</div><div style="margin-top:8px;">得分: ' + score + '/' + pool.length + '</div></div>';
      if (onResult) onResult({ score: score, total: pool.length });
    }

    start();
    return { stop: function () { if (animId) cancelAnimationFrame(animId); } };
  };

  // ============================================================
  // 公开 API
  // ============================================================
  var EasterEggs = {
    /**
     * 获取所有彩蛋模式列表
     */
    getAll: function () {
      return EGG_MODES.map(function (m) {
        return { id: m.id, name: m.name, icon: m.icon, desc: m.desc };
      });
    },

    /**
     * 开始某个彩蛋模式
     * @param {string} modeId - 模式ID
     * @param {Array} questions - 题目列表
     * @param {HTMLElement|string} container - 容器
     * @param {Function} onResult - 结果回调
     */
    start: function (modeId, questions, container, onResult) {
      var containerEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (!containerEl) {
        console.error('EasterEggs: 容器不存在');
        return null;
      }
      if (!EggGames[modeId]) {
        console.error('EasterEggs: 未知模式 ' + modeId);
        return null;
      }
      var qs = questions && questions.length > 0 ? questions : (window.QUESTION_BANK || []);
      if (qs.length === 0) {
        containerEl.innerHTML = '<div style="text-align:center;padding:40px;color:#6b7280;">暂无题目数据</div>';
        return null;
      }
      return EggGames[modeId](containerEl, qs, onResult);
    },

    /**
     * 渲染游戏模式选择界面
     * @param {HTMLElement|string} container - 容器
     * @param {Function} onSelect - 选择回调
     */
    renderGameUI: function (container, onSelect) {
      var containerEl = typeof container === 'string' ? document.getElementById(container) : container;
      if (!containerEl) return;

      containerEl.innerHTML = '';
      containerEl.style.cssText = 'background:#fff;border-radius:12px;padding:16px;';

      var title = createEl('div', '', '🎮 彩蛋模式 - 20种天马行空的刷题方式');
      title.style.cssText = 'font-size:18px;font-weight:600;text-align:center;margin-bottom:16px;color:#1f2937;';
      containerEl.appendChild(title);

      var grid = createEl('div', '');
      grid.style.cssText = 'display:grid;grid-template-columns:repeat(2,1fr);gap:10px;max-height:480px;overflow-y:auto;';

      for (var i = 0; i < EGG_MODES.length; i++) {
        var mode = EGG_MODES[i];
        var card = createEl('div', 'egg-mode-card');
        card.dataset.modeId = mode.id;
        card.style.cssText = 'padding:12px;background:#f9fafb;border:2px solid #e5e7eb;border-radius:10px;cursor:pointer;transition:all 0.2s;';
        card.innerHTML = '<div style="font-size:24px;margin-bottom:4px;">' + mode.icon + '</div>' +
          '<div style="font-size:14px;font-weight:600;color:#1f2937;">' + (i + 1) + '. ' + mode.name + '</div>' +
          '<div style="font-size:12px;color:#6b7280;margin-top:2px;">' + mode.desc + '</div>';

        card.addEventListener('mouseenter', function () {
          this.style.borderColor = '#3b82f6';
          this.style.background = '#eff6ff';
          this.style.transform = 'translateY(-2px)';
        });
        card.addEventListener('mouseleave', function () {
          this.style.borderColor = '#e5e7eb';
          this.style.background = '#f9fafb';
          this.style.transform = '';
        });

        (function (modeId, modeName) {
          card.addEventListener('click', function () {
            if (onSelect) onSelect(modeId, modeName);
          });
        })(mode.id, mode.name);

        grid.appendChild(card);
      }

      containerEl.appendChild(grid);
    }
  };

  // 暴露到全局
  window.EasterEggs = EasterEggs;

})(window);
