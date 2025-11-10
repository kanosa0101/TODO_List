@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo ========================================
echo    Todo 应用一键启动脚本
echo ========================================
echo.

:: 先检查 MySQL 是否已运行（尝试连接端口，不需要管理员权限）
set NEED_ADMIN=0
powershell -Command "$ErrorActionPreference='SilentlyContinue'; $tcpClient = New-Object System.Net.Sockets.TcpClient; try { $tcpClient.Connect('localhost', 3306); $tcpClient.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %errorLevel% neq 0 (
    :: MySQL 端口未响应，可能未运行，需要管理员权限启动
    set NEED_ADMIN=1
    :: 再次确认服务状态（需要管理员权限）
    net session >nul 2>&1
    if %errorLevel% neq 0 (
        echo [提示] MySQL 可能未运行，需要管理员权限来启动
        echo 如果 MySQL 已启动，脚本将继续执行
        echo 如果 MySQL 未启动，请以管理员身份运行此脚本
        echo.
    )
)

echo [1/6] 检查必要的工具...
echo.

:: 检查 Java
where java >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 未找到 Java，请先安装 Java 17+
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('java -version 2^>^&1 ^| findstr /i "version"') do set JAVA_VERSION=%%i
echo   ✓ Java: !JAVA_VERSION!

:: 检查 Maven
where mvn >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 未找到 Maven，请先安装 Maven
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('mvn -version 2^>^&1 ^| findstr /i "Apache Maven"') do set MVN_VERSION=%%i
echo   ✓ Maven: !MVN_VERSION!

:: 检查 Node.js
where node >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node -v 2^>^&1') do set NODE_VERSION=%%i
echo   ✓ Node.js: !NODE_VERSION!

:: 检查 npm
where npm >nul 2>&1
if %errorLevel% neq 0 (
    echo [错误] 未找到 npm
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm -v 2^>^&1') do set NPM_VERSION=%%i
echo   ✓ npm: !NPM_VERSION!

echo.
echo [2/6] 检查 MySQL 服务...
echo.

:: 检查 MySQL 端口是否可访问
powershell -Command "$ErrorActionPreference='SilentlyContinue'; $tcpClient = New-Object System.Net.Sockets.TcpClient; try { $tcpClient.Connect('localhost', 3306); $tcpClient.Close(); Write-Host '  ✓ MySQL 服务已在运行中（端口3306可访问）' } catch { Write-Host '  [检查] MySQL 端口3306不可访问' }" 2>nul

:: 如果端口不可访问，尝试启动服务
if %NEED_ADMIN% equ 1 (
    net session >nul 2>&1
    if %errorLevel% equ 0 (
        echo   正在尝试启动 MySQL 服务...
        net start MySQL80 >nul 2>&1
        if %errorLevel% equ 0 (
            echo   ✓ MySQL 服务启动成功！
            timeout /t 2 /nobreak >nul
        ) else (
            :: 检查服务是否真的未运行
            sc query MySQL80 2>nul | find "RUNNING" >nul
            if %errorLevel% equ 0 (
                echo   ✓ MySQL 服务已在运行中
            ) else (
                echo   [警告] MySQL 服务启动失败或未安装
                echo   如果 MySQL 已手动启动，脚本将继续执行
            )
        )
    ) else (
        echo   [提示] 无法自动启动 MySQL（需要管理员权限）
        echo   如果 MySQL 已手动启动，脚本将继续执行
    )
)

echo.
echo [3/6] Checking database configuration...
echo.

:: 检查数据库配置文件
echo   Checking application.properties...
if exist "%~dp0backend\src\main\resources\application.properties" (
    echo   OK: Configuration file found
) else (
    echo   ERROR: Configuration file not found at: %~dp0backend\src\main\resources\application.properties
    echo   Current directory: %CD%
    pause
    exit /b 1
)

echo.
echo [4/6] 检查前端依赖...
echo.

if exist "%~dp0frontend\node_modules" (
    echo   OK: Frontend dependencies installed
) else (
    echo   Installing frontend dependencies...
    cd /d "%~dp0frontend"
    call npm install
    if %errorLevel% neq 0 (
        echo   ERROR: Failed to install frontend dependencies
        pause
        exit /b 1
    )
    cd /d "%~dp0"
    echo   OK: Frontend dependencies installed
)

echo.
echo [5/6] 启动后端服务器...
echo.

:: 在新窗口中启动后端
start "Todo Backend" cmd /k "cd /d %~dp0backend && echo [Backend] Starting... && mvn spring-boot:run"

:: 等待后端启动
echo   等待后端服务器启动（约15秒）...
timeout /t 15 /nobreak >nul

:: 测试后端是否启动成功
echo   测试后端连接...
powershell -Command "$ErrorActionPreference='SilentlyContinue'; $response = Invoke-WebRequest -Uri 'http://localhost:3001/api/todos' -UseBasicParsing -TimeoutSec 3; if ($response.StatusCode -eq 200) { Write-Host '  ✓ 后端服务器启动成功！' } else { Write-Host '  [警告] 后端可能还在启动中...' }" 2>nul

echo.
echo [6/6] 启动前端服务器...
echo.

:: 在新窗口中启动前端
start "Todo Frontend" cmd /k "cd /d %~dp0frontend && echo [Frontend] Starting... && npm run dev"

:: 等待前端服务器启动
echo   Waiting for frontend server to start (about 5 seconds)...
timeout /t 5 /nobreak >nul

:: 自动打开浏览器
echo   Opening browser...
start http://localhost:3000

echo.
echo ========================================
echo   启动完成！
echo ========================================
echo.
echo 后端服务器: http://localhost:3001
echo 前端应用:   http://localhost:3000
echo.
echo 提示：
echo - 浏览器已自动打开前端页面
echo - 后端和前端已在独立窗口中启动
echo - 关闭窗口即可停止对应的服务
echo - 如需停止所有服务，请关闭所有相关窗口
echo.
pause

