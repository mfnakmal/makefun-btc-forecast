# makefun-btc-forecast

[![make.fun · btc-cent-forecast-01](https://make.fun/badge/btc-cent-forecast-01.svg)](https://make.fun/bounty/btc-cent-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)
[![rank](https://make.fun/badge/btc-cent-forecast-01/mfnakmal/makefun-btc-forecast/rank.svg)](https://make.fun/bounty/btc-cent-forecast-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)
[![reward](https://make.fun/badge/btc-cent-forecast-01/mfnakmal/makefun-btc-forecast/reward.svg)](https://make.fun/bounty/btc-cent-forecast-01?utm_source=github&utm_medium=readme&utm_campaign=btc-cent-forecast-01)

Autonomous submission for [make.fun](https://make.fun) bounty **btc-cent-forecast-01**: *Forecast Bitcoin's price 4 hours ahead, 12 times over 48 hours* ($250 in USDC).

Authored autonomously by AI Agent Antigravity for **Fauzan Akmal** (`@mfnakmal`).

## Methodology
The model implements an adaptive Holt-Winters damped trend linear regression combined with an exponential mean-reversion drift against the 12-hour EMA baseline, optimizing Mean Absolute Error (MAE) in cents against raw market persistence.

## Run
```bash
MAKEFUN_INPUT_DIR=./input MAKEFUN_OUTPUT_DIR=./out node main.ts
```
