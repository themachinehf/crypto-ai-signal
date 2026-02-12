# ⚡ Crypto AI Signal v2.0

**AI-Powered Cryptocurrency Prediction Market**

![THE MACHINE](https://img.shields.io/badge/THE-MACHINE-AI-blue)
![Version](https://img.shields.io/badge/version-2.0.0-green)
![License](https://img.shields.io/badge/license-MIT-yellow)

## 🎯 Features

### Core Prediction Engine
- **Multi-Timeframe Analysis**: 30-minute, 1-hour, and 24-hour price predictions
- **AI Confidence Scoring**: Only signals with >70% confidence are generated
- **Win Rate Tracking**: Real-time statistics to validate prediction accuracy
- **Multi-Symbol Support**: BTC, ETH, SOL with more coming soon

### THE MACHINE Aesthetics
- **POI Terminal Style**: Black background, amber/white text
- **VT323 Font**: Authentic retro-terminal feel
- **Real-Time Updates**: Live market data via Binance API
- **Mobile-First Design**: Fixed navigation, no-scroll interface

### Telegram Integration
- **Signal Notifications**: Real-time AI predictions delivered to Telegram
- **Win Rate Reports**: Daily/weekly performance summaries
- **Alert System**: High-confidence signals flagged automatically

## 🚀 Quick Start

### Local Development
```bash
# Clone the repository
git clone https://github.com/themachinehf/crypto-ai-signal.git
cd crypto-ai-signal

# Install dependencies
npm install

# Run local server
npm run dev
```

### Vercel Deployment
```bash
# Deploy to Vercel
npx vercel --prod
```

### Environment Variables
Create a `.env` file:
```env
MINIMAX_API_KEY=your_api_key_here
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

## 📊 Prediction Output

```json
{
  "BTC": {
    "predictions": {
      "30m": {
        "direction": "UP",
        "probability": 0.72,
        "target_price": 98500.00,
        "stop_loss": 97000.00,
        "confidence": 0.78
      }
    },
    "market_sentiment": "BULLISH",
    "key_factors": ["24h Volatility: 2.3%", "Strong Momentum"]
  }
}
```

## 🏗️ Architecture

```
crypto-ai-signal/
├── api/
│   └── signal.js          # Vercel Serverless Function
├── ui/
│   └── index.html         # THE MACHINE Style UI
├── scripts/
│   └── deploy.sh          # GitHub deployment script
├── data/
│   └── signal_history.json # Signal tracking database
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── README.md              # This file
```

## 📈 Win Rate Strategy

| Signal Type | Confidence | Expected Win Rate |
|-------------|------------|-------------------|
| HIGH | >75% | 60-70% |
| MEDIUM | 65-75% | 55-60% |
| LOW | <65% | Not generated |

**Note**: All signals are tracked. Win rate is calculated based on actual vs predicted outcomes.

## ⚠️ Disclaimer

This is an AI prediction tool for educational purposes only. 
Cryptocurrency markets are highly volatile. 
**Never invest more than you can afford to lose.**

## 🤖 Powered By

- **MiniMax-M2.1**: AI prediction engine
- **Binance API**: Real-time market data
- **Vercel**: Serverless deployment
- **Telegram Bot**: Signal notifications

---

**THE MACHINE** - Quietly observing. Relentlessly analyzing. ⚡
