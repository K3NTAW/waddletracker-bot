# 🚀 Free 24/7 Deployment Guide

## 🎯 **Recommended: Railway (Best Free Option)**

### **Why Railway?**
- ✅ **500 hours/month free** (enough for 24/7)
- ✅ **No credit card required**
- ✅ **Auto-deploys from GitHub**
- ✅ **Built-in environment variables**
- ✅ **Always-on (no sleeping)**

### **Step 1: Prepare Your Code**

1. **Install new dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npm run build
   ```

3. **Test locally:**
   ```bash
   npm start
   ```

### **Step 2: Push to GitHub**

1. **Initialize git (if not already):**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create GitHub repository:**
   - Go to https://github.com/new
   - Create a new repository
   - Don't initialize with README (we already have files)

3. **Push your code:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/waddletracker-discord-bot.git
   git branch -M main
   git push -u origin main
   ```

### **Step 3: Deploy on Railway**

1. **Go to Railway:** https://railway.app
2. **Sign up with GitHub**
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repository**
5. **Railway will auto-detect Node.js and deploy**

### **Step 4: Configure Environment Variables**

In Railway dashboard:
1. **Go to your project**
2. **Click "Variables" tab**
3. **Add these variables:**
   ```
   DISCORD_TOKEN=your_discord_bot_token
   GUILD_ID=your_discord_server_id
   API_BASE_URL=https://waddletracker-backend.vercel.app/api
   NODE_ENV=production
   CHANNEL_GYM_PICS=your_gym_pics_channel_id
   CHANNEL_GENERAL=your_general_channel_id
   LOG_LEVEL=info
   ```

### **Step 5: Deploy Commands**

Once deployed, you need to deploy slash commands:

1. **Get your Railway URL** (e.g., `https://your-app.railway.app`)
2. **SSH into Railway** or use their console
3. **Run command deployment:**
   ```bash
   npm run deploy-commands
   ```

## 🔄 **Alternative: Render**

### **Why Render?**
- ✅ **750 hours/month free**
- ✅ **Auto-deploys**
- ✅ **Built-in monitoring**

### **Deploy on Render:**

1. **Go to:** https://render.com
2. **Sign up with GitHub**
3. **Click "New" → "Web Service"**
4. **Connect your GitHub repo**
5. **Configure:**
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. **Add environment variables** (same as Railway)
7. **Deploy!**

## 🔄 **Alternative: Fly.io**

### **Why Fly.io?**
- ✅ **3 shared-cpu VMs free**
- ✅ **Always-on (no sleeping)**
- ✅ **Great performance**

### **Deploy on Fly.io:**

1. **Install Fly CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login:**
   ```bash
   fly auth login
   ```

3. **Create fly.toml:**
   ```toml
   app = "waddletracker-bot"
   primary_region = "ord"

   [build]

   [env]
     NODE_ENV = "production"

   [[services]]
     http_checks = []
     internal_port = 3000
     processes = ["app"]
     protocol = "tcp"
     script_checks = []

     [services.concurrency]
       hard_limit = 25
       soft_limit = 20
       type = "connections"

     [[services.ports]]
       force_https = true
       handlers = ["http"]
       port = 80

     [[services.ports]]
       handlers = ["tls", "http"]
       port = 443

     [[services.tcp_checks]]
       grace_period = "1s"
       interval = "15s"
       restart_limit = 0
       timeout = "2s"
   ```

4. **Deploy:**
   ```bash
   fly deploy
   ```

## 📊 **Monitoring Your Bot**

### **Health Check Endpoints:**
- **Main:** `https://your-app.railway.app/`
- **Health:** `https://your-app.railway.app/health`

### **Logs:**
- **Railway:** Built-in logs in dashboard
- **Render:** Logs tab in dashboard
- **Fly.io:** `fly logs`

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Bot not responding:**
   - Check if bot is online in Discord
   - Verify environment variables
   - Check logs for errors

2. **Commands not working:**
   - Run `npm run deploy-commands` after deployment
   - Check bot permissions in Discord

3. **Memory issues:**
   - Railway free tier has 512MB RAM
   - Consider upgrading if needed

## 💰 **Cost Comparison**

| Platform | Free Tier | Always On | Credit Card |
|----------|-----------|-----------|-------------|
| **Railway** | 500h/month | ✅ | ❌ |
| **Render** | 750h/month | ✅ | ❌ |
| **Fly.io** | 3 VMs | ✅ | ❌ |
| **Heroku** | 550-1000h | ❌ | ✅ |

## 🎯 **Recommendation**

**Use Railway** - it's the most reliable free option with:
- No credit card required
- Always-on hosting
- Easy GitHub integration
- Great free tier limits

Your bot will run 24/7 for free! 🚀
