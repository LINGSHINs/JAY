/**
 * Stats - 学习统计与进度可视化模块
 * 提供答题数据统计和多种图表可视化能力
 */
(function (window) {
  'use strict';

  var STORAGE_KEY = 'zhiyi_stats';
  var MASTERY_KEY = 'zhiyi_mastery';

  // ---------- 内部工具 ----------
  function getStoredStats() {
    try {
      var data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : getDefaultStats();
    } catch (e) {
      return getDefaultStats();
    }
  }

  function setStoredStats(stats) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch (e) {}
  }

  function getDefaultStats() {
    return {
      totalAnswered: 0,
      totalCorrect: 0,
      byDept: {},       // { deptName: { total, correct } }
      byType: {},       // { typeName: { total, correct } }
      dailyRecord: {},  // { 'YYYY-MM-DD': { answered, correct, mistakes } }
      studyDays: [],    // 学习日期数组
      streak: 0,        // 连续打卡天数
      lastStudyDate: null
    };
  }

  function getMasteryMap() {
    try {
      var data = localStorage.getItem(MASTERY_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  }

  function formatDate(date) {
    var y = date.getFullYear();
    var m = String(date.getMonth() + 1).padStart(2, '0');
    var d = String(date.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  function getQuestions() {
    return window.QUESTION_BANK || [];
  }

  // ---------- 打卡与连续天数计算 ----------
  function calcStreak(studyDays) {
    if (!studyDays || studyDays.length === 0) return 0;
    var sorted = studyDays.slice().sort();
    var streak = 1;
    var today = new Date();
    var todayStr = formatDate(today);

    // 从今天或昨天开始数
    var current = new Date();
    var currentStr = formatDate(current);
    if (sorted.indexOf(currentStr) === -1) {
      current.setDate(current.getDate() - 1);
      currentStr = formatDate(current);
      if (sorted.indexOf(currentStr) === -1) return 0;
    }

    while (true) {
      current.setDate(current.getDate() - 1);
      currentStr = formatDate(current);
      if (sorted.indexOf(currentStr) !== -1) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }

  // ---------- 公开 API ----------
  var Stats = {
    /**
     * 记录一次答题结果
     * @param {Object} question - 题目对象
     * @param {boolean} isCorrect - 是否正确
     */
    recordAnswer: function (question, isCorrect) {
      var stats = getStoredStats();
      var today = formatDate(new Date());

      stats.totalAnswered++;
      if (isCorrect) stats.totalCorrect++;

      // 按部门统计
      var dept = question.dept || '未知';
      if (!stats.byDept[dept]) stats.byDept[dept] = { total: 0, correct: 0 };
      stats.byDept[dept].total++;
      if (isCorrect) stats.byDept[dept].correct++;

      // 按题型统计
      var type = question.type || '未知';
      if (!stats.byType[type]) stats.byType[type] = { total: 0, correct: 0 };
      stats.byType[type].total++;
      if (isCorrect) stats.byType[type].correct++;

      // 每日记录
      if (!stats.dailyRecord[today]) {
        stats.dailyRecord[today] = { answered: 0, correct: 0, mistakes: 0 };
        if (stats.studyDays.indexOf(today) === -1) {
          stats.studyDays.push(today);
        }
      }
      stats.dailyRecord[today].answered++;
      if (isCorrect) {
        stats.dailyRecord[today].correct++;
      } else {
        stats.dailyRecord[today].mistakes++;
      }

      // 更新连续打卡
      stats.streak = calcStreak(stats.studyDays);
      stats.lastStudyDate = today;

      setStoredStats(stats);

      // 更新掌握度
      this.updateMastery(question.id, isCorrect);
    },

    /**
     * 更新题目掌握度
     */
    updateMastery: function (qid, isCorrect) {
      var mastery = getMasteryMap();
      if (!mastery[qid]) {
        mastery[qid] = { level: 0, correctCount: 0, totalCount: 0 };
      }
      var item = mastery[qid];
      item.totalCount++;
      if (isCorrect) item.correctCount++;

      // 掌握度等级: 0未掌握 1熟悉 2掌握 3精通
      var rate = item.correctCount / item.totalCount;
      if (item.totalCount >= 5 && rate >= 0.9) item.level = 3;
      else if (item.totalCount >= 3 && rate >= 0.7) item.level = 2;
      else if (item.totalCount >= 2 && rate >= 0.5) item.level = 1;
      else item.level = 0;

      try {
        localStorage.setItem(MASTERY_KEY, JSON.stringify(mastery));
      } catch (e) {}
    },

    /**
     * 获取总览数据
     */
    getOverview: function () {
      var questions = getQuestions();
      var stats = getStoredStats();
      var totalQuestions = questions.length;
      var accuracy = stats.totalAnswered > 0
        ? Math.round((stats.totalCorrect / stats.totalAnswered) * 100)
        : 0;

      return {
        totalQuestions: totalQuestions,
        totalAnswered: stats.totalAnswered,
        totalCorrect: stats.totalCorrect,
        accuracy: accuracy,
        studyDaysCount: stats.studyDays.length,
        streak: stats.streak,
        progress: totalQuestions > 0
          ? Math.round((stats.totalAnswered / totalQuestions) * 100)
          : 0
      };
    },

    /**
     * 各部门进度数据
     */
    getByDept: function () {
      var questions = getQuestions();
      var stats = getStoredStats();
      var deptTotal = {};

      // 统计每个部门的总题数
      for (var i = 0; i < questions.length; i++) {
        var q = questions[i];
        if (!deptTotal[q.dept]) deptTotal[q.dept] = 0;
        deptTotal[q.dept]++;
      }

      var result = [];
      var deptNames = Object.keys(deptTotal);
      for (var j = 0; j < deptNames.length; j++) {
        var name = deptNames[j];
        var deptStat = stats.byDept[name] || { total: 0, correct: 0 };
        result.push({
          dept: name,
          total: deptTotal[name],
          answered: deptStat.total,
          correct: deptStat.correct,
          accuracy: deptStat.total > 0
            ? Math.round((deptStat.correct / deptStat.total) * 100)
            : 0,
          progress: Math.round((deptStat.total / deptTotal[name]) * 100)
        });
      }
      return result.sort(function (a, b) { return b.total - a.total; });
    },

    /**
     * 各题型正确率
     */
    getByType: function () {
      var stats = getStoredStats();
      var result = [];
      var types = Object.keys(stats.byType);
      for (var i = 0; i < types.length; i++) {
        var t = types[i];
        var s = stats.byType[t];
        result.push({
          type: t,
          total: s.total,
          correct: s.correct,
          accuracy: s.total > 0
            ? Math.round((s.correct / s.total) * 100)
            : 0
        });
      }
      return result;
    },

    /**
     * 最近N天错题数趋势
     * @param {number} days - 天数
     */
    getMistakeTrend: function (days) {
      days = days || 7;
      var stats = getStoredStats();
      var result = [];
      var today = new Date();

      for (var i = days - 1; i >= 0; i--) {
        var d = new Date(today);
        d.setDate(d.getDate() - i);
        var dateStr = formatDate(d);
        var record = stats.dailyRecord[dateStr] || { answered: 0, correct: 0, mistakes: 0 };
        result.push({
          date: dateStr,
          mistakes: record.mistakes,
          answered: record.answered,
          correct: record.correct
        });
      }
      return result;
    },

    /**
     * 掌握度分布
     */
    getMasteryDistribution: function () {
      var mastery = getMasteryMap();
      var questions = getQuestions();
      var distribution = [
        { level: 0, label: '未掌握', count: 0 },
        { level: 1, label: '熟悉', count: 0 },
        { level: 2, label: '掌握', count: 0 },
        { level: 3, label: '精通', count: 0 }
      ];

      for (var i = 0; i < questions.length; i++) {
        var qid = questions[i].id;
        var m = mastery[qid];
        if (m) {
          distribution[m.level].count++;
        } else {
          distribution[0].count++;
        }
      }

      return distribution;
    },

    // ---------- 图表渲染 ----------

    /**
     * 绘制环形进度条
     * @param {string} canvasId - canvas元素ID
     * @param {number} percentage - 百分比 0-100
     * @param {Object} options - 配置项
     */
    renderProgressBar: function (canvasId, percentage, options) {
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var opts = options || {};
      var size = canvas.width;
      var center = size / 2;
      var lineWidth = opts.lineWidth || 12;
      var radius = center - lineWidth;
      var bgColor = opts.bgColor || '#e5e7eb';
      var fgColor = opts.fgColor || '#3b82f6';
      var textColor = opts.textColor || '#1f2937';
      var showText = opts.showText !== false;

      ctx.clearRect(0, 0, size, size);

      // 背景圆环
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.strokeStyle = bgColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 进度圆环
      var startAngle = -Math.PI / 2;
      var endAngle = startAngle + (Math.PI * 2 * percentage / 100);
      ctx.beginPath();
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.strokeStyle = fgColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.stroke();

      // 中心文字
      if (showText) {
        ctx.fillStyle = textColor;
        ctx.font = 'bold ' + Math.floor(size / 5) + 'px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(percentage + '%', center, center);
      }
    },

    /**
     * 绘制柱状图
     * @param {string} canvasId - canvas元素ID
     * @param {Array} data - 数据 [{label, value, color?}]
     * @param {Object} options - 配置项
     */
    renderBarChart: function (canvasId, data, options) {
      var canvas = document.getElementById(canvasId);
      if (!canvas || !data || data.length === 0) return;
      var ctx = canvas.getContext('2d');
      var opts = options || {};
      var w = canvas.width;
      var h = canvas.height;
      var padding = opts.padding || { top: 20, right: 20, bottom: 40, left: 40 };
      var chartW = w - padding.left - padding.right;
      var chartH = h - padding.top - padding.bottom;
      var barGap = opts.barGap || 8;
      var barColor = opts.barColor || '#3b82f6';
      var labelColor = opts.labelColor || '#6b7280';
      var valueColor = opts.valueColor || '#1f2937';

      ctx.clearRect(0, 0, w, h);

      var maxValue = Math.max.apply(null, data.map(function (d) { return d.value; }));
      if (maxValue === 0) maxValue = 1;

      var barWidth = (chartW - barGap * (data.length - 1)) / data.length;

      // Y轴
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top);
      ctx.lineTo(padding.left, h - padding.bottom);
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1;
      ctx.stroke();

      // X轴
      ctx.beginPath();
      ctx.moveTo(padding.left, h - padding.bottom);
      ctx.lineTo(w - padding.right, h - padding.bottom);
      ctx.stroke();

      // 柱形
      for (var i = 0; i < data.length; i++) {
        var item = data[i];
        var barH = (item.value / maxValue) * chartH;
        var x = padding.left + i * (barWidth + barGap);
        var y = h - padding.bottom - barH;

        ctx.fillStyle = item.color || barColor;
        ctx.fillRect(x, y, barWidth, barH);

        // 数值标签
        ctx.fillStyle = valueColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(item.value, x + barWidth / 2, y - 4);

        // X轴标签
        ctx.fillStyle = labelColor;
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        var label = item.label.length > 6 ? item.label.substring(0, 6) + '..' : item.label;
        ctx.fillText(label, x + barWidth / 2, h - padding.bottom + 14);
      }
    },

    /**
     * 绘制折线图
     * @param {string} canvasId - canvas元素ID
     * @param {Array} data - 数据 [{label, value}]
     * @param {Object} options - 配置项
     */
    renderLineChart: function (canvasId, data, options) {
      var canvas = document.getElementById(canvasId);
      if (!canvas || !data || data.length === 0) return;
      var ctx = canvas.getContext('2d');
      var opts = options || {};
      var w = canvas.width;
      var h = canvas.height;
      var padding = opts.padding || { top: 20, right: 20, bottom: 40, left: 40 };
      var chartW = w - padding.left - padding.right;
      var chartH = h - padding.top - padding.bottom;
      var lineColor = opts.lineColor || '#3b82f6';
      var fillColor = opts.fillColor || 'rgba(59, 130, 246, 0.1)';
      var pointColor = opts.pointColor || '#3b82f6';
      var labelColor = opts.labelColor || '#6b7280';

      ctx.clearRect(0, 0, w, h);

      var maxValue = Math.max.apply(null, data.map(function (d) { return d.value; }));
      if (maxValue === 0) maxValue = 1;

      var stepX = data.length > 1 ? chartW / (data.length - 1) : chartW;

      // 网格线
      ctx.strokeStyle = '#f3f4f6';
      ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) {
        var gy = padding.top + (chartH / 4) * g;
        ctx.beginPath();
        ctx.moveTo(padding.left, gy);
        ctx.lineTo(w - padding.right, gy);
        ctx.stroke();
      }

      // 计算点坐标
      var points = [];
      for (var i = 0; i < data.length; i++) {
        var px = padding.left + i * stepX;
        var py = h - padding.bottom - (data[i].value / maxValue) * chartH;
        points.push({ x: px, y: py });
      }

      // 填充区域
      if (fillColor) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, h - padding.bottom);
        for (var j = 0; j < points.length; j++) {
          ctx.lineTo(points[j].x, points[j].y);
        }
        ctx.lineTo(points[points.length - 1].x, h - padding.bottom);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
      }

      // 折线
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (var k = 1; k < points.length; k++) {
        ctx.lineTo(points[k].x, points[k].y);
      }
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 2;
      ctx.stroke();

      // 数据点
      for (var p = 0; p < points.length; p++) {
        ctx.beginPath();
        ctx.arc(points[p].x, points[p].y, 4, 0, Math.PI * 2);
        ctx.fillStyle = pointColor;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // 数值
        ctx.fillStyle = '#1f2937';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(data[p].value, points[p].x, points[p].y - 8);
      }

      // X轴标签
      ctx.fillStyle = labelColor;
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      for (var l = 0; l < data.length; l++) {
        var label = data[l].label;
        // 只显示部分标签避免拥挤
        if (data.length <= 7 || l % Math.ceil(data.length / 7) === 0) {
          ctx.fillText(label, points[l].x, h - padding.bottom + 16);
        }
      }
    },

    /**
     * 绘制学习热力图（类似GitHub贡献图）
     * @param {string} canvasId - canvas元素ID
     * @param {Object} data - 数据 { 'YYYY-MM-DD': count }
     * @param {Object} options - 配置项
     */
    renderHeatmap: function (canvasId, data, options) {
      var canvas = document.getElementById(canvasId);
      if (!canvas) return;
      var ctx = canvas.getContext('2d');
      var opts = options || {};
      var cellSize = opts.cellSize || 12;
      var cellGap = opts.cellGap || 3;
      var weeks = opts.weeks || 26; // 显示26周
      var colors = opts.colors || [
        '#ebedf0', // 0
        '#9be9a8', // 1-3
        '#40c463', // 4-7
        '#30a14e', // 8-12
        '#216e39'  // 13+
      ];

      var w = canvas.width;
      var h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      var today = new Date();
      var dayOfWeek = today.getDay(); // 0-6 (周日-周六)
      var totalDays = weeks * 7;
      var startDate = new Date(today);
      startDate.setDate(startDate.getDate() - totalDays + 1);

      var heatData = data || {};

      // 找到最大值用于颜色映射
      var maxCount = 1;
      for (var key in heatData) {
        if (heatData[key] > maxCount) maxCount = heatData[key];
      }

      // 绘制每个格子
      var startX = 10;
      var startY = 20;

      for (var week = 0; week < weeks; week++) {
        for (var day = 0; day < 7; day++) {
          var d = new Date(startDate);
          d.setDate(d.getDate() + week * 7 + day);
          var dateStr = formatDate(d);
          var count = heatData[dateStr] || 0;

          // 只绘制到今天为止
          if (d > today) continue;

          var x = startX + week * (cellSize + cellGap);
          var y = startY + day * (cellSize + cellGap);

          // 颜色等级
          var level = 0;
          if (count > 0) {
            if (count <= 3) level = 1;
            else if (count <= 7) level = 2;
            else if (count <= 12) level = 3;
            else level = 4;
          }

          ctx.fillStyle = colors[level];
          ctx.fillRect(x, y, cellSize, cellSize);
        }
      }

      // 月份标签
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'left';
      var lastMonth = -1;
      for (var wk = 0; wk < weeks; wk++) {
        var checkDate = new Date(startDate);
        checkDate.setDate(checkDate.getDate() + wk * 7);
        var month = checkDate.getMonth();
        if (month !== lastMonth && checkDate <= today) {
          var monthNames = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
          var mx = startX + wk * (cellSize + cellGap);
          ctx.fillText(monthNames[month], mx, 14);
          lastMonth = month;
        }
      }

      // 星期标签（简略）
      ctx.fillStyle = '#6b7280';
      ctx.font = '9px sans-serif';
      ctx.textAlign = 'right';
      var dayLabels = ['日', '', '二', '', '四', '', '六'];
      for (var dy = 0; dy < 7; dy++) {
        if (dayLabels[dy]) {
          ctx.fillText(dayLabels[dy], startX - 4, startY + dy * (cellSize + cellGap) + cellSize - 2);
        }
      }
    },

    /**
     * 重置统计数据
     */
    reset: function () {
      try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(MASTERY_KEY);
      } catch (e) {}
    },

    /**
     * 生成热力图数据（从dailyRecord）
     */
    getHeatmapData: function () {
      var stats = getStoredStats();
      var result = {};
      for (var date in stats.dailyRecord) {
        result[date] = stats.dailyRecord[date].answered;
      }
      return result;
    }
  };

  // 暴露到全局
  window.Stats = Stats;

})(window);
