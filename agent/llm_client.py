import os
from openai import OpenAI
from dotenv import load_dotenv
from typing import List, Dict

# 获取当前文件所在目录（agent目录）
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, '.env')

# 加载 .env 文件中的环境变量（指定绝对路径）
load_dotenv(ENV_FILE)

class HelloAgentsLLM:
    """
    为本书 "Hello Agents" 定制的LLM客户端。
    它用于调用任何兼容OpenAI接口的服务，并默认使用流式响应。
    """
    def __init__(self, model: str = None, apiKey: str = None, baseUrl: str = None, timeout: int = None):
        """
        初始化客户端。优先使用传入参数，如果未提供，则从环境变量加载。
        """
        def get_env_value(key, default=None):
            """获取环境变量值，自动去除引号"""
            value = os.getenv(key, default)
            if value and isinstance(value, str):
                # 去除首尾的引号（单引号或双引号）
                value = value.strip().strip('"').strip("'")
            return value
        
        self.model = model or get_env_value("LLM_MODEL_ID")
        apiKey = apiKey or get_env_value("LLM_API_KEY")
        baseUrl = baseUrl or get_env_value("LLM_BASE_URL")
        timeout = timeout or int(get_env_value("LLM_TIMEOUT", "60") or "60")
        
        if not all([self.model, apiKey, baseUrl]):
            missing = []
            if not self.model:
                missing.append("LLM_MODEL_ID")
            if not apiKey:
                missing.append("LLM_API_KEY")
            if not baseUrl:
                missing.append("LLM_BASE_URL")
            raise ValueError(f"模型ID、API密钥和服务地址必须被提供或在.env文件中定义。缺少: {', '.join(missing)}")
        
        self.client = OpenAI(api_key=apiKey, base_url=baseUrl, timeout=timeout)

    def think(self, messages: List[Dict[str, str]], temperature: float = 0) -> str:
        """
        调用大语言模型进行思考，并返回其响应。
        """
        print(f"🧠 正在调用 {self.model} 模型...")
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                stream=True,
            )
            
            # 处理流式响应
            print("✅ 大语言模型响应成功:")
            collected_content = []
            for chunk in response:
                content = chunk.choices[0].delta.content or ""
                print(content, end="", flush=True)
                collected_content.append(content)
            print()  # 在流式输出结束后换行
            return "".join(collected_content)
        except Exception as e:
            print(f"❌ 调用LLM API时发生错误: {e}")
            return None

    def think_stream(self, messages: List[Dict[str, str]], temperature: float = 0):
        """
        流式调用大语言模型，返回生成器。
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=temperature,
                stream=True,
            )
            
            for chunk in response:
                content = chunk.choices[0].delta.content or ""
                if content:
                    yield content
        except Exception as e:
            print(f"❌ 调用LLM API时发生错误: {e}")
            yield None

# --- 客户端使用示例 ---
if __name__ == '__main__':
    try:
        llmClient = HelloAgentsLLM()
        
        exampleMessages = [
            {"role": "system", "content": "You are a helpful assistant that writes Python code."},
            {"role": "user", "content": "写一个快速排序算法"}
        ]
        
        print("--- 调用LLM ---")
        responseText = llmClient.think(exampleMessages)
        if responseText:
            print("\n\n--- 完整模型响应 ---")
            print(responseText)
    except ValueError as e:
        print(e)

