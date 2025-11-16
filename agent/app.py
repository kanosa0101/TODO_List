from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from dotenv import load_dotenv
import json
import os
import logging
from datetime import datetime

# 获取当前文件所在目录（agent目录）
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, '.env')

# 先加载 .env 文件（指定绝对路径）
load_dotenv(ENV_FILE)

from llm_client import HelloAgentsLLM
from mcp_tools import get_mcp_tools, execute_tool

app = Flask(__name__)
# 配置 CORS，允许前端跨域请求
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://127.0.0.1:3000"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)
logger = logging.getLogger(__name__)

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
    """聊天接口 - 流式响应，支持 MCP 工具调用"""
    request_id = datetime.now().strftime('%Y%m%d%H%M%S%f')[:-3]
    logger.info(f"[{request_id}] ========== 收到新的聊天请求 ==========")
    logger.info(f"[{request_id}] 请求来源: {request.remote_addr}")
    
    if not llm_client:
        logger.error(f"[{request_id}] LLM客户端未初始化")
        return jsonify({'error': 'LLM客户端未初始化'}), 500
    
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        temperature = data.get('temperature', 0)
        user_token = request.headers.get('Authorization', '').replace('Bearer ', '')
        
        logger.info(f"[{request_id}] 请求参数:")
        logger.info(f"[{request_id}]   - 消息数量: {len(messages)}")
        logger.info(f"[{request_id}]   - 温度: {temperature}")
        logger.info(f"[{request_id}]   - 用户Token: {'已提供' if user_token else '未提供'}")
        if messages:
            last_message = messages[-1]
            logger.info(f"[{request_id}]   - 最后一条消息: {last_message.get('role', 'unknown')} - {last_message.get('content', '')[:100]}")
        
        if not messages:
            logger.warning(f"[{request_id}] 消息为空，返回错误")
            return jsonify({'error': '消息不能为空'}), 400
        
        # 获取 MCP 工具定义
        tools = get_mcp_tools()
        logger.info(f"[{request_id}] 已加载 {len(tools)} 个 MCP 工具")
        
        def generate():
            try:
                current_messages = messages.copy()
                
                # 如果有 token，添加系统提示，告知 LLM 可以使用工具
                if user_token:
                    system_message = {
                        "role": "system",
                        "content": """你是一个智能助手，可以帮助用户管理待办事项和笔记。
你可以使用以下功能：
1. 查看、创建、更新、删除待办事项
2. 查看、创建、更新、删除笔记

当用户请求查看或操作待办事项和笔记时，你应该主动使用相应的工具。
操作完成后，用自然语言向用户说明操作结果。"""
                    }
                    # 检查是否已有系统消息
                    has_system = any(msg.get("role") == "system" for msg in current_messages)
                    if not has_system:
                        current_messages.insert(0, system_message)
                
                max_iterations = 10  # 防止无限循环
                iteration = 0
                
                while iteration < max_iterations:
                    iteration += 1
                    logger.info(f"[{request_id}] ---------- 迭代 {iteration}/{max_iterations} ----------")
                    logger.info(f"[{request_id}] 当前消息历史长度: {len(current_messages)}")
                    
                    # 调用 LLM，传入工具定义
                    try:
                        logger.info(f"[{request_id}] 正在调用 LLM (模型: {llm_client.model})...")
                        start_time = datetime.now()
                        response = llm_client.client.chat.completions.create(
                            model=llm_client.model,
                            messages=current_messages,
                            temperature=temperature,
                            tools=tools if user_token else None,  # 只有在有 token 时才提供工具
                            tool_choice="auto" if user_token else None
                        )
                        elapsed = (datetime.now() - start_time).total_seconds()
                        logger.info(f"[{request_id}] LLM 调用完成，耗时: {elapsed:.2f}秒")
                    except Exception as e:
                        logger.error(f"[{request_id}] LLM调用失败: {str(e)}")
                        yield f"data: {json.dumps({'error': f'LLM调用失败: {str(e)}'})}\n\n"
                        break
                    
                    message = response.choices[0].message
                    logger.info(f"[{request_id}] LLM 响应:")
                    logger.info(f"[{request_id}]   - 有工具调用: {bool(message.tool_calls)}")
                    logger.info(f"[{request_id}]   - 有内容: {bool(message.content)}")
                    if message.content:
                        logger.info(f"[{request_id}]   - 内容预览: {message.content[:200]}")
                    
                    # 检查是否有工具调用
                    if message.tool_calls and user_token:
                        logger.info(f"[{request_id}] 检测到 {len(message.tool_calls)} 个工具调用")
                        # 添加 assistant 的响应到消息历史（包含工具调用）
                        assistant_message = {
                            "role": "assistant",
                            "content": message.content or None,
                            "tool_calls": [
                                {
                                    "id": tc.id,
                                    "type": tc.type,
                                    "function": {
                                        "name": tc.function.name,
                                        "arguments": tc.function.arguments
                                    }
                                }
                                for tc in message.tool_calls
                            ]
                        }
                        current_messages.append(assistant_message)
                        
                        # 执行所有工具调用
                        for idx, tool_call in enumerate(message.tool_calls, 1):
                            tool_name = tool_call.function.name
                            try:
                                arguments = json.loads(tool_call.function.arguments)
                            except:
                                arguments = {}
                            
                            logger.info(f"[{request_id}] 工具调用 {idx}/{len(message.tool_calls)}: {tool_name}")
                            logger.info(f"[{request_id}]   参数: {json.dumps(arguments, ensure_ascii=False, indent=2)}")
                            
                            # 执行工具
                            tool_start_time = datetime.now()
                            tool_result = execute_tool(user_token, tool_name, arguments)
                            tool_elapsed = (datetime.now() - tool_start_time).total_seconds()
                            
                            logger.info(f"[{request_id}] 工具执行完成，耗时: {tool_elapsed:.2f}秒")
                            logger.info(f"[{request_id}]   结果: success={tool_result.get('success', False)}")
                            if not tool_result.get('success', False):
                                logger.warning(f"[{request_id}]   错误: {tool_result.get('error', '未知错误')}")
                            
                            # 添加工具调用结果到消息历史
                            current_messages.append({
                                "role": "tool",
                                "tool_call_id": tool_call.id,
                                "name": tool_name,
                                "content": json.dumps(tool_result, ensure_ascii=False)
                            })
                        
                        # 继续循环，让 LLM 基于工具结果生成回复
                        # 注意：工具调用后，下一次 LLM 调用应该返回最终回复
                        continue
                    
                    # 没有工具调用，流式返回最终响应
                    # 如果 message.content 有内容，直接返回
                    if message.content and message.content.strip():
                        logger.info(f"[{request_id}] 返回最终响应，内容长度: {len(message.content)} 字符")
                        current_messages.append({
                            "role": "assistant",
                            "content": message.content
                        })
                        # 流式返回内容（按块发送以保持流式体验）
                        chunk_size = 10  # 每次发送10个字符
                        total_chunks = (len(message.content) + chunk_size - 1) // chunk_size
                        logger.info(f"[{request_id}] 开始流式发送响应，共 {total_chunks} 个块")
                        for i in range(0, len(message.content), chunk_size):
                            chunk = message.content[i:i+chunk_size]
                            yield f"data: {json.dumps({'content': chunk})}\n\n"
                        yield f"data: {json.dumps({'done': True})}\n\n"
                        logger.info(f"[{request_id}] ========== 请求完成 ==========")
                        break
                    else:
                        # 如果没有内容，可能是工具调用后的情况，需要再次调用 LLM 生成最终回复
                        # 添加空的 assistant 消息（如果还没有的话）
                        last_assistant = None
                        for msg in reversed(current_messages[-5:]):
                            if msg.get("role") == "assistant" and not msg.get("tool_calls"):
                                last_assistant = msg
                                break
                        
                        if not last_assistant:
                            current_messages.append({
                                "role": "assistant",
                                "content": ""
                            })
                        
                        # 流式生成最终回复（不传入 tools，确保生成文本回复）
                        logger.info(f"[{request_id}] 使用流式调用生成最终回复...")
                        has_content = False
                        chunk_count = 0
                        try:
                            stream_start_time = datetime.now()
                            for chunk in llm_client.think_stream(current_messages, temperature):
                                if chunk is None:
                                    logger.error(f"[{request_id}] 流式生成返回 None")
                                    yield f"data: {json.dumps({'error': 'LLM调用失败'})}\n\n"
                                    break
                                has_content = True
                                chunk_count += 1
                                yield f"data: {json.dumps({'content': chunk})}\n\n"
                            stream_elapsed = (datetime.now() - stream_start_time).total_seconds()
                            logger.info(f"[{request_id}] 流式生成完成，共 {chunk_count} 个块，耗时: {stream_elapsed:.2f}秒")
                        except Exception as e:
                            logger.error(f"[{request_id}] 流式生成失败: {str(e)}")
                            yield f"data: {json.dumps({'error': f'流式生成失败: {str(e)}'})}\n\n"
                        
                        if has_content:
                            yield f"data: {json.dumps({'done': True})}\n\n"
                            logger.info(f"[{request_id}] ========== 请求完成 ==========")
                        else:
                            # 如果仍然没有内容，发送错误信息
                            logger.warning(f"[{request_id}] LLM未返回任何内容")
                            yield f"data: {json.dumps({'error': 'LLM未返回任何内容'})}\n\n"
                        break
                
            except Exception as e:
                logger.error(f"[{request_id}] 生成响应时发生异常: {str(e)}")
                import traceback
                logger.error(f"[{request_id}] 异常堆栈:\n{traceback.format_exc()}")
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

