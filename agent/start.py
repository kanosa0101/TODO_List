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
    try:
        import flask
        import flask_cors
        from openai import OpenAI
        from dotenv import load_dotenv
        return True
    except ImportError as e:
        print(f"❌ 缺少依赖: {e}")
        print("   请运行: pip install -r requirements.txt")
        return False

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
    print("[1/3] 检查配置文件...")
    if not check_env_file():
        print("   请先配置 .env 文件")
        input("\n按 Enter 键退出...")
        return
    print("   ✓ .env 文件存在")
    print()
    
    # 检查依赖
    print("[2/3] 检查 Python 依赖...")
    if not check_dependencies():
        input("\n按 Enter 键退出...")
        return
    print("   ✓ 依赖已安装")
    print()
    
    # 启动服务
    print("[3/3] 启动 Agent 服务...")
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
        print("   正在导入 app 模块...")
        from app import app, llm_client
        port = int(os.getenv('AGENT_PORT', 5000))
        
        print("=" * 60)
        print(f"🚀 Agent 服务启动中...")
        print(f"   地址: http://0.0.0.0:{port}")
        print(f"   本地: http://localhost:{port}")
        print(f"   LLM 就绪: {'是' if llm_client else '否'}")
        if not llm_client:
            print("   ⚠️  警告: LLM 客户端未初始化")
            print("   请检查 .env 文件中的配置")
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

