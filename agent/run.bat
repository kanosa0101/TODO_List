@echo off
chcp 65001 >nul
title AI Agent Service

echo ========================================
echo AI Agent Service
echo ========================================
echo.

echo [步骤 1] 检查当前目录...
cd
echo   当前目录: %CD%
echo.

echo [步骤 2] 激活虚拟环境...
if not exist venv\Scripts\activate.bat (
    echo [错误] 虚拟环境不存在！请先运行脚本创建虚拟环境
    pause
    exit /b 1
)
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [错误] 无法激活虚拟环境
    pause
    exit /b 1
)
echo   ✓ 虚拟环境已激活
echo.

echo [步骤 3] 检查 Python...
python --version
if errorlevel 1 (
    echo [错误] Python 未找到
    pause
    exit /b 1
)
echo.

echo [步骤 4] 检查依赖...
python -c "import flask, flask_cors, requests" 2>nul
if errorlevel 1 (
    echo   ⚠️  依赖未安装，正在安装...
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo   ✓ 依赖安装完成
) else (
    echo   ✓ 依赖已安装
)
echo.

echo [步骤 5] 检查配置文件...
if exist .env (
    echo   ✓ .env 文件存在
) else (
    echo   ⚠️  [警告] .env 文件不存在
)
echo.

echo [步骤 6] 检查启动脚本...
if exist start.py (
    echo   ✓ start.py 存在
    set START_SCRIPT=start.py
) else (
    echo   ✗ start.py 不存在，使用 app.py
    set START_SCRIPT=app.py
)
echo.

echo [步骤 7] 启动 Agent 服务...
echo.
python %START_SCRIPT%

echo.
echo [错误] Agent 服务已停止
pause

