"""
MCP (Model Context Protocol) 工具模块
提供待办事项和笔记的操作功能
"""
import requests
import json
import logging
from typing import Dict, List, Any, Optional
from datetime import datetime

# 配置日志
logger = logging.getLogger(__name__)

# 后端 API 基础 URL
# 注意：后端服务默认运行在 3001 端口
BACKEND_BASE_URL = "http://localhost:3001"

# 请求超时时间（秒）
REQUEST_TIMEOUT = 10


def get_headers(token: str) -> Dict[str, str]:
    """获取请求头，包含认证信息"""
    return {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }


def handle_request_error(e: Exception, operation: str) -> Dict[str, Any]:
    """
    统一处理请求错误
    
    Args:
        e: 异常对象
        operation: 操作名称（用于错误消息）
    
    Returns:
        错误响应字典
    """
    if isinstance(e, requests.exceptions.ConnectionError):
        return {
            "success": False,
            "error": f"无法连接到后端服务 ({BACKEND_BASE_URL})。请确保后端服务正在运行。"
        }
    elif isinstance(e, requests.exceptions.Timeout):
        return {
            "success": False,
            "error": f"{operation}请求超时，后端服务响应时间过长。"
        }
    elif isinstance(e, requests.exceptions.HTTPError):
        error_msg = f"HTTP 错误 {e.response.status_code}"
        try:
            error_detail = e.response.json().get('error', '')
            if error_detail:
                error_msg += f": {error_detail}"
        except:
            error_msg += f": {e.response.text[:100]}"
        return {
            "success": False,
            "error": error_msg
        }
    else:
        return {
            "success": False,
            "error": f"{operation}失败: {str(e)}"
        }


# ==================== 待办事项工具 ====================

