import React from 'react';
import { BookOpen, X, Sparkles, CheckCircle } from 'lucide-react';

interface OrnamentSpecModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OrnamentSpecModal: React.FC<OrnamentSpecModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">
                  Специфікація езотеричної мови
                </span>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Орнамент v2.0
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                Довідник мови «Орнамент»
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-sm text-slate-300">
          {/* Intro statement */}
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm leading-relaxed">
              <strong className="text-white">Код як витвір геометричного мистецтва: </strong>
              У мові «Орнамент» немає літер і цифр у клітинках. Програма складається виключно з чистих кольорових кубиків, що утворюють тканий візерунок. Комп’ютер зчитує цей орнамент за законами кольорів і кількостей.
            </div>
          </div>

          {/* Color Alphabet */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              1. Колірний алфавіт мови
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-blue-600 border border-blue-400 shrink-0 shadow-sm" />
                <div>
                  <div className="font-bold text-white">Синій кубик</div>
                  <div className="text-slate-400">Початок оператора або заголовок циклу FOR.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-700 shrink-0 shadow-sm" />
                <div>
                  <div className="font-bold text-white">Чорний кубик</div>
                  <div className="text-slate-400">Змінні пам’яті (кількість кубиків задає ім’я).</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-rose-500 border border-rose-300 shrink-0 shadow-sm" />
                <div>
                  <div className="font-bold text-white">Червоний кубик</div>
                  <div className="text-slate-400">Числовий операнд 1 (кількість кубиків = значенню).</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-amber-400 border border-amber-200 shrink-0 shadow-sm" />
                <div>
                  <div className="font-bold text-white">Бурштиновий кубик</div>
                  <div className="text-slate-400">Числовий операнд 2 / Коефіцієнт множення або другий доданок.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-emerald-500 border border-emerald-300 shrink-0 shadow-sm" />
                <div>
                  <div className="font-bold text-white">Смарагдовий кубик</div>
                  <div className="text-slate-400">Симетрична оправа орнаменту. Суцільний ряд = кінець циклу FOR.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-purple-600 border border-purple-400 shrink-0 shadow-sm" />
                <div>
                  <div className="font-bold text-white">Фіолетовий кубик</div>
                  <div className="text-slate-400">Команда виведення на екран (PRINT).</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white border border-slate-300 shrink-0 shadow-sm" />
                <div>
                  <div className="font-bold text-white">Білий кубик</div>
                  <div className="text-slate-400">Порожнє полотно / фон, пропускається при виконанні.</div>
                </div>
              </div>
            </div>
          </div>

          {/* Numbers and Variables interpretation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Variables */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                2. Як читаються змінні (Чорні кубики)
              </h4>
              <p className="text-xs text-slate-400">
                Ім’я змінної визначається <strong>кількістю чорних кубиків</strong> у рядку:
              </p>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                  <span className="text-slate-400">➔ 1 чорний = </span>
                  <strong className="text-white">Змінна X</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                  </div>
                  <span className="text-slate-400">➔ 2 чорних = </span>
                  <strong className="text-white">Змінна Y</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                  </div>
                  <span className="text-slate-400">➔ 3 чорних = </span>
                  <strong className="text-white">Змінна Z</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                    <span className="w-4 h-4 rounded-xs bg-slate-950 border border-slate-700" />
                  </div>
                  <span className="text-slate-400">➔ 4 чорних = </span>
                  <strong className="text-emerald-400">Суматор S</strong>
                </div>
              </div>
            </div>

            {/* Numbers */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                3. Як читаються числа (Червоні кубики)
              </h4>
              <p className="text-xs text-slate-400">
                Значення числа дорівнює <strong>кількості червоних кубиків</strong> у рядку:
              </p>
              <div className="space-y-1.5 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-xs bg-rose-500" />
                  <span className="text-slate-400">➔ 1 червоний = </span>
                  <strong className="text-white">Число 1</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                  </div>
                  <span className="text-slate-400">➔ 3 червоних = </span>
                  <strong className="text-white">Число 3</strong>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-0.5">
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                    <span className="w-4 h-4 rounded-xs bg-rose-500" />
                  </div>
                  <span className="text-slate-400">➔ 5 червоних = </span>
                  <strong className="text-white">Число 5</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Visual patterns for structures */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              4. Візерунки базових операторів
            </h3>

            {/* Pattern: Assignment */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Присвоєння числа змінній: X = 3;</span>
                <span className="text-[11px] text-indigo-400 font-mono">1 синій + змінна + N червоних + зелений</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-6 h-6 rounded-md bg-blue-600 border border-blue-400" title="1 синій: оператор =" />
                <div className="w-6 h-6 rounded-md bg-slate-950 border border-slate-700" title="1 чорний: змінна X" />
                <div className="w-6 h-6 rounded-md bg-rose-500" title="червоний 1" />
                <div className="w-6 h-6 rounded-md bg-rose-500" title="червоний 2" />
                <div className="w-6 h-6 rounded-md bg-rose-500" title="червоний 3" />
                <div className="w-6 h-6 rounded-md bg-emerald-500 border border-emerald-300" title="зелений: кінець команди" />
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 opacity-20" />
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 opacity-20" />
              </div>
              <p className="text-[11px] text-slate-400">
                Один синій кубик означає присвоєння. Далі йде змінна (чорні кубики), далі число (червоні), в кінці — зелений кубик.
              </p>
            </div>

            {/* Pattern: Math (+ and *) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Арифметика: X = X * 5; (Множення)</span>
                <span className="text-[11px] text-indigo-400 font-mono">3 синіх = помножити (*), 2 синіх = додати (+)</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-6 h-6 rounded-md bg-blue-600 border border-blue-400" />
                <div className="w-6 h-6 rounded-md bg-blue-600 border border-blue-400" />
                <div className="w-6 h-6 rounded-md bg-blue-600 border border-blue-400" />
                <div className="w-6 h-6 rounded-md bg-slate-950 border border-slate-700" title="змінна X" />
                <div className="w-6 h-6 rounded-md bg-rose-500" />
                <div className="w-6 h-6 rounded-md bg-rose-500" />
                <div className="w-6 h-6 rounded-md bg-rose-500" />
                <div className="w-6 h-6 rounded-md bg-rose-500" />
                <div className="w-6 h-6 rounded-md bg-rose-500" />
                <div className="w-6 h-6 rounded-md bg-emerald-500 border border-emerald-300" />
              </div>
              <p className="text-[11px] text-slate-400">
                3 синіх кубики означають множення. Змінна X множиться на кількість червоних кубиків (на 5).
              </p>
            </div>

            {/* Pattern: Print */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white text-xs">Виведення в консоль: ВИВЕСТИ(X);</span>
                <span className="text-[11px] text-indigo-400 font-mono">1 фіолетовий + змінна + 1 зелений</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 bg-slate-900/60 rounded-xl border border-slate-800">
                <div className="w-6 h-6 rounded-md bg-purple-600 border border-purple-400" title="фіолетовий: PRINT" />
                <div className="w-6 h-6 rounded-md bg-slate-950 border border-slate-700" title="змінна X" />
                <div className="w-6 h-6 rounded-md bg-emerald-500 border border-emerald-300" title="зелений: кінець" />
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 opacity-20" />
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 opacity-20" />
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 opacity-20" />
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 opacity-20" />
                <div className="w-6 h-6 rounded-md bg-white border border-slate-300 opacity-20" />
              </div>
            </div>

            {/* Pattern: FOR LOOP (Multi-row) */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-indigo-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-300 text-xs sm:text-sm">
                  ★ Багаторядковий орнамент циклу FOR
                </span>
                <span className="text-[11px] text-indigo-400 font-mono">Шедевр мови «Орнамент»</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Цикл будується з 4 обов’язкових рядків заголовка, потім рядків дій, і закривається зеленим рядом:
              </p>

              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1.5">
                {/* Row 1: Header */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-slate-400 font-mono">Рядок 1:</span>
                  <div className="flex gap-1 flex-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-5 flex-1 rounded-xs bg-blue-600 border border-blue-400" />
                    ))}
                  </div>
                  <span className="text-[10px] text-blue-300 font-semibold w-24">Синій заголовок</span>
                </div>

                {/* Row 2: Variable */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-slate-400 font-mono">Рядок 2:</span>
                  <div className="flex gap-1 flex-1">
                    <div className="h-5 w-5 rounded-xs bg-slate-950 border border-slate-700" />
                  </div>
                  <span className="text-[10px] text-slate-300 font-semibold w-24">Змінна (X)</span>
                </div>

                {/* Row 3: Start val */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-slate-400 font-mono">Рядок 3:</span>
                  <div className="flex gap-1 flex-1">
                    <div className="h-5 w-5 rounded-xs bg-rose-500" />
                    <div className="h-5 w-5 rounded-xs bg-rose-500" />
                    <div className="h-5 w-5 rounded-xs bg-rose-500" />
                  </div>
                  <span className="text-[10px] text-rose-300 font-semibold w-24">Старт (3)</span>
                </div>

                {/* Row 4: End val */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-slate-400 font-mono">Рядок 4:</span>
                  <div className="flex gap-1 flex-1">
                    <div className="h-5 w-5 rounded-xs bg-rose-500" />
                  </div>
                  <span className="text-[10px] text-rose-300 font-semibold w-24">Фініш (1)</span>
                </div>

                {/* Row 5: Body */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-slate-400 font-mono">Рядок 5:</span>
                  <div className="flex gap-1 flex-1">
                    <div className="h-5 w-5 rounded-xs bg-purple-600 border border-purple-400" />
                    <div className="h-5 w-5 rounded-xs bg-slate-950 border border-slate-700" />
                    <div className="h-5 w-5 rounded-xs bg-emerald-500 border border-emerald-300" />
                  </div>
                  <span className="text-[10px] text-purple-300 font-semibold w-24">Друк X</span>
                </div>

                {/* Row 6: Green Boundary */}
                <div className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-slate-400 font-mono">Рядок 6:</span>
                  <div className="flex gap-1 flex-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-5 flex-1 rounded-xs bg-emerald-500 border border-emerald-300" />
                    ))}
                  </div>
                  <span className="text-[10px] text-emerald-300 font-semibold w-24">Кінець циклу</span>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20 text-xs text-slate-300">
                <strong>Результат роботи цього орнаменту:</strong> змінна X набуває значень 3, потім 2, потім 1, і на екран виводиться зворотний відлік: <code className="text-indigo-300 font-bold font-mono">3, 2, 1</code>!
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/20 transition"
          >
            Зрозуміло, до створення орнаменту!
          </button>
        </div>
      </div>
    </div>
  );
};
