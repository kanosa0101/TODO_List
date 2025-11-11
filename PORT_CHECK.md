# 端口占用检查指南

## 📋 项目使用的端口

| 端口 | 服务 | 配置文件 | 说明 |
|------|------|----------|------|
| 3000 | 前端开发服务器 | `frontend/vite.config.js` | React + Vite 开发服务器 |
| 3001 | 后端服务器 | `backend/src/main/resources/application.properties` | Spring Boot API 服务器 |
| 3306 | MySQL 数据库 | MySQL 配置 | 数据库服务（必须运行） |

## 🔍 快速检查

### Windows

运行端口检查脚本：
```bash
check-ports.bat
```

手动检查：
```bash
# 检查前端端口
netstat -ano | findstr ":3000"

# 检查后端端口
netstat -ano | findstr ":3001"

# 检查MySQL端口
netstat -ano | findstr ":3306"
```

### Linux/Mac

运行端口检查脚本：
```bash
chmod +x check-ports.sh
./check-ports.sh
```

手动检查：
```bash
# 检查前端端口
lsof -i :3000

# 检查后端端口
lsof -i :3001

# 检查MySQL端口
lsof -i :3306
```

## 🛠️ 解决方案

### 端口被占用

#### 方法1：终止占用进程（推荐）

**Windows:**
```bash
# 使用脚本（交互式）
kill-port.bat 3000
kill-port.bat 3001

# 手动终止
# 1. 查找进程ID
netstat -ano | findstr ":3000"
# 2. 终止进程（替换PID为实际进程ID）
taskkill /PID <PID> /F
```

**Linux/Mac:**
```bash
# 使用脚本（交互式）
chmod +x kill-port.sh
./kill-port.sh 3000
./kill-port.sh 3001

# 手动终止
# 1. 查找进程ID
lsof -t -i:3000
# 2. 终止进程
kill -9 $(lsof -t -i:3000)
```

#### 方法2：修改端口配置

**修改前端端口：**

编辑 `frontend/vite.config.js`:
```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,  // 改为其他可用端口
    // ...
  },
})
```

**修改后端端口：**

编辑 `backend/src/main/resources/application.properties`:
```properties
server.port=3002  # 改为其他可用端口
```

**注意：** 如果修改了后端端口，记得同时更新前端的代理配置：
```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3002',  // 与后端端口一致
    changeOrigin: true,
  },
}
```

## ✅ 端口状态说明

### 正常状态

- ✅ **端口 3000** - 前端开发服务器运行时占用（正常）
- ✅ **端口 3001** - 后端服务器运行时占用（正常）
- ✅ **端口 3306** - MySQL 服务运行时占用（必须运行）

### 异常状态

- ❌ **端口 3000 被其他程序占用** - 需要终止占用进程或修改端口
- ❌ **端口 3001 被其他程序占用** - 需要终止占用进程或修改端口
- ❌ **端口 3306 未被占用** - MySQL 服务未运行，需要启动 MySQL

## 🔧 常见问题

### Q: 如何查看占用端口的进程详情？

**Windows:**
```bash
# 查找进程ID
netstat -ano | findstr ":3000"
# 查看进程详情（替换PID）
tasklist | findstr "<PID>"
```

**Linux/Mac:**
```bash
# 查看进程详情
lsof -i :3000
```

### Q: 如何批量检查所有端口？

**Windows:**
```bash
netstat -ano | findstr "LISTENING" | findstr ":300"
```

**Linux/Mac:**
```bash
lsof -i -P -n | grep LISTEN | grep -E ":(3000|3001|3306)"
```

### Q: 端口被占用但找不到进程？

可能的原因：
1. 进程已结束，但端口仍在 TIME_WAIT 状态（等待一段时间会自动释放）
2. 需要管理员权限才能查看某些系统进程
3. 防火墙或安全软件阻止了端口释放

解决方案：
- 等待 1-2 分钟让端口自动释放
- 以管理员身份运行检查命令
- 重启计算机（最后手段）

## 📝 端口检查脚本说明

### check-ports.bat / check-ports.sh

自动检查项目使用的所有端口状态，显示：
- 端口是否被占用
- 占用进程的详细信息
- 解决方案建议

### kill-port.bat / kill-port.sh

交互式终止占用指定端口的进程：
- 自动查找占用端口的进程
- 显示进程信息
- 确认后终止进程

## 🚀 启动前检查清单

在启动项目前，建议执行以下检查：

1. ✅ 运行 `check-ports.bat` (Windows) 或 `./check-ports.sh` (Linux/Mac)
2. ✅ 确认 MySQL 服务正在运行（端口 3306 被占用）
3. ✅ 确认前端端口 3000 可用（如果被占用，终止进程或修改端口）
4. ✅ 确认后端端口 3001 可用（如果被占用，终止进程或修改端口）

## 📚 相关文档

- [README.md](./README.md) - 项目主文档
- [故障排除](./README.md#故障排除) - 更多故障排除指南

