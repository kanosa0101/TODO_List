#!/bin/bash

echo "========================================"
echo "端口占用检查工具"
echo "========================================"
echo ""

# 检查端口 3000 - 前端开发服务器
echo "[检查端口 3000 - 前端开发服务器]"
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3000 已被占用"
    echo ""
    echo "占用进程信息："
    lsof -Pi :3000 -sTCP:LISTEN
    echo ""
    echo "解决方案："
    echo "1. 停止占用端口的进程: kill -9 \$(lsof -t -i:3000)"
    echo "2. 或修改 vite.config.js 中的端口号"
    echo ""
else
    echo "✅ 端口 3000 可用"
fi
echo ""

# 检查端口 3001 - 后端服务器
echo "[检查端口 3001 - 后端服务器]"
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  端口 3001 已被占用"
    echo ""
    echo "占用进程信息："
    lsof -Pi :3001 -sTCP:LISTEN
    echo ""
    echo "解决方案："
    echo "1. 停止占用端口的进程: kill -9 \$(lsof -t -i:3001)"
    echo "2. 或修改 application.properties 中的 server.port"
    echo ""
else
    echo "✅ 端口 3001 可用"
fi
echo ""

# 检查端口 3306 - MySQL数据库
echo "[检查端口 3306 - MySQL数据库]"
if lsof -Pi :3306 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "✅ 端口 3306 已被占用（MySQL服务正在运行）"
    echo ""
    echo "占用进程信息："
    lsof -Pi :3306 -sTCP:LISTEN
    echo ""
else
    echo "⚠️  端口 3306 未被占用（MySQL服务未运行）"
    echo ""
    echo "解决方案："
    echo "1. 启动 MySQL 服务: sudo systemctl start mysql"
    echo "2. 或检查 MySQL 配置"
    echo ""
fi
echo ""

echo "========================================"
echo "检查完成"
echo "========================================"

