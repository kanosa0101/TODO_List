#!/bin/bash

# 获取脚本所在目录的父目录（项目根目录）
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "========================================"
echo "   Todo 应用一键启动脚本"
echo "========================================"
echo ""

# 检查是否有 sudo 权限
if [ "$EUID" -ne 0 ]; then 
    echo "[错误] 需要管理员权限来启动 MySQL 服务"
    echo "请使用: sudo ./start-all.sh"
    exit 1
fi

echo "[1/7] 检查必要的工具..."
echo ""

# 检查 Java
if ! command -v java &> /dev/null; then
    echo "[错误] 未找到 Java，请先安装 Java 17+"
    exit 1
fi
JAVA_VERSION=$(java -version 2>&1 | head -n 1)
echo "  ✓ Java: $JAVA_VERSION"

# 检查 Maven
if ! command -v mvn &> /dev/null; then
    echo "[错误] 未找到 Maven，请先安装 Maven"
    exit 1
fi
MVN_VERSION=$(mvn -version 2>&1 | head -n 1)
echo "  ✓ Maven: $MVN_VERSION"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "[错误] 未找到 Node.js，请先安装 Node.js"
    exit 1
fi
NODE_VERSION=$(node -v)
echo "  ✓ Node.js: $NODE_VERSION"

# 检查 npm
if ! command -v npm &> /dev/null; then
    echo "[错误] 未找到 npm"
    exit 1
fi
NPM_VERSION=$(npm -v)
echo "  ✓ npm: $NPM_VERSION"

# 检查 Python（Agent 服务需要）
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "  [警告] 未找到 Python，Agent 服务可能无法启动"
else
    PYTHON_CMD=$(command -v python3 2>/dev/null || command -v python 2>/dev/null)
    PYTHON_VERSION=$($PYTHON_CMD --version 2>&1)
    echo "  ✓ Python: $PYTHON_VERSION"
fi

echo ""
echo "[2/7] 启动 MySQL 服务...
echo ""

# 尝试启动 MySQL 服务
if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
    echo "  ✓ MySQL 服务已在运行中"
else
    echo "  正在启动 MySQL 服务..."
    if systemctl start mysql 2>/dev/null || systemctl start mysqld 2>/dev/null; then
        echo "  ✓ MySQL 服务启动成功！"
    else
        echo "  [警告] MySQL 服务启动失败，请手动检查"
        exit 1
    fi
fi

echo ""
echo "[3/7] 检查数据库配置..."
echo ""

if [ -f "$SCRIPT_DIR/backend/src/main/resources/application.properties" ]; then
    echo "  ✓ 配置文件存在"
else
    echo "  [错误] 未找到配置文件"
    exit 1
fi

echo ""
echo "[4/7] 检查前端依赖..."
echo ""

if [ -d "$SCRIPT_DIR/frontend/node_modules" ]; then
    echo "  ✓ 前端依赖已安装"
else
    echo "  正在安装前端依赖..."
    cd "$SCRIPT_DIR/frontend"
    npm install
    if [ $? -ne 0 ]; then
        echo "  [错误] 前端依赖安装失败"
        exit 1
    fi
    cd "$SCRIPT_DIR"
    echo "  ✓ 前端依赖安装完成"
fi

echo ""
echo "[5/7] 启动后端服务器..."
echo ""

# 获取脚本所在目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# 在新终端中启动后端（如果支持）
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$SCRIPT_DIR/backend' && echo '[后端] 正在启动...' && mvn spring-boot:run; exec bash"
elif command -v xterm &> /dev/null; then
    xterm -e "cd '$SCRIPT_DIR/backend' && echo '[后端] 正在启动...' && mvn spring-boot:run" &
elif command -v osascript &> /dev/null; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"cd '$SCRIPT_DIR/backend' && echo '[后端] 正在启动...' && mvn spring-boot:run\""
else
    # 如果都不支持，在后台运行
    cd "$SCRIPT_DIR/backend"
    nohup mvn spring-boot:run > ../backend.log 2>&1 &
    BACKEND_PID=$!
    echo "  后端已在后台启动 (PID: $BACKEND_PID)"
    echo "  日志文件: backend.log"
fi

# 等待后端启动
echo "  等待后端服务器启动（约15秒）..."
sleep 15

