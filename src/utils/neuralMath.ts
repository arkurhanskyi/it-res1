import { DataPoint, SingleNeuronWeights, MLPWeights } from '../types';

export const sigmoid = (z: number): number => {
  // Prevent overflow
  if (z > 20) return 1;
  if (z < -20) return 0;
  return 1 / (1 + Math.exp(-z));
};

export const sigmoidDerivative = (sigmoidVal: number): number => {
  return sigmoidVal * (1 - sigmoidVal);
};

export const predictSingle = (
  x1: number,
  x2: number,
  w: SingleNeuronWeights
): { prob: number; label: number; z: number } => {
  const z = w.w1 * x1 + w.w2 * x2 + w.bias;
  const prob = sigmoid(z);
  return { prob, label: prob >= 0.5 ? 1 : 0, z };
};

export const predictMLP = (
  x1: number,
  x2: number,
  weights: MLPWeights
): {
  prob: number;
  label: number;
  h1Z: number;
  h1Act: number;
  h2Z: number;
  h2Act: number;
  outZ: number;
} => {
  const h1Z = weights.h1.w1 * x1 + weights.h1.w2 * x2 + weights.h1.bias;
  const h1Act = sigmoid(h1Z);

  const h2Z = weights.h2.w1 * x1 + weights.h2.w2 * x2 + weights.h2.bias;
  const h2Act = sigmoid(h2Z);

  const outZ = weights.out.w1 * h1Act + weights.out.w2 * h2Act + weights.out.bias;
  const prob = sigmoid(outZ);

  return {
    prob,
    label: prob >= 0.5 ? 1 : 0,
    h1Z,
    h1Act,
    h2Z,
    h2Act,
    outZ,
  };
};

export interface EvaluationResult {
  accuracyPercent: number;
  correctCount: number;
  totalCount: number;
  loss: number;
  pointResults: {
    id: string;
    target: number;
    prob: number;
    predictedLabel: number;
    isCorrect: boolean;
  }[];
}

export const evaluateModel = (
  dataset: DataPoint[],
  predictFn: (x1: number, x2: number) => { prob: number; label: number }
): EvaluationResult => {
  if (dataset.length === 0) {
    return {
      accuracyPercent: 0,
      correctCount: 0,
      totalCount: 0,
      loss: 0,
      pointResults: [],
    };
  }

  let correctCount = 0;
  let totalLoss = 0;

  const pointResults = dataset.map((p) => {
    const { prob, label } = predictFn(p.x1, p.x2);
    const isCorrect = label === p.label;
    if (isCorrect) correctCount++;

    // Mean squared error for loss
    const diff = prob - p.label;
    totalLoss += 0.5 * diff * diff;

    return {
      id: p.id,
      target: p.label,
      prob,
      predictedLabel: label,
      isCorrect,
    };
  });

  const accuracyPercent = Math.round((correctCount / dataset.length) * 100);
  const loss = parseFloat((totalLoss / dataset.length).toFixed(4));

  return {
    accuracyPercent,
    correctCount,
    totalCount: dataset.length,
    loss,
    pointResults,
  };
};

// Stochastic Gradient Descent (SGD) for single perceptron
export const trainSingleNeuronEpoch = (
  dataset: DataPoint[],
  weights: SingleNeuronWeights,
  learningRate = 0.5
): SingleNeuronWeights => {
  let dw1 = 0;
  let dw2 = 0;
  let dbias = 0;

  dataset.forEach((p) => {
    const { prob } = predictSingle(p.x1, p.x2, weights);
    const error = prob - p.label; // dLoss/dProb
    const delta = error * sigmoidDerivative(prob); // dLoss/dZ

    dw1 += delta * p.x1;
    dw2 += delta * p.x2;
    dbias += delta;
  });

  const n = dataset.length || 1;
  return {
    w1: parseFloat((weights.w1 - (learningRate * dw1) / n).toFixed(3)),
    w2: parseFloat((weights.w2 - (learningRate * dw2) / n).toFixed(3)),
    bias: parseFloat((weights.bias - (learningRate * dbias) / n).toFixed(3)),
  };
};

// Backpropagation for 2-2-1 Multi-Layer Perceptron
export const trainMLPEpoch = (
  dataset: DataPoint[],
  weights: MLPWeights,
  learningRate = 0.8
): MLPWeights => {
  let dOutW1 = 0;
  let dOutW2 = 0;
  let dOutBias = 0;

  let dH1W1 = 0;
  let dH1W2 = 0;
  let dH1Bias = 0;

  let dH2W1 = 0;
  let dH2W2 = 0;
  let dH2Bias = 0;

  dataset.forEach((p) => {
    const fwd = predictMLP(p.x1, p.x2, weights);
    const outError = fwd.prob - p.label;
    const deltaOut = outError * sigmoidDerivative(fwd.prob);

    dOutW1 += deltaOut * fwd.h1Act;
    dOutW2 += deltaOut * fwd.h2Act;
    dOutBias += deltaOut;

    // Backprop to hidden layer 1
    const deltaH1 = deltaOut * weights.out.w1 * sigmoidDerivative(fwd.h1Act);
    dH1W1 += deltaH1 * p.x1;
    dH1W2 += deltaH1 * p.x2;
    dH1Bias += deltaH1;

    // Backprop to hidden layer 2
    const deltaH2 = deltaOut * weights.out.w2 * sigmoidDerivative(fwd.h2Act);
    dH2W1 += deltaH2 * p.x1;
    dH2W2 += deltaH2 * p.x2;
    dH2Bias += deltaH2;
  });

  const n = dataset.length || 1;

  return {
    h1: {
      w1: parseFloat((weights.h1.w1 - (learningRate * dH1W1) / n).toFixed(3)),
      w2: parseFloat((weights.h1.w2 - (learningRate * dH1W2) / n).toFixed(3)),
      bias: parseFloat((weights.h1.bias - (learningRate * dH1Bias) / n).toFixed(3)),
    },
    h2: {
      w1: parseFloat((weights.h2.w1 - (learningRate * dH2W1) / n).toFixed(3)),
      w2: parseFloat((weights.h2.w2 - (learningRate * dH2W2) / n).toFixed(3)),
      bias: parseFloat((weights.h2.bias - (learningRate * dH2Bias) / n).toFixed(3)),
    },
    out: {
      w1: parseFloat((weights.out.w1 - (learningRate * dOutW1) / n).toFixed(3)),
      w2: parseFloat((weights.out.w2 - (learningRate * dOutW2) / n).toFixed(3)),
      bias: parseFloat((weights.out.bias - (learningRate * dOutBias) / n).toFixed(3)),
    },
  };
};
