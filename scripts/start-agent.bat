@echo off
chcp 65001 >nul
echo ========================================
echo 启动 AI Agent 服务
echo ========================================
echo.

cd /d %~dp0..\agent

if not exist "venv" (
    echo [1/4] 创建虚拟环境...
    python -m venv venv
    if errorlevel 1 (
        echo [错误] 无法创建虚拟环境，请检查 Python 是否已安装
        pause
        exit /b 1
    )
) else (
    echo [1/4] 虚拟环境已存在
)

echo.
echo [2/4] 激活虚拟环境...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [错误] 无法激活虚拟环境
    pause
    exit /b 1
)

echo.
echo [3/4] 检查并安装依赖...
if not exist "requirements.txt" (
    echo [错误] requirements.txt 文件不存在
    pause
    exit /b 1
)
echo   正在安装 Python 依赖（这可能需要几分钟）...
echo   依赖列表: flask, flask-cors, openai, python-dotenv, requests
pip install -r requirements.txt
if errorlevel 1 (
    echo [错误] 依赖安装失败！
    echo 请检查:
    echo   1. 网络连接是否正常
    echo   2. pip 是否正常工作
    echo   3. Python 版本是否兼容
    echo.
    echo 可以尝试手动安装:
    echo   cd agent
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)
echo   ✓ 依赖安装完成

echo.
echo [4/4] 检查配置文件...
if not exist ".env" (
    echo.
    echo ⚠️  警告: .env 文件不存在！
    echo 请复制 .env.example 为 .env 并配置您的 API 密钥
    echo.
    if exist ".env.example" (
        echo 正在复制 .env.example 为 .env...
        copy ".env.example" ".env" >nul
        echo ✅ 已创建 .env 文件，请编辑并填入您的 API 配置
    )
    echo.
    pause
)

echo.
echo ========================================
echo 启动 Agent 服务...
echo 服务地址: http://localhost:5000
echo ========================================
echo.
echo 提示: 服务将在新窗口中启动
echo 如果看到错误，请检查 .env 文件中的配置
echo.
echo 正在启动 Agent 服务窗口...
cd /d %~dp0..\agent
if not exist "venv\Scripts\activate.bat" (
    echo [错误] 虚拟环境不存在，请先运行脚本创建虚拟环境
    pause
    exit /b 1
)

start "AI Agent Service" cmd /k "cd /d %~dp0..\agent && run.bat"

timeout /t 3 >nul
echo.
echo ✅ Agent 服务启动命令已执行
echo 请查看新打开的窗口确认服务是否成功启动
echo.
pause