# 测试后端是否启动成功
echo "  测试后端连接..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/todos | grep -q "200"; then
    echo "  ✓ 后端服务器启动成功！"
else
    echo "  [警告] 后端可能还在启动中..."
fi

echo ""
echo "[6/7] 启动 Agent 服务..."
echo ""

# 检查 Agent 目录是否存在
if [ ! -d "$SCRIPT_DIR/agent" ]; then
    echo "  [警告] Agent 目录不存在，跳过 Agent 服务启动"
else
    cd "$SCRIPT_DIR/agent"
    
    # 检查并创建虚拟环境
    if [ ! -d "venv" ]; then
        echo "  创建 Agent 虚拟环境..."
        python3 -m venv venv
    fi
    
    # 检查 Agent 服务配置
    if [ ! -f ".env" ]; then
        echo "  [提示] Agent .env 文件不存在，将尝试创建"
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo "  [提示] 已创建 .env 文件，请编辑并配置 API 密钥"
        fi
    fi
    
    # 激活虚拟环境并检查依赖
    source venv/bin/activate
    
    # 检查依赖是否已安装
    if ! python -c "import flask, flask_cors" 2>/dev/null; then
        echo "  安装 Agent 依赖..."
        pip install -r requirements.txt -q
    fi
    
    # 在新终端中启动 Agent 服务（如果支持）
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd '$SCRIPT_DIR/agent' && source venv/bin/activate && python start.py 2>/dev/null || python app.py; exec bash" &
    elif command -v xterm &> /dev/null; then
        xterm -e "cd '$SCRIPT_DIR/agent' && source venv/bin/activate && python start.py 2>/dev/null || python app.py" &
    elif command -v osascript &> /dev/null; then
        # macOS
        osascript -e "tell app \"Terminal\" to do script \"cd '$SCRIPT_DIR/agent' && source venv/bin/activate && python start.py 2>/dev/null || python app.py\"" &
    else
        # 如果都不支持，在后台运行
        nohup python start.py > ../agent.log 2>&1 || nohup python app.py > ../agent.log 2>&1 &
        AGENT_PID=$!
        echo "  Agent 服务已在后台启动 (PID: $AGENT_PID)"
        echo "  日志文件: agent.log"
    fi
    
    # 等待 Agent 服务启动
    echo "  等待 Agent 服务启动（约3秒）..."
    sleep 3
fi

echo ""
echo "[7/7] 启动前端服务器..."
echo ""

# 在新终端中启动前端
if command -v gnome-terminal &> /dev/null; then
    gnome-terminal -- bash -c "cd '$SCRIPT_DIR/frontend' && echo '[前端] 正在启动...' && npm run dev; exec bash" &
elif command -v xterm &> /dev/null; then
    xterm -e "cd '$SCRIPT_DIR/frontend' && echo '[前端] 正在启动...' && npm run dev" &
elif command -v osascript &> /dev/null; then
    # macOS
    osascript -e "tell app \"Terminal\" to do script \"cd '$SCRIPT_DIR/frontend' && echo '[前端] 正在启动...' && npm run dev\"" &
else
    # 如果都不支持，在后台运行
    cd "$SCRIPT_DIR/frontend"
    nohup npm run dev > ../frontend.log 2>&1 &
    FRONTEND_PID=$!
    echo "  前端已在后台启动 (PID: $FRONTEND_PID)"
    echo "  日志文件: frontend.log"
fi

# 等待前端服务器启动
echo "  等待前端服务器启动（约5秒）..."
sleep 5

# 自动打开浏览器
echo "  正在打开浏览器..."
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000 &
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000 &
else
    echo "  [提示] 请手动打开浏览器访问 http://localhost:3000"
fi

echo ""
echo "========================================"
echo "  启动完成！"
echo "========================================"
echo ""
echo "后端服务器: http://localhost:3001"
echo "Agent 服务: http://localhost:5000"
echo "前端应用:   http://localhost:3000"
echo ""
echo "提示："
echo "- 浏览器已自动打开前端页面"
echo "- 后端、Agent 和前端已在独立窗口中启动"
echo "- 关闭窗口即可停止对应的服务"
echo "- 如需停止所有服务，请关闭所有相关窗口"
echo "- 如果 Agent 服务启动失败，请检查 agent/.env 配置"
echo ""

