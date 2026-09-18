import React from 'react';
import { MissionId } from '../types';
import { Compass, Palette, Brain, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { sounds } from '../utils/audio';

interface HeaderProps {
  currentMission: MissionId;
  onSelectMission: (mission: MissionId) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMission,
  onSelectMission,
}) => {
  const [soundEnabled, setSoundEnabled] = React.useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.enabled = next;
    if (next) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-3 sm:px-4 py-2 sm:py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-black text-sm tracking-wider">
              IT
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-white text-base sm:text-lg tracking-tight">
                  IT Квест
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Дослідження
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">
                Уроки інформатики • 3 вікові місії
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-1.5 sm:hidden">
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition ${
                soundEnabled
                  ? 'bg-slate-900 border-slate-700 text-indigo-400'
                  : 'bg-slate-900/60 border-slate-800 text-slate-500'
              }`}
              title={soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
              aria-label="Звук"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mission Tabs */}
        <nav
          className="grid grid-cols-3 sm:flex sm:items-center p-1 bg-slate-900/95 rounded-2xl border border-slate-800 w-full sm:w-auto gap-1 shadow-inner"
          aria-label="Місії квесту"
        >
          <button
            onClick={() => {
              onSelectMission('5th-grade');
              sounds.playClick();
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[46px] sm:min-h-0 ${
              currentMission === '5th-grade'
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Compass className="w-4 h-4 shrink-0" />
            <div className="text-center sm:text-left leading-tight">
              <span className="block font-bold text-xs sm:text-sm whitespace-nowrap">5 клас</span>
              <span className="block text-[10px] sm:hidden opacity-80 whitespace-nowrap">Лабіринт</span>
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm whitespace-nowrap">: Лабіринт</span>
          </button>

          <button
            onClick={() => {
              onSelectMission('6-7th-grade');
              sounds.playClick();
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[46px] sm:min-h-0 ${
              currentMission === '6-7th-grade'
                ? 'bg-blue-500 text-white shadow-md shadow-blue-500/25 font-bold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Palette className="w-4 h-4 shrink-0" />
            <div className="text-center sm:text-left leading-tight">
              <span className="block font-bold text-xs sm:text-sm whitespace-nowrap">6-7 клас</span>
              <span className="block text-[10px] sm:hidden opacity-80 whitespace-nowrap">Код</span>
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm whitespace-nowrap">: Кольоровий код</span>
          </button>

          <button
            onClick={() => {
              onSelectMission('8-9th-grade');
              sounds.playClick();
            }}
            className={`flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all min-h-[46px] sm:min-h-0 ${
              currentMission === '8-9th-grade'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-bold ring-1 ring-purple-400/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Brain className="w-4 h-4 shrink-0" />
            <div className="text-center sm:text-left leading-tight">
              <span className="block font-bold text-xs sm:text-sm whitespace-nowrap">8-9 клас</span>
              <span className="block text-[10px] sm:hidden opacity-80 whitespace-nowrap">ШІ & Нейро</span>
            </div>
            <span className="hidden sm:inline text-xs sm:text-sm whitespace-nowrap">: ШІ & Нейромережа</span>
          </button>
        </nav>

        {/* Desktop Controls */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={toggleSound}
            className={`p-2 rounded-xl border transition ${
              soundEnabled
                ? 'bg-slate-900 border-slate-700 text-indigo-400 hover:bg-slate-800'
                : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-800'
            }`}
            title={soundEnabled ? 'Вимкнути звук' : 'Увімкнути звук'}
            aria-label="Звук"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
