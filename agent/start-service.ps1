# Quick start script for Agent service
Write-Host "========================================"
Write-Host "Starting Agent Service..."
Write-Host "========================================"
Write-Host ""

# Activate virtual environment
& ".\venv\Scripts\Activate.ps1"

# Start the service
python start.py
