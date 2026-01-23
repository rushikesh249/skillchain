# SkillChain Backend

> Blockchain Verified Micro-Credentials for Skills-Based Hiring

A production-grade TypeScript/Express.js backend for a Web3 platform that enables students to earn blockchain-verified credentials through project-based assessments.

## 🌟 Features

- **Student Submissions**: Submit GitHub repos for skill verification
- **GitHub Verification Engine**: Automated repo analysis with confidence scoring
- **IPFS Integration**: Certificate storage on decentralized storage
- **Blockchain Minting**: SBT (Soulbound Token) credential issuance
- **Employer Search**: Search and unlock verified candidate profiles
- **Admin Dashboard**: Approve/reject submissions pipeline

## 📁 Project Structure

```
rift/
├── src/
│   ├── config/           # Environment, database, swagger
│   ├── middlewares/      # Auth, validation, error handling
│   ├── modules/
│   │   ├── auth/         # Registration, login, JWT
│   │   ├── skills/       # Skill catalog
│   │   ├── submissions/  # Student submissions
│   │   ├── credentials/  # Issued credentials
│   │   ├── employer/     # Search, unlock profiles
│   │   ├── admin/        # Approve/reject submissions
│   │   ├── verify/       # Public credential verification
│   │   └── user/         # User model and repository
│   ├── services/
│   │   ├── github/       # GitHub API verification
│   │   ├── ipfs/         # IPFS upload service
│   │   └── blockchain/   # SBT minting service
│   ├── shared/           # Errors, utils, types
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── tests/                # Jest test suites
├── scripts/              # Seed scripts
├── Dockerfile
├── docker-compose.yml
└── .github/workflows/    # CI/CD
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- MongoDB (local or Atlas)
- npm or yarn

### Installation

```bash
# Clone repository
git clone <repo-url>
cd rift

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your values
```

### Environment Setup

Edit `.env` file:

```env
PORT=3000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/skillchain
JWT_SECRET=your-super-secret-jwt-key-at-least-32-chars
JWT_EXPIRES_IN=7d
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional - for enhanced features
GITHUB_TOKEN=your-github-personal-access-token
IPFS_TOKEN=your-web3storage-token
RPC_URL=https://sepolia.infura.io/v3/your-key
ISSUER_PRIVATE_KEY=your-wallet-private-key
CONTRACT_ADDRESS=0x...
```

### Running Locally

```bash
# Start MongoDB (if using Docker)
docker-compose up mongo -d

# Seed database
npm run seed

# Start development server
npm run dev
```

Server starts at: `http://localhost:3000`

### Using Docker

```bash
# Start all services (API + MongoDB + Mongo Express)
docker-compose up -d

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

## 📖 API Documentation

### Swagger UI

Access interactive documentation at: **http://localhost:3000/api-docs**

### API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register user | - |
| `POST` | `/api/auth/login` | Login | - |
| `GET` | `/api/auth/me` | Get current user | ✅ |
| `GET` | `/api/skills` | List all skills | - |
| `POST` | `/api/submissions` | Create submission | Student |
| `GET` | `/api/submissions/my` | My submissions | Student |
| `GET` | `/api/credentials/my` | My credentials | Student |
| `GET` | `/api/employer/search` | Search candidates | Employer |
| `POST` | `/api/employer/unlock/:id` | Unlock profile | Employer |
| `GET` | `/api/employer/unlocks` | My unlocks | Employer |
| `GET` | `/api/admin/submissions/pending` | Pending submissions | Admin |
| `POST` | `/api/admin/submissions/:id/approve` | Approve submission | Admin |
| `POST` | `/api/admin/submissions/:id/reject` | Reject submission | Admin |
| `GET` | `/api/verify/:credentialId` | Verify credential | - |
| `GET` | `/api/health` | Health check | - |

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- tests/auth.test.ts
```

## 📦 Sample Curl Commands

### Register Student

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Developer",
    "email": "john@example.com",
    "password": "Password123",
    "role": "student",
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f1234D"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123"
  }'
```

### Create Submission (Student)

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "skillId": "<skill-id>",
    "githubRepoUrl": "https://github.com/username/repo",
    "demoUrl": "https://myapp.vercel.app"
  }'
```

### Search Candidates (Employer)

```bash
curl "http://localhost:3000/api/employer/search?skillSlug=react&minScore=70&page=1&limit=10" \
  -H "Authorization: Bearer <employer-token>"
```

### Approve Submission (Admin)

```bash
curl -X POST http://localhost:3000/api/admin/submissions/<submission-id>/approve \
  -H "Authorization: Bearer <admin-token>"
```

### Verify Credential (Public)

```bash
curl http://localhost:3000/api/verify/<credential-uuid>
```

## 🔐 Seed Credentials

After running `npm run seed`:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@skillchain.io | Admin@123456 |
| Employer | employer@testcorp.com | Employer@123 |
| Student | student@example.com | Student@123 |

## 🚢 Deployment

### Render/Railway

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add environment variables from `.env.example`
6. Set `NODE_ENV=production`

### Environment Variables Required

```
PORT=3000
NODE_ENV=production
MONGODB_URI=<mongodb-atlas-uri>
JWT_SECRET=<production-secret-min-32-chars>
JWT_EXPIRES_IN=7d
CORS_ORIGINS=https://your-frontend.com
```

### Health Check

Configure health check endpoint: `/api/health`

## 🛠 Tech Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Validation**: Zod
- **Auth**: JWT + bcrypt
- **Security**: Helmet, CORS, rate-limit
- **Logging**: Pino
- **Documentation**: Swagger
- **Testing**: Jest + Supertest
- **CI/CD**: GitHub Actions
- **Container**: Docker

## 📋 License

MIT
