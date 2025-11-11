@echo off
chcp 65001 >nul
if "%1"=="" (
    echo 用法: kill-port.bat [端口号]
    echo 示例: kill-port.bat 3000
    exit /b 1
)

set PORT=%1
echo 正在查找占用端口 %PORT% 的进程...

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":%PORT%" ^| findstr "LISTENING"') do (
    set PID=%%a
    echo.
    echo 找到进程 PID: %%a
    tasklist | findstr "%%a"
    echo.
    set /p CONFIRM=是否要终止此进程? (Y/N): 
    if /i "!CONFIRM!"=="Y" (
        echo 正在终止进程 %%a...
        taskkill /PID %%a /F
        if %errorlevel% == 0 (
            echo ✅ 进程已终止
        ) else (
            echo ❌ 终止进程失败，可能需要管理员权限
        )
    ) else (
        echo 已取消操作
    )
    goto :end
)

echo 未找到占用端口 %PORT% 的进程
:end
pause

