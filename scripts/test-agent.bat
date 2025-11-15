@echo off
chcp 65001 >nul
echo ========================================
echo 测试 Agent 服务连接
echo ========================================
echo.

echo [1/3] 检查端口 5000 是否被占用...
powershell -Command "$ErrorActionPreference='SilentlyContinue'; $tcpClient = New-Object System.Net.Sockets.TcpClient; try { $tcpClient.Connect('localhost', 5000); $tcpClient.Close(); Write-Host '  ✓ 端口 5000 正在监听' -ForegroundColor Green } catch { Write-Host '  ✗ 端口 5000 未监听，Agent 服务可能未启动' -ForegroundColor Red }" 2>nul

echo.
echo [2/3] 测试健康检查接口...
powershell -Command "$ErrorActionPreference='SilentlyContinue'; try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/health' -UseBasicParsing -TimeoutSec 3; Write-Host '  ✓ 健康检查成功' -ForegroundColor Green; Write-Host $response.Content } catch { Write-Host '  ✗ 健康检查失败:' $_.Exception.Message -ForegroundColor Red }" 2>nul

echo.
echo [3/3] 检查 .env 文件...
if exist "%~dp0..\agent\.env" (
    echo   ✓ .env 文件存在
) else (
    echo   ✗ .env 文件不存在
    echo   请复制 .env.example 为 .env 并配置
)

echo.
echo ========================================
echo 如果 Agent 服务未运行，请执行:
echo   scripts\start-agent.bat
echo ========================================
echo.
pause

