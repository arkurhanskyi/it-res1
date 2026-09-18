import React, { useState, useMemo, useEffect } from 'react';
import { GridCell, CellColor } from '../types';
import { COLOR_TASKS, COLOR_PALETTE_INFO } from '../data/colorLangTasks';
import {
  decompileGrid,
  executeColorProgram,
  ExecutionResult,
  ExecutionStep,
  isRowGreenBoundary,
  isRowForLoopHeader,
} from '../utils/colorInterpreter';
import { OrnamentSpecModal } from './OrnamentSpecModal';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  Terminal,
  BookOpen,
  Trophy,
  ChevronRight,
  Code2,
  Eraser,
  Eye,
  Layers,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';

export const Mission2ColorLang: React.FC = () => {
  const [currentTaskId, setCurrentTaskId] = useState<1 | 2 | 3>(1);
  const currentTask = COLOR_TASKS.find((t) => t.id === currentTaskId) || COLOR_TASKS[0];

  // Grid state (rows of pure color cells)
  const [grid, setGrid] = useState<GridCell[][]>(() =>
    JSON.parse(JSON.stringify(currentTask.initialGrid))
  );

  // Active color chosen from the palette
  const [activeColor, setActiveColor] = useState<CellColor>('red');

  // Modal for language specification
  const [isSpecModalOpen, setIsSpecModalOpen] = useState<boolean>(false);

  // Toggle decompiler view (inspection of computer interpretation)
  const [showDecompiler, setShowDecompiler] = useState<boolean>(false);

  // Execution state
  const [executionResult, setExecutionResult] = useState<ExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeStepRow, setActiveStepRow] = useState<number | null>(null);
  const [liveVars, setLiveVars] = useState<Record<string, number>>({});
  const [liveOutput, setLiveOutput] = useState<number[]>([]);
  const [isTaskCompleted, setIsTaskCompleted] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);

  // Drag-to-paint state
  const [isMouseDown, setIsMouseDown] = useState<boolean>(false);

  // Reset grid whenever task changes
  useEffect(() => {
    setGrid(JSON.parse(JSON.stringify(currentTask.initialGrid)));
    setExecutionResult(null);
    setActiveStepRow(null);
    setLiveVars({});
    setLiveOutput([]);
    setIsTaskCompleted(false);
    setValidationError(null);
    setShowHint(false);
  }, [currentTaskId]);

  // Real-time decompilation
  const decompiledCode = useMemo(() => {
    return decompileGrid(grid);
  }, [grid]);

  // Handle painting a cell
  const paintCell = (rIdx: number, cIdx: number) => {
    setValidationError(null);
    setIsTaskCompleted(false);

    setGrid((prev) => {
      if (prev[rIdx][cIdx].color === activeColor) return prev;
      const next = prev.map((r) => [...r]);
      next[rIdx][cIdx] = { color: activeColor };
      return next;
    });
  };

  const handleCellClick = (rIdx: number, cIdx: number) => {
    sounds.playClick();
    paintCell(rIdx, cIdx);
  };

  const handleCellMouseEnter = (rIdx: number, cIdx: number) => {
    if (isMouseDown) {
      paintCell(rIdx, cIdx);
    }
  };

  // Row operations
  const fillRowWith = (rIdx: number, color: CellColor) => {
    sounds.playClick();
    setValidationError(null);
    setIsTaskCompleted(false);
    setGrid((prev) => {
      const next = prev.map((r) => [...r]);
      next[rIdx] = Array.from({ length: next[rIdx].length }, () => ({ color }));
      return next;
    });
  };

  // Run execution animation
  const handleRun = () => {
    sounds.playClick();
    setValidationError(null);
    setIsExecuting(true);
    setActiveStepRow(null);
    setLiveVars({ X: 0, Y: 0, Z: 0, S: 0, A: 0, B: 0 });
    setLiveOutput([]);

    const result = executeColorProgram(grid);
    setExecutionResult(result);

    if (result.error) {
      setValidationError(result.error);
      setIsExecuting(false);
      return;
    }

    // Step-by-step animation if steps exist
    if (result.steps.length > 0) {
      let stepIdx = 0;
      const interval = setInterval(() => {
        if (stepIdx < result.steps.length) {
          const step = result.steps[stepIdx];
          setActiveStepRow(step.rowIndex);
          setLiveVars(step.variables);
          setLiveOutput(step.output);
          sounds.playMove();
          stepIdx++;
        } else {
          clearInterval(interval);
          setIsExecuting(false);
          setActiveStepRow(null);
          setLiveVars(result.variables);
          setLiveOutput(result.output);
          validateSuccess(result.output);
        }
      }, 400);
    } else {
      setIsExecuting(false);
      setLiveVars(result.variables);
      setLiveOutput(result.output);
      validateSuccess(result.output);
    }
  };

  const validateSuccess = (output: number[]) => {
    const formattedOutput = output.length > 0 ? output.join(', ') : 'порожньо';

    if (currentTaskId === 1) {
      if (output.length > 0 && output[output.length - 1] === 15) {
        setIsTaskCompleted(true);
        sounds.playSuccess();
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        setValidationError(null);
      } else {
        setValidationError(`Отримано вивід: [ ${formattedOutput} ]. Очікувалось: [ 15 ]. Перевірте значення коефіцієнта при змінній X у виразі Z = k · X + Y.`);
      }
    } else if (currentTaskId === 2) {
      const match = output.length > 0 && output[output.length - 1] === 10;
      if (match) {
        setIsTaskCompleted(true);
        sounds.playSuccess();
        confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
        setValidationError(null);
      } else {
        setValidationError(`Отримано вивід: [ ${formattedOutput} ]. Очікувалась сума: [ 10 ]. Перевірте цілісність конструкції циклу FOR та межі його лічильника.`);
      }
    } else if (currentTaskId === 3) {
      const validSeq = output.join(',') === '2,4,8,16';
      const validEnd = output.includes(16) || output.includes(42) || output.join(',') === '10,20,30';
      if (validSeq || validEnd) {
        setIsTaskCompleted(true);
        sounds.playSuccess();
        confetti({ particleCount: 120, spread: 90, origin: { y: 0.6 } });
        setValidationError(null);
      } else {
        setValidationError(`Отримано вивід: [ ${formattedOutput} ]. Очікувана послідовність: [ 2, 4, 8, 16 ]. Перевірте початковий стан змінної та дію множення в циклі.`);
      }
    }
  };

  // Reset to initial task grid
  const handleReset = () => {
    sounds.playClick();
    setGrid(JSON.parse(JSON.stringify(currentTask.initialGrid)));
    setExecutionResult(null);
    setActiveStepRow(null);
    setLiveVars({});
    setLiveOutput([]);
    setIsTaskCompleted(false);
    setValidationError(null);
  };

  return (
    <div
      className="space-y-4 max-w-6xl mx-auto"
      onMouseDown={() => setIsMouseDown(true)}
      onMouseUp={() => setIsMouseDown(false)}
    >
      {/* Spec Modal */}
      <OrnamentSpecModal isOpen={isSpecModalOpen} onClose={() => setIsSpecModalOpen(false)} />

      {/* Top Header / Task Selector */}
      <div className="bg-slate-900/90 border border-slate-800 p-3 sm:p-4 rounded-3xl backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                Місія 2 • 6–7 класи
              </span>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full border border-slate-700">
                Мова «Орнамент»
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Код як візуальне мистецтво
            </h1>
          </div>
        </div>

        {/* Task selector tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {COLOR_TASKS.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                sounds.playClick();
                setCurrentTaskId(task.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 flex items-center gap-1.5 ${
                currentTaskId === task.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span>Завдання {task.id}</span>
              {currentTaskId === task.id && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
            </button>
          ))}
        </div>
      </div>

      {/* Task Description & Goal Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/20 p-4 rounded-3xl space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-white flex items-center gap-2">
              <span>{currentTask.title}</span>
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {currentTask.instructions}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Spec button */}
            <button
              onClick={() => {
                sounds.playClick();
                setIsSpecModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 font-bold text-xs flex items-center gap-1.5 transition shadow-sm"
            >
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <span>Довідник орнаментів</span>
            </button>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="text-slate-400">
            <strong className="text-amber-400">Ціль: </strong>
            {currentTask.testDescription}
          </div>
          <button
            type="button"
            onClick={() => {
              sounds.playClick();
              setShowHint(!showHint);
            }}
            className="text-[11px] text-indigo-300 hover:text-indigo-200 bg-indigo-950/60 hover:bg-indigo-900/60 px-3 py-1 rounded-xl border border-indigo-500/30 transition flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
            <span>{showHint ? 'Сховати підказку' : 'Підказка до завдання'}</span>
          </button>
        </div>

        {showHint && (
          <div className="text-xs text-indigo-200 bg-indigo-950/60 p-3 rounded-2xl border border-indigo-500/30 flex items-start gap-2.5 animate-in fade-in duration-200">
            <span className="text-amber-400 font-bold shrink-0">💡</span>
            <div className="leading-relaxed">
              <strong className="text-amber-300 font-semibold">Напрямок роздумів: </strong>
              {currentTask.hint}
            </div>
          </div>
        )}
      </div>

      {/* Main Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Canvas & Palette (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          {/* Visual Canvas Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-4">
            {/* Palette & Controls Bar */}
            <div className="space-y-3 pb-3 border-b border-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-indigo-400" />
                  Палітра кубиків:
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleReset}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1 transition"
                    title="Скинути до початкового стану"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Скинути</span>
                  </button>

                  <button
                    onClick={() => setShowDecompiler(!showDecompiler)}
                    className={`px-2.5 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1 transition ${
                      showDecompiler
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                    title="Показати, як комп'ютер інтерпретує візерунок"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>{showDecompiler ? 'Приховати код' : 'Декомпільований код'}</span>
                  </button>
                </div>
              </div>

              {/* Color Swatches (Only pure colors, NO letters or text on cubes!) */}
              <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
                {COLOR_PALETTE_INFO.map((item) => {
                  const isSelected = activeColor === item.color;
                  return (
                    <button
                      key={item.color}
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setActiveColor(item.color);
                      }}
                      className={`p-2 rounded-2xl border flex flex-col items-center gap-1.5 transition transform active:scale-95 ${
                        isSelected
                          ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 border-white/60 bg-slate-800'
                          : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
                      }`}
                    >
                      {/* Color swatch square */}
                      <div
                        className={`w-7 h-7 rounded-xl border shadow-sm transition ${item.bgClass}`}
                      />
                      <span className="text-[11px] font-bold text-slate-200">
                        {item.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pure Ornament Grid (The Carpet of Code) */}
            <div className="space-y-1.5 overflow-x-auto pb-2 select-none">
              <div className="min-w-[500px] space-y-1.5">
                {grid.map((rowCells, rIdx) => {
                  const isCurrentActive = activeStepRow === rIdx;
                  const isGreenBorder = isRowGreenBoundary(rowCells);
                  const isForHeader = isRowForLoopHeader(rowCells);

                  return (
                    <div
                      key={rIdx}
                      className={`flex items-center gap-2 p-1 rounded-2xl transition-all ${
                        isCurrentActive
                          ? 'bg-indigo-500/20 ring-2 ring-indigo-400 shadow-lg shadow-indigo-500/20'
                          : isForHeader
                          ? 'bg-blue-950/20'
                          : isGreenBorder
                          ? 'bg-emerald-950/20'
                          : 'hover:bg-slate-800/30'
                      }`}
                    >
                      {/* Row index indicator */}
                      <span className="w-5 text-[11px] font-mono text-slate-500 text-right shrink-0">
                        {rIdx + 1}
                      </span>

                      {/* Row cell cubes (Pure Color squares!) */}
                      <div className="flex items-center gap-1.5 flex-1">
                        {rowCells.map((cell, cIdx) => {
                          const isWhite = cell.color === 'white';
                          const isBlue = cell.color === 'blue';
                          const isRed = cell.color === 'red';
                          const isAmber = cell.color === 'amber';
                          const isGreen = cell.color === 'green';
                          const isPurple = cell.color === 'purple';
                          const isBlack = cell.color === 'black';

                          return (
                            <button
                              key={cIdx}
                              type="button"
                              onClick={() => handleCellClick(rIdx, cIdx)}
                              onMouseEnter={() => handleCellMouseEnter(rIdx, cIdx)}
                              className={`h-9 sm:h-10 flex-1 rounded-xl border transition-transform duration-75 active:scale-90 shadow-sm ${
                                isWhite
                                  ? 'bg-slate-950/90 border-slate-800 hover:border-slate-600'
                                  : isBlue
                                  ? 'bg-blue-600 border-blue-400 shadow-blue-600/30'
                                  : isRed
                                  ? 'bg-rose-500 border-rose-300 shadow-rose-500/30'
                                  : isAmber
                                  ? 'bg-amber-400 border-amber-200 shadow-amber-400/30'
                                  : isGreen
                                  ? 'bg-emerald-500 border-emerald-300 shadow-emerald-500/30'
                                  : isPurple
                                  ? 'bg-purple-600 border-purple-400 shadow-purple-600/30'
                                  : 'bg-slate-950 border-slate-700 shadow-inner'
                              }`}
                              title={`Рядок ${rIdx + 1}, Стовпець ${cIdx + 1}: ${cell.color}`}
                            />
                          );
                        })}
                      </div>

                      {/* Quick row actions */}
                      <div className="flex items-center gap-1 shrink-0 opacity-70 hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => fillRowWith(rIdx, 'blue')}
                          className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-500/50 hover:bg-blue-600 text-white flex items-center justify-center text-[10px] transition"
                          title="Залити весь рядок синім (Заголовок циклу FOR)"
                        >
                          🟦
                        </button>
                        <button
                          type="button"
                          onClick={() => fillRowWith(rIdx, 'green')}
                          className="w-6 h-6 rounded-lg bg-emerald-600/30 border border-emerald-500/50 hover:bg-emerald-600 text-white flex items-center justify-center text-[10px] transition"
                          title="Залити весь рядок зеленим (Кінець блоку)"
                        >
                          🟩
                        </button>
                        <button
                          type="button"
                          onClick={() => fillRowWith(rIdx, 'white')}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-[10px] transition"
                          title="Очистити рядок"
                        >
                          <Eraser className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Run Button bar */}
            <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Клікайте або затискайте мишку, щоб ткати кольоровий орнамент.</span>
              </div>

              <button
                type="button"
                onClick={handleRun}
                disabled={isExecuting}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 flex items-center gap-2 transition transform active:scale-95 disabled:opacity-50"
              >
                <Play className={`w-4 h-4 fill-current ${isExecuting ? 'animate-spin' : ''}`} />
                <span>{isExecuting ? 'Розшифрування...' : 'Запустити орнамент'}</span>
              </button>
            </div>
          </div>

          {/* Optional Decompiled Code Inspector */}
          {showDecompiler && (
            <div className="bg-slate-950 border border-slate-800 rounded-3xl p-4 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-400" />
                  Комп’ютерне читання орнаменту (Синтаксичний розбір):
                </span>
                <span className="text-slate-500 font-mono text-[11px]">Auto-AST Engine</span>
              </div>

              <div className="space-y-1 font-mono text-xs max-h-48 overflow-y-auto p-2 bg-slate-900 rounded-2xl border border-slate-800">
                {decompiledCode.map((stmt) => (
                  <div
                    key={stmt.rowIndex}
                    className={`px-2 py-1 rounded-lg flex items-center justify-between ${
                      stmt.type === 'syntax_error'
                        ? 'bg-rose-950/30 text-rose-300'
                        : stmt.type === 'empty'
                        ? 'text-slate-600'
                        : 'text-slate-200 bg-slate-950/50'
                    }`}
                  >
                    <span>
                      <span className="text-slate-500 mr-2">{stmt.rowIndex + 1}:</span>
                      {stmt.text}
                    </span>
                    <span className="text-[10px] text-slate-500 uppercase">{stmt.type}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Output & RAM (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          {/* Success Card */}
          {isTaskCompleted && (
            <div className="bg-gradient-to-br from-emerald-950/80 to-slate-900 border-2 border-emerald-500/50 p-4 rounded-3xl shadow-xl shadow-emerald-500/20 space-y-3 animate-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">Орнамент розшифровано!</h3>
                  <p className="text-xs text-emerald-300">Завдання {currentTaskId} успішно виконано!</p>
                </div>
              </div>

              {currentTaskId < 3 ? (
                <button
                  onClick={() => {
                    sounds.playClick();
                    setCurrentTaskId((prev) => (prev + 1) as 1 | 2 | 3);
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-500/30 transition"
                >
                  <span>Наступне завдання</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="p-2.5 rounded-xl bg-emerald-900/40 text-emerald-200 text-xs text-center font-bold">
                  🎉 Вітаємо! Всі 3 завдання мови «Орнамент» подолано!
                </div>
              )}
            </div>
          )}

          {/* Validation Error Card */}
          {validationError && !isTaskCompleted && (
            <div className="bg-rose-950/60 border border-rose-500/40 p-3.5 rounded-3xl text-xs text-rose-200 space-y-1">
              <div className="font-bold text-rose-300 flex items-center gap-1.5">
                <span>⚠️ Не зовсім так:</span>
              </div>
              <p className="leading-relaxed text-slate-300">{validationError}</p>
            </div>
          )}

          {/* Console Output Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-purple-400" />
                Термінал виведення (PRINT):
              </span>
              <span className="text-[10px] text-slate-500 font-mono">STDOUT</span>
            </div>

            <div className="min-h-[100px] max-h-[160px] overflow-y-auto bg-slate-950 p-3 rounded-2xl border border-slate-800 font-mono text-xs space-y-1">
              {liveOutput.length === 0 ? (
                <span className="text-slate-600 italic">Вивід порожній. Натисніть «Запустити орнамент»...</span>
              ) : (
                liveOutput.map((val, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-purple-300">
                    <span className="text-slate-600 select-none">❯</span>
                    <span className="font-bold text-white bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-500/30">
                      {val}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Registers / RAM card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-400" />
                Стан змінних (Пам’ять / RAM):
              </span>
              <span className="text-[10px] text-slate-500 font-mono">REGISTERS</span>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono text-xs">
              {['X', 'Y', 'Z', 'S'].map((vName) => {
                const val = liveVars[vName] ?? 0;
                return (
                  <div
                    key={vName}
                    className="p-2.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center gap-0.5"
                  >
                    <span className="text-[10px] text-slate-400 uppercase font-bold">{vName}</span>
                    <span className="text-base font-extrabold text-white">{val}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick reference reminder */}
          <div className="bg-slate-950 p-3.5 rounded-3xl border border-slate-800/80 space-y-2 text-xs text-slate-400">
            <div className="font-bold text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              Швидке нагадування:
            </div>
            <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400 leading-relaxed">
              <li>Кількість <strong className="text-white">чорних кубиків</strong> = змінна (1 = X, 2 = Y).</li>
              <li>Кількість <strong className="text-rose-400">червоних кубиків</strong> = числу.</li>
              <li><strong className="text-blue-400">1 синій</strong> = присвоїти (=), <strong className="text-blue-400">3 синіх</strong> = помножити (*).</li>
              <li><strong className="text-blue-400">Ряд синіх</strong> = заголовок циклу FOR.</li>
              <li><strong className="text-emerald-400">Ряд зелених</strong> = кінець циклу.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
