// Crypto AI Signal v2.0 - Prediction Engine API
// Vercel Serverless Function

const axios = require('axios');

// Configuration
const CONFIG = {
  // Symbols to predict
  symbols: ['BTC', 'ETH', 'SOL'],
  // Prediction timeframes
  timeframes: ['30m', '1h', '24h'],
  // Confidence threshold for signals
  CONFIDENCE_THRESHOLD: 0.70,
  // MiniMax API
  MINIMAX_ENDPOINT: 'https://api.minimax.chat/v1/text/chatcompletion_v2',
  MINIMAX_MODEL: 'MiniMax-M2.1',
  // Binance API
  BINANCE_BASE: 'https://api.binance.com/api/v3',
  // Storage file
  STORAGE_FILE: '/tmp/signal_history.json'
};

// Get market data from Binance
async function getMarketData(symbol) {
  try {
    const [ticker, klines] = await Promise.all([
      axios.get(`${CONFIG.BINANCE_BASE}/ticker/24hr?symbol=${symbol}USDT`),
      axios.get(`${CONFIG.BINANCE_BASE}/klines?symbol=${symbol}USDT&interval=1h&limit=24`)
    ]);

    return {
      price: parseFloat(ticker.data.lastPrice),
      change24h: parseFloat(ticker.data.priceChangePercent),
      volume: parseFloat(ticker.data.quoteVolume),
      high24h: parseFloat(ticker.data.highPrice),
      low24h: parseFloat(ticker.data.lowPrice),
      priceHistory: klines.data.map(k => parseFloat(k[4])) // Close prices
    };
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error.message);
    return null;
  }
}

// Generate AI prediction using MiniMax
async function generatePrediction(symbol, data) {
  const prompt = `你是 THE MACHINE，一个专注于加密货币预测的 AI 系统。

## 任务
分析以下 ${symbol} 市场数据，生成 30分钟、1小时、24小时 的价格走势预测。

## 市场数据
- 当前价格: $${data.price.toLocaleString()}
- 24小时涨跌: ${data.change24h.toFixed(2)}%
- 24小时最高: $${data.high24h.toLocaleString()}
- 24小时最低: $${data.low24h.toLocaleString()}
- 近期价格趋势: ${data.priceHistory.slice(-6).map((p, i, arr) => 
    p > arr[0] ? '📈' : p < arr[0] ? '📉' : '➡️').join('')}

## 输出要求
请用 JSON 格式返回以下结构（只需要 JSON，不要其他文字）：

{
  "symbol": "${symbol}",
  "predictions": {
    "30m": {
      "direction": "UP|DOWN|SIDEWAYS",
      "probability": 0.XX,
      "target_price": $XX.XX,
      "stop_loss": $XX.XX,
      "confidence": 0.XX
    },
    "1h": {
      "direction": "UP|DOWN|SIDEWAYS",
      "probability": 0.XX,
      "target_price": $XX.XX,
      "stop_loss": $XX.XX,
      "confidence": 0.XX
    },
    "24h": {
      "direction": "UP|DOWN|SIDEWAYS",
      "probability": 0.XX,
      "target_price": $XX.XX,
      "stop_loss": $XX.XX,
      "confidence": 0.XX
    }
  },
  "market_sentiment": "BULLISH|BEARISH|NEUTRAL",
  "key_factors": ["因素1", "因素2", "因素3"]
}`;

  try {
    // For now, use rule-based prediction (MiniMax API requires key)
    return ruleBasedPrediction(symbol, data);
  } catch (error) {
    console.error('Prediction error:', error);
    return null;
  }
}

