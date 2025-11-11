@echo off
chcp 65001 >nul
echo ========================================
echo 端口占用检查工具
echo ========================================
echo.

echo [检查端口 3000 - 前端开发服务器]
netstat -ano | findstr ":3000" >nul
if %errorlevel% == 0 (
    echo ⚠️  端口 3000 已被占用
    echo.
    echo 占用进程信息：
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
        set PID=%%a
        echo PID: %%a
        tasklist | findstr "%%a"
    )
    echo.
    echo 解决方案：
    echo 1. 停止占用端口的进程
    echo 2. 或修改 vite.config.js 中的端口号
    echo.
) else (
    echo ✅ 端口 3000 可用
)
echo.

echo [检查端口 3001 - 后端服务器]
netstat -ano | findstr ":3001" >nul
if %errorlevel% == 0 (
    echo ⚠️  端口 3001 已被占用
    echo.
    echo 占用进程信息：
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING"') do (
        set PID=%%a
        echo PID: %%a
        tasklist | findstr "%%a"
    )
    echo.
    echo 解决方案：
    echo 1. 停止占用端口的进程
    echo 2. 或修改 application.properties 中的 server.port
    echo.
) else (
    echo ✅ 端口 3001 可用
)
echo.

echo [检查端口 3306 - MySQL数据库]
netstat -ano | findstr ":3306" >nul
if %errorlevel% == 0 (
    echo ✅ 端口 3306 已被占用（MySQL服务正在运行）
    echo.
    echo 占用进程信息：
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3306" ^| findstr "LISTENING"') do (
        set PID=%%a
        echo PID: %%a
        tasklist | findstr "%%a"
    )
    echo.
) else (
    echo ⚠️  端口 3306 未被占用（MySQL服务未运行）
    echo.
    echo 解决方案：
    echo 1. 启动 MySQL 服务
    echo 2. 或检查 MySQL 配置
    echo.
)
echo.

echo ========================================
echo 检查完成
echo ========================================
pause

