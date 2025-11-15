@echo off
chcp 65001 >nul
echo ========================================
echo 安装 Agent 服务依赖
echo ========================================
echo.

cd /d %~dp0..\agent

if not exist "venv" (
    echo [1/3] 创建虚拟环境...
    python -m venv venv
    if errorlevel 1 (
        echo [错误] 无法创建虚拟环境，请检查 Python 是否已安装
        pause
        exit /b 1
    )
    echo   ✓ 虚拟环境创建成功
) else (
    echo [1/3] 虚拟环境已存在
)

echo.
echo [2/3] 激活虚拟环境...
call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [错误] 无法激活虚拟环境
    pause
    exit /b 1
)
echo   ✓ 虚拟环境已激活

echo.
echo [3/3] 安装 Python 依赖...
if not exist "requirements.txt" (
    echo [错误] requirements.txt 文件不存在
    pause
    exit /b 1
)

echo   正在安装依赖（这可能需要几分钟）...
echo   依赖列表:
echo     - flask
echo     - flask-cors
echo     - openai
echo     - python-dotenv
echo.

pip install --upgrade pip
pip install -r requirements.txt

if errorlevel 1 (
    echo.
    echo [错误] 依赖安装失败！
    echo.
    echo 请检查:
    echo   1. 网络连接是否正常
    echo   2. pip 是否正常工作
    echo   3. Python 版本是否兼容（建议 Python 3.8+）
    echo.
    echo 可以尝试手动安装:
    echo   cd agent
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)

echo.
echo ========================================
echo ✅ 依赖安装完成！
echo ========================================
echo.
echo 现在可以运行 scripts\start-agent.bat 启动服务
echo.
pause

