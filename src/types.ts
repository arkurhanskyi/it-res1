export type MissionId = '5th-grade' | '6-7th-grade' | '8-9th-grade';

// Mission 1 Types: Labyrinth
export type Direction = 'up' | 'down' | 'left' | 'right';
export type CommandToken = 'вг' | 'нд' | 'лв' | 'пр';

export interface Position {
  x: number;
  y: number;
}

export interface LabyrinthCell {
  x: number;
  y: number;
  isWall: boolean;
  isStart: boolean;
  isExit: boolean;
  hasArtifact?: boolean;
  artifactName?: string;
  hint?: string;
}

export interface LabyrinthLevel {
  id: number;
  title: string;
  subtitle: string;
  width: number;
  height: number;
  start: Position;
  exit: Position;
  walls: Position[];
  artifacts: Array<{ x: number; y: number; name: string }>;
  description: string;
}

// Mission 2 Types: Color Grid Programming ("Орнамент")
export type CellColor = 'white' | 'blue' | 'red' | 'amber' | 'green' | 'purple' | 'black';

export interface GridCell {
  color: CellColor;
}

export interface ColorTask {
  id: 1 | 2 | 3;
  title: string;
  objective: string;
  instructions: string;
  hint: string;
  initialGrid: GridCell[][];
  expectedOutputs: number[];
  testDescription: string;
}

// Mission 3 Types: Visual Neural Network Lab (AI Perceptron & Deep Learning)
export type LogicFunctionType = 'AND' | 'OR' | 'XOR_SINGLE' | 'XOR_MLP';

export interface DataPoint {
  id: string;
  x1: number;
  x2: number;
  label: number; // 0 or 1
  name?: string;
}

export interface SingleNeuronWeights {
  w1: number;
  w2: number;
  bias: number;
}

export interface MLPWeights {
  h1: SingleNeuronWeights;
  h2: SingleNeuronWeights;
  out: {
    w1: number;
    w2: number;
    bias: number;
  };
}

export interface NeuralLabChallenge {
  id: 1 | 2 | 3;
  title: string;
  subtitle: string;
  historicalContext: string;
  goal: string;
  dataset: DataPoint[];
  architectureType: 'single' | 'mlp';
  initialWeights: SingleNeuronWeights | MLPWeights;
  minSeparableAccuracy: number; // 100 for AND/OR and XOR_MLP; 75 for XOR_SINGLE
  isParadox?: boolean;
}

// Mission 3: 3x3 Pixel Vision AI Workshop Types
export interface VisionPattern {
  id: string;
  name: string;
  pixels: boolean[]; // 9 elements (row-major: [r0c0, r0c1, r0c2, r1c0...])
  expectedLabel: 0 | 1; // 1 = Match / Active, 0 = Reject / Inactive
  explanation?: string;
}

export interface VisionChallenge {
  id: number;
  title: string;
  badge: string;
  objective: string;
  story: string;
  instructions: string;
  hint: string;
  targetConcept: string;
  testSuite: VisionPattern[];
  initialWeights?: number[]; // 9 elements
  initialBias?: number;
  isAdversarialTask?: boolean;
}
