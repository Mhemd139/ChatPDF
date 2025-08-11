# ChatPDF - AI-Powered PDF Conversation App

A modern web application that allows users to have intelligent conversations with their PDF documents using OpenAI API and RAG (Retrieval-Augmented Generation).

## 🚀 Features

- **PDF Upload & Processing**: Drag & drop PDF upload with automatic text extraction
- **Intelligent Conversations**: Chat with your PDFs using OpenAI GPT models
- **RAG Implementation**: Retrieval-Augmented Generation with similarity search and MMR
- **Conversation History**: Persistent chat history with context awareness
- **Multi-PDF Support**: Manage multiple documents in one session
- **Source Citations**: See which parts of the PDF informed the AI's responses
- **PWA Ready**: Installable web app with offline capabilities

## 🏗️ Architecture

```
ChatPDF/
├── frontend/                 # Next.js React application
│   ├── components/          # Reusable UI components
│   ├── pages/              # Next.js pages and API routes
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   ├── types/              # TypeScript type definitions
│   └── styles/             # CSS and styling
├── backend/                 # Node.js/Express API (optional)
│   ├── routes/             # API endpoints
│   ├── services/           # Business logic
│   ├── middleware/         # Custom middleware
│   └── config/             # Configuration files
├── shared/                  # Shared utilities and types
└── docs/                   # Documentation
```

## 🎨 UX Flow

### 1. Landing Page
- Clean, modern design with hero section
- "Upload PDF" call-to-action
- Feature highlights and demo
- Sign up/login options

### 2. Dashboard
- PDF library management
- Recent conversations
- Quick actions (upload, new chat)
- Search and filter capabilities

### 3. PDF Upload Flow
- Drag & drop interface
- File validation and processing
- Progress indicators
- Success/error feedback

### 4. Conversation Interface
- Split-screen layout (PDF viewer + chat)
- Real-time chat with typing indicators
- Message history with timestamps
- Source citations and highlights
- Export/share options

### 5. Settings & Configuration
- API key management
- Model selection
- Conversation preferences
- Export settings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Headless UI
- **PDF Processing**: PDF.js, pdf-parse
- **AI/ML**: OpenAI API, LangChain
- **Vector Database**: Pinecone/ChromaDB
- **State Management**: Zustand/Redux Toolkit
- **Deployment**: Vercel/Netlify

## 📱 PWA Features

- Offline capability
- Push notifications
- App-like experience
- Install prompts
- Background sync

## 🔐 Security

- API key encryption
- File upload validation
- Rate limiting
- CORS configuration
- Environment variable protection 