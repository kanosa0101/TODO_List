#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
测试 .env 配置和 LLM 客户端初始化
"""
import os
import sys
from dotenv import load_dotenv

# 加载 .env 文件
env_file = os.path.join(os.path.dirname(__file__), '.env')
print(f"加载配置文件: {env_file}")
print(f"文件存在: {os.path.exists(env_file)}")
print()

load_dotenv(env_file)

# 检查配置
def get_clean_value(key):
    value = os.getenv(key, '').strip()
    if value:
        value = value.strip('"').strip("'")
    return value

model_id = get_clean_value('LLM_MODEL_ID')
api_key = get_clean_value('LLM_API_KEY')
base_url = get_clean_value('LLM_BASE_URL')
port = get_clean_value('AGENT_PORT')

print("=" * 60)
print("配置检查")
print("=" * 60)
print(f"LLM_MODEL_ID: {model_id if model_id else '(未设置)'}")
print(f"LLM_API_KEY: {api_key[:10] + '...' if len(api_key) > 10 else '(未设置)'}")
print(f"LLM_BASE_URL: {base_url if base_url else '(未设置)'}")
print(f"AGENT_PORT: {port if port else '(未设置)'}")
print()

# 检查必需配置
missing = []
if not model_id:
    missing.append('LLM_MODEL_ID')
if not api_key:
    missing.append('LLM_API_KEY')
if not base_url:
    missing.append('LLM_BASE_URL')

if missing:
    print(f"❌ 缺少必需配置: {', '.join(missing)}")
    sys.exit(1)
else:
    print("✓ 所有必需配置已设置")
    print()

# 尝试初始化 LLM 客户端
print("=" * 60)
print("测试 LLM 客户端初始化")
print("=" * 60)

try:
    from llm_client import HelloAgentsLLM
    llm = HelloAgentsLLM()
    print(f"✓ LLM 客户端初始化成功")
    print(f"  模型: {llm.model}")
except Exception as e:
    print(f"❌ LLM 客户端初始化失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print()
print("=" * 60)
print("✓ 所有测试通过")
print("=" * 60)
