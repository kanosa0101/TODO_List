# AI Agent 服务

基于 Flask 的 LLM 客户端服务，支持 OpenAI 兼容的 API。

## 功能特性

- 🤖 支持 OpenAI 兼容的 API
- 💬 流式和非流式响应
- 🔄 实时对话体验
- ⚙️ 环境变量配置
- 🛠️ MCP 工具集成（待办事项和笔记管理）

## 安装依赖

### Windows

使用提供的脚本（推荐）：
```bash
# 从项目根目录运行
scripts\install-agent-deps.bat
```

或手动安装：
```bash
cd agent
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

### Linux/Mac

```bash
cd agent
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

**依赖列表：**
- flask
- flask-cors
- openai
- python-dotenv
- requests

## 配置

1. 复制环境变量示例文件：
```bash
cp .env.example .env
```

2. 编辑 `.env` 文件，填入您的 API 配置：
```env
LLM_MODEL_ID=your-model-id
LLM_API_KEY=your-api-key
LLM_BASE_URL=https://api.openai.com/v1
LLM_TIMEOUT=60
AGENT_PORT=5000
```

## 启动服务

### Windows

使用提供的脚本（推荐）：
```bash
# 从项目根目录运行
scripts\start-agent.bat
```

或手动启动：
```bash
cd agent
venv\Scripts\activate
python start.py
# 或
python app.py
```

### Linux/Mac

```bash
cd agent
source venv/bin/activate
python start.py
# 或
python app.py
```

服务将在 `http://localhost:5000` 启动（或 `.env` 中配置的端口）。

**注意：** 如果使用 `start.py`，它会进行更详细的启动检查和错误提示。

## API 接口

### 健康检查
```
GET /health
```

### 聊天（非流式）
```
POST /api/chat
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "temperature": 0.7
}
```

### 聊天（流式）
```
POST /api/chat/stream
Content-Type: application/json

{
  "messages": [
    {"role": "user", "content": "你好"}
  ],
  "temperature": 0.7
}
```

响应格式为 Server-Sent Events (SSE)。

## 使用示例

```python
from llm_client import HelloAgentsLLM

# 初始化客户端
llm = HelloAgentsLLM()

# 发送消息
messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "写一个快速排序算法"}
]

response = llm.think(messages)
print(response)
```

