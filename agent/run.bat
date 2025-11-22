@echo off
chcp 65001 >nul
title AI Agent Service

echo ========================================
echo Starting AI Agent Service
echo ========================================
echo.

REM Activate virtual environment and start service
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo Error: Cannot activate virtual environment
    echo Please ensure venv exists: python -m venv venv
    pause
    exit /b 1
)

REM Start the service
python start.py

pause
