import React, { useState, useEffect, useRef } from 'react';
import { LABYRINTH_LEVELS } from '../data/labyrinthLevels';
import { Position, CommandToken } from '../types';
import { sounds } from '../utils/audio';
import confetti from 'canvas-confetti';
import {
  Play,
  RotateCcw,
  Sparkles,
  Award,
  AlertTriangle,
  Lightbulb,
  CornerDownLeft,
  ChevronRight,
  StepForward,
  Trophy,
  Bot,
  Zap
} from 'lucide-react';

export const Mission1Labyrinth: React.FC = () => {
  const [selectedLevelId, setSelectedLevelId] = useState<number>(1);
  const currentLevel = LABYRINTH_LEVELS.find((l) => l.id === selectedLevelId) || LABYRINTH_LEVELS[0];

  // Code editor state
  const [codeText, setCodeText] = useState<string>('вг\nвг\nпр\nпр\nнд');
  
  // Execution state
  const [playerPos, setPlayerPos] = useState<Position>(currentLevel.start);
  const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set([`${currentLevel.start.x},${currentLevel.start.y}`]));
  const [illuminatedCells, setIlluminatedCells] = useState<Set<string>>(new Set());
  const [collectedArtifacts, setCollectedArtifacts] = useState<Set<string>>(new Set());
  
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentExecutingIndex, setCurrentExecutingIndex] = useState<number | null>(null);
  const [errorLineIndex, setErrorLineIndex] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [speedMs, setSpeedMs] = useState<number>(350);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize illumination around start position
  useEffect(() => {
    resetLevel();
  }, [selectedLevelId]);

  const resetLevel = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false);
    setCurrentExecutingIndex(null);
    setErrorLineIndex(null);
    setErrorMessage(null);
    setIsSuccess(false);
    setPlayerPos(currentLevel.start);
    setCollectedArtifacts(new Set());

    // Only illuminate the start cell itself (no next steps or neighbors revealed!)
    const startKey = `${currentLevel.start.x},${currentLevel.start.y}`;
    setIlluminatedCells(new Set([startKey]));
    setVisitedCells(new Set([startKey]));
  };

  // Helper to parse code lines into token array with original line numbers
  const parsedCommands = React.useMemo(() => {
    const lines = codeText.split('\n');
    const result: Array<{ token: CommandToken; lineIndex: number; originalText: string }> = [];

    lines.forEach((line, idx) => {
      // Clean string
      const trimmed = line.trim().toLowerCase();
      if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('//')) return;

      // Match commands: вг, нд, лв, пр, or words separated by space/commas
      const matches = trimmed.match(/(вг|нд|лв|пр)/g);
      if (matches) {
        matches.forEach((m) => {
          result.push({
            token: m as CommandToken,
            lineIndex: idx,
            originalText: line,
          });
        });
      }
    });
    return result;
  }, [codeText]);

  // Append command via touch button
  const handleAddCommand = (cmd: CommandToken) => {
    sounds.playClick();
    setCodeText((prev) => {
      const trimmed = prev.trimEnd();
      if (!trimmed) return cmd;
      return `${trimmed}\n${cmd}`;
    });
  };

  const handleBackspace = () => {
    sounds.playClick();
    setCodeText((prev) => {
      const lines = prev.trimEnd().split('\n');
      lines.pop();
      return lines.join('\n');
    });
  };

  const isWall = (x: number, y: number): boolean => {
    if (x < 0 || x >= currentLevel.width || y < 0 || y >= currentLevel.height) {
      return true; // boundaries are walls
    }
    return currentLevel.walls.some((w) => w.x === x && w.y === y);
  };

  // Add only the visited cell to illuminated trail (pitch black maze - no revealing what is ahead or adjacent!)
  const revealVisitedCell = (pos: Position, currentIlluminated: Set<string>) => {
    const updated = new Set(currentIlluminated);
    updated.add(`${pos.x},${pos.y}`);
    return updated;
  };

  // Execute one step
  const executeStep = (
    stepIdx: number,
    currentPos: Position,
    currentIllum: Set<string>,
    currentVisited: Set<string>,
    currentArtifacts: Set<string>
  ) => {
    if (stepIdx >= parsedCommands.length) {
      setIsRunning(false);
      setCurrentExecutingIndex(null);
      // Check if reached exit
      if (currentPos.x === currentLevel.exit.x && currentPos.y === currentLevel.exit.y) {
        setIsSuccess(true);
        sounds.playSuccess();
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } else {
        setErrorMessage('ℹ️ Програма завершилась, але дрон не дійшов до Виходу (🏁). Додайте ще команд!');
      }
      return;
    }

    const item = parsedCommands[stepIdx];
    setCurrentExecutingIndex(stepIdx);
    setErrorLineIndex(null);

    // Calculate next position
    let nextX = currentPos.x;
    let nextY = currentPos.y;

    switch (item.token) {
      case 'вг': nextY -= 1; break;
      case 'нд': nextY += 1; break;
      case 'лв': nextX -= 1; break;
      case 'пр': nextX += 1; break;
    }

    // Check collision with wall
    if (isWall(nextX, nextY)) {
      sounds.playBump();
      setIsRunning(false);
      setErrorLineIndex(item.lineIndex);
      // Reveal ONLY the specific wall that was hit so student sees what blocked the path
      if (nextX >= 0 && nextX < currentLevel.width && nextY >= 0 && nextY < currentLevel.height) {
        setIlluminatedCells((prev) => new Set(prev).add(`${nextX},${nextY}`));
      }
      setErrorMessage(
        `💥 Зіткнення зі стіною на кроці №${stepIdx + 1} (рядок ${item.lineIndex + 1}: «${item.token}»)! Рух неможливий.`
      );
      return;
    }

    // Valid move
    const newPos = { x: nextX, y: nextY };
    sounds.playStep();

    const newIllum = revealVisitedCell(newPos, currentIllum);
    const newVisited = new Set(currentVisited).add(`${nextX},${nextY}`);
    const newArtifacts = new Set(currentArtifacts);

    // Check artifacts
    const foundArtifact = currentLevel.artifacts.find(
      (a) => a.x === nextX && a.y === nextY && !newArtifacts.has(a.name)
    );
    if (foundArtifact) {
      newArtifacts.add(foundArtifact.name);
      sounds.playCrystal();
    }

    setPlayerPos(newPos);
    setIlluminatedCells(newIllum);
    setVisitedCells(newVisited);
    setCollectedArtifacts(newArtifacts);

    // Check if exit reached mid-path
    if (newPos.x === currentLevel.exit.x && newPos.y === currentLevel.exit.y && stepIdx === parsedCommands.length - 1) {
      setIsRunning(false);
      setCurrentExecutingIndex(null);
      setIsSuccess(true);
      sounds.playSuccess();
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      return;
    }

    timeoutRef.current = setTimeout(() => {
      executeStep(stepIdx + 1, newPos, newIllum, newVisited, newArtifacts);
    }, speedMs);
  };

  const handleRun = () => {
    if (parsedCommands.length === 0) {
      setErrorMessage('Введіть хоча б одну команду руху (вг, нд, лв, пр)');
      return;
    }

    resetLevel();
    setIsRunning(true);
    setErrorMessage(null);
    setErrorLineIndex(null);

    const startKey = `${currentLevel.start.x},${currentLevel.start.y}`;
    // Start with slight delay
    timeoutRef.current = setTimeout(() => {
      executeStep(
        0,
        currentLevel.start,
        new Set([startKey]),
        new Set([startKey]),
        new Set()
      );
    }, 200);
  };

  const handleStop = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsRunning(false);
    setCurrentExecutingIndex(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Level Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Bot className="w-4 h-4" />
            <span>Місія 1 • 5 Клас • Просторове орієнтування</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            {currentLevel.title}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            {currentLevel.description}
          </p>
        </div>

        {/* Level Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-stretch md:self-auto justify-center">
          {LABYRINTH_LEVELS.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => {
                setSelectedLevelId(lvl.id);
                sounds.playClick();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedLevelId === lvl.id
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <span>Сектор {lvl.id}</span>
              {selectedLevelId === lvl.id && <ChevronRight className="w-3 h-3" />}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Left is Maze View, Right is Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Labyrinth & Status (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
            {/* Ambient radar glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-300">
                  Дослідницький сенсор туману
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-500/40 border border-emerald-400 inline-block" />
                  Відкрито: {Math.round((illuminatedCells.size / (currentLevel.width * currentLevel.height)) * 100)}%
                </span>
                {currentLevel.artifacts.length > 0 && (
                  <span className="flex items-center gap-1 text-amber-300">
                    <Sparkles className="w-3.5 h-3.5" />
                    Артефакти: {collectedArtifacts.size}/{currentLevel.artifacts.length}
                  </span>
                )}
              </div>
            </div>

            {/* Maze Board Container */}
            <div className="flex justify-center items-center py-2 overflow-x-auto">
              <div
                className="grid gap-1 bg-slate-950 p-3 rounded-2xl border border-slate-800 shadow-2xl relative select-none"
                style={{
                  gridTemplateColumns: `repeat(${currentLevel.width}, minmax(0, 1fr))`,
                  width: 'min(100%, 480px)',
                  aspectRatio: `${currentLevel.width} / ${currentLevel.height}`,
                }}
              >
                {Array.from({ length: currentLevel.height }).map((_, y) =>
                  Array.from({ length: currentLevel.width }).map((_, x) => {
                    const key = `${x},${y}`;
                    const isKnown = illuminatedCells.has(key);
                    const isVisited = visitedCells.has(key);
                    const isRobotHere = playerPos.x === x && playerPos.y === y;
                    const wallCell = isWall(x, y);
                    const isStartCell = currentLevel.start.x === x && currentLevel.start.y === y;
                    const isExitCell = currentLevel.exit.x === x && currentLevel.exit.y === y;
                    const artifact = currentLevel.artifacts.find((a) => a.x === x && a.y === y);
                    const isArtifactCollected = artifact && collectedArtifacts.has(artifact.name);

                    // If tile is in darkness:
                    if (!isKnown) {
                      return (
                        <div
                          key={key}
                          className="w-full h-full rounded-md bg-slate-950 border border-slate-900/60 flex items-center justify-center transition-all duration-300 relative group"
                        >
                          <span className="text-[9px] text-slate-800 font-mono select-none">?</span>
                        </div>
                      );
                    }

                    // Illuminated wall
                    if (wallCell) {
                      return (
                        <div
                          key={key}
                          className="w-full h-full rounded-md bg-slate-800 border border-slate-700/80 flex items-center justify-center shadow-inner relative"
                          title="Стіна"
                        >
                          <div className="w-2 h-2 rounded-xs bg-slate-700 opacity-60" />
                        </div>
                      );
                    }

                    // Illuminated floor tile
                    return (
                      <div
                        key={key}
                        className={`w-full h-full rounded-md flex items-center justify-center transition-all duration-200 relative border ${
                          isRobotHere
                            ? 'bg-emerald-950/80 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                            : isExitCell
                            ? 'bg-amber-950/40 border-amber-400/80 animate-pulse'
                            : isVisited
                            ? 'bg-emerald-950/30 border-emerald-500/20'
                            : 'bg-slate-900 border-slate-800/80'
                        }`}
                      >
                        {/* Robot Icon */}
                        {isRobotHere && (
                          <div className="relative z-10 flex items-center justify-center">
                            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg transform scale-110 transition-transform">
                              <Bot className="w-4 h-4 animate-bounce" />
                            </div>
                            {/* Flashlight beam */}
                            <div className="absolute inset-0 w-12 h-12 -left-3 -top-3 bg-emerald-400/20 rounded-full blur-sm pointer-events-none" />
                          </div>
                        )}

                        {/* Start Flag */}
                        {!isRobotHere && isStartCell && (
                          <span className="text-xs text-slate-400 font-bold">S</span>
                        )}

                        {/* Exit Portal */}
                        {!isRobotHere && isExitCell && (
                          <div className="flex flex-col items-center">
                            <span className="text-sm">🏁</span>
                          </div>
                        )}

                        {/* Artifact */}
                        {!isRobotHere && artifact && !isArtifactCollected && (
                          <div className="animate-bounce text-xs" title={artifact.name}>
                            💎
                          </div>
                        )}

                        {/* Footprint marker */}
                        {!isRobotHere && !isStartCell && !isExitCell && isVisited && (
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400/30" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Error or Status Alert */}
            {errorMessage && (
              <div
                className={`mt-4 p-3 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm animate-in fade-in ${
                  errorMessage.includes('💥')
                    ? 'bg-rose-950/60 border-rose-800/80 text-rose-200'
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                }`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                <div className="flex-1 font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Victory Card */}
            {isSuccess && (
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-slate-900 border border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in zoom-in-95">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-white text-sm sm:text-base">
                      Місію Сектора {selectedLevelId} виконано!
                    </h3>
                    <p className="text-xs text-emerald-300">
                      Дрон успішно дістався виходу крізь темряву!
                    </p>
                  </div>
                </div>

                {selectedLevelId < LABYRINTH_LEVELS.length && (
                  <button
                    onClick={() => setSelectedLevelId((prev) => prev + 1)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition"
                  >
                    <span>Наступний сектор</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Touch Controls (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-white text-sm">Програма навігації</span>
              </div>
              <span className="text-[11px] text-slate-400">
                Команд: {parsedCommands.length}
              </span>
            </div>

            {/* Code Editor Container */}
            <div className="relative rounded-xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs sm:text-sm">
              <div className="flex min-h-[220px] max-h-[280px]">
                {/* Line numbers column */}
                <div className="w-10 bg-slate-900/80 border-r border-slate-800/80 py-3 px-1 text-right text-slate-500 select-none font-mono text-xs">
                  {codeText.split('\n').map((_, idx) => (
                    <div
                      key={idx}
                      className={`h-6 leading-6 ${
                        errorLineIndex === idx
                          ? 'text-rose-400 font-bold bg-rose-500/20 rounded'
                          : parsedCommands[currentExecutingIndex ?? -1]?.lineIndex === idx
                          ? 'text-emerald-300 font-bold'
                          : ''
                      }`}
                    >
                      {idx + 1}
                    </div>
                  ))}
                </div>

                {/* Textarea */}
                <textarea
                  value={codeText}
                  onChange={(e) => {
                    setCodeText(e.target.value);
                    setErrorLineIndex(null);
                    setErrorMessage(null);
                  }}
                  disabled={isRunning}
                  spellCheck={false}
                  placeholder={`вг\nпр\nнд\nлв`}
                  className="flex-1 p-3 bg-transparent text-emerald-300 placeholder-slate-600 focus:outline-hidden resize-none font-mono leading-6 leading-relaxed"
                />
              </div>
            </div>

            {/* Mobile / Quick Command Buttons */}
            <div className="mt-3">
              <div className="text-[11px] text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Швидкі кнопки (для смартфонів):</span>
                <span className="text-[10px] text-slate-500">можна натискати пальцем</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => handleAddCommand('вг')}
                  disabled={isRunning}
                  className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition"
                >
                  <span className="text-emerald-400 font-extrabold text-sm">▲</span>
                  <span>вг (вгору)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCommand('нд')}
                  disabled={isRunning}
                  className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition"
                >
                  <span className="text-emerald-400 font-extrabold text-sm">▼</span>
                  <span>нд (вниз)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCommand('лв')}
                  disabled={isRunning}
                  className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition"
                >
                  <span className="text-emerald-400 font-extrabold text-sm">◄</span>
                  <span>лв (вліво)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleAddCommand('пр')}
                  disabled={isRunning}
                  className="py-2.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 border border-slate-700 text-white font-bold text-xs flex flex-col items-center justify-center gap-0.5 transition"
                >
                  <span className="text-emerald-400 font-extrabold text-sm">►</span>
                  <span>пр (вправо)</span>
                </button>
              </div>

              {/* Action buttons: Clear & Backspace */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={handleBackspace}
                  disabled={isRunning}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1 transition"
                >
                  <span>⌫ Стерти останню</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sounds.playClick();
                    setCodeText('');
                  }}
                  disabled={isRunning}
                  className="py-1.5 px-3 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-slate-400 hover:text-rose-300 text-xs font-semibold transition"
                >
                  Очистити
                </button>
              </div>
            </div>

            {/* Run / Stop & Speed Bar */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
              {!isRunning ? (
                <button
                  onClick={handleRun}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-98 transition"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Виконати програму</span>
                </button>
              ) : (
                <button
                  onClick={handleStop}
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20 transition"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Зупинити дрон</span>
                </button>
              )}

              <button
                onClick={resetLevel}
                className="w-full sm:w-auto p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 text-xs font-bold transition flex items-center justify-center gap-1.5"
                title="Скинути положення"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="sm:hidden">Скинути позицію</span>
              </button>
            </div>

            {/* Speed selector */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Швидкість дрона:</span>
              <div className="flex items-center gap-1">
                {[
                  { label: '1x', ms: 500 },
                  { label: '2x', ms: 300 },
                  { label: '4x', ms: 120 },
                ].map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSpeedMs(s.ms)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      speedMs === s.ms
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-400 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-200">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              Правила дослідження:
            </div>
            <p>1. Дрон бачить тільки навколо себе. Стіни приховані, доки ви до них не наблизитесь.</p>
            <p>2. Команда <code className="text-emerald-400 font-bold">вг</code> — крок угору, <code className="text-emerald-400 font-bold">нд</code> — крок униз, <code className="text-emerald-400 font-bold">лв</code> — ліворуч, <code className="text-emerald-400 font-bold">пр</code> — праворуч.</p>
            <p>3. Якщо дрон упреться в стіну, програма зупиниться, а рядок помилки засвітиться червоним!</p>
          </div>
        </div>
      </div>
    </div>
  );
};