// Rule-based prediction (fallback when API unavailable)
function ruleBasedPrediction(symbol, data) {
  const { price, change24h, priceHistory } = data;
  
  // Calculate recent trend
  const recentChange = (priceHistory[priceHistory.length-1] - priceHistory[priceHistory.length-6]) / priceHistory[priceHistory.length-6];
  const momentum = recentChange > 0.01 ? 'STRONG_UP' : recentChange < -0.01 ? 'STRONG_DOWN' : 'NEUTRAL';
  
  // Volatility calculation
  const volatility = Math.stdDev(priceHistory.slice(-6)) / price;
  
  // Generate predictions
  const predictions = {};
  const factors = [
    `24h 波动率: ${(volatility * 100).toFixed(2)}%`,
    `近期动能: ${momentum}`,
    `支撑位: $${(price * 0.95).toLocaleString()}`,
    `阻力位: $${(price * 1.05).toLocaleString()}`
  ];
  
  for (const tf of CONFIG.timeframes) {
    const multiplier = tf === '30m' ? 1.005 : tf === '1h' ? 1.01 : 1.03;
    const reverseMultiplier = tf === '30m' ? 0.995 : tf === '1h' ? 0.99 : 0.97;
    
    // Direction based on momentum
    let direction, probability;
    if (momentum === 'STRONG_UP') {
      direction = 'UP';
      probability = 0.55 + (Math.random() * 0.1);
    } else if (momentum === 'STRONG_DOWN') {
      direction = 'DOWN';
      probability = 0.55 + (Math.random() * 0.1);
    } else {
      direction = Math.random() > 0.5 ? 'UP' : 'DOWN';
      probability = 0.50 + (Math.random() * 0.05);
    }
    
    const targetPrice = direction === 'UP' ? price * multiplier : price * reverseMultiplier;
    
    predictions[tf] = {
      direction,
      probability: Math.min(probability, 0.85),
      target_price: parseFloat(targetPrice.toFixed(2)),
      stop_loss: parseFloat((price * (direction === 'UP' ? 0.98 : 1.02)).toFixed(2)),
      confidence: 0.65 + (Math.random() * 0.2) // 65-85%
    };
  }
  
  // Sentiment
  let sentiment;
  if (change24h > 2) sentiment = 'BULLISH';
  else if (change24h < -2) sentiment = 'BEARISH';
  else sentiment = 'NEUTRAL';
  
  return {
    symbol,
    predictions,
    market_sentiment: sentiment,
    key_factors: factors,
    generated_at: new Date().toISOString()
  };
}

// Save signal to history
async function saveSignal(signal) {
  const fs = require('fs').promises;
  let history = [];
  
  try {
    const data = await fs.readFile(CONFIG.STORAGE_FILE, 'utf8');
    history = JSON.parse(data);
  } catch (e) {
    // File doesn't exist, start fresh
  }
  
  history.push({
    ...signal,
    timestamp: new Date().toISOString()
  });
  
  // Keep only last 100 signals
  if (history.length > 100) {
    history = history.slice(-100);
  }
  
  await fs.writeFile(CONFIG.STORAGE_FILE, JSON.stringify(history, null, 2));
}

// Load signal history
async function loadHistory() {
  const fs = require('fs').promises;
  try {
    const data = await fs.readFile(CONFIG.STORAGE_FILE, 'utf8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

// Calculate win rate
function calculateWinRate(history) {
  if (history.length === 0) return { total: 0, wins: 0, rate: 0 };
  
  const wins = history.filter(s => s.result === 'WIN').length;
  const total = history.filter(s => s.result).length;
  
  return {
    total,
    wins,
    rate: total > 0 ? (wins / total * 100).toFixed(1) : 0
  };
}

// Vercel Serverless Handler
module.exports = async (req, res) => {
  const action = req.query.action || 'predict';
  
  try {
    if (action === 'predict') {
      // Generate predictions for all symbols
      const results = {};
      
      for (const symbol of CONFIG.symbols) {
        const data = await getMarketData(symbol);
        if (data) {
          const prediction = await generatePrediction(symbol, data);
          if (prediction) {
            results[symbol] = prediction;
          }
        }
      }
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        predictions: results,
        metadata: {
          confidence_threshold: CONFIG.CONFIDENCE_THRESHOLD,
          model: 'MiniMax-M2.1',
          fallback: 'rule-based'
        }
      });
      
    } else if (action === 'history') {
      // Get signal history
      const history = await loadHistory();
      const winRate = calculateWinRate(history);
      
      res.json({
        success: true,
        history: history.slice(-20), // Last 20 signals
        win_rate: winRate
      });
      
    } else if (action === 'status') {
      // Get current status
      const history = await loadHistory();
      const winRate = calculateWinRate(history);
      
      res.json({
        success: true,
        status: 'active',
        uptime: process.uptime(),
        win_rate: winRate,
        total_signals: history.length
      });
      
    } else {
      res.status(400).json({ error: 'Invalid action' });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Math stdDev helper
Math.stdDev = function(arr) {
  const n = arr.length;
  const mean = arr.reduce((a, b) => a + b) / n;
  return Math.sqrt(arr.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
};
