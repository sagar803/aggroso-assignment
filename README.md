# CSV Insights Dashboard

A web application for analyzing CSV files with AI-powered insights, interactive visualizations, and report management.

## 🚀 Features

### ✅ What's Done

#### Core Functionality
- **File Upload**: Support for CSV, TSV, XLSX, XLS, and ODS files
- **Data Preview**: Interactive table view with sorting and filtering
- **AI-Powered Insights**: Automatic generation of data quality analysis, trends, and recommendations
- **Report Management**: Save and access last 5 reports with full data restoration
- **Follow-up Questions**: Ask additional questions about your data via AI chat

#### UI/UX Features
- **Dark/Light Theme**: Toggle between dark and light modes
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Loading States**: Visual feedback during file processing and analysis
- **Error Handling**: User-friendly error messages for invalid files and API failures
- **Status Page**: Real-time health monitoring of backend, LLM, and frontend services

#### Technical Features
- **Column Type Inference**: Automatic detection of numeric, categorical, date, and ID columns
- **Data Quality Metrics**: Completeness, consistency, and diversity scores
- **Smart Data Sampling**: Efficient processing of large datasets
- **Local Storage**: Client-side report persistence
- **Session Management**: Track and restore work sessions

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Zustand** for state management
- **Tailwind CSS** for styling
- **Recharts** for data visualization
- **Lucide React** for icons
- **SheetJS (xlsx)** for Excel file parsing
- **PapaParse** for CSV parsing
- **recharts** for charts

### Backend
- **Node.js** with Express
- **OpenAI API** for AI insights
- **CORS** enabled for cross-origin requests

## 📋 Prerequisites

- Node.js 18+ and npm/yarn
- Anthropic API key (get one at https://console.anthropic.com/)

## 🏃 How to Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/csv-insights-dashboard.git
cd csv-insights-dashboard
```

### 2. Setup Backend

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
```

**backend/.env:**
```
OPENAI_API_KEY=your_api_key_here
CLIENT_URL=http://localhost:3000
```

Start the backend:
```bash
npm start
```

Backend will run on `http://localhost:3001`

### 3. Setup Frontend

```bash
cd frontend
npm install

# Create .env file
cp .env.example .env
```

**frontend/.env:**
```
REACT_APP_API_URL=http://localhost:3001
```

Start the frontend:
```bash
npm start
```

Frontend will run on `http://localhost:3000`

### 4. Open the App

Navigate to `http://localhost:3000` in your browser.

## 🐳 Run with Docker (Alternative)

```bash
# Build and run both frontend and backend
docker-compose up --build

# Access the app at http://localhost:3000
```

## 📁 Project Structure

```
csv-insights-dashboard/
├── frontend/                 # React TypeScript app
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── layout/      # AppShell, navigation
│   │   │   ├── workspace/   # Report panel, charts, chat
│   │   │   ├── reports/     # History dropdown, export
│   │   │   └── ui/          # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── stores/          # Zustand state management
│   │   ├── lib/             # Utilities and helpers
│   │   ├── types/           # TypeScript type definitions
│   │   └── pages/           # Page components
│   └── public/
├── backend/                 # Express API server
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic
│   │   └── middleware/      # Express middleware
│   └── server.js
├── README.md
├── AI_NOTES.md
├── ABOUTME.md
└── PROMPTS_USED.md
```

## 🔑 Environment Variables

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:3001
```

### Backend (.env)
```
ANTHROPIC_API_KEY=your_anthropic_api_key
PORT=3001
NODE_ENV=development
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Upload various file formats (CSV, XLSX)
- [ ] Test with empty files
- [ ] Test with malformed CSV
- [ ] Test with large files (10,000+ rows)
- [ ] Save and load reports
- [ ] Export reports (Markdown, Text, Clipboard)
- [ ] Ask follow-up questions
- [ ] Toggle theme
- [ ] Check status page
- [ ] Test on mobile device

## 📊 Usage Guide

1. **Upload a File**: Click "Upload CSV" on home page
2. **View Insights**: Report automatically generates with health score, summary, and key findings
3. **Explore Data**: View table, charts, and ask follow-up questions
4. **Save Report**: Click "Save Report" to store in history
5. **Export**: Use Export menu to download or copy report
6. **View History**: Access last 5 reports from History dropdown