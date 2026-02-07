# Freelancer Pricing Tool

A pricing tool for freelancers built with TypeScript frontend and Python backend.

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Backend**: FastAPI (Python)
- **Database**: SQLite

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Activate the virtual environment:
```bash
# On macOS/Linux:
source venv/bin/activate

# Or use the helper script:
./activate.sh

# On Windows:
venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the backend server:
```bash
python main.py
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Current Features

- Login page with email and password authentication
- JWT token-based authentication
- SQLite database for user storage

## Future Features

- User signup
- Password change functionality
- Pricing tool features
