# 全栈待办事项应用

一个现代化、功能丰富的全栈项目，采用前后端分离架构，集成 AI Agent 服务。使用 React + Vite 作为前端，Java Spring Boot 作为后端，Python Flask 作为 AI Agent 服务。

## 📁 项目结构

```
.
├── backend/                    # Java Spring Boot 后端 (端口: 3001)
│   ├── src/main/java/         # 源代码
│   │   └── com/todo/
│   │       ├── controller/    # REST 控制器
│   │       ├── service/       # 业务逻辑层
│   │       ├── repository/    # 数据访问层
│   │       ├── model/         # 实体模型
│   │       ├── security/      # 安全配置
│   │       └── config/        # 配置类
│   ├── src/main/resources/    # 配置文件
│   │   ├── application.properties          # 实际配置文件
│   │   └── application.properties.example  # 配置示例文件
│   └── pom.xml                # Maven 依赖
├── frontend/                  # React + Vite 前端 (端口: 5173)
│   ├── src/
│   │   ├── components/        # React 组件
│   │   ├── services/          # API 服务
│   │   ├── styles/            # 样式文件
│   │   └── utils/             # 工具函数
│   └── package.json          # 依赖配置
├── agent/                     # AI Agent 服务 (端口: 5000)
│   ├── app.py                # Flask 主应用
│   ├── llm_client.py         # LLM 客户端
│   ├── mcp_tools.py          # MCP 工具集成
│   ├── requirements.txt      # Python 依赖
│   ├── .env.example          # 环境变量示例
│   └── README.md             # Agent 服务文档
├── scripts/                   # 启动脚本
│   ├── start-all.bat/sh      # 一键启动所有服务
│   ├── start-backend.bat/sh  # 启动后端
│   ├── start-frontend.bat/sh # 启动前端
│   └── start-agent.bat/sh    # 启动 Agent 服务
└── README.md                  # 项目文档
```

## 🚀 快速开始

### 前置要求

- Java 17+
- Maven 3.6+
- Node.js 16+ 和 npm
- MySQL 8.0+
- Python 3.8+ (可选，用于 Agent 服务)

### 配置环境

1. **配置后端数据库**
   ```bash
   # 复制配置示例文件
   cp backend/src/main/resources/application.properties.example \
      backend/src/main/resources/application.properties
   
   # 编辑配置文件，修改数据库密码和JWT密钥
   # Windows: 使用记事本或编辑器打开 application.properties
   ```

2. **创建数据库**
   ```sql
   CREATE DATABASE tododb CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

### 一键启动（推荐）

**Windows:**
```bash
# 右键点击 scripts/start-all.bat，选择"以管理员身份运行"
```

**Linux/Mac:**
```bash
chmod +x scripts/start-all.sh
sudo ./scripts/start-all.sh
```

脚本会自动：
- ✅ 检查必要工具（Java、Maven、Node.js、Python）
- ✅ 启动 MySQL 服务
- ✅ 安装前端和 Agent 依赖
- ✅ 启动后端、前端和 Agent 服务器
- ✅ 自动打开浏览器

**服务端口：**
- 前端：http://localhost:5173
- 后端：http://localhost:3001
- Agent：http://localhost:5000

### 手动启动

**启动后端:**
```bash
cd backend
mvn spring-boot:run
# 或使用脚本: scripts/start-backend.bat
```

**启动前端:**
```bash
cd frontend
npm install
npm run dev
# 或使用脚本: scripts/start-frontend.bat
```

## 📚 API 文档

启动后端后访问：
- **Knife4j UI（推荐）**: http://localhost:3001/doc.html
- **Swagger UI**: http://localhost:3001/swagger-ui.html

使用步骤：
1. 通过 `/api/auth/login` 获取 JWT Token
2. 在文档页面点击"Authorize"，输入 Token
3. 测试接口

## ✨ 功能特性

### 待办事项
- ✅ 增删改查操作
- 🎯 优先级管理（高/中/低）
- 🔍 筛选功能（全部/进行中/已完成）
- 📊 统计信息
- 🔄 每日任务支持
- ⏱️ 任务时长和进度跟踪

### 笔记功能
- 📝 Markdown 编辑和预览
- ✏️ Monaco 编辑器（VS Code 同款）
- 💾 文件导入/导出
- 🔐 用户数据隔离

### 用户认证
- 🔐 JWT Token 认证
- 👤 用户注册/登录
- 🔒 路由保护

## 🛠️ 技术栈

**后端:**
- Spring Boot 3.2.0
- Spring Data JPA
- MySQL
- Spring Security + JWT
- Swagger/Knife4j

**前端:**
- React 18
- Vite
- React Router
- Monaco Editor

**AI Agent:**
- Python 3.8+
- Flask + Flask-CORS
- OpenAI API
- MCP Tools (待办事项和笔记工具集成)

## 📡 主要 API

### 认证（无需Token）
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 待办事项（需要Token）
- `GET /api/todos` - 获取列表
- `POST /api/todos` - 创建
- `PUT /api/todos/{id}` - 更新
- `DELETE /api/todos/{id}` - 删除

### 笔记（需要Token）
- `GET /api/notes` - 获取列表
- `POST /api/notes` - 创建
- `PUT /api/notes/{id}` - 更新
- `DELETE /api/notes/{id}` - 删除

### AI Agent
- `GET /health` - 健康检查
- `POST /api/chat` - 聊天（非流式）
- `POST /api/chat/stream` - 聊天（流式，SSE）

## 🤖 AI Agent 服务

### 功能特性

- 🤖 OpenAI 兼容的 LLM 对话
- 💬 支持流式和非流式响应
- 🛠️ MCP 工具集成（可调用待办事项和笔记API）
- 🔄 实时对话体验

### 快速配置

1. **安装依赖**
   ```bash
   # 使用脚本（推荐）
   scripts\install-agent-deps.bat
   
   # 或手动安装
   cd agent
   python -m venv venv
   venv\Scripts\activate  # Linux/Mac: source venv/bin/activate
   pip install -r requirements.txt
   ```

2. **配置环境变量**
   ```bash
   cd agent
   cp .env.example .env
   # 编辑 .env 文件，填入您的 LLM API 配置
   ```

3. **启动服务**
   ```bash
   # 使用脚本
   scripts\start-agent.bat
   
   # 或手动启动
   cd agent
   venv\Scripts\activate
   python start.py
   ```

### Agent API 示例

**非流式聊天：**
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好"}],
    "temperature": 0.7
  }'
```

**流式聊天：**
```bash
curl -X POST http://localhost:5000/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "你好"}],
    "temperature": 0.7
  }'
```

更多详情请查看 [agent/README.md](agent/README.md)

## 🔧 常见问题

### 后端启动失败

**MySQL 连接失败:**
- 检查 MySQL 服务是否运行
- 确认数据库已创建
- 检查 `application.properties` 中的数据库配置

**端口被占用:**
```bash
# Windows
netstat -ano | findstr ":3001"

# Linux/Mac
lsof -i :3001
```

### 前端启动失败

**依赖安装失败:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**无法连接后端:**
- 确认后端已启动（http://localhost:3001）
- 检查浏览器控制台错误信息

## 📝 配置说明

### 后端配置

编辑 `backend/src/main/resources/application.properties`:

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/tododb?...
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD

# JWT配置
jwt.secret=YOUR_SECRET_KEY
jwt.expiration=86400000
```

### 前端配置

编辑 `frontend/.env`（如需要）:

```env
VITE_API_BASE_URL=http://localhost:3001
```

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License
