import React, { useState, useEffect, useMemo, useRef } from 'react';
import { VISION_CHALLENGES } from '../data/visionChallenges';
import { VisionChallenge, VisionPattern } from '../types';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Brain,
  Eye,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Lightbulb,
  ShieldAlert,
  Sliders,
  Check,
  Zap,
  Activity,
  Maximize2,
  Info,
  HelpCircle,
} from 'lucide-react';

export const PixelPerceptronLab: React.FC = () => {
  const [selectedChallengeId, setSelectedChallengeId] = useState<number>(1);
  const currentChallenge: VisionChallenge =
    VISION_CHALLENGES.find((c) => c.id === selectedChallengeId) ||
    VISION_CHALLENGES[0];

  // 3x3 Retina Input Grid (9 pixels)
  const [inputPixels, setInputPixels] = useState<boolean[]>(
    currentChallenge.testSuite[0]?.pixels || Array(9).fill(false)
  );

  // 3x3 Synaptic Weights (9 numbers)
  const [weights, setWeights] = useState<number[]>(
    currentChallenge.initialWeights || [0, 0, 0, 1, 1, 1, 0, 0, 0]
  );

  // Bias (threshold)
  const [bias, setBias] = useState<number>(currentChallenge.initialBias ?? -1);

  // Active selected test preset or custom
  const [activeTestIndex, setActiveTestIndex] = useState<number>(0);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Reset when challenge changes
  useEffect(() => {
    setWeights(currentChallenge.initialWeights || Array(9).fill(0));
    setBias(currentChallenge.initialBias ?? 0);
    if (currentChallenge.testSuite.length > 0) {
      setInputPixels(currentChallenge.testSuite[0].pixels);
      setActiveTestIndex(0);
    }
    setShowHint(false);
  }, [selectedChallengeId]);

  // Compute live prediction for given 9 pixels
  const evaluatePixels = (pixels: boolean[], w: number[], b: number) => {
    let dotProduct = 0;
    const activeTerms: { index: number; weight: number }[] = [];

    for (let i = 0; i < 9; i++) {
      if (pixels[i]) {
        dotProduct += w[i];
        activeTerms.push({ index: i, weight: w[i] });
      }
    }

    const totalScore = dotProduct + b;
    const isActive = totalScore >= 0;
    return {
      dotProduct,
      totalScore,
      isActive,
      activeTerms,
    };
  };

  // Live output for current drawing
  const currentEvaluation = useMemo(() => {
    return evaluatePixels(inputPixels, weights, bias);
  }, [inputPixels, weights, bias]);

  // Validation Test Suite Results
  const testResults = useMemo(() => {
    return currentChallenge.testSuite.map((test) => {
      const res = evaluatePixels(test.pixels, weights, bias);
      const predictedLabel = res.isActive ? 1 : 0;
      const passed = predictedLabel === test.expectedLabel;
      return {
        ...test,
        predictedLabel,
        totalScore: res.totalScore,
        passed,
      };
    });
  }, [currentChallenge, weights, bias]);

  const passedCount = testResults.filter((t) => t.passed).length;
  const totalCount = testResults.length;
  const isAllPassed = passedCount === totalCount && totalCount > 0;

  // Trigger celebration on victory
  const prevPassedRef = useRef<boolean>(false);
  useEffect(() => {
    if (isAllPassed && !prevPassedRef.current) {
      sounds.playSuccess();
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
      });
    }
    prevPassedRef.current = isAllPassed;
  }, [isAllPassed]);

  // Toggle single pixel on input canvas
  const toggleInputPixel = (index: number) => {
    sounds.playClick();
    setActiveTestIndex(-1); // Switch to custom drawing mode
    setInputPixels((prev) => {
      const next = [...prev];
      next[index] = !next[index];
      return next;
    });
  };

  // Cycle weight on 3x3 matrix: +2 -> +1 -> 0 -> -1 -> -2 -> -3 -> +2
  const cycleWeight = (index: number, delta: number) => {
    sounds.playMove();
    setWeights((prev) => {
      const next = [...prev];
      let newW = next[index] + delta;
      if (newW > 3) newW = -3;
      if (newW < -3) newW = 3;
      next[index] = newW;
      return next;
    });
  };

  // Apply a specific test case pattern to the input grid
  const applyTestCase = (index: number) => {
    sounds.playClick();
    setActiveTestIndex(index);
    setInputPixels(currentChallenge.testSuite[index].pixels);
  };

  // Reset weights to challenge defaults
  const resetToDefaults = () => {
    sounds.playClick();
    setWeights(currentChallenge.initialWeights || Array(9).fill(0));
    setBias(currentChallenge.initialBias ?? 0);
  };

  // Helper to get color styling for a weight value
  const getWeightBadgeClass = (w: number) => {
    if (w >= 2) return 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/30';
    if (w === 1) return 'bg-emerald-900/80 border border-emerald-500/60 text-emerald-300 font-bold';
    if (w === 0) return 'bg-slate-900 border border-slate-700/80 text-slate-500 font-medium';
    if (w === -1) return 'bg-rose-950/80 border border-rose-500/50 text-rose-300 font-bold';
    return 'bg-rose-600 text-white font-black shadow-md shadow-rose-600/30';
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto select-none">
      {/* Top Banner & Challenge Tabs */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-3xl backdrop-blur-md shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/30 font-bold">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400">
                Комп'ютерний зір 3×3 • Практикум інженера ШІ
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Справжня дія
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Створення оптичного розпізнавача образів (Vision Perceptron)
            </h1>
          </div>
        </div>

        {/* Challenge selector tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {VISION_CHALLENGES.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                sounds.playClick();
                setSelectedChallengeId(ch.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedChallengeId === ch.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{ch.id === 1 ? '1: Горизонталь' : ch.id === 2 ? '2: «+» vs «×»' : ch.id === 3 ? '3: Контур 0' : '4: ШІ-Атака'}</span>
              {selectedChallengeId === ch.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Description & Goal Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/20 to-slate-900 border border-emerald-500/20 p-4 rounded-3xl space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white">
                {currentChallenge.title}
              </h2>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                {currentChallenge.badge}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {currentChallenge.story}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                sounds.playClick();
                setShowHint(!showHint);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                showHint
                  ? 'bg-amber-500 text-slate-950'
                  : 'bg-slate-800 hover:bg-slate-700 text-amber-300'
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5" />
              <span>{showHint ? 'Сховати пораду' : 'Підказка інженера'}</span>
            </button>

            <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono flex items-center gap-1.5">
              <span className="text-slate-400">Пройдено тестів:</span>
              <strong className={isAllPassed ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                {passedCount}/{totalCount}
              </strong>
            </div>
          </div>
        </div>

        {/* Hint banner if opened */}
        {showHint && (
          <div className="mt-2 p-3 rounded-2xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs leading-relaxed flex items-start gap-2.5 animate-in fade-in">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong>Інженерне рішення: </strong>
              {currentChallenge.hint}
            </div>
          </div>
        )}

        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-400">
            <strong className="text-emerald-400">Інструкція: </strong>
            {currentChallenge.instructions}
          </div>
        </div>
      </div>

      {/* Main Interactive Workshop: 3-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Col: 3x3 Camera Sensor (Drawing & Testing) (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>Сенсор камери (Входи X₁–X₉):</span>
              </span>
              <span className="text-[10px] text-slate-400">Клікніть, щоб малювати</span>
            </div>

            {/* 3x3 Interactive Drawing Grid */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-[260px] mx-auto w-full aspect-square flex items-center justify-center">
              <div className="grid grid-cols-3 gap-2.5 w-full h-full">
                {inputPixels.map((isActive, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => toggleInputPixel(idx)}
                    className={`rounded-xl transition-all duration-150 relative flex items-center justify-center border text-xs font-mono font-bold ${
                      isActive
                        ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-lg shadow-amber-500/40 scale-100 ring-2 ring-amber-400/50'
                        : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-600 hover:border-slate-700'
                    }`}
                    title={`Піксель ${idx + 1}: ${isActive ? 'Світиться (1)' : 'Темний (0)'}`}
                  >
                    <span>{isActive ? '1' : '0'}</span>
                    <span className="absolute bottom-1 right-1.5 text-[8px] opacity-40 font-mono">
                      x{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Presets / Drawing tools */}
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTestIndex(-1);
                  setInputPixels(Array(9).fill(false));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition"
              >
                Очистити
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTestIndex(-1);
                  setInputPixels((prev) => prev.map((p) => !p));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition"
              >
                Інвертувати
              </button>

              <button
                type="button"
                onClick={() => {
                  sounds.playClick();
                  setActiveTestIndex(-1);
                  setInputPixels(Array(9).fill(true));
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] text-slate-300 font-medium transition"
              >
                Заповнити
              </button>
            </div>
          </div>

          {/* Preset test selector tabs */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Швидке тестування на зразках:
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[140px] overflow-y-auto pr-1">
              {currentChallenge.testSuite.map((test, idx) => (
                <button
                  key={test.id}
                  type="button"
                  onClick={() => applyTestCase(idx)}
                  className={`p-1.5 rounded-xl text-[11px] text-left border flex items-center justify-between transition ${
                    activeTestIndex === idx
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span className="truncate max-w-[95px]">{test.name}</span>
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-bold ${
                      test.expectedLabel === 1
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {test.expectedLabel === 1 ? '+' : '–'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Col: Synaptic Weights Matrix & Bias (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Матриця ваг (Синапси W₁–W₉):</span>
              </span>
              <button
                type="button"
                onClick={resetToDefaults}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                title="Скинути ваги до початкових"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Скинути</span>
              </button>
            </div>

            <p className="text-[11px] text-slate-400 leading-tight">
              Клікайте <strong className="text-emerald-300">[+]</strong> або <strong className="text-rose-300">[–]</strong> на кожному синапсі для налаштування сили сигналу:
            </p>

            {/* 3x3 Weights Grid with tactile +/- buttons */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 max-w-[260px] mx-auto w-full aspect-square flex items-center justify-center">
              <div className="grid grid-cols-3 gap-2 w-full h-full">
                {weights.map((w, idx) => (
                  <div
                    key={idx}
                    className={`rounded-xl border flex flex-col items-center justify-between p-1 transition-all ${getWeightBadgeClass(
                      w
                    )}`}
                  >
                    {/* + button */}
                    <button
                      type="button"
                      onClick={() => cycleWeight(idx, 1)}
                      className="w-full h-4 rounded hover:bg-white/20 flex items-center justify-center text-[10px] font-bold leading-none"
                      title="Збільшити вагу"
                    >
                      +
                    </button>

                    {/* Weight value */}
                    <div className="font-mono text-xs font-black">
                      {w > 0 ? `+${w}` : `${w}`}
                    </div>

                    {/* - button */}
                    <button
                      type="button"
                      onClick={() => cycleWeight(idx, -1)}
                      className="w-full h-4 rounded hover:bg-white/20 flex items-center justify-center text-[10px] font-bold leading-none"
                      title="Зменшити вагу"
                    >
                      –
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Weight Legend */}
            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 pt-1">
              <div className="flex items-center gap-1 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span>Збудження (+вага)</span>
              </div>
              <div className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span>Гальмування (-вага)</span>
              </div>
            </div>
          </div>

          {/* Bias (Threshold) Control */}
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-300 font-bold flex items-center gap-1.5">
                <span>Поріг чутливості (Bias):</span>
              </span>
              <span className="font-mono font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-500/30">
                {bias > 0 ? `+${bias}` : bias}
              </span>
            </div>

            <input
              type="range"
              min="-6"
              max="6"
              step="1"
              value={bias}
              onChange={(e) => {
                sounds.playMove();
                setBias(parseInt(e.target.value, 10));
              }}
              className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>-6 (Суворий поріг)</span>
              <span>0 (Нейтральний)</span>
              <span>+6 (Легкий старт)</span>
            </div>
          </div>
        </div>

        {/* Right Col: Mathematical Summation & Live Verdict (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>Стан штучного нейрона:</span>
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                f(∑ x·w + b)
              </span>
            </div>

            {/* Neuron Activation Verdict Box */}
            <div
              className={`p-4 rounded-2xl border-2 transition-all duration-200 flex flex-col items-center justify-center text-center gap-2 ${
                currentEvaluation.isActive
                  ? 'bg-gradient-to-b from-emerald-950/80 to-slate-950 border-emerald-500/80 shadow-lg shadow-emerald-500/20'
                  : 'bg-gradient-to-b from-rose-950/80 to-slate-950 border-rose-500/80 shadow-lg shadow-rose-500/20'
              }`}
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg ${
                  currentEvaluation.isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/40 animate-pulse'
                    : 'bg-rose-500 text-white'
                }`}
              >
                {currentEvaluation.isActive ? <Check className="w-7 h-7 stroke-[3]" /> : <XCircle className="w-7 h-7" />}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Рішення перцептрона:
                </span>
                <div
                  className={`text-base font-black ${
                    currentEvaluation.isActive ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentEvaluation.isActive
                    ? 'РОЗПІЗНАНО (АКТИВАЦІЯ +)'
                    : 'ВІДХИЛЕНО (ГАЛЬМУВАННЯ –)'}
                </div>
              </div>

              <div className="font-mono text-xs text-slate-300 bg-slate-900/90 px-3 py-1 rounded-xl border border-slate-800">
                Сумарний потенціал Z = <strong className="text-white">{currentEvaluation.totalScore}</strong>
                <span className="text-[10px] text-slate-500 ml-1">
                  ({currentEvaluation.totalScore >= 0 ? '≥ 0 → 1' : '< 0 → 0'})
                </span>
              </div>
            </div>

            {/* Formula Breakdown Details */}
            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1.5 text-xs">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Розбір синаптичних внесків:
              </span>

              <div className="text-[11px] font-mono text-slate-300 leading-relaxed max-h-[85px] overflow-y-auto pr-1">
                {currentEvaluation.activeTerms.length === 0 ? (
                  <span className="text-slate-500 italic">Немає активних вхідних пікселів</span>
                ) : (
                  currentEvaluation.activeTerms.map((t, idx) => (
                    <span key={t.index}>
                      {idx > 0 && ' + '}
                      <span className={t.weight > 0 ? 'text-emerald-400' : t.weight < 0 ? 'text-rose-400' : 'text-slate-500'}>
                        [x{t.index + 1}: {t.weight > 0 ? `+${t.weight}` : t.weight}]
                      </span>
                    </span>
                  ))
                )}
                {currentEvaluation.activeTerms.length > 0 && (
                  <span>
                    {' '}
                    + <span className="text-amber-400">bias({bias})</span> ={' '}
                    <strong className="text-white">{currentEvaluation.totalScore}</strong>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Goal Victory Alert */}
          {isAllPassed && (
            <div className="bg-emerald-950/70 border border-emerald-500/50 p-3 rounded-2xl space-y-2 animate-in zoom-in-95">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <strong className="text-white block">Всі тести пройдено на 100%!</strong>
                  <span className="text-emerald-300 text-[11px]">
                    Ваш ваговий фільтр працює бездоганно.
                  </span>
                </div>
              </div>

              {selectedChallengeId < VISION_CHALLENGES.length && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedChallengeId((prev) => prev + 1);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/30 transition"
                >
                  <span>Наступна інженерна місія</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Panel: Automated Test Suite (Validation Grid) */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Валідаційний стрес-тест моделі:</span>
            <span className="text-[11px] text-slate-400 font-normal">
              (Перевірка фільтра на різних типах фігур і шуму)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                isAllPassed
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                  : 'bg-amber-950/60 text-amber-300 border-amber-500/40'
              }`}
            >
              Успіх: {passedCount} із {totalCount} тестів
            </span>
          </div>
        </div>

        {/* Test Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {testResults.map((test, idx) => (
            <div
              key={test.id}
              onClick={() => applyTestCase(idx)}
              className={`p-2.5 rounded-2xl border cursor-pointer transition-all flex flex-col items-center justify-between gap-2 ${
                test.passed
                  ? 'bg-emerald-950/20 hover:bg-emerald-950/30 border-emerald-500/40'
                  : 'bg-rose-950/20 hover:bg-rose-950/30 border-rose-500/40'
              } ${activeTestIndex === idx ? 'ring-2 ring-white/60' : ''}`}
            >
              {/* Mini 3x3 Preview Grid */}
              <div className="w-12 h-12 bg-slate-950 rounded-lg p-1 grid grid-cols-3 gap-0.5 border border-slate-800">
                {test.pixels.map((p, pIdx) => (
                  <div
                    key={pIdx}
                    className={`rounded-[2px] ${
                      p ? 'bg-amber-400' : 'bg-slate-900'
                    }`}
                  />
                ))}
              </div>

              {/* Title & Expected info */}
              <div className="text-center w-full">
                <div className="text-[11px] font-bold text-slate-200 truncate" title={test.name}>
                  {test.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  Очікувано:{' '}
                  <strong className={test.expectedLabel === 1 ? 'text-emerald-400' : 'text-slate-400'}>
                    {test.expectedLabel === 1 ? '+' : '–'}
                  </strong>
                </div>
              </div>

              {/* Live Test Verdict Badge */}
              <div
                className={`w-full py-1 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 border ${
                  test.passed
                    ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                }`}
              >
                {test.passed ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Пройшов</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3 h-3 text-rose-400" />
                    <span>Помилка ({test.predictedLabel === 1 ? '+' : '–'})</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
