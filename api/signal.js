// Crypto AI Signal v2.0 - Prediction Engine API (SIMULATION MODE)
// Vercel Serverless Function

// Force simulation mode - no external API calls
const CONFIG = {
  symbols: ['BTC', 'ETH', 'SOL'],
  timeframes: ['30m', '1h', '24h'],
  CONFIDENCE_THRESHOLD: 0.70,
  SIMULATION_MODE: true, // Force simulation mode
  STORAGE_FILE: '/tmp/signal_history.json'
};

// Get market data - SIMULATION MODE
function getMarketData(symbol) {
  // Generate realistic simulated data
  const basePrices = {
    'BTC': 97500 + Math.random() * 2000 - 1000,
    'ETH': 3485 + Math.random() * 100 - 50,
    'SOL': 238 + Math.random() * 10 - 5
  };
  
  const basePrice = basePrices[symbol];
  
  // Generate realistic price history
  const priceHistory = [];
  let currentPrice = basePrice * 0.98;
  for (let i = 0; i < 24; i++) {
    currentPrice = currentPrice * (1 + (Math.random() * 0.02 - 0.01));
    priceHistory.push(currentPrice);
  }
  
  return {
    price: basePrice,
    change24h: (Math.random() * 4 - 2),
    volume: Math.random() * 10000000000,
    high24h: basePrice * 1.02,
    low24h: basePrice * 0.98,
    priceHistory: priceHistory
  };
}

// Generate AI prediction using simulation
async function generatePrediction(symbol, data) {
  // Always use rule-based simulation
  return ruleBasedPrediction(symbol, data);
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
      // Generate predictions for all symbols (synchronous in simulation mode)
      const results = {};
      
      for (const symbol of CONFIG.symbols) {
        const data = getMarketData(symbol);
        if (data) {
          const prediction = generatePrediction(symbol, data);
          if (prediction) {
            results[symbol] = prediction;
          }
        }
      }
      
      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        mode: 'simulation',
        predictions: results,
        metadata: {
          confidence_threshold: CONFIG.CONFIDENCE_THRESHOLD,
          model: 'SIMULATION',
          disclaimer: 'This is a simulation for demo purposes only. Not financial advice.'
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
