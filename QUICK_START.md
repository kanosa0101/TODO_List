# 快速开始指南

## 🚀 一键启动（推荐）

### Windows
1. 右键点击 `start-all.bat`
2. 选择"以管理员身份运行"
3. 等待自动启动完成

### Linux/Mac
```bash
chmod +x start-all.sh
sudo ./start-all.sh
```

## 📋 前置要求

- Java 17+
- Maven 3.6+
- Node.js 16+
- MySQL 8.0+

## ⚙️ 配置数据库

编辑 `backend/src/main/resources/application.properties`：
```properties
spring.datasource.password=你的MySQL密码
```

## 🎯 功能说明

### 任务管理
- **添加任务**：点击"添加新任务"按钮，在弹窗中填写信息
- **每日任务**：勾选"每日任务"后，任务每天自动重置为未完成
- **任务时长**：可设置预计时长（分钟/小时/天）
- **任务进度**：可设置总步骤数并跟踪完成进度

### 任务分类
- **每日任务**：每天自动刷新的任务，完成不计入统计
- **其他任务**：普通任务，完成计入统计

### 筛选与统计
- 默认显示"进行中"的任务
- 统计信息排除每日任务
- 已完成任务显示更透明

## 🔧 常见问题

### 403 错误
- 检查 Token 是否过期，重新登录
- 确认后端服务正常运行

### 数据库连接失败
- 确认 MySQL 服务已启动
- 检查 `application.properties` 中的密码配置
- 确认数据库 `tododb` 已创建

### 端口被占用
- 后端：修改 `application.properties` 中的 `server.port`
- 前端：Vite 会自动使用下一个可用端口

## 📚 更多文档

- [README.md](./README.md) - 完整项目文档
- [ARCHITECTURE.md](./ARCHITECTURE.md) - 架构设计
- [AUTHENTICATION.md](./AUTHENTICATION.md) - 认证系统

