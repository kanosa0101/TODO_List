#!/bin/bash

echo "========================================"
echo "启动 MySQL 服务..."
echo "========================================"

# 检查是否有 sudo 权限
if [ "$EUID" -ne 0 ]; then 
    echo "需要管理员权限来启动 MySQL 服务"
    echo "请使用: sudo ./start-backend.sh"
    exit 1
fi

# 尝试启动 MySQL 服务
if systemctl is-active --quiet mysql || systemctl is-active --quiet mysqld; then
    echo "MySQL 服务已在运行中"
else
    echo "正在启动 MySQL 服务..."
    systemctl start mysql 2>/dev/null || systemctl start mysqld
    if [ $? -eq 0 ]; then
        echo "MySQL 服务启动成功！"
    else
        echo "警告：MySQL 服务启动失败，请手动检查"
    fi
fi

echo ""
echo "========================================"
echo "启动后端服务器..."
echo "========================================"
cd backend
mvn spring-boot:run

