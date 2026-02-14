# Legacy E-commerce (Local run)

Quick steps to run the project locally on Windows.

Prerequisites
- Python 3.11+ (recommended)
- Node.js 18+ and Yarn or npm
- MongoDB running locally on default port (27017)

Backend
1. Open a PowerShell terminal and create a virtual environment in `backend`:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Start the backend (from `backend` folder):

```powershell
uvicorn server:app --reload --host 127.0.0.1 --port 8000
```

Frontend
1. From the `frontend` folder install dependencies (use yarn if available):

```powershell
cd frontend
yarn install
# or: npm install
```

2. Start the frontend dev server:

```powershell
yarn start
# or: npm start
```

Quick helper scripts
- Use the provided `start_all.ps1` at repository root to open two windows and start frontend and backend automatically.

Notes
- Backend environment variables are in `backend/.env`.
- Frontend environment variables are in `frontend/.env`.
# Here are your Instructions
