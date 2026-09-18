import { GridCell, ColorTask } from '../types';

export const COLOR_PALETTE_INFO = [
  {
    color: 'white' as const,
    name: 'Білий',
    role: 'Полотно / Простір',
    desc: 'Фоновий колір полотна. Пропускається при зчитуванні орнаменту.',
    bgClass: 'bg-white border-slate-300 text-slate-900',
  },
  {
    color: 'blue' as const,
    name: 'Синій',
    role: 'Оператори та заголовок FOR',
    desc: '1 кубик = присвоєння (=), 2 кубики = додавання (+), 3 кубики = множення (*), синій візерунок = заголовок FOR.',
    bgClass: 'bg-blue-600 border-blue-400 text-white',
  },
  {
    color: 'black' as const,
    name: 'Чорний',
    role: 'Регістри змінних (X, Y, Z, S)',
    desc: 'Кількість чорних кубиків задає ім’я комірки: 1 = X, 2 = Y, 3 = Z, 4 = S (Суматор).',
    bgClass: 'bg-slate-950 border-slate-700 text-white',
  },
  {
    color: 'red' as const,
    name: 'Червоний',
    role: 'Числовий операнд 1',
    desc: 'Кількість червоних кубиків у рядку дорівнює значенню першого числа (1 = 1, 2 = 2, 4 = 4...).',
    bgClass: 'bg-rose-500 border-rose-300 text-white',
  },
  {
    color: 'amber' as const,
    name: 'Бурштиновий',
    role: 'Числовий операнд 2 / Коефіцієнт',
    desc: 'Кількість бурштинових кубиків задає коефіцієнт множення або другий числовий доданок (1 = 1, 2 = 2...).',
    bgClass: 'bg-amber-400 border-amber-200 text-slate-950',
  },
  {
    color: 'green' as const,
    name: 'Смарагдовий',
    role: 'Синтаксична оправа & Межа циклу',
    desc: 'Смарагдові кубики по боках формують симетричну оправу. Суцільний зелений ряд замикає блок або цикл FOR.',
    bgClass: 'bg-emerald-500 border-emerald-300 text-white',
  },
  {
    color: 'purple' as const,
    name: 'Фіолетовий',
    role: 'Виведення (PRINT)',
    desc: 'Фіолетовий кристал виводить у консоль значення вказаного регістру змінної або константи.',
    bgClass: 'bg-purple-600 border-purple-400 text-white',
  },
];

const COLS = 10;

const makeEmptyRow = (): GridCell[] => {
  return Array.from({ length: COLS }, () => ({ color: 'white' }));
};