def list_todos(token: str, filter: Optional[str] = None) -> Dict[str, Any]:
    """
    获取当前用户的所有待办事项
    
    Args:
        token: 用户认证 token
        filter: 筛选条件，可选值：'all', 'active', 'completed'
    
    Returns:
        包含待办事项列表的字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/todos"
        params = {}
        if filter and filter != 'all':
            params['filter'] = filter
        
        logger.info(f"[MCP] 调用 list_todos - URL: {url}, 参数: {params}")
        start_time = datetime.now()
        response = requests.get(url, headers=get_headers(token), params=params, timeout=REQUEST_TIMEOUT)
        elapsed = (datetime.now() - start_time).total_seconds()
        logger.info(f"[MCP] list_todos 请求完成，状态码: {response.status_code}, 耗时: {elapsed:.2f}秒")
        
        response.raise_for_status()
        todos = response.json()
        
        logger.info(f"[MCP] list_todos 成功，返回 {len(todos)} 个待办事项")
        return {
            "success": True,
            "data": todos,
            "count": len(todos)
        }
    except Exception as e:
        logger.error(f"[MCP] list_todos 失败: {str(e)}")
        return handle_request_error(e, "获取待办事项")


def get_todo_by_id(token: str, todo_id: int) -> Dict[str, Any]:
    """
    根据 ID 获取待办事项详情
    
    Args:
        token: 用户认证 token
        todo_id: 待办事项 ID
    
    Returns:
        包含待办事项详情的字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/todos/{todo_id}"
        response = requests.get(url, headers=get_headers(token), timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        todo = response.json()
        
        return {
            "success": True,
            "data": todo
        }
    except Exception as e:
        return handle_request_error(e, "获取待办事项详情")


def create_todo(token: str, text: str, priority: str = "MEDIUM", 
                completed: bool = False, deadline: Optional[str] = None,
                is_daily: bool = False, total_steps: Optional[int] = None,
                estimated_duration: Optional[int] = None,
                duration_unit: Optional[str] = None) -> Dict[str, Any]:
    """
    创建新的待办事项
    
    Args:
        token: 用户认证 token
        text: 待办事项内容
        priority: 优先级，可选值：'LOW', 'MEDIUM', 'HIGH'
        completed: 是否已完成
        deadline: 截止日期，格式：'YYYY-MM-DDTHH:mm:ss'
        is_daily: 是否为每日任务
        total_steps: 总步骤数
        estimated_duration: 预计时长数值
        duration_unit: 时长单位，可选值：'MINUTES', 'HOURS', 'DAYS'
    
    Returns:
        包含创建的待办事项的字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/todos"
        data = {
            "text": text,
            "priority": priority,
            "completed": completed,
            "isDaily": is_daily
        }
        
        if deadline:
            data["deadline"] = deadline
        if total_steps is not None:
            data["totalSteps"] = total_steps
        if estimated_duration is not None:
            data["estimatedDuration"] = estimated_duration
        if duration_unit:
            data["durationUnit"] = duration_unit
        
        response = requests.post(url, headers=get_headers(token), json=data, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        todo = response.json()
        
        return {
            "success": True,
            "data": todo,
            "message": "待办事项创建成功"
        }
    except Exception as e:
        return handle_request_error(e, "创建待办事项")


def update_todo(token: str, todo_id: int, text: Optional[str] = None,
                priority: Optional[str] = None, completed: Optional[bool] = None,
                deadline: Optional[str] = None, is_daily: Optional[bool] = None,
                total_steps: Optional[int] = None, completed_steps: Optional[int] = None,
                estimated_duration: Optional[int] = None,
                duration_unit: Optional[str] = None) -> Dict[str, Any]:
    """
    更新待办事项
    
    Args:
        token: 用户认证 token
        todo_id: 待办事项 ID
        text: 待办事项内容（可选）
        priority: 优先级（可选）
        completed: 是否已完成（可选）
        deadline: 截止日期（可选）
        is_daily: 是否为每日任务（可选）
        total_steps: 总步骤数（可选）
        completed_steps: 已完成步骤数（可选）
        estimated_duration: 预计时长数值（可选）
        duration_unit: 时长单位（可选）
    
    Returns:
        包含更新后的待办事项的字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/todos/{todo_id}"
        data = {}
        
        if text is not None:
            data["text"] = text
        if priority is not None:
            data["priority"] = priority
        if completed is not None:
            data["completed"] = completed
        if deadline is not None:
            data["deadline"] = deadline
        if is_daily is not None:
            data["isDaily"] = is_daily
        if total_steps is not None:
            data["totalSteps"] = total_steps
        if completed_steps is not None:
            data["completedSteps"] = completed_steps
        if estimated_duration is not None:
            data["estimatedDuration"] = estimated_duration
        if duration_unit is not None:
            data["durationUnit"] = duration_unit
        
        response = requests.patch(url, headers=get_headers(token), json=data, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        todo = response.json()
        
        return {
            "success": True,
            "data": todo,
            "message": "待办事项更新成功"
        }
    except Exception as e:
        return handle_request_error(e, "更新待办事项")


def delete_todo(token: str, todo_id: int) -> Dict[str, Any]:
    """
    删除待办事项
    
    Args:
        token: 用户认证 token
        todo_id: 待办事项 ID
    
    Returns:
        操作结果字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/todos/{todo_id}"
        response = requests.delete(url, headers=get_headers(token), timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        
        return {
            "success": True,
            "message": "待办事项删除成功"
        }
    except Exception as e:
        return handle_request_error(e, "删除待办事项")


# ==================== 笔记工具 ====================

def list_notes(token: str) -> Dict[str, Any]:
    """
    获取当前用户的所有笔记
    
    Args:
        token: 用户认证 token
    
    Returns:
        包含笔记列表的字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/notes"
        response = requests.get(url, headers=get_headers(token), timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        notes = response.json()
        
        return {
            "success": True,
            "data": notes,
            "count": len(notes)
        }
    except Exception as e:
        return handle_request_error(e, "获取笔记列表")


def get_note_by_id(token: str, note_id: int) -> Dict[str, Any]:
    """
    根据 ID 获取笔记详情
    
    Args:
        token: 用户认证 token
        note_id: 笔记 ID
    
    Returns:
        包含笔记详情的字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/notes/{note_id}"
        response = requests.get(url, headers=get_headers(token), timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        note = response.json()
        
        return {
            "success": True,
            "data": note
        }
    except Exception as e:
        return handle_request_error(e, "获取笔记详情")


def create_note(token: str, title: str, content: str = "") -> Dict[str, Any]:
    """
    创建新笔记
    
    Args:
        token: 用户认证 token
        title: 笔记标题
        content: 笔记内容
    
    Returns:
        包含创建的笔记的字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/notes"
        data = {
            "title": title,
            "content": content
        }
        
        response = requests.post(url, headers=get_headers(token), json=data, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        note = response.json()
        
        return {
            "success": True,
            "data": note,
            "message": "笔记创建成功"
        }
    except Exception as e:
        return handle_request_error(e, "创建笔记")


def update_note(token: str, note_id: int, title: Optional[str] = None,
                content: Optional[str] = None) -> Dict[str, Any]:
    """
    更新笔记
    
    Args:
        token: 用户认证 token
        note_id: 笔记 ID
        title: 笔记标题（可选）
        content: 笔记内容（可选）
    
    Returns:
        包含更新后的笔记的字典
    """
    try:
        # 先获取现有笔记
        get_url = f"{BACKEND_BASE_URL}/api/notes/{note_id}"
        get_response = requests.get(get_url, headers=get_headers(token), timeout=REQUEST_TIMEOUT)
        get_response.raise_for_status()
        existing_note = get_response.json()
        
        # 准备更新数据
        data = {
            "title": title if title is not None else existing_note.get("title", ""),
            "content": content if content is not None else existing_note.get("content", "")
        }
        
        url = f"{BACKEND_BASE_URL}/api/notes/{note_id}"
        response = requests.put(url, headers=get_headers(token), json=data, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        note = response.json()
        
        return {
            "success": True,
            "data": note,
            "message": "笔记更新成功"
        }
    except Exception as e:
        return handle_request_error(e, "更新笔记")


def delete_note(token: str, note_id: int) -> Dict[str, Any]:
    """
    删除笔记
    
    Args:
        token: 用户认证 token
        note_id: 笔记 ID
    
    Returns:
        操作结果字典
    """
    try:
        url = f"{BACKEND_BASE_URL}/api/notes/{note_id}"
        response = requests.delete(url, headers=get_headers(token), timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        
        return {
            "success": True,
            "message": "笔记删除成功"
        }
    except Exception as e:
        return handle_request_error(e, "删除笔记")


# ==================== MCP 工具定义 ====================

def get_mcp_tools() -> List[Dict[str, Any]]:
    """
    返回 MCP 工具定义列表，用于 LLM function calling
    """
    return [
        {
            "type": "function",
            "function": {
                "name": "list_todos",
                "description": "获取当前用户的所有待办事项列表。可以按状态筛选：'all'（全部）、'active'（未完成）、'completed'（已完成）",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "filter": {
                            "type": "string",
                            "enum": ["all", "active", "completed"],
                            "description": "筛选条件：'all'（全部）、'active'（未完成）、'completed'（已完成）。默认为 'all'"
                        }
                    }
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_todo_by_id",
                "description": "根据 ID 获取待办事项的详细信息",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "todo_id": {
                            "type": "integer",
                            "description": "待办事项的 ID"
                        }
                    },
                    "required": ["todo_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "create_todo",
                "description": "创建新的待办事项",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "text": {
                            "type": "string",
                            "description": "待办事项的内容描述"
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["LOW", "MEDIUM", "HIGH"],
                            "description": "优先级，默认为 'MEDIUM'"
                        },
                        "completed": {
                            "type": "boolean",
                            "description": "是否已完成，默认为 false"
                        },
                        "deadline": {
                            "type": "string",
                            "description": "截止日期，格式：'YYYY-MM-DDTHH:mm:ss'，例如 '2024-12-31T23:59:59'"
                        },
                        "is_daily": {
                            "type": "boolean",
                            "description": "是否为每日任务，默认为 false"
                        },
                        "total_steps": {
                            "type": "integer",
                            "description": "总步骤数（可选）"
                        },
                        "estimated_duration": {
                            "type": "integer",
                            "description": "预计时长数值（可选）"
                        },
                        "duration_unit": {
                            "type": "string",
                            "enum": ["MINUTES", "HOURS", "DAYS"],
                            "description": "时长单位：'MINUTES'（分钟）、'HOURS'（小时）、'DAYS'（天）"
                        }
                    },
                    "required": ["text"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_todo",
                "description": "更新待办事项。可以更新部分字段，只需提供要更新的字段即可",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "todo_id": {
                            "type": "integer",
                            "description": "待办事项的 ID"
                        },
                        "text": {
                            "type": "string",
                            "description": "待办事项的内容描述（可选）"
                        },
                        "priority": {
                            "type": "string",
                            "enum": ["LOW", "MEDIUM", "HIGH"],
                            "description": "优先级（可选）"
                        },
                        "completed": {
                            "type": "boolean",
                            "description": "是否已完成（可选）"
                        },
                        "deadline": {
                            "type": "string",
                            "description": "截止日期，格式：'YYYY-MM-DDTHH:mm:ss'（可选）"
                        },
                        "is_daily": {
                            "type": "boolean",
                            "description": "是否为每日任务（可选）"
                        },
                        "total_steps": {
                            "type": "integer",
                            "description": "总步骤数（可选）"
                        },
                        "completed_steps": {
                            "type": "integer",
                            "description": "已完成步骤数（可选）"
                        },
                        "estimated_duration": {
                            "type": "integer",
                            "description": "预计时长数值（可选）"
                        },
                        "duration_unit": {
                            "type": "string",
                            "enum": ["MINUTES", "HOURS", "DAYS"],
                            "description": "时长单位（可选）"
                        }
                    },
                    "required": ["todo_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_todo",
                "description": "删除待办事项",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "todo_id": {
                            "type": "integer",
                            "description": "待办事项的 ID"
                        }
                    },
                    "required": ["todo_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "list_notes",
                "description": "获取当前用户的所有笔记列表",
                "parameters": {
                    "type": "object",
                    "properties": {}
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "get_note_by_id",
                "description": "根据 ID 获取笔记的详细信息",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "integer",
                            "description": "笔记的 ID"
                        }
                    },
                    "required": ["note_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "create_note",
                "description": "创建新笔记",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "title": {
                            "type": "string",
                            "description": "笔记的标题"
                        },
                        "content": {
                            "type": "string",
                            "description": "笔记的内容，支持 Markdown 格式"
                        }
                    },
                    "required": ["title"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "update_note",
                "description": "更新笔记。可以更新标题和/或内容",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "integer",
                            "description": "笔记的 ID"
                        },
                        "title": {
                            "type": "string",
                            "description": "笔记的标题（可选）"
                        },
                        "content": {
                            "type": "string",
                            "description": "笔记的内容，支持 Markdown 格式（可选）"
                        }
                    },
                    "required": ["note_id"]
                }
            }
        },
        {
            "type": "function",
            "function": {
                "name": "delete_note",
                "description": "删除笔记",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "note_id": {
                            "type": "integer",
                            "description": "笔记的 ID"
                        }
                    },
                    "required": ["note_id"]
                }
            }
        }
    ]


