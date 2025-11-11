#!/bin/bash

if [ -z "$1" ]; then
    echo "用法: ./kill-port.sh [端口号]"
    echo "示例: ./kill-port.sh 3000"
    exit 1
fi

PORT=$1
echo "正在查找占用端口 $PORT 的进程..."

PID=$(lsof -t -i:$PORT)

if [ -z "$PID" ]; then
    echo "未找到占用端口 $PORT 的进程"
    exit 0
fi

echo ""
echo "找到进程 PID: $PID"
ps -p $PID
echo ""

read -p "是否要终止此进程? (y/n): " CONFIRM

if [ "$CONFIRM" = "y" ] || [ "$CONFIRM" = "Y" ]; then
    echo "正在终止进程 $PID..."
    kill -9 $PID
    if [ $? -eq 0 ]; then
        echo "✅ 进程已终止"
    else
        echo "❌ 终止进程失败，可能需要管理员权限"
        echo "尝试使用: sudo kill -9 $PID"
    fi
else
    echo "已取消操作"
fi

