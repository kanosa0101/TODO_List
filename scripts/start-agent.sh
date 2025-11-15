#!/bin/bash

echo "========================================"
echo "启动 AI Agent 服务"
echo "========================================"
echo

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR/agent"

if [ ! -d "venv" ]; then
    echo "创建虚拟环境..."
    python3 -m venv venv
fi

echo "激活虚拟环境..."
source venv/bin/activate

echo "安装依赖..."
pip install -r requirements.txt -q

if [ ! -f ".env" ]; then
    echo
    echo "⚠️  警告: .env 文件不存在！"
    echo "请复制 .env.example 为 .env 并配置您的 API 密钥"
    echo
    read -p "按 Enter 继续..."
fi

echo
echo "启动 Agent 服务..."
echo "服务地址: http://localhost:5000"
echo

python app.py

