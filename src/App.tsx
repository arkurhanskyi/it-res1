/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MissionId } from './types';
import { Header } from './components/Header';
import { Mission1Labyrinth } from './components/Mission1Labyrinth';
import { Mission2ColorLang } from './components/Mission2ColorLang';
import { Mission3NeuralLab } from './components/Mission3NeuralLab';
import { Laptop, Smartphone } from 'lucide-react';

export default function App() {
  const [currentMission, setCurrentMission] = useState<MissionId>('5th-grade');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white font-sans">
      {/* Top Header */}
      <Header
        currentMission={currentMission}
        onSelectMission={setCurrentMission}
      />

      {/* Main Content Arena */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8">
        {currentMission === '5th-grade' && <Mission1Labyrinth />}
        {currentMission === '6-7th-grade' && <Mission2ColorLang />}
        {currentMission === '8-9th-grade' && <Mission3NeuralLab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Інтерактивний квест з інформатики • Адаптовано під смартфони та ПК</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-slate-400">
              <Smartphone className="w-3.5 h-3.5" />
              <Laptop className="w-3.5 h-3.5" />
              Мобільна оптимізація
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
