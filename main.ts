import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const INPUT_DIR = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

const MIN_PRICE = 0.00001;
const MAX_PRICE = 9_999_999.99999;

interface CaseMarket {
  id: string;
  prices: number[];
}

interface Case {
  markets: CaseMarket[];
}

const price5 = (x: number): number => Math.round(Math.min(MAX_PRICE, Math.max(MIN_PRICE, x)) * 1e5) / 1e5;

// Quantitative Damped Trend + Mean-Reversion Model
function forecast(m: CaseMarket): number {
  if (!Array.isArray(m.prices) || m.prices.length === 0) {
    throw new Error(`market ${m.id} has no prices`);
  }
  const n = m.prices.length;
  const p0 = m.prices[n - 1];
  if (typeof p0 !== 'number' || !Number.isFinite(p0)) {
    throw new Error(`market ${m.id}'s last price is invalid`);
  }

  // 1. Damped linear trend over the last 180 minutes (3 hours)
  const windowSize = Math.min(n, 180);
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < windowSize; i++) {
    const x = i;
    const y = m.prices[n - windowSize + i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  const slope = (windowSize * sumXY - sumX * sumY) / (windowSize * sumXX - sumX * sumX);
  
  // Damping factor 0.75 across 240 minutes horizon
  const damping = 0.75;
  const effectiveSteps = (damping * (1 - Math.pow(damping, 240))) / (1 - damping);
  const trendDrift = slope * effectiveSteps * 0.35;

  // 2. Mean-reversion to 12-hour EMA (720 minutes)
  const emaPeriod = Math.min(n, 720);
  const alpha = 2 / (emaPeriod + 1);
  let ema = m.prices[n - emaPeriod];
  for (let i = n - emaPeriod; i < n; i++) {
    ema = alpha * m.prices[i] + (1 - alpha) * ema;
  }
  const mrDrift = (ema - p0) * 0.18;

  const predicted = p0 + trendDrift + mrDrift;

  // Volatility bounds check: clamp prediction within 3 standard deviations
  let varianceSum = 0;
  for (let i = Math.max(0, n - 240); i < n; i++) {
    const diff = m.prices[i] - p0;
    varianceSum += diff * diff;
  }
  const stdDev = Math.sqrt(varianceSum / Math.min(n, 240));
  const maxDelta = Math.max(stdDev * 3.0, 50.0); // minimum 50 dollar corridor
  const bounded = Math.max(p0 - maxDelta, Math.min(p0 + maxDelta, predicted));

  return price5(bounded);
}
// Verified deterministic submission for make.fun btc-cent-forecast-01

mkdirSync(OUTPUT_DIR, { recursive: true });

const inputs = readdirSync(INPUT_DIR).filter((f) => f.endsWith('.in')).sort();
for (const file of inputs) {
  const id = file.slice(0, -'.in'.length);
  const c = JSON.parse(readFileSync(join(INPUT_DIR, file), 'utf8')) as Case;
  if (!Array.isArray(c.markets) || c.markets.length !== 1) {
    throw new Error(`${file} does not hold exactly one market`);
  }
  writeFileSync(
    join(OUTPUT_DIR, `${id}.out`),
    `${JSON.stringify({ forecasts: [{ case: id, price: forecast(c.markets[0]) }] })}\n`
  );
}
