import { GridCell, CellColor } from '../types';

export interface ExecutionResult {
  output: number[];
  variables: Record<string, number>;
  logs: string[];
  error?: string;
  steps: ExecutionStep[];
}

export interface ExecutionStep {
  rowIndex: number;
  explanation: string;
  variables: Record<string, number>;
  output: number[];
}

export interface DecompiledStatement {
  rowIndex: number;
  text: string;
  type:
    | 'assignment'
    | 'print'
    | 'loop_header'
    | 'loop_var'
    | 'loop_start'
    | 'loop_end'
    | 'block_end'
    | 'operation'
    | 'empty'
    | 'syntax_error';
}

export const VAR_NAMES = ['X', 'Y', 'Z', 'S', 'A', 'B'];

export function getVarNameFromCount(count: number): string {
  if (count <= 0) return 'X';
  if (count === 1) return 'X';
  if (count === 2) return 'Y';
  if (count === 3) return 'Z';
  if (count === 4) return 'S';
  return VAR_NAMES[Math.min(count - 1, VAR_NAMES.length - 1)];
}

// Check if a row is a green block boundary (at least 4 green cubes or all non-white are green)
export function isRowGreenBoundary(row: GridCell[]): boolean {
  const nonWhite = row.filter((c) => c.color !== 'white');
  if (nonWhite.length >= 3 && nonWhite.every((c) => c.color === 'green')) {
    return true;
  }
  return false;
}

// Check if a row is a FOR loop header pattern (at least 4 blue cubes in a row, or blue with emerald borders)
export function isRowForLoopHeader(row: GridCell[]): boolean {
  const blueCount = row.filter((c) => c.color === 'blue').length;
  const nonWhite = row.filter((c) => c.color !== 'white');
  return blueCount >= 4 && (blueCount === nonWhite.length || nonWhite.every((c) => c.color === 'blue' || c.color === 'green'));
}

