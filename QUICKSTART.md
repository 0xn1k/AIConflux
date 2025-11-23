# Quick Start Guide

## Setup in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Then edit `.env` and add your keys:

**Minimum Required for Testing:**
- `MONGODB_URI` - Get free cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- `NEXTAUTH_SECRET` - Run: `openssl rand -base64 32`
- `NEXTAUTH_URL=http://localhost:3000`

**For Google Login:**
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - [Google Cloud Console](https://console.cloud.google.com/)

**For AI Models:**
- `OPENAI_API_KEY` - [OpenAI Platform](https://platform.openai.com/)
- `ANTHROPIC_API_KEY` - [Anthropic Console](https://console.anthropic.com/)
- `DEEPSEEK_API_KEY` - [DeepSeek Platform](https://platform.deepseek.com/)

**For Payments:**
- `RAZORPAY_KEY_ID` & `RAZORPAY_KEY_SECRET` - [Razorpay Dashboard](https://dashboard.razorpay.com/)

### 3. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 4. Test the Flow

1. Sign in with Google/GitHub
2. You'll get 3 free messages
3. Select ChatGPT and/or DeepSeek (free models)
4. Send a message
5. See responses from all selected models
6. When free messages run out, buy tokens
7. Unlock premium models (Claude, etc.) by purchasing

## Project Architecture

```
Frontend (Next.js + React)
    ↓
NextAuth.js (SSO Login)
    ↓
API Routes (/api/*)
    ↓
MongoDB (User Data + Chat History)
    ↓
AI APIs (ChatGPT, Claude, DeepSeek)
    ↓
Razorpay (Payments)
```

## Key Features Implemented

✅ SSO Login (Google, GitHub)
✅ Free tier (3 messages)
✅ Token system (pay per message)
✅ Model unlock (one-time purchase)
✅ Multi-model chat (parallel queries)
✅ Chat history
✅ Razorpay integration
✅ Responsive UI
✅ Vercel deployment ready

## API Endpoints

- `POST /api/chat` - Send message to AI models
- `GET /api/history` - Get chat history
- `GET /api/user` - Get user stats
- `POST /api/buy-tokens` - Create token purchase order
- `PUT /api/buy-tokens` - Verify token purchase
- `POST /api/buy-model` - Create model unlock order
- `PUT /api/buy-model` - Verify model unlock

## Payment Flow

1. User clicks "Buy Tokens" or locked model
2. Frontend calls API to create Razorpay order
3. Razorpay checkout opens
4. User completes payment
5. Razorpay sends payment details to frontend
6. Frontend sends to API for verification
7. API verifies signature and updates MongoDB
8. User gets tokens/model access

## Deploy to Vercel

```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo-url>
git push -u origin main

# Then go to vercel.com and:
# 1. Import your GitHub repo
# 2. Add all environment variables
# 3. Deploy!
```

## Troubleshooting

**Issue: Can't connect to MongoDB**
- Check MONGODB_URI format
- Whitelist your IP in MongoDB Atlas
- Ensure network access is configured

**Issue: OAuth not working**
- Verify redirect URLs in Google/GitHub console
- Check NEXTAUTH_URL matches your domain
- Ensure NEXTAUTH_SECRET is set

**Issue: AI models not responding**
- Verify API keys are correct
- Check API key permissions
- Look at console logs for errors

**Issue: Razorpay not loading**
- Check RAZORPAY_KEY_ID is correct
- Ensure Razorpay script loads (check browser console)
- Test with Razorpay test keys first

## Development Tips

- Use Razorpay test mode keys during development
- MongoDB free tier is sufficient for testing
- AI API calls cost money - test sparingly
- Use environment variables for all secrets
- Never commit .env file

## Next Steps

After basic setup, you can:
- Add more AI models (Gemini, Perplexity, Grok)
- Customize pricing and token packages
- Add chat export functionality
- Implement chat search
- Add user profile page
- Set up analytics
- Add email notifications

## Support

Check the main README.md for detailed documentation.
