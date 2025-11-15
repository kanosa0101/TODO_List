from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
import json
import os

# 获取当前文件所在目录（agent目录）
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, '.env')

# 先加载 .env 文件（指定绝对路径）
load_dotenv(ENV_FILE)

from llm_client import HelloAgentsLLM

app = Flask(__name__)
# 配置 CORS，允许前端跨域请求
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 初始化 LLM 客户端
llm_client = None
try:
    print("=" * 50)
    print("正在初始化 LLM 客户端...")
    # 显示当前环境变量（不显示敏感信息）
    model_id = os.getenv("LLM_MODEL_ID", "").strip().strip('"').strip("'")
    base_url = os.getenv("LLM_BASE_URL", "").strip().strip('"').strip("'")
    api_key = os.getenv("LLM_API_KEY", "")
    if api_key:
        api_key_display = api_key[:10] + "..." if len(api_key) > 10 else "***"
    else:
        api_key_display = "未设置"
    
    print(f"   读取配置:")
    print(f"   - LLM_MODEL_ID: {model_id if model_id else '(未设置)'}")
    print(f"   - LLM_BASE_URL: {base_url if base_url else '(未设置)'}")
    print(f"   - LLM_API_KEY: {api_key_display}")
    print()
    
    llm_client = HelloAgentsLLM()
    print("✅ LLM 客户端初始化成功")
    print(f"   模型: {llm_client.model}")
    print("=" * 50)
except Exception as e:
    print("=" * 50)
    print(f"❌ LLM 客户端初始化失败: {e}")
    print()
    print("请检查 .env 文件中的配置:")
    print("  - LLM_MODEL_ID (模型ID)")
    print("  - LLM_API_KEY (API密钥)")
    print("  - LLM_BASE_URL (服务地址)")
    print()
    print("提示: .env 文件中的值不需要加引号，例如:")
    print("  LLM_MODEL_ID=your-model-id")
    print("  LLM_API_KEY=your-api-key")
    print("  LLM_BASE_URL=https://api.example.com/v1")
    print("=" * 50)
    llm_client = None

@app.route('/health', methods=['GET'])
def health():
    """健康检查接口"""
    return jsonify({
        'status': 'ok',
        'llm_ready': llm_client is not None
    })

@app.route('/api/chat', methods=['POST'])
def chat():
    """聊天接口 - 非流式响应"""
    if not llm_client:
        return jsonify({'error': 'LLM客户端未初始化'}), 500
    
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        temperature = data.get('temperature', 0)
        
        if not messages:
            return jsonify({'error': '消息不能为空'}), 400
        
        response_text = llm_client.think(messages, temperature)
        
        if response_text is None:
            return jsonify({'error': 'LLM调用失败'}), 500
        
        return jsonify({
            'response': response_text,
            'model': llm_client.model
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/chat/stream', methods=['POST'])
def chat_stream():
    """聊天接口 - 流式响应"""
    if not llm_client:
        return jsonify({'error': 'LLM客户端未初始化'}), 500
    
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        temperature = data.get('temperature', 0)
        
        if not messages:
            return jsonify({'error': '消息不能为空'}), 400
        
        def generate():
            try:
                for chunk in llm_client.think_stream(messages, temperature):
                    if chunk is None:
                        yield f"data: {json.dumps({'error': 'LLM调用失败'})}\n\n"
                        break
                    yield f"data: {json.dumps({'content': chunk})}\n\n"
                yield f"data: {json.dumps({'done': True})}\n\n"
            except Exception as e:
                yield f"data: {json.dumps({'error': str(e)})}\n\n"
        
        return Response(
            stream_with_context(generate()),
            mimetype='text/event-stream',
            headers={
                'Cache-Control': 'no-cache',
                'X-Accel-Buffering': 'no'
            }
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# 如果直接运行 app.py，使用简单的启动方式
if __name__ == '__main__':
    # .env 文件已经在文件顶部加载过了
    port = int(os.getenv('AGENT_PORT', 5000))
    print("=" * 60)
    print("🚀 启动 Agent 服务...")
    print(f"   地址: http://0.0.0.0:{port}")
    print(f"   本地: http://localhost:{port}")
    print(f"   LLM 就绪: {'是' if llm_client else '否'}")
    if not llm_client:
        print("   ⚠️  警告: LLM 客户端未初始化，服务可能无法正常工作")
    print("=" * 60)
    print()
    try:
        app.run(host='0.0.0.0', port=port, debug=True)
    except OSError as e:
        if "Address already in use" in str(e) or "address already in use" in str(e).lower():
            print(f"❌ 端口 {port} 已被占用")
            print("   请检查是否有其他程序在使用该端口")
        else:
            print(f"❌ 服务启动失败: {e}")
        input("\n按 Enter 键退出...")
    except Exception as e:
        print(f"❌ 服务启动失败: {e}")
        import traceback
        traceback.print_exc()
        input("\n按 Enter 键退出...")

