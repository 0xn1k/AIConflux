# AI Conflux - Multi-Model AI Chat Platform

A Next.js application that allows users to chat with multiple AI models simultaneously (ChatGPT, Claude, DeepSeek, and more) with a freemium + token-based payment system.

## Features

- **Multi-Model Chat**: Chat with ChatGPT, Claude, DeepSeek, and other AI models in parallel
- **Freemium Model**: 3 free messages to start
- **Token System**: Purchase tokens for continued access after free tier
- **Model Unlock System**: Free models (ChatGPT, DeepSeek) available by default; premium models (Claude, Gemini, Perplexity, Grok) require one-time purchase
- **SSO Authentication**: Login with Google or GitHub via NextAuth.js
- **Chat History**: All conversations stored in MongoDB
- **Razorpay Integration**: Secure payment processing for Indian users

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Google & GitHub OAuth
- **Database**: MongoDB Atlas
- **AI APIs**: OpenAI (ChatGPT), Anthropic (Claude), DeepSeek
- **Payment**: Razorpay
- **Hosting**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB Atlas account
- Google OAuth credentials
- GitHub OAuth credentials
- OpenAI API key
- Anthropic API key
- DeepSeek API key
- Razorpay account (for payments)

### Installation

1. Clone the repository:
```bash
cd aiConflux
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

- **MongoDB**: Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **NextAuth Secret**: Generate with `openssl rand -base64 32`
- **Google OAuth**: Get credentials from [Google Cloud Console](https://console.cloud.google.com/)
- **GitHub OAuth**: Create OAuth app in [GitHub Settings](https://github.com/settings/developers)
- **OpenAI**: Get API key from [OpenAI Platform](https://platform.openai.com/)
- **Anthropic**: Get API key from [Anthropic Console](https://console.anthropic.com/)
- **DeepSeek**: Get API key from [DeepSeek Platform](https://platform.deepseek.com/)
- **Razorpay**: Get credentials from [Razorpay Dashboard](https://dashboard.razorpay.com/)

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODB_URI` | MongoDB connection string | Yes |
| `NEXTAUTH_URL` | Your app URL (http://localhost:3000 for dev) | Yes |
| `NEXTAUTH_SECRET` | Random secret for NextAuth | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | Yes |
| `GITHUB_ID` | GitHub OAuth client ID | Yes |
| `GITHUB_SECRET` | GitHub OAuth client secret | Yes |
| `OPENAI_API_KEY` | OpenAI API key for ChatGPT | Yes |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | Yes |
| `DEEPSEEK_API_KEY` | DeepSeek API key | Yes |
| `RAZORPAY_KEY_ID` | Razorpay key ID | Yes |
| `RAZORPAY_KEY_SECRET` | Razorpay key secret | Yes |

## Project Structure

```
aiConflux/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/   # NextAuth configuration
│   │   ├── chat/                 # Chat endpoint (multi-model)
│   │   ├── history/              # Chat history endpoint
│   │   ├── user/                 # User data endpoint
│   │   ├── buy-tokens/           # Token purchase endpoint
│   │   └── buy-model/            # Model unlock endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── components/
│   ├── SessionProvider.tsx       # NextAuth session provider
│   ├── ChatInterface.tsx         # Main chat UI
│   ├── UserStats.tsx             # User stats display
│   ├── BuyTokensModal.tsx        # Token purchase modal
│   └── BuyModelModal.tsx         # Model unlock modal
├── lib/
│   ├── mongodb.ts                # MongoDB connection
│   ├── db.ts                     # Database helpers
│   └── ai-clients.ts             # AI API integrations
├── models/
│   ├── User.ts                   # User model & helpers
│   └── Chat.ts                   # Chat model & helpers
├── types/
│   └── next-auth.d.ts            # NextAuth TypeScript definitions
└── package.json
```

## Database Schema

### Users Collection
```typescript
{
  email: string,
  name: string,
  image: string,
  freeChatsUsed: number,        // 0-3
  tokens: number,                // Purchased tokens
  unlockedModels: string[],      // ["ChatGPT", "DeepSeek", "Claude", ...]
  createdAt: Date,
  updatedAt: Date
}
```

### Chats Collection
```typescript
{
  userId: string,                // user email
  role: "user" | "assistant",
  model: string,                 // "ChatGPT", "Claude", etc.
  content: string,
  timestamp: Date
}
```

## Payment Configuration

### Token Packages

- **Small**: 10 tokens - ₹99
- **Medium**: 50 tokens - ₹399
- **Large**: 100 tokens - ₹699

Each message sent to all selected models consumes tokens equal to the number of models.

### Model Prices (One-time purchase)

- **Claude**: ₹299
- **Gemini**: ₹199
- **Perplexity**: ₹249
- **Grok**: ₹349

## Deployment to Vercel

1. Push your code to GitHub

2. Go to [Vercel](https://vercel.com) and import your repository

3. Add all environment variables in Vercel dashboard:
   - Go to Settings → Environment Variables
   - Add all variables from `.env.example`

4. Deploy!

Your app will be live at `https://your-project.vercel.app`

## API Endpoints

### GET `/api/user`
Get current user data (tokens, free chats remaining, unlocked models)

### POST `/api/chat`
Send a message to selected AI models
```json
{
  "message": "Hello!",
  "models": ["ChatGPT", "Claude"]
}
```

### GET `/api/history`
Get user's chat history

### POST `/api/buy-tokens`
Create Razorpay order for token purchase
```json
{
  "packageType": "medium"  // "small", "medium", or "large"
}
```

### PUT `/api/buy-tokens`
Verify payment and add tokens to user account

### POST `/api/buy-model`
Create Razorpay order for model unlock
```json
{
  "model": "Claude"
}
```

### PUT `/api/buy-model`
Verify payment and unlock model for user

## Usage Flow

1. **Sign Up**: User logs in with Google or GitHub
2. **Free Tier**: Gets 3 free messages with ChatGPT & DeepSeek
3. **Select Models**: Choose which AI models to query
4. **Send Message**: Message sent to all selected models in parallel
5. **View Responses**: Each model's response displayed separately
6. **Purchase Tokens**: When free tier exhausted, buy token packages
7. **Unlock Models**: Purchase access to premium models (Claude, etc.)
8. **Unlimited Chat**: Continue chatting with purchased tokens

## Adding More AI Models

To add a new AI model:

1. Add the model to `models/User.ts`:
```typescript
export const PREMIUM_MODELS = ["Claude", "Gemini", "YourNewModel"];
```

2. Implement the API client in `lib/ai-clients.ts`:
```typescript
export async function callYourNewModel(message: string, history: AIMessage[] = []): Promise<string> {
  // Implementation here
}
```

3. Add the case in `callAI()` function
4. Add pricing in `app/api/buy-model/route.ts`

## Security Notes

- Never commit `.env` file
- Use environment variables for all secrets
- Razorpay payment signature verification is implemented
- NextAuth handles session security
- MongoDB connection uses SSL by default

## Support

For issues or questions, please open an issue on GitHub.

## License

MIT License
