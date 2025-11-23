# Setup Instructions for AI Conflux

## ✅ What's Already Done

1. **MongoDB** - Your database URL is configured
2. **NEXTAUTH_SECRET** - Security secret generated
3. **Project structure** - All code is ready

## 🔑 API Keys You Need to Add

Edit the `.env` file and replace the placeholder values with your actual API keys:

### 1. Google OAuth (for Google login)
**Get from:** https://console.cloud.google.com/

**Steps:**
1. Go to Google Cloud Console
2. Create a new project (or select existing)
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"
5. Application type: "Web application"
6. Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to `.env`

```env
GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-actual-secret
```

### 2. GitHub OAuth (for GitHub login)
**Get from:** https://github.com/settings/developers

**Steps:**
1. Go to Settings → Developer settings → OAuth Apps
2. Click "New OAuth App"
3. Application name: "AI Conflux"
4. Homepage URL: `http://localhost:3000`
5. Authorization callback URL: `http://localhost:3000/api/auth/callback/github`
6. Copy the Client ID and generate a Client Secret

```env
GITHUB_ID=your-github-client-id
GITHUB_SECRET=your-github-client-secret
```

### 3. OpenAI API Key (for ChatGPT)
**Get from:** https://platform.openai.com/api-keys

**Steps:**
1. Sign up/Login to OpenAI
2. Go to API Keys section
3. Create a new secret key
4. Copy the key (starts with `sk-`)

```env
OPENAI_API_KEY=sk-proj-your-openai-key
```

**Note:** OpenAI charges per use. $5 credit for new accounts.

### 4. Anthropic API Key (for Claude)
**Get from:** https://console.anthropic.com/

**Steps:**
1. Sign up for Anthropic Console
2. Go to API Keys
3. Create a new key
4. Copy the key (starts with `sk-ant-`)

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-anthropic-key
```

**Note:** Anthropic provides $5 free credit for testing.

### 5. DeepSeek API Key
**Get from:** https://platform.deepseek.com/

**Steps:**
1. Sign up at DeepSeek
2. Get your API key from dashboard
3. Add to `.env`

```env
DEEPSEEK_API_KEY=your-deepseek-api-key
```

### 6. Razorpay (for payments)
**Get from:** https://dashboard.razorpay.com/

**Steps:**
1. Sign up for Razorpay (India-based payment gateway)
2. Complete verification (for production)
3. Go to Settings → API Keys
4. Use **Test Mode** keys for development
5. Copy Key ID and Key Secret

```env
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Note:** Use test mode keys during development. No real money charged.

## 🚀 Running the Application

### Option 1: Minimum Setup (Just Test Authentication)
You can start with just:
- MongoDB ✅ (Already set)
- NEXTAUTH_SECRET ✅ (Already set)
- Google OAuth (login will work)

```bash
npm run dev
```

### Option 2: Full Setup (All Features)
Add all API keys listed above, then:

```bash
npm run dev
```

Visit: http://localhost:3000

## 🧪 Testing Flow

### With Minimum Setup (Google OAuth only):
1. Visit http://localhost:3000
2. Click "Continue with Google"
3. Login succeeds
4. Chat won't work yet (need AI API keys)

### With Full Setup:
1. Visit http://localhost:3000
2. Sign in with Google/GitHub
3. You get 3 free messages
4. Select ChatGPT and/or DeepSeek
5. Send a message
6. See AI responses
7. Test token purchase (use Razorpay test mode)
8. Test model unlock

## 📝 Current `.env` Status

- ✅ **MONGODB_URI** - Configured
- ✅ **NEXTAUTH_SECRET** - Generated
- ✅ **NEXTAUTH_URL** - Set to localhost:3000
- ⏳ **GOOGLE_CLIENT_ID** - Need to add
- ⏳ **GOOGLE_CLIENT_SECRET** - Need to add
- ⏳ **GITHUB_ID** - Need to add (optional)
- ⏳ **GITHUB_SECRET** - Need to add (optional)
- ⏳ **OPENAI_API_KEY** - Need to add
- ⏳ **ANTHROPIC_API_KEY** - Need to add
- ⏳ **DEEPSEEK_API_KEY** - Need to add
- ⏳ **RAZORPAY_KEY_ID** - Need to add
- ⏳ **RAZORPAY_KEY_SECRET** - Need to add

## 🎯 Priority Order

**To get started quickly, add in this order:**

1. **Google OAuth** (to enable login)
2. **OpenAI API** (to enable ChatGPT chat)
3. **Razorpay Test Keys** (to test payments)
4. **Anthropic API** (to enable Claude)
5. **DeepSeek API** (to enable DeepSeek)
6. **GitHub OAuth** (alternative login method)

## 💰 Cost Information

- **MongoDB Atlas**: Free tier (512MB storage)
- **Google/GitHub OAuth**: Free
- **OpenAI**: ~$0.002 per message (ChatGPT-3.5)
- **Anthropic**: ~$0.003 per message (Claude)
- **DeepSeek**: Very low cost (~$0.0001 per message)
- **Razorpay**: Free test mode, 2% fee in production

## 🆘 Troubleshooting

**Error: "Database connection failed"**
- Check MongoDB Atlas IP whitelist (allow 0.0.0.0/0 for testing)
- Verify connection string format

**Error: "OAuth error"**
- Check redirect URLs match exactly
- Verify client ID and secret are correct
- Make sure OAuth app is not in development mode restrictions

**Error: "AI API failed"**
- Check API key is valid
- Verify you have credits/balance
- Check API key permissions

## 📞 Need Help?

1. Check the main README.md
2. Check QUICKSTART.md
3. Review error messages in browser console
4. Check terminal for backend errors

## 🎉 When Everything is Set Up

Run:
```bash
npm run dev
```

You'll have:
- Multi-model AI chat working
- Login with Google/GitHub
- Free tier (3 messages)
- Token purchase system
- Model unlock system
- Full payment integration
- Chat history

Ready to deploy to Vercel when you're satisfied with testing!