def execute_tool(token: str, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    执行 MCP 工具调用
    
    Args:
        token: 用户认证 token
        tool_name: 工具名称
        arguments: 工具参数
    
    Returns:
        工具执行结果
    """
    try:
        if tool_name == "list_todos":
            return list_todos(token, arguments.get("filter", "all"))
        
        elif tool_name == "get_todo_by_id":
            return get_todo_by_id(token, arguments["todo_id"])
        
        elif tool_name == "create_todo":
            return create_todo(
                token,
                arguments["text"],
                arguments.get("priority", "MEDIUM"),
                arguments.get("completed", False),
                arguments.get("deadline"),
                arguments.get("is_daily", False),
                arguments.get("total_steps"),
                arguments.get("estimated_duration"),
                arguments.get("duration_unit")
            )
        
        elif tool_name == "update_todo":
            return update_todo(
                token,
                arguments["todo_id"],
                arguments.get("text"),
                arguments.get("priority"),
                arguments.get("completed"),
                arguments.get("deadline"),
                arguments.get("is_daily"),
                arguments.get("total_steps"),
                arguments.get("completed_steps"),
                arguments.get("estimated_duration"),
                arguments.get("duration_unit")
            )
        
        elif tool_name == "delete_todo":
            return delete_todo(token, arguments["todo_id"])
        
        elif tool_name == "list_notes":
            return list_notes(token)
        
        elif tool_name == "get_note_by_id":
            return get_note_by_id(token, arguments["note_id"])
        
        elif tool_name == "create_note":
            return create_note(
                token,
                arguments["title"],
                arguments.get("content", "")
            )
        
        elif tool_name == "update_note":
            return update_note(
                token,
                arguments["note_id"],
                arguments.get("title"),
                arguments.get("content")
            )
        
        elif tool_name == "delete_note":
            return delete_note(token, arguments["note_id"])
        
        else:
            return {
                "success": False,
                "error": f"未知的工具: {tool_name}"
            }
    
    except KeyError as e:
        return {
            "success": False,
            "error": f"缺少必需参数: {str(e)}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

