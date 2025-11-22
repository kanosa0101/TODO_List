#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Agent 服务启动脚本
提供更友好的启动信息和错误处理
"""
import os
import sys

def check_env_file():
    """检查 .env 文件"""
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    if not os.path.exists(env_path):
        print("⚠️  警告: .env 文件不存在")
        example_path = os.path.join(os.path.dirname(__file__), '.env.example')
        if os.path.exists(example_path):
            print("   发现 .env.example 文件，请复制为 .env 并配置")
        return False
    return True

def check_dependencies():
    """检查必要的依赖"""
    missing_deps = []
    try:
        import flask
    except ImportError:
        missing_deps.append("flask")
    
    try:
        import flask_cors
    except ImportError:
        missing_deps.append("flask-cors")
    
    try:
        from openai import OpenAI
    except ImportError:
        missing_deps.append("openai")
    
    try:
        from dotenv import load_dotenv
    except ImportError:
        missing_deps.append("python-dotenv")
    
    try:
        import requests
    except ImportError:
        missing_deps.append("requests")
    
    if missing_deps:
        print(f"❌ 缺少以下依赖: {', '.join(missing_deps)}")
        print("   请运行: pip install -r requirements.txt")
        return False
    return True

def validate_env_config():
    """验证 .env 配置"""
    from dotenv import load_dotenv
    env_path = os.path.join(os.path.dirname(__file__), '.env')
    load_dotenv(env_path)
    
    # 获取配置值并去除引号
    def get_clean_value(key):
        value = os.getenv(key, '').strip()
        if value:
            value = value.strip('"').strip("'")
        return value
    
    model_id = get_clean_value('LLM_MODEL_ID')
    api_key = get_clean_value('LLM_API_KEY')
    base_url = get_clean_value('LLM_BASE_URL')
    
    missing = []
    if not model_id:
        missing.append('LLM_MODEL_ID')
    if not api_key:
        missing.append('LLM_API_KEY')
    if not base_url:
        missing.append('LLM_BASE_URL')
    
    if missing:
        print(f"   ⚠️  缺少必需配置: {', '.join(missing)}")
        print()
        print("   请编辑 .env 文件，填入以下配置：")
        for key in missing:
            if key == 'LLM_MODEL_ID':
                print(f"     {key}=your-model-id  (例如: gpt-4, claude-3-sonnet-20240229)")
            elif key == 'LLM_API_KEY':
                print(f"     {key}=your-api-key")
            elif key == 'LLM_BASE_URL':
                print(f"     {key}=https://api.openai.com/v1")
        print()
        print("   提示：配置值不需要加引号")
        return False
    
    # 显示当前配置（隐藏敏感信息）
    print(f"   ✓ 配置已加载")
    print(f"     - 模型: {model_id}")
    print(f"     - API地址: {base_url}")
    api_key_display = api_key[:10] + "..." if len(api_key) > 10 else "***"
    print(f"     - API密钥: {api_key_display}")
    return True

def main():
    print("=" * 60)
    print("AI Agent Service - 启动检查")
    print("=" * 60)
    print()
    
    # 检查当前目录
    current_dir = os.getcwd()
    print(f"📁 当前目录: {current_dir}")
    print()
    
    # 检查 .env 文件
    print("[1/4] 检查配置文件...")
    if not check_env_file():
        print("   请先配置 .env 文件")
        input("\n按 Enter 键退出...")
        return
    
    # 验证配置内容
    if not validate_env_config():
        input("\n按 Enter 键退出...")
        return
    print()
    
    # 检查依赖
    print("[2/4] 检查 Python 依赖...")
    if not check_dependencies():
        input("\n按 Enter 键退出...")
        return
    print("   ✓ 依赖已安装")
    print()
    
    # 启动服务
    print("[3/4] 准备启动服务...")
    print()
    print("=" * 60)
    
    try:
        # 确保在 agent 目录下
        agent_dir = os.path.dirname(os.path.abspath(__file__))
        os.chdir(agent_dir)
        
        # 加载环境变量
        from dotenv import load_dotenv
        env_file = os.path.join(agent_dir, '.env')
        load_dotenv(env_file)
        
        # 导入并运行 app
        print("[4/4] 正在启动 Agent 服务...")
        from app import app, llm_client
        port = int(os.getenv('AGENT_PORT', 5000))
        
        print("=" * 60)
        print(f"🚀 Agent 服务启动中...")
        print(f"   地址: http://0.0.0.0:{port}")
        print(f"   本地: http://localhost:{port}")
        print(f"   LLM 就绪: {'✓ 是' if llm_client else '✗ 否'}")
        if not llm_client:
            print()
            print("   ⚠️  警告: LLM 客户端未初始化")
            print("   服务可以启动，但 AI 功能将不可用")
            print("   请检查上方的错误信息")
        print("=" * 60)
        print()
        print("服务运行中，按 Ctrl+C 停止...")
        print()
        
        app.run(host='0.0.0.0', port=port, debug=True)
    except KeyboardInterrupt:
        print("\n\n✅ 服务已停止")
    except OSError as e:
        if "Address already in use" in str(e) or "address already in use" in str(e).lower():
            print(f"\n❌ 端口 {port} 已被占用")
            print("   请检查是否有其他程序在使用该端口")
            print("   或修改 .env 文件中的 AGENT_PORT")
        else:
            print(f"\n❌ 启动失败: {e}")
        import traceback
        traceback.print_exc()
        input("\n按 Enter 键退出...")
    except Exception as e:
        print(f"\n❌ 启动失败: {e}")
        import traceback
        traceback.print_exc()
        input("\n按 Enter 键退出...")

if __name__ == '__main__':
    main()

