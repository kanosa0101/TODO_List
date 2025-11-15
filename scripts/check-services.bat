@echo off
chcp 65001 >nul
echo ========================================
echo 检查服务状态
echo ========================================
echo.

echo [1/2] 检查后端服务 (端口 3001)...
powershell -Command "$ErrorActionPreference='SilentlyContinue'; $tcpClient = New-Object System.Net.Sockets.TcpClient; try { $tcpClient.Connect('localhost', 3001); $tcpClient.Close(); Write-Host '  ✓ 后端服务正在运行 (端口 3001)' -ForegroundColor Green } catch { Write-Host '  ✗ 后端服务未运行 (端口 3001)' -ForegroundColor Red }" 2>nul

echo.
echo [2/2] 检查 Agent 服务 (端口 5000)...
powershell -Command "$ErrorActionPreference='SilentlyContinue'; $tcpClient = New-Object System.Net.Sockets.TcpClient; try { $tcpClient.Connect('localhost', 5000); $tcpClient.Close(); Write-Host '  ✓ Agent 服务正在运行 (端口 5000)' -ForegroundColor Green } catch { Write-Host '  ✗ Agent 服务未运行 (端口 5000)' -ForegroundColor Red }" 2>nul

echo.
echo ========================================
echo 提示：
echo - 如果后端服务未运行，请运行: scripts\start-backend.bat
echo - 如果 Agent 服务未运行，请运行: scripts\start-agent.bat
echo ========================================
echo.
pause

