@echo off
echo ========================================
echo 检查 MySQL 服务...
echo ========================================

:: 先检查 MySQL 端口是否可访问（不需要管理员权限）
powershell -Command "$ErrorActionPreference='SilentlyContinue'; $tcpClient = New-Object System.Net.Sockets.TcpClient; try { $tcpClient.Connect('localhost', 3306); $tcpClient.Close(); exit 0 } catch { exit 1 }" >nul 2>&1
if %errorLevel% equ 0 (
    echo MySQL 服务已在运行中（端口3306可访问）
) else (
    :: MySQL 端口不可访问，尝试启动服务
    echo MySQL 服务未运行，正在尝试启动...
    net session >nul 2>&1
    if %errorLevel% neq 0 (
        echo ========================================
        echo 错误：需要管理员权限来启动 MySQL！
        echo ========================================
        echo 请右键点击此文件，选择"以管理员身份运行"
        echo.
        pause
        exit /b 1
    )
    net start MySQL80 >nul 2>&1
    if %errorLevel% equ 0 (
        echo MySQL 服务启动成功！
        timeout /t 2 /nobreak >nul
    ) else (
        :: 再次检查服务状态
        sc query MySQL80 2>nul | find "RUNNING" >nul
        if %errorLevel% equ 0 (
            echo MySQL 服务已在运行中
        ) else (
            echo 警告：MySQL 服务启动失败
            echo 可以使用: net start MySQL80
            pause
            exit /b 1
        )
    )
)

echo.
echo ========================================
echo 启动后端服务器...
echo ========================================
cd backend
mvn spring-boot:run

