"""
中间件：请求/响应拦截器
用于记录所有HTTP请求和响应
"""
from flask import request, g
import logging
import time
import json

logger = logging.getLogger(__name__)

def setup_request_logging(app):
    """设置请求日志中间件"""
    
    @app.before_request
    def log_request():
        """在请求处理前记录"""
        g.start_time = time.time()
        g.request_id = time.strftime('%Y%m%d%H%M%S') + str(int(time.time() * 1000) % 1000).zfill(3)
        
        # 记录请求信息
        logger.info(f"")
        logger.info(f"{'='*60}")
        logger.info(f"📥 收到请求 [{g.request_id}]")
        logger.info(f"   方法: {request.method}")
        logger.info(f"   路径: {request.path}")
        logger.info(f"   来源: {request.remote_addr}")
        logger.info(f"   User-Agent: {request.headers.get('User-Agent', 'N/A')[:80]}")
        
        # 记录请求头（排除敏感信息）
        sensitive_headers = ['authorization', 'cookie', 'api-key']
        headers = {k: ('***' if k.lower() in sensitive_headers else v) 
                  for k, v in request.headers.items()}
        logger.info(f"   请求头: {json.dumps(dict(headers), ensure_ascii=False, indent=6)}")
        
        # 记录请求体（仅对POST/PUT）
        if request.method in ['POST', 'PUT'] and request.is_json:
            try:
                body = request.get_json()
                # 隐藏敏感字段
                safe_body = hide_sensitive_fields(body)
                logger.info(f"   请求体: {json.dumps(safe_body, ensure_ascii=False, indent=6)}")
            except Exception as e:
                logger.warning(f"   请求体解析失败: {e}")
    
    @app.after_request
    def log_response(response):
        """在请求处理后记录"""
        if hasattr(g, 'start_time'):
            elapsed = time.time() - g.start_time
            request_id = getattr(g, 'request_id', 'unknown')
            
            logger.info(f"")
            logger.info(f"📤 响应 [{request_id}]")
            logger.info(f"   状态码: {response.status_code}")
            logger.info(f"   耗时: {elapsed*1000:.2f}ms")
            
            # 记录响应头
            logger.info(f"   响应头: {json.dumps(dict(response.headers), ensure_ascii=False, indent=6)}")
            
            # 对于非流式响应，记录响应体
            if response.content_type and 'application/json' in response.content_type:
                try:
                    # 获取响应数据（不影响原响应）
                    if response.direct_passthrough:
                        logger.info(f"   响应体: <streaming response>")
                    else:
                        data = response.get_json()
                        if data:
                            data_str = json.dumps(data, ensure_ascii=False)
                            if len(data_str) > 500:
                                logger.info(f"   响应体(截断): {data_str[:500]}...")
                            else:
                                logger.info(f"   响应体: {data_str}")
                except Exception as e:
                    logger.debug(f"   无法解析响应体: {e}")
            
            logger.info(f"{'='*60}")
        
        return response

def hide_sensitive_fields(data, sensitive_keys=['password', 'token', 'api_key', 'secret']):
    """隐藏敏感字段"""
    if isinstance(data, dict):
        return {k: ('***' if any(s in k.lower() for s in sensitive_keys) else hide_sensitive_fields(v, sensitive_keys))
                for k, v in data.items()}
    elif isinstance(data, list):
        return [hide_sensitive_fields(item, sensitive_keys) for item in data]
    else:
        return data
