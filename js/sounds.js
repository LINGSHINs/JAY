/**
 * sounds.js - 音效系统
 * 使用Web Audio API生成音效（不需要音频文件，用振荡器合成）
 * 包含答对音效、答错音效、点击音效、切换页面音效
 */

const SoundManager = (function () {
  'use strict';

  // ========== 私有变量 ==========
  let audioContext = null;
  let masterGain = null;
  let enabled = true;
  let volume = 0.5;
  let initialized = false;

  // ========== 初始化 ==========

  /**
   * 初始化音频上下文
   * 需要在用户交互事件中调用（如点击、触摸）
   * @returns {boolean} 是否初始化成功
   */
  function init() {
    if (initialized) return true;

    try {
      // 创建音频上下文
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API 不支持');
        return false;
      }

      audioContext = new AudioContextClass();

      // 创建主音量节点
      masterGain = audioContext.createGain();
      masterGain.gain.value = volume;
      masterGain.connect(audioContext.destination);

      initialized = true;
      return true;
    } catch (e) {
      console.error('音频初始化失败:', e);
      return false;
    }
  }

  /**
   * 确保音频上下文已启动（处理浏览器自动播放策略）
   */
  function resumeContext() {
    if (audioContext && audioContext.state === 'suspended') {
      audioContext.resume();
    }
  }

  // ========== 工具方法 ==========

  /**
   * 创建振荡器并播放音符
   * @param {number} frequency - 频率 (Hz)
   * @param {number} startTime - 开始时间 (秒，相对于当前)
   * @param {number} duration - 持续时间 (秒)
   * @param {string} type - 波形类型 (sine, square, sawtooth, triangle)
   * @param {number} gainValue - 音量增益
   * @param {object} envelope - 包络设置 { attack, decay, sustain, release }
   */
  function playNote(frequency, startTime, duration, type = 'sine', gainValue = 0.3, envelope = null) {
    if (!initialized || !enabled) return;

    const now = audioContext.currentTime;
    const start = now + startTime;

    // 创建振荡器
    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);

    // 创建增益节点（用于音量包络）
    const gainNode = audioContext.createGain();

    if (envelope) {
      // ADSR包络
      const { attack = 0.01, decay = 0.1, sustain = 0.7, release = 0.1 } = envelope;
      const peakGain = gainValue * volume;
      const sustainGain = peakGain * sustain;

      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(peakGain, start + attack);
      gainNode.gain.linearRampToValueAtTime(sustainGain, start + attack + decay);
      gainNode.gain.setValueAtTime(sustainGain, start + duration - release);
      gainNode.gain.linearRampToValueAtTime(0, start + duration);
    } else {
      // 简单的淡入淡出
      const peakGain = gainValue * volume;
      gainNode.gain.setValueAtTime(0, start);
      gainNode.gain.linearRampToValueAtTime(peakGain, start + 0.01);
      gainNode.gain.setValueAtTime(peakGain, start + duration - 0.02);
      gainNode.gain.linearRampToValueAtTime(0, start + duration);
    }

    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    // 播放
    oscillator.start(start);
    oscillator.stop(start + duration + 0.05);
  }

  /**
   * 播放滑音（频率渐变）
   * @param {number} startFreq - 起始频率
   * @param {number} endFreq - 结束频率
   * @param {number} duration - 持续时间
   * @param {string} type - 波形类型
   * @param {number} gainValue - 音量
   */
  function playGlissando(startFreq, endFreq, duration, type = 'sine', gainValue = 0.3) {
    if (!initialized || !enabled) return;

    const now = audioContext.currentTime;

    const oscillator = audioContext.createOscillator();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startFreq, now);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), now + duration);

    const gainNode = audioContext.createGain();
    const peakGain = gainValue * volume;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.02);
    gainNode.gain.setValueAtTime(peakGain, now + duration - 0.05);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + duration + 0.05);
  }

  /**
   * 播放白噪声
   * @param {number} duration - 持续时间
   * @param {number} gainValue - 音量
   * @param {string} filterType - 滤波器类型
   * @param {number} filterFreq - 滤波器频率
   */
  function playNoise(duration, gainValue = 0.2, filterType = 'lowpass', filterFreq = 1000) {
    if (!initialized || !enabled) return;

    const now = audioContext.currentTime;
    const bufferSize = audioContext.sampleRate * duration;
    const buffer = audioContext.createBuffer(1, bufferSize, audioContext.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = audioContext.createBufferSource();
    noise.buffer = buffer;

    const filter = audioContext.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq;

    const gainNode = audioContext.createGain();
    const peakGain = gainValue * volume;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.01);
    gainNode.gain.setValueAtTime(peakGain, now + duration - 0.02);
    gainNode.gain.linearRampToValueAtTime(0, now + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(masterGain);

    noise.start(now);
    noise.stop(now + duration + 0.05);
  }

  // ========== 答对音效（3种风格） ==========

  /**
   * 答对音效 - 风格0：清脆叮
   * 高音铃声效果，类似金属敲击
   */
  function playCorrectStyle0() {
    // 主音
    playNote(1200, 0, 0.15, 'sine', 0.4, { attack: 0.005, decay: 0.05, sustain: 0.6, release: 0.1 });
    // 泛音
    playNote(2400, 0, 0.1, 'sine', 0.15, { attack: 0.005, decay: 0.03, sustain: 0.5, release: 0.07 });
    playNote(3600, 0, 0.08, 'sine', 0.08, { attack: 0.005, decay: 0.02, sustain: 0.4, release: 0.05 });
  }

  /**
   * 答对音效 - 风格1：欢快旋律
   * 上升音阶，活泼欢快
   */
  function playCorrectStyle1() {
    // C大调和弦分解：C5 E5 G5 C6
    const notes = [523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, i) => {
      playNote(freq, i * 0.08, 0.2, 'triangle', 0.3, {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.7,
        release: 0.1
      });
    });
    // 最后加一个高音装饰
    playNote(1318.51, 0.35, 0.15, 'sine', 0.2, {
      attack: 0.005,
      decay: 0.03,
      sustain: 0.6,
      release: 0.1
    });
  }

  /**
   * 答对音效 - 风格2：胜利号角
   * 铜管风格，庄严胜利
   */
  function playCorrectStyle2() {
    // 号角式和弦
    const baseFreq = 440;
    // 主音
    playNote(baseFreq, 0, 0.3, 'square', 0.15, { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.15 });
    // 三度
    playNote(baseFreq * 1.25, 0.05, 0.28, 'square', 0.12, { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.15 });
    // 五度
    playNote(baseFreq * 1.5, 0.1, 0.25, 'square', 0.1, { attack: 0.02, decay: 0.1, sustain: 0.7, release: 0.15 });
    // 高八度
    playNote(baseFreq * 2, 0.15, 0.2, 'sine', 0.1, { attack: 0.01, decay: 0.05, sustain: 0.8, release: 0.15 });
  }

  /**
   * 播放答对音效
   * @param {number} style - 风格 0/1/2
   */
  function playCorrect(style = 0) {
    if (!initialized) init();
    resumeContext();

    switch (style) {
      case 0:
        playCorrectStyle0();
        break;
      case 1:
        playCorrectStyle1();
        break;
      case 2:
        playCorrectStyle2();
        break;
      default:
        playCorrectStyle0();
    }
  }

  // ========== 答错音效（3种风格） ==========

  /**
   * 答错音效 - 风格0：低沉嗡
   * 低频嗡嗡声，低沉压抑
   */
  function playWrongStyle0() {
    playNote(150, 0, 0.4, 'sawtooth', 0.2, {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.6,
      release: 0.2
    });
    playNote(100, 0, 0.4, 'sine', 0.15, {
      attack: 0.02,
      decay: 0.1,
      sustain: 0.7,
      release: 0.2
    });
  }

  /**
   * 答错音效 - 风格1：错误哔
   * 经典错误提示音，短促的电子蜂鸣声
   */
  function playWrongStyle1() {
    playNote(200, 0, 0.1, 'square', 0.25, {
      attack: 0.005,
      decay: 0.02,
      sustain: 0.8,
      release: 0.05
    });
    playNote(150, 0.12, 0.15, 'square', 0.25, {
      attack: 0.005,
      decay: 0.02,
      sustain: 0.8,
      release: 0.08
    });
  }

  /**
   * 答错音效 - 风格2：滑降音
   * 音调下滑，表现失败、失落感
   */
  function playWrongStyle2() {
    playGlissando(600, 150, 0.4, 'sawtooth', 0.2);
    playGlissando(400, 100, 0.45, 'sine', 0.15);
  }

  /**
   * 播放答错音效
   * @param {number} style - 风格 0/1/2
   */
  function playWrong(style = 0) {
    if (!initialized) init();
    resumeContext();

    switch (style) {
      case 0:
        playWrongStyle0();
        break;
      case 1:
        playWrongStyle1();
        break;
      case 2:
        playWrongStyle2();
        break;
      default:
        playWrongStyle0();
    }
  }

  // ========== 点击音效 ==========

  /**
   * 点击音效
   * 清脆的短音，类似按钮点击
   */
  function playClick() {
    if (!initialized) init();
    resumeContext();

    if (!enabled) return;

    const now = audioContext.currentTime;

    // 短促的高频点击
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(800, now);
    oscillator.frequency.exponentialRampToValueAtTime(400, now + 0.05);

    const gainNode = audioContext.createGain();
    const peakGain = 0.2 * volume;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(peakGain, now + 0.005);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    oscillator.connect(gainNode);
    gainNode.connect(masterGain);

    oscillator.start(now);
    oscillator.stop(now + 0.1);
  }

  // ========== 切换页面音效 ==========

  /**
   * 切换页面音效
   * 柔和的滑音过渡
   */
  function playPageSwitch() {
    if (!initialized) init();
    resumeContext();

    if (!enabled) return;

    // 向上滑音，轻盈的页面切换感
    playGlissando(300, 600, 0.15, 'sine', 0.15);

    // 轻微的噪声增加质感
    playNoise(0.1, 0.05, 'highpass', 2000);
  }

  // ========== 其他音效 ==========

  /**
   * 弹窗出现音效
   */
  function playPopup() {
    if (!initialized) init();
    resumeContext();

    if (!enabled) return;

    playNote(500, 0, 0.08, 'sine', 0.2);
    playNote(700, 0.05, 0.1, 'sine', 0.15);
  }

  /**
   * 弹窗关闭音效
   */
  function playPopupClose() {
    if (!initialized) init();
    resumeContext();

    if (!enabled) return;

    playNote(700, 0, 0.08, 'sine', 0.15);
    playNote(500, 0.05, 0.1, 'sine', 0.2);
  }

  /**
   * 滑动/拖拽音效
   */
  function playSlide() {
    if (!initialized) init();
    resumeContext();

    if (!enabled) return;

    playNoise(0.05, 0.08, 'bandpass', 1500);
  }

  /**
   * 成功完成音效（较长）
   */
  function playSuccess() {
    if (!initialized) init();
    resumeContext();

    // 欢快的完成旋律
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, i) => {
      playNote(freq, i * 0.1, 0.3, 'triangle', 0.25, {
        attack: 0.01,
        decay: 0.05,
        sustain: 0.7,
        release: 0.15
      });
    });
  }

  // ========== 控制方法 ==========

  /**
   * 设置音效开关
   * @param {boolean} bool - 是否开启
   */
  function setEnabled(bool) {
    enabled = bool;

    // 保存到localStorage
    try {
      localStorage.setItem('zhiyi_sound_enabled', bool ? '1' : '0');
    } catch (e) {
      console.warn('保存音效设置失败:', e);
    }
  }

  /**
   * 获取音效开关状态
   * @returns {boolean}
   */
  function isEnabled() {
    return enabled;
  }

  /**
   * 设置音量
   * @param {number} vol - 音量 0-1
   */
  function setVolume(vol) {
    volume = Math.max(0, Math.min(1, vol));

    if (masterGain) {
      masterGain.gain.setValueAtTime(volume, audioContext.currentTime);
    }

    // 保存到localStorage
    try {
      localStorage.setItem('zhiyi_sound_volume', String(volume));
    } catch (e) {
      console.warn('保存音量设置失败:', e);
    }
  }

  /**
   * 获取当前音量
   * @returns {number}
   */
  function getVolume() {
    return volume;
  }

  /**
   * 切换音效开关
   * @returns {boolean} 切换后的状态
   */
  function toggle() {
    setEnabled(!enabled);
    return enabled;
  }

  /**
   * 从localStorage恢复设置
   */
  function loadSettings() {
    try {
      const savedEnabled = localStorage.getItem('zhiyi_sound_enabled');
      if (savedEnabled !== null) {
        enabled = savedEnabled === '1';
      }

      const savedVolume = localStorage.getItem('zhiyi_sound_volume');
      if (savedVolume !== null) {
        volume = parseFloat(savedVolume);
        if (isNaN(volume)) volume = 0.5;
      }
    } catch (e) {
      console.warn('读取音效设置失败:', e);
    }
  }

  /**
   * 检查是否已初始化
   * @returns {boolean}
   */
  function isInitialized() {
    return initialized;
  }

  /**
   * 获取音频上下文
   * @returns {AudioContext|null}
   */
  function getContext() {
    return audioContext;
  }

  // ========== 初始化设置 ==========
  // 页面加载时读取保存的设置
  if (typeof window !== 'undefined') {
    loadSettings();
  }

  // ========== 公开API ==========
  return {
    // 初始化
    init,
    isInitialized,
    getContext,

    // 音效播放
    playCorrect,
    playWrong,
    playClick,
    playPageSwitch,
    playPopup,
    playPopupClose,
    playSlide,
    playSuccess,

    // 控制
    setEnabled,
    isEnabled,
    setVolume,
    getVolume,
    toggle,

    // 设置持久化
    loadSettings
  };
})();

// 支持ES模块导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SoundManager;
}
