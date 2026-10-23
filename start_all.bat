@echo off
echo ===================================================
echo Starting Ernakulam Power Grid Optimization Suite
echo Backend: Python FastAPI + NetworkX (Port 8000)
echo Frontend: React + TypeScript + Vite (Port 5173)
echo ===================================================

start "FastAPI NetworkX Backend" cmd /k "python -m uvicorn backend.main:app --port 8000 --reload"
start "React Vite Frontend" cmd /k "npm run dev"

timeout /t 3 >nul
start http://localhost:5173
start http://127.0.0.1:8000/docs
echo Done! Both servers are active.
