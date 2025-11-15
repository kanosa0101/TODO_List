@echo off
echo Starting Frontend Server...

:: 在新窗口中启动前端服务器
start "Todo Frontend" cmd /k "cd /d %~dp0..\frontend && echo [Frontend] Starting... && npm run dev"

:: 等待服务器启动
echo Waiting for server to start (about 5 seconds)...
timeout /t 5 /nobreak >nul

:: 自动打开浏览器
echo Opening browser...
start http://localhost:3000

echo.
echo Frontend server is running at http://localhost:3000
echo The server is running in a separate window.
echo Close that window to stop the server.
echo.
pause