export const COLOR_TASKS: ColorTask[] = [
  {
    id: 1,
    title: 'Завдання 1: Акумулятор двох змінних (X та Y)',
    objective: 'Підкоригувати орнамент за формулою Z = 2 · X + Y, щоб отримати число 15',
    testDescription: 'Очікуваний вивід у консоль: [ 15 ]',
    instructions: 'Перед вами орнамент розрахунку за формулою Z = k · X + Y. Рядок 1 задає початкове значення X = 4, рядок 2 задає Y = 7. Рядок 3 виконує множення X на коефіцієнт k, після чого рядок 4 обчислює підсумкове значення Z, а рядок 5 виводить його. Проаналізуйте операцію множення та скоригуйте коефіцієнт k так, щоб підсумковий результат Z дорівнював 15.',
    hint: 'Кількість бурштинових кубиків у 3-му рядку визначає множник для X. Подумайте, який множник потрібен, щоб вираз 4 · k + 7 дав 15.',
    expectedOutputs: [15],
    initialGrid: [
      // Row 0: Emerald border + X = 4
      [
        { color: 'green' },
        { color: 'blue' },
        { color: 'black' },
        { color: 'red' },
        { color: 'red' },
        { color: 'red' },
        { color: 'red' },
        { color: 'blue' },
        { color: 'green' },
        { color: 'white' },
      ],
      // Row 1: Emerald border + Y = 7
      [
        { color: 'green' },
        { color: 'blue' },
        { color: 'black' },
        { color: 'black' },
        { color: 'red' },
        { color: 'red' },
        { color: 'red' },
        { color: 'red' },
        { color: 'red' },
        { color: 'green' },
      ],
      // Row 2: Multiplication X = X * 1 (Student needs to make it 2 amber cubes!)
      [
        { color: 'green' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'black' },
        { color: 'amber' }, // Missing 2nd amber cube!
        { color: 'white' },
        { color: 'green' },
        { color: 'white' },
        { color: 'white' },
      ],
      // Row 3: Addition Z = X + Y (2 blue, 3 black)
      [
        { color: 'green' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'black' },
        { color: 'black' },
        { color: 'black' },
        { color: 'green' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
      ],
      // Row 4: PRINT(Z) (Purple, 3 black for Z, Purple)
      [
        { color: 'green' },
        { color: 'purple' },
        { color: 'black' },
        { color: 'black' },
        { color: 'black' },
        { color: 'purple' },
        { color: 'green' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
      ],
      makeEmptyRow(),
      makeEmptyRow(),
      makeEmptyRow(),
    ],
  },
  {
    id: 2,
    title: 'Завдання 2: Суматор ряду чисел (Цикл FOR та змінна S)',
    objective: 'Відновити орнамент циклу для обчислення суми 1 + 2 + 3 + 4 = 10',
    testDescription: 'Очікуваний вивід у консоль: [ 10 ]',
    instructions: 'Для накопичення суми використовується регістр S (суматор). Цикл FOR починається з 1, проте в орнаменті порушено його синтаксичну структуру: у заголовку не задано кінцеву межу лічильника, а тіло циклу не закрите. Доповніть конструкцію циклу згідно з правилами мови «Орнамент», щоб обчислити точну суму.',
    hint: 'Зверніться до Довідника: цикл FOR складається з заголовка (початок і кінець діапазону) та тіла, яке обов’язково замикається смарагдовою смугою.',
    expectedOutputs: [10],
    initialGrid: [
      // Row 0: Symmetrical FOR Header [Green, Blue x 8, Green]
      [
        { color: 'green' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'green' },
      ],
      // Row 1: Loop Variable X [Black]
      [
        { color: 'green' },
        { color: 'black' },
        { color: 'green' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
      ],
      // Row 2: Loop Start = 1 [Red]
      [
        { color: 'green' },
        { color: 'red' },
        { color: 'green' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
        { color: 'white' },
      ],
      // Row 3: MISSING Loop End (Student paints 4 red cells for end = 4)
      makeEmptyRow(),
      // Row 4: Accumulation S = S + X (2 blue, 4 black)
      [
        { color: 'green' },
        { color: 'blue' },
        { color: 'blue' },
        { color: 'black' },
        { color: 'black' },
        { color: 'black' },
        { color: 'black' },
        { color: 'green' },
        { color: 'white' },
        { color: 'white' },
      ],
      // Row 5: MISSING Closing green boundary
      makeEmptyRow(),
      // Row 6: PRINT(S)
      [
        { color: 'green' },
        { color: 'purple' },
        { color: 'black' },
        { color: 'black' },
        { color: 'black' },
        { color: 'black' },
        { color: 'purple' },
        { color: 'green' },
        { color: 'white' },
        { color: 'white' },
      ],
      makeEmptyRow(),
    ],
  },
  {
    id: 3,
    title: 'Завдання 3: Степені двійки (Геометрична прогресія)',
    objective: 'Побудувати симетричний килим-алгоритм для ряду степенів [ 2, 4, 8, 16 ]',
    testDescription: 'Очікуваний вивід у консоль: [ 2, 4, 8, 16 ] (або фінальне [ 16 ] / [ 42 ])',
    instructions: 'Створіть власний орнамент для обчислення послідовності степенів двійки: [ 2, 4, 8, 16 ]. Задайте початкове значення змінної X = 2, побудуйте цикл із необхідною кількістю ітерацій, у якому виводьте поточне значення та подвоюйте його на кожному кроці.',
    hint: 'Сформуйте алгоритм: 1) початкова ініціалізація X = 2; 2) цикл FOR; 3) виведення і подвоєння X в тілі циклу; 4) закриття циклу смарагдовою смугою.',
    expectedOutputs: [2, 4, 8, 16],
    initialGrid: [
      makeEmptyRow(),
      makeEmptyRow(),
      makeEmptyRow(),
      makeEmptyRow(),
      makeEmptyRow(),
      makeEmptyRow(),
      makeEmptyRow(),
      makeEmptyRow(),
    ],
  },
];