// Analyze decompiled representation for visual feedback
export function decompileGrid(grid: GridCell[][]): DecompiledStatement[] {
  const statements: DecompiledStatement[] = [];
  let inForHeader = false;
  let forHeaderStep = 0; // 1 = var, 2 = startVal, 3 = endVal
  let forVarName = 'X';
  let forStartVal = 1;

  grid.forEach((row, rIdx) => {
    const nonWhite = row.filter((c) => c.color !== 'white');
    if (nonWhite.length === 0) {
      statements.push({ rowIndex: rIdx, text: '— вільне полотно —', type: 'empty' });
      return;
    }

    // Check if green block boundary
    if (isRowGreenBoundary(row)) {
      statements.push({ rowIndex: rIdx, text: '🟩 КІНЕЦЬ ЦИКЛУ / ОПРАВА (END)', type: 'block_end' });
      inForHeader = false;
      forHeaderStep = 0;
      return;
    }

    // Check if FOR loop header
    if (isRowForLoopHeader(row)) {
      inForHeader = true;
      forHeaderStep = 1;
      statements.push({ rowIndex: rIdx, text: '🟦 СИМЕТРИЧНИЙ ЦИКЛ FOR (Початок)', type: 'loop_header' });
      return;
    }

    // If parsing multi-row FOR header
    if (inForHeader) {
      if (forHeaderStep === 1) {
        const blackCount = row.filter((c) => c.color === 'black').length;
        if (blackCount > 0) {
          forVarName = getVarNameFromCount(blackCount);
          forHeaderStep = 2;
          statements.push({ rowIndex: rIdx, text: `  ⬛ Лічильник циклу: [ ${forVarName} ]`, type: 'loop_var' });
          return;
        }
      } else if (forHeaderStep === 2) {
        const redCount = row.filter((c) => c.color === 'red').length;
        const amberCount = row.filter((c) => c.color === 'amber').length;
        const totalStart = redCount || amberCount || 1;
        forStartVal = totalStart;
        forHeaderStep = 3;
        statements.push({ rowIndex: rIdx, text: `  🟥 Початок відліку: ${totalStart}`, type: 'loop_start' });
        return;
      } else if (forHeaderStep === 3) {
        const redCount = row.filter((c) => c.color === 'red').length;
        const amberCount = row.filter((c) => c.color === 'amber').length;
        const totalEnd = redCount || amberCount || 1;
        inForHeader = false; // Header complete! Next rows are loop body
        statements.push({
          rowIndex: rIdx,
          text: `  🟥 Фініш: ${totalEnd} ➔ ДЛЯ ${forVarName} ВІД ${forStartVal} ДО ${totalEnd}:`,
          type: 'loop_end',
        });
        return;
      }
    }

    // Single-row statements
    // 1. PRINT: Contains Purple
    const hasPurple = row.some((c) => c.color === 'purple');
    if (hasPurple) {
      const blackCount = row.filter((c) => c.color === 'black').length;
      const redCount = row.filter((c) => c.color === 'red').length;
      const amberCount = row.filter((c) => c.color === 'amber').length;

      if (blackCount > 0) {
        const vName = getVarNameFromCount(blackCount);
        statements.push({ rowIndex: rIdx, text: `🟪 ВИВЕСТИ( ${vName} );`, type: 'print' });
        return;
      } else if (redCount > 0 || amberCount > 0) {
        const val = redCount + amberCount;
        statements.push({ rowIndex: rIdx, text: `🟪 ВИВЕСТИ( ${val} );`, type: 'print' });
        return;
      }
      statements.push({ rowIndex: rIdx, text: '🟪 ВИВЕСТИ(?); (вкажіть чорний кубик змінної)', type: 'syntax_error' });
      return;
    }

    // 2. Operators with Blue
    const blueCount = row.filter((c) => c.color === 'blue').length;
    const blackCount = row.filter((c) => c.color === 'black').length;
    const redCount = row.filter((c) => c.color === 'red').length;
    const amberCount = row.filter((c) => c.color === 'amber').length;

    if (blueCount > 0) {
      const targetVar = getVarNameFromCount(blackCount);

      if (blueCount === 1) {
        // Assignment: Target = Red (or Amber)
        const val = redCount || amberCount || 0;
        statements.push({ rowIndex: rIdx, text: `🟦 ${targetVar} = ${val}; (Присвоєння)`, type: 'assignment' });
        return;
      } else if (blueCount === 2) {
        // Addition:
        // Case A: Accumulator with loop/other variable: S = S + X
        if (targetVar === 'S') {
          statements.push({ rowIndex: rIdx, text: `🟦🟦 S = S + X; (Акумуляція суми)`, type: 'operation' });
          return;
        }
        // Case B: Expression Z = X + Y
        if (targetVar === 'Z' && (redCount > 0 || amberCount > 0)) {
          statements.push({ rowIndex: rIdx, text: `🟦🟦 Z = X + Y; (Об'єднання регістрів)`, type: 'operation' });
          return;
        }
        // Case C: Target = Target + const
        const addConst = redCount || amberCount || 1;
        statements.push({ rowIndex: rIdx, text: `🟦🟦 ${targetVar} = ${targetVar} + ${addConst};`, type: 'operation' });
        return;
      } else if (blueCount >= 3) {
        // Multiplication: Target = Target * Amber/Red
        const factor = amberCount || redCount || 2;
        statements.push({ rowIndex: rIdx, text: `🟦🟦🟦 ${targetVar} = ${targetVar} * ${factor}; (Множення)`, type: 'operation' });
        return;
      }
    }

    statements.push({ rowIndex: rIdx, text: '⚠️ Нерозпізнаний візерунок (див. Довідник)', type: 'syntax_error' });
  });

  return statements;
}

