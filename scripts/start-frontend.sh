#!/bin/bash
echo "Starting Frontend Server..."
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$SCRIPT_DIR/frontend"

# 在后台启动前端服务器
npm run dev &
FRONTEND_PID=$!

# 等待服务器启动
echo "Waiting for server to start (about 5 seconds)..."
sleep 5

# 自动打开浏览器
echo "Opening browser..."
if command -v xdg-open &> /dev/null; then
    # Linux
    xdg-open http://localhost:3000
elif command -v open &> /dev/null; then
    # macOS
    open http://localhost:3000
else
    echo "[提示] 请手动打开浏览器访问 http://localhost:3000"
fi

# 等待用户中断
echo ""
echo "Frontend server is running at http://localhost:3000"
echo "Press Ctrl+C to stop the server"
echo ""

# 等待前端进程
wait $FRONTEND_PID

