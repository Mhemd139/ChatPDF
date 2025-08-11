# Technical Architecture

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   Landing   │ │  Dashboard  │ │    Chat     │         │
│  │    Page     │ │             │ │  Interface  │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 API Layer (Next.js API Routes)             │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   Auth      │ │    PDF      │ │    Chat     │         │
│  │   APIs      │ │   APIs      │ │    APIs     │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    External Services                       │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐         │
│  │   OpenAI    │ │  Pinecone   │ │   Storage   │         │
│  │     API     │ │   Vector    │ │   (Local/   │         │
│  │             │ │   Database  │ │    Cloud)   │         │
│  └─────────────┘ └─────────────┘ └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Technology Stack

### Frontend Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Headless UI
- **State Management**: Zustand
- **PDF Processing**: PDF.js, react-pdf
- **File Upload**: react-dropzone
- **Animations**: Framer Motion
- **Icons**: Heroicons

### Backend Stack
- **Runtime**: Node.js 18+
- **Framework**: Next.js API Routes (serverless)
- **Database**: SQLite (local) / PostgreSQL (production)
- **Vector DB**: Pinecone / ChromaDB
- **AI/ML**: OpenAI API, LangChain
- **Authentication**: NextAuth.js / JWT
- **File Storage**: Local / AWS S3 / Cloudinary

### DevOps & Tools
- **Deployment**: Vercel / Netlify
- **Version Control**: Git
- **Testing**: Jest, React Testing Library
- **Linting**: ESLint, Prettier
- **Type Checking**: TypeScript
- **CI/CD**: GitHub Actions

## 📊 Data Flow Architecture

### 1. PDF Upload Flow
```
User Upload → File Validation → Text Extraction → 
Chunking → Embedding Generation → Vector Storage → 
Success Response
```

### 2. Chat Flow
```
User Message → Context Retrieval → OpenAI API → 
Response Generation → Source Citation → 
Message Storage → UI Update
```

### 3. Authentication Flow
```
Login Request → JWT Generation → Token Storage → 
Protected Route Access → Token Validation
```

## 🗄️ Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### PDFs Table
```sql
CREATE TABLE pdfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  filename VARCHAR(255) NOT NULL,
  file_size INTEGER NOT NULL,
  page_count INTEGER,
  status VARCHAR(50) DEFAULT 'processing',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Conversations Table
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  pdf_id UUID REFERENCES pdfs(id),
  title VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id),
  role VARCHAR(20) NOT NULL, -- 'user' or 'assistant'
  content TEXT NOT NULL,
  sources JSONB, -- Array of source citations
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Embeddings Table
```sql
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_id UUID REFERENCES pdfs(id),
  chunk_text TEXT NOT NULL,
  embedding_vector VECTOR(1536), -- OpenAI embedding dimension
  page_number INTEGER,
  chunk_index INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Security Architecture

### Authentication & Authorization
- **JWT-based authentication**
- **Role-based access control**
- **Session management**
- **API key encryption**

### Data Protection
- **File upload validation**
- **Content sanitization**
- **Rate limiting**
- **CORS configuration**

### API Security
- **Input validation**
- **SQL injection prevention**
- **XSS protection**
- **CSRF protection**

## 🚀 Performance Optimization

### Frontend Optimization
- **Code splitting** with Next.js dynamic imports
- **Image optimization** with Next.js Image component
- **Lazy loading** for PDF components
- **Virtual scrolling** for large chat histories
- **Service worker** for caching

### Backend Optimization
- **Database indexing** on frequently queried fields
- **Connection pooling** for database connections
- **Caching strategy** with Redis (optional)
- **CDN integration** for static assets
- **API response compression**

### PDF Processing Optimization
- **Streaming uploads** for large files
- **Background processing** for PDF extraction
- **Chunked processing** for large documents
- **Caching** of processed embeddings

## 🔄 State Management Architecture

### Zustand Store Structure
```typescript
// PDF Store
interface PDFStore {
  pdfs: PDF[];
  currentPDF: PDF | null;
  uploadProgress: number;
  isLoading: boolean;
  
  uploadPDF: (file: File) => Promise<void>;
  setCurrentPDF: (pdf: PDF) => void;
  updateProgress: (progress: number) => void;
}

// Chat Store
interface ChatStore {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  isTyping: boolean;
  
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (id: string) => void;
  clearMessages: () => void;
}

// User Store
interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

// Settings Store
interface SettingsStore {
  openaiApiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  showCitations: boolean;
  
  updateSettings: (settings: Partial<Settings>) => void;
  testConnection: () => Promise<boolean>;
}
```

## 🔌 API Design

### RESTful API Endpoints

#### Authentication
```
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/register
GET    /api/auth/me
```

#### PDF Management
```
POST   /api/pdf/upload
GET    /api/pdf/list
GET    /api/pdf/:id
DELETE /api/pdf/:id
POST   /api/pdf/:id/process
```

#### Chat
```
POST   /api/chat/conversation
GET    /api/chat/conversations
GET    /api/chat/conversation/:id
POST   /api/chat/conversation/:id/message
GET    /api/chat/conversation/:id/messages
DELETE /api/chat/conversation/:id
```

#### Settings
```
GET    /api/settings
PUT    /api/settings
POST   /api/settings/test-connection
```

### API Response Format
```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

## 🧪 Testing Strategy

### Unit Testing
- **Component testing** with React Testing Library
- **Hook testing** with custom test utilities
- **Utility function testing** with Jest
- **API route testing** with Supertest

### Integration Testing
- **Database integration** tests
- **API endpoint** testing
- **Authentication flow** testing
- **PDF processing** pipeline testing

### E2E Testing
- **User journey** testing with Playwright
- **Critical path** validation
- **Cross-browser** compatibility
- **Mobile responsiveness** testing

## 📈 Monitoring & Analytics

### Performance Monitoring
- **Core Web Vitals** tracking
- **API response times**
- **PDF processing metrics**
- **Error tracking** with Sentry

### User Analytics
- **Feature usage** tracking
- **User engagement** metrics
- **Conversion funnel** analysis
- **A/B testing** framework

### System Health
- **Uptime monitoring**
- **Database performance**
- **API rate limiting** alerts
- **Error rate** monitoring

## 🔄 Deployment Architecture

### Development Environment
- **Local development** with hot reload
- **Environment variables** management
- **Database seeding** scripts
- **Mock services** for testing

### Staging Environment
- **Vercel preview** deployments
- **Database migrations** testing
- **Integration testing** automation
- **Performance testing** suite

### Production Environment
- **Vercel** hosting with edge functions
- **PostgreSQL** database (Supabase/Railway)
- **Pinecone** vector database
- **CDN** for static assets
- **Monitoring** and alerting

## 🛠️ Development Workflow

### Git Workflow
1. **Feature branches** from main
2. **Pull request** reviews
3. **Automated testing** on PR
4. **Staging deployment** on merge
5. **Production deployment** with approval

### Code Quality
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Husky** for pre-commit hooks

### Documentation
- **API documentation** with OpenAPI
- **Component documentation** with Storybook
- **Architecture decisions** record (ADR)
- **Deployment guides** 