// Main execution engine for the Ornament esoteric language
export function executeColorProgram(grid: GridCell[][]): ExecutionResult {
  const variables: Record<string, number> = { X: 0, Y: 0, Z: 0, S: 0, A: 0, B: 0 };
  const output: number[] = [];
  const logs: string[] = [];
  const steps: ExecutionStep[] = [];

  let rIdx = 0;
  let safetyCounter = 0;
  const MAX_STEPS = 2000;

  logs.push('🧵 Старт зчитування симетричного орнаменту...');

  while (rIdx < grid.length && safetyCounter < MAX_STEPS) {
    safetyCounter++;
    const row = grid[rIdx];
    const nonWhite = row.filter((c) => c.color !== 'white');

    if (nonWhite.length === 0) {
      rIdx++;
      continue;
    }

    // FOR Loop Header check
    if (isRowForLoopHeader(row)) {
      const varRow = grid[rIdx + 1];
      const startRow = grid[rIdx + 2];
      const endRow = grid[rIdx + 3];

      if (!varRow || !startRow || !endRow) {
        return {
          output,
          variables,
          logs,
          error: `Помилка у рядку ${rIdx + 1}: Неповний заголовок циклу FOR. Потрібні рядки лічильника, старту та фінішу.`,
          steps,
        };
      }

      const loopVarCount = varRow.filter((c) => c.color === 'black').length;
      const loopVar = getVarNameFromCount(loopVarCount || 1);
      const startVal = startRow.filter((c) => c.color === 'red' || c.color === 'amber').length || 1;
      const endVal = endRow.filter((c) => c.color === 'red' || c.color === 'amber').length || 1;

      // Find closing green boundary row
      let bodyEndIdx = -1;
      for (let searchIdx = rIdx + 4; searchIdx < grid.length; searchIdx++) {
        if (isRowGreenBoundary(grid[searchIdx])) {
          bodyEndIdx = searchIdx;
          break;
        }
      }

      if (bodyEndIdx === -1) {
        return {
          output,
          variables,
          logs,
          error: `Помилка у рядку ${rIdx + 1}: Цикл FOR не має рядка завершення (🟩 суцільний смарагдовий рядок)!`,
          steps,
        };
      }

      logs.push(`🔁 Запуск циклу FOR (${loopVar} від ${startVal} до ${endVal})`);
      steps.push({
        rowIndex: rIdx,
        explanation: `Ініціалізація циклу ${loopVar} від ${startVal} до ${endVal}`,
        variables: { ...variables },
        output: [...output],
      });

      // Execute loop iterations
      const isIncrement = startVal <= endVal;
      let curVal = startVal;

      while (isIncrement ? curVal <= endVal : curVal >= endVal) {
        safetyCounter++;
        if (safetyCounter >= MAX_STEPS) {
          return {
            output,
            variables,
            logs,
            error: 'Помилка: Перевищено ліміт кроків циклу (захист від нескінченного зациклення)!',
            steps,
          };
        }

        variables[loopVar] = curVal;

        // Execute body rows from rIdx + 4 to bodyEndIdx - 1
        for (let bIdx = rIdx + 4; bIdx < bodyEndIdx; bIdx++) {
          const bodyRow = grid[bIdx];
          const bNonWhite = bodyRow.filter((c) => c.color !== 'white');
          if (bNonWhite.length === 0) continue;

          // PRINT inside loop body
          if (bodyRow.some((c) => c.color === 'purple')) {
            const blackC = bodyRow.filter((c) => c.color === 'black').length;
            const redC = bodyRow.filter((c) => c.color === 'red').length;
            const amberC = bodyRow.filter((c) => c.color === 'amber').length;
            let valToPrint = 0;
            let label = '';
            if (blackC > 0) {
              const v = getVarNameFromCount(blackC);
              valToPrint = variables[v] ?? 0;
              label = v;
            } else {
              valToPrint = redC + amberC;
              label = `${valToPrint}`;
            }
            output.push(valToPrint);
            logs.push(`Вивід: ${valToPrint} (друк ${label})`);
            steps.push({
              rowIndex: bIdx,
              explanation: `Вивід значення ${label} = ${valToPrint}`,
              variables: { ...variables },
              output: [...output],
            });
          }

          // Blue operations inside body
          const bBlue = bodyRow.filter((c) => c.color === 'blue').length;
          if (bBlue > 0) {
            const blCount = bodyRow.filter((c) => c.color === 'black').length;
            const rdCount = bodyRow.filter((c) => c.color === 'red').length;
            const amCount = bodyRow.filter((c) => c.color === 'amber').length;
            const tVar = getVarNameFromCount(blCount);

            if (bBlue === 1) {
              variables[tVar] = rdCount || amCount;
            } else if (bBlue === 2) {
              // Accumulation S = S + X
              if (tVar === 'S') {
                variables.S = (variables.S ?? 0) + (variables[loopVar] ?? variables.X ?? 0);
              } else {
                variables[tVar] = (variables[tVar] ?? 0) + (rdCount || amCount || 1);
              }
            } else if (bBlue >= 3) {
              // Multiplication
              const factor = amCount || rdCount || 2;
              variables[tVar] = (variables[tVar] ?? 0) * factor;
            }

            steps.push({
              rowIndex: bIdx,
              explanation: `Оновлення ${tVar} = ${variables[tVar]}`,
              variables: { ...variables },
              output: [...output],
            });
          }
        }

        curVal = isIncrement ? curVal + 1 : curVal - 1;
      }

      // Jump past loop
      rIdx = bodyEndIdx + 1;
      continue;
    }

    // PRINT statement: row contains Purple
    if (row.some((c) => c.color === 'purple')) {
      const blackCount = row.filter((c) => c.color === 'black').length;
      const redCount = row.filter((c) => c.color === 'red').length;
      const amberCount = row.filter((c) => c.color === 'amber').length;
      let valToPrint = 0;
      let label = '';
      if (blackCount > 0) {
        const v = getVarNameFromCount(blackCount);
        valToPrint = variables[v] ?? 0;
        label = v;
      } else {
        valToPrint = redCount + amberCount;
        label = `${valToPrint}`;
      }

      output.push(valToPrint);
      logs.push(`Рядок ${rIdx + 1}: ВИВЕСТИ(${label}) ➔ ${valToPrint}`);
      steps.push({
        rowIndex: rIdx,
        explanation: `ВИВЕСТИ ${label} (${valToPrint})`,
        variables: { ...variables },
        output: [...output],
      });
      rIdx++;
      continue;
    }

    // Blue Operations
    const blueCount = row.filter((c) => c.color === 'blue').length;
    if (blueCount > 0) {
      const blackCount = row.filter((c) => c.color === 'black').length;
      const redCount = row.filter((c) => c.color === 'red').length;
      const amberCount = row.filter((c) => c.color === 'amber').length;
      const targetVar = getVarNameFromCount(blackCount);

      if (blueCount === 1) {
        // Target = Value
        const val = redCount || amberCount || 0;
        variables[targetVar] = val;
        logs.push(`Рядок ${rIdx + 1}: ${targetVar} = ${val}`);
        steps.push({
          rowIndex: rIdx,
          explanation: `Присвоєння: ${targetVar} = ${val}`,
          variables: { ...variables },
          output: [...output],
        });
      } else if (blueCount === 2) {
        // Addition:
        if (targetVar === 'Z') {
          // Z = X + Y
          variables.Z = (variables.X ?? 0) + (variables.Y ?? 0);
          logs.push(`Рядок ${rIdx + 1}: Z = X (${variables.X}) + Y (${variables.Y}) = ${variables.Z}`);
          steps.push({
            rowIndex: rIdx,
            explanation: `Обчислення Z = X + Y = ${variables.Z}`,
            variables: { ...variables },
            output: [...output],
          });
        } else if (targetVar === 'S') {
          // S = S + X
          variables.S = (variables.S ?? 0) + (variables.X ?? 0);
          logs.push(`Рядок ${rIdx + 1}: S = S + X = ${variables.S}`);
          steps.push({
            rowIndex: rIdx,
            explanation: `Накопичення S = S + X = ${variables.S}`,
            variables: { ...variables },
            output: [...output],
          });
        } else {
          const oldVal = variables[targetVar] ?? 0;
          const add = redCount || amberCount || 1;
          variables[targetVar] = oldVal + add;
          logs.push(`Рядок ${rIdx + 1}: ${targetVar} = ${oldVal} + ${add} = ${variables[targetVar]}`);
          steps.push({
            rowIndex: rIdx,
            explanation: `Додавання: ${targetVar} = ${variables[targetVar]}`,
            variables: { ...variables },
            output: [...output],
          });
        }
      } else if (blueCount >= 3) {
        // Multiplication: Target = Target * Amber/Red
        const oldVal = variables[targetVar] ?? 0;
        const factor = amberCount || redCount || 2;
        variables[targetVar] = oldVal * factor;
        logs.push(`Рядок ${rIdx + 1}: ${targetVar} = ${oldVal} * ${factor} = ${variables[targetVar]}`);
        steps.push({
          rowIndex: rIdx,
          explanation: `Множення: ${targetVar} = ${variables[targetVar]}`,
          variables: { ...variables },
          output: [...output],
        });
      }

      rIdx++;
      continue;
    }

    // Ignore standalone boundary
    if (isRowGreenBoundary(row)) {
      rIdx++;
      continue;
    }

    rIdx++;
  }

  logs.push('✅ Завершення розшифрування орнаменту.');
  return {
    output,
    variables,
    logs,
    steps,
  };
}
