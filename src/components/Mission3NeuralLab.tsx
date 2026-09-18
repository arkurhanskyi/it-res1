import React, { useState, useEffect, useRef, useMemo } from 'react';
import { PixelPerceptronLab } from './PixelPerceptronLab';
import { NEURAL_LAB_CHALLENGES } from '../data/neuralLabChallenges';
import {
  NeuralLabChallenge,
  DataPoint,
  SingleNeuronWeights,
  MLPWeights,
} from '../types';
import {
  predictSingle,
  predictMLP,
  evaluateModel,
  trainSingleNeuronEpoch,
  trainMLPEpoch,
  EvaluationResult,
} from '../utils/neuralMath';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Brain,
  Eye,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  CheckCircle2,
  XCircle,
  Trophy,
  HelpCircle,
  Layers,
  Activity,
  AlertTriangle,
  Lightbulb,
  PlusCircle,
  Trash2,
  ChevronRight,
  TrendingDown,
  Percent,
} from 'lucide-react';

export const Mission3NeuralLab: React.FC = () => {
  const [labSection, setLabSection] = useState<'vision' | 'boundary'>('vision');
  const [selectedChallengeId, setSelectedChallengeId] = useState<1 | 2 | 3>(1);
  const currentChallenge: NeuralLabChallenge =
    NEURAL_LAB_CHALLENGES.find((c) => c.id === selectedChallengeId) ||
    NEURAL_LAB_CHALLENGES[0];

  // Weights state
  const [singleWeights, setSingleWeights] = useState<SingleNeuronWeights>({
    w1: 0.4,
    w2: 0.2,
    bias: 0.1,
  });

  const [mlpWeights, setMlpWeights] = useState<MLPWeights>({
    h1: { w1: 2.0, w2: 2.0, bias: -1.0 },
    h2: { w1: 2.0, w2: 2.0, bias: -3.0 },
    out: { w1: 2.0, w2: -2.0, bias: -1.0 },
  });

  // Custom or challenge dataset
  const [dataset, setDataset] = useState<DataPoint[]>(currentChallenge.dataset);
  const [customClassToAdd, setCustomClassToAdd] = useState<0 | 1>(1);

  // Training state
  const [isTraining, setIsTraining] = useState<boolean>(false);
  const [epochsTrained, setEpochsTrained] = useState<number>(0);
  const [learningRate, setLearningRate] = useState<number>(0.8);
  const [paradoxConfirmed, setParadoxConfirmed] = useState<boolean>(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState<boolean>(false);

  // Canvas ref for heatmap
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Initialize on challenge change
  useEffect(() => {
    setDataset(currentChallenge.dataset);
    setEpochsTrained(0);
    setIsTraining(false);
    setParadoxConfirmed(false);

    if (currentChallenge.architectureType === 'single') {
      setSingleWeights(currentChallenge.initialWeights as SingleNeuronWeights);
    } else {
      setMlpWeights(currentChallenge.initialWeights as MLPWeights);
    }
  }, [selectedChallengeId]);

  // Current predictor function
  const predict = (x1: number, x2: number) => {
    if (currentChallenge.architectureType === 'single') {
      return predictSingle(x1, x2, singleWeights);
    } else {
      return predictMLP(x1, x2, mlpWeights);
    }
  };

  // Evaluation stats
  const evaluation: EvaluationResult = useMemo(() => {
    return evaluateModel(dataset, (x1, x2) => {
      const res = predict(x1, x2);
      return { prob: res.prob, label: res.label };
    });
  }, [dataset, singleWeights, mlpWeights, currentChallenge.architectureType]);

  // Check goal achievement
  const isGoalMet = useMemo(() => {
    if (currentChallenge.isParadox) {
      return paradoxConfirmed || evaluation.accuracyPercent >= 75;
    }
    return evaluation.accuracyPercent === 100;
  }, [evaluation.accuracyPercent, currentChallenge.isParadox, paradoxConfirmed]);

  // Handle victory sound & confetti
  const prevMetRef = useRef<boolean>(false);
  useEffect(() => {
    if (isGoalMet && !prevMetRef.current) {
      sounds.playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    }
    prevMetRef.current = isGoalMet;
  }, [isGoalMet]);

  // Automated training loop
  useEffect(() => {
    if (!isTraining) return;

    const interval = setInterval(() => {
      if (currentChallenge.architectureType === 'single') {
        setSingleWeights((prev) => {
          const next = trainSingleNeuronEpoch(dataset, prev, learningRate);
          return next;
        });
      } else {
        setMlpWeights((prev) => {
          const next = trainMLPEpoch(dataset, prev, learningRate);
          return next;
        });
      }
      setEpochsTrained((e) => e + 1);
    }, 60);

    return () => clearInterval(interval);
  }, [isTraining, dataset, learningRate, currentChallenge.architectureType]);

  // Draw 2D Decision Boundary Heatmap on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    // Coordinate domain: [-0.2, 1.2]
    const minCoord = -0.2;
    const maxCoord = 1.2;
    const range = maxCoord - minCoord;

    const toCanvasX = (x: number) => ((x - minCoord) / range) * width;
    const toCanvasY = (y: number) => height - ((y - minCoord) / range) * height;

    // Low-resolution grid rendering for performance
    const res = 60;
    const cellW = width / res;
    const cellH = height / res;

    for (let i = 0; i < res; i++) {
      for (let j = 0; j < res; j++) {
        const x1 = minCoord + (i / res) * range;
        const x2 = minCoord + ((res - 1 - j) / res) * range;

        const { prob } = predict(x1, x2);

        // Smooth color interpolation:
        // prob ~ 0: Indigo/Slate blue (rgb 30, 41, 59)
        // prob ~ 0.5: Neutral divider (rgb 15, 23, 42)
        // prob ~ 1: Amber/Orange glow (rgb 180, 83, 9)
        if (prob >= 0.5) {
          const alpha = Math.min(0.85, (prob - 0.5) * 1.5 + 0.15);
          ctx.fillStyle = `rgba(245, 158, 11, ${alpha})`;
        } else {
          const alpha = Math.min(0.85, (0.5 - prob) * 1.5 + 0.15);
          ctx.fillStyle = `rgba(59, 130, 246, ${alpha})`;
        }

        ctx.fillRect(i * cellW, j * cellH, cellW + 1, cellH + 1);
      }
    }

    // Draw Grid Lines (at 0 and 1)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // x = 0, x = 1
    ctx.beginPath();
    ctx.moveTo(toCanvasX(0), 0);
    ctx.lineTo(toCanvasX(0), height);
    ctx.moveTo(toCanvasX(1), 0);
    ctx.lineTo(toCanvasX(1), height);
    // y = 0, y = 1
    ctx.moveTo(0, toCanvasY(0));
    ctx.lineTo(width, toCanvasY(0));
    ctx.moveTo(0, toCanvasY(1));
    ctx.lineTo(width, toCanvasY(1));
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Decision Boundary Line contour for single perceptron
    if (currentChallenge.architectureType === 'single') {
      const { w1, w2, bias } = singleWeights;
      if (Math.abs(w2) > 0.001) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 8;
        ctx.beginPath();

        const xStart = minCoord;
        const yStart = (-bias - w1 * xStart) / w2;

        const xEnd = maxCoord;
        const yEnd = (-bias - w1 * xEnd) / w2;

        ctx.moveTo(toCanvasX(xStart), toCanvasY(yStart));
        ctx.lineTo(toCanvasX(xEnd), toCanvasY(yEnd));
        ctx.stroke();
        ctx.shadowBlur = 0;
      }
    }

    // Draw Data Points
    dataset.forEach((p) => {
      const px = toCanvasX(p.x1);
      const py = toCanvasY(p.x2);
      const { label } = predict(p.x1, p.x2);
      const isCorrect = label === p.label;

      // Glow circle
      ctx.beginPath();
      ctx.arc(px, py, 13, 0, Math.PI * 2);
      ctx.fillStyle = p.label === 1 ? '#f59e0b' : '#3b82f6';
      ctx.shadowColor = p.label === 1 ? '#fbbf24' : '#60a5fa';
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Border indicating correct/incorrect
      ctx.lineWidth = 3;
      ctx.strokeStyle = isCorrect ? '#10b981' : '#ef4444';
      ctx.stroke();

      // Label text inside
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${p.label}`, px, py);
    });
  }, [dataset, singleWeights, mlpWeights, currentChallenge.architectureType]);

  // Click on canvas to add custom point in sandbox mode
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    const minCoord = -0.2;
    const maxCoord = 1.2;
    const range = maxCoord - minCoord;

    const x1 = parseFloat((minCoord + (cx / rect.width) * range).toFixed(2));
    const x2 = parseFloat((maxCoord - (cy / rect.height) * range).toFixed(2));

    sounds.playClick();
    const newPt: DataPoint = {
      id: `pt_${Date.now()}`,
      x1,
      x2,
      label: customClassToAdd,
      name: `(${x1}, ${x2})`,
    };
    setDataset((prev) => [...prev, newPt]);
  };

  const resetWeights = () => {
    sounds.playClick();
    setIsTraining(false);
    setEpochsTrained(0);
    if (currentChallenge.architectureType === 'single') {
      setSingleWeights(currentChallenge.initialWeights as SingleNeuronWeights);
    } else {
      setMlpWeights(currentChallenge.initialWeights as MLPWeights);
    }
  };

  const handleStepTrain = () => {
    sounds.playMove();
    if (currentChallenge.architectureType === 'single') {
      setSingleWeights((prev) => trainSingleNeuronEpoch(dataset, prev, learningRate));
    } else {
      setMlpWeights((prev) => trainMLPEpoch(dataset, prev, learningRate));
    }
    setEpochsTrained((e) => e + 1);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto select-none">
      {/* Primary Mode Selector */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row items-center gap-1.5 w-full">
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setLabSection('vision');
            }}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
              labSection === 'vision'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30 ring-1 ring-emerald-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Практикум: Комп'ютерний зір 3×3 (Зроби сам!)</span>
            <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-full text-emerald-300 font-bold border border-emerald-500/20">
              4 Практичні місії
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setLabSection('boundary');
            }}
            className={`w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition ${
              labSection === 'boundary'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-1 ring-purple-400'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>Лабораторія: 2D Межа рішень (Парадокс XOR & Backprop)</span>
            <span className="text-[10px] bg-slate-950/60 px-2 py-0.5 rounded-full text-purple-300 font-bold border border-purple-500/20">
              Теорія
            </span>
          </button>
        </div>
      </div>

      {labSection === 'vision' ? (
        <PixelPerceptronLab />
      ) : (
        <>
          {/* Top Banner */}
          <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-3xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-purple-400">
                Місія 3 • 8–9 класи
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Лабораторія Штучного Інтелекту
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Перцептрон & Глибоке навчання (MLP)
            </h1>
          </div>
        </div>

        {/* Experiment selector tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {NEURAL_LAB_CHALLENGES.map((ch) => (
            <button
              key={ch.id}
              onClick={() => {
                sounds.playClick();
                setSelectedChallengeId(ch.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                selectedChallengeId === ch.id
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>{ch.id === 1 ? '1: Перцептрон' : ch.id === 2 ? '2: Пастка XOR' : '3: Deep Learning'}</span>
              {selectedChallengeId === ch.id && (
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Challenge Subtitle & Historical Context */}
      <div className="bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/20 p-4 rounded-3xl space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>{currentChallenge.title}</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {currentChallenge.historicalContext}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="px-3 py-1.5 rounded-xl bg-purple-950/60 border border-purple-500/30 text-purple-300 font-mono text-xs flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Епох: {epochsTrained}</span>
            </div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-400">
            <strong className="text-amber-400">Завдання дослідника: </strong>
            {currentChallenge.goal}
          </div>
          <div className="text-[11px] text-purple-300 bg-purple-950/60 px-2.5 py-0.5 rounded-full border border-purple-500/20">
            Архітектура: {currentChallenge.architectureType === 'single' ? 'Один нейрон (2 входи, 1 вихід)' : 'Багатошарова мережа (2-2-1)'}
          </div>
        </div>
      </div>

      {/* Main Grid Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: 2D Decision Boundary Canvas (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>2D Поле класифікації (Межа рішень):</span>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-3 text-[11px]">
                <div className="flex items-center gap-1.5 text-blue-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block shadow-sm" />
                  <span>Клас 0</span>
                </div>
                <div className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm" />
                  <span>Клас 1</span>
                </div>
              </div>
            </div>

            {/* Canvas wrapper */}
            <div className="relative aspect-square w-full max-w-[440px] mx-auto rounded-2xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950">
              <canvas
                ref={canvasRef}
                width={360}
                height={360}
                onClick={handleCanvasClick}
                className="w-full h-full cursor-crosshair block"
                title="Клікніть, щоб додати власну точку даних!"
              />

              {/* Axis labels */}
              <span className="absolute bottom-1 right-2 text-[10px] font-mono text-slate-400 font-bold">
                X₁
              </span>
              <span className="absolute top-2 left-2 text-[10px] font-mono text-slate-400 font-bold">
                X₂
              </span>
            </div>

            {/* Sandbox add point helper */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-400 text-[11px]">Додати точку кліком:</span>
                <button
                  type="button"
                  onClick={() => setCustomClassToAdd(0)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                    customClassToAdd === 0
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Клас 0
                </button>
                <button
                  type="button"
                  onClick={() => setCustomClassToAdd(1)}
                  className={`px-2 py-0.5 rounded-lg text-xs font-bold transition ${
                    customClassToAdd === 1
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  Клас 1
                </button>
              </div>

              {dataset.length > 4 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setDataset(currentChallenge.dataset);
                  }}
                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                  title="Скинути до стандартних 4 точок"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Скинути точки</span>
                </button>
              )}
            </div>
          </div>

          {/* Dataset Results Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-2">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              Таблиця відповідей нейромережі:
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {evaluation.pointResults.map((pr, idx) => (
                <div
                  key={pr.id || idx}
                  className={`p-2 rounded-2xl border flex flex-col items-center justify-center gap-1 transition ${
                    pr.isCorrect
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                  }`}
                >
                  <div className="flex items-center gap-1 text-[11px] font-mono">
                    <span className="text-slate-400">Точка {idx + 1}:</span>
                    <strong>{pr.target}</strong>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span className="text-slate-400">ШІ:</span>
                    <strong className="font-mono text-white">{(pr.prob * 100).toFixed(0)}%</strong>
                    {pr.isCorrect ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Weights, Network Diagram & Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-3">
          {/* Metrics Card (Accuracy & Loss) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl grid grid-cols-2 gap-3">
            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                  evaluation.accuracyPercent === 100
                    ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
                    : evaluation.accuracyPercent >= 75
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-rose-500 text-white'
                }`}
              >
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Точність</span>
                <div className="text-lg font-black text-white">
                  {evaluation.accuracyPercent}%
                  <span className="text-xs text-slate-500 font-normal ml-1">
                    ({evaluation.correctCount}/{evaluation.totalCount})
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Функція втрат (Loss)</span>
                <div className="text-lg font-black text-purple-300 font-mono">
                  {evaluation.loss}
                </div>
              </div>
            </div>
          </div>

          {/* Special Minsky Paradox Banner for Challenge 2 */}
          {currentChallenge.isParadox && (
            <div className="bg-gradient-to-br from-amber-950/60 via-slate-900 to-purple-950/40 border-2 border-amber-500/40 p-4 rounded-3xl space-y-2.5">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    Математична пастка: Неможливо розділити прямою!
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Як би ви не рухали повзунки ваг, <strong>1 лінійна пряма</strong> ніколи не зможе одночасно відокремити дві діагональні точки (0,1 і 1,0) від (0,0 і 1,1). Максимальна точність обмежена 75%.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  sounds.playSuccess();
                  setParadoxConfirmed(true);
                  setSelectedChallengeId(3);
                }}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/30 transition"
              >
                <span>Підтверджую відкриття Мінського ➔ Подолати за допомогою Deep Learning!</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Success Card when 100% is reached */}
          {isGoalMet && !currentChallenge.isParadox && (
            <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/50 p-4 rounded-3xl shadow-xl shadow-emerald-500/20 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Мета досягнута: 100% точність!</h3>
                  <p className="text-xs text-emerald-300">
                    {currentChallenge.id === 1
                      ? 'Перцептрон бездоганно розділив логічний оператор!'
                      : 'Багатошаровий перцептрон (Deep Learning) подолав парадокс XOR!'}
                  </p>
                </div>
              </div>

              {selectedChallengeId < 3 && (
                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setSelectedChallengeId((prev) => (prev + 1) as 1 | 2 | 3);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 transition"
                >
                  <span>Перейти до наступного експерименту</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Interactive Weight Sliders */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-purple-400" />
                <span>Налаштування ваг (Синапси):</span>
              </span>
              <button
                type="button"
                onClick={resetWeights}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 transition"
                title="Скинути ваги"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Скинути</span>
              </button>
            </div>

            {currentChallenge.architectureType === 'single' ? (
              // Single Perceptron Sliders
              <div className="space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono">Вага w₁ (вплив входу X₁):</span>
                    <span className="font-bold text-purple-300 font-mono">{singleWeights.w1}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={singleWeights.w1}
                    onChange={(e) =>
                      setSingleWeights((prev) => ({
                        ...prev,
                        w1: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono">Вага w₂ (вплив входу X₂):</span>
                    <span className="font-bold text-purple-300 font-mono">{singleWeights.w2}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={singleWeights.w2}
                    onChange={(e) =>
                      setSingleWeights((prev) => ({
                        ...prev,
                        w2: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-purple-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-mono">Зсув (bias / поріг збудження):</span>
                    <span className="font-bold text-amber-300 font-mono">{singleWeights.bias}</span>
                  </div>
                  <input
                    type="range"
                    min="-4"
                    max="4"
                    step="0.1"
                    value={singleWeights.bias}
                    onChange={(e) =>
                      setSingleWeights((prev) => ({
                        ...prev,
                        bias: parseFloat(e.target.value),
                      }))
                    }
                    className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                  />
                </div>
              </div>
            ) : (
              // Multi-Layer Perceptron (Deep Learning) Sliders
              <div className="space-y-3">
                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-purple-300 uppercase tracking-wider block">
                    Прихований нейрон 1 (Межа OR):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">w1: {mlpWeights.h1.w1}</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.2"
                        value={mlpWeights.h1.w1}
                        onChange={(e) =>
                          setMlpWeights((prev) => ({
                            ...prev,
                            h1: { ...prev.h1, w1: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full accent-purple-500 h-1 bg-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">w2: {mlpWeights.h1.w2}</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.2"
                        value={mlpWeights.h1.w2}
                        onChange={(e) =>
                          setMlpWeights((prev) => ({
                            ...prev,
                            h1: { ...prev.h1, w2: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full accent-purple-500 h-1 bg-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">b: {mlpWeights.h1.bias}</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.2"
                        value={mlpWeights.h1.bias}
                        onChange={(e) =>
                          setMlpWeights((prev) => ({
                            ...prev,
                            h1: { ...prev.h1, bias: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full accent-amber-500 h-1 bg-slate-800"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider block">
                    Прихований нейрон 2 (Межа AND):
                  </span>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">w1: {mlpWeights.h2.w1}</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.2"
                        value={mlpWeights.h2.w1}
                        onChange={(e) =>
                          setMlpWeights((prev) => ({
                            ...prev,
                            h2: { ...prev.h2, w1: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full accent-indigo-500 h-1 bg-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">w2: {mlpWeights.h2.w2}</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.2"
                        value={mlpWeights.h2.w2}
                        onChange={(e) =>
                          setMlpWeights((prev) => ({
                            ...prev,
                            h2: { ...prev.h2, w2: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full accent-indigo-500 h-1 bg-slate-800"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-mono">b: {mlpWeights.h2.bias}</span>
                      <input
                        type="range"
                        min="-5"
                        max="5"
                        step="0.2"
                        value={mlpWeights.h2.bias}
                        onChange={(e) =>
                          setMlpWeights((prev) => ({
                            ...prev,
                            h2: { ...prev.h2, bias: parseFloat(e.target.value) },
                          }))
                        }
                        className="w-full accent-amber-500 h-1 bg-slate-800"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Training Action Buttons */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleStepTrain}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition flex items-center gap-1"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>1 крок (SGD)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setIsTraining(!isTraining);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md ${
                    isTraining
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30'
                  }`}
                >
                  {isTraining ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>{isTraining ? 'Зупинити навчання' : 'Авто-навчання (Backprop)'}</span>
                </button>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <span>Швидкість η:</span>
                <select
                  value={learningRate}
                  onChange={(e) => setLearningRate(parseFloat(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-white text-[11px] rounded-lg px-2 py-1"
                >
                  <option value="0.2">0.2 (Повільна)</option>
                  <option value="0.5">0.5 (Нормальна)</option>
                  <option value="0.8">0.8 (Швидка)</option>
                  <option value="1.5">1.5 (Агресивна)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Research Concept Guide Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-2 text-xs text-slate-300">
            <div className="flex items-center gap-2 font-bold text-white">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>Як це працює у справжньому штучному інтелекті?</span>
            </div>
            <p className="leading-relaxed text-slate-400">
              Кожен нейрон множить свої входи на синаптичні ваги та додає зміщення. Коли мільярди таких простих нейронів об'єднуються у глибокі шари, вони здатні розпізнавати фотографії, розуміти людську мову (як Gemini чи ChatGPT) і керувати автопілотом!
            </p>
          </div>
        </div>
      </div>
    </>
  )}
</div>
  );
};
