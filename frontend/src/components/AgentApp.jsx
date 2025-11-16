import { useState, useRef, useEffect } from 'react';
import UserMenu from './UserMenu';
import Navigation from './Navigation';
import '../styles/AgentApp.css';

function AgentApp() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const [streamingContent, setStreamingContent] = useState('');
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const checkIfAtBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const isAtBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
      setShowScrollToBottom(!isAtBottom);
    }
  };

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.addEventListener('scroll', checkIfAtBottom);
      checkIfAtBottom();
      return () => {
        messagesContainerRef.current?.removeEventListener('scroll', checkIfAtBottom);
      };
    }
  }, [messages, streamingContent]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);
    setStreamingContent('');

    try {
      // 获取用户 token
      const token = sessionStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/agent/chat/stream', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          messages: [
            ...messages.map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content: userMessage.content }
          ],
          temperature: 0.7
        }),
      });

      if (!response.ok) {
        let errorMessage = '请求失败';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          // 如果响应不是 JSON，使用状态文本
          errorMessage = `请求失败: ${response.status} ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                console.error('Agent 错误:', data.error);
                setError(data.error);
                setIsLoading(false);
                setStreamingContent('');
                // 如果已经有部分内容，保存它
                if (assistantMessage.trim()) {
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: assistantMessage,
                    timestamp: new Date().toISOString()
                  }]);
                }
                return;
              }
              if (data.done) {
                // 只有当有内容时才保存消息
                if (assistantMessage.trim()) {
                  setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: assistantMessage,
                    timestamp: new Date().toISOString()
                  }]);
                } else {
                  // 如果没有内容，显示错误
                  setError('LLM 未返回任何内容，请重试');
                }
                setStreamingContent('');
                setIsLoading(false);
                return;
              }
              if (data.content) {
                assistantMessage += data.content;
                setStreamingContent(assistantMessage);
              }
            } catch (e) {
              console.error('解析SSE数据失败:', e);
            }
          }
        }
      }
    } catch (err) {
      console.error('发送消息失败:', err);
      let errorMessage = '发送消息失败';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.name === 'TypeError' && err.message.includes('fetch')) {
        errorMessage = '无法连接到 AI 服务，请确保 Agent 服务已启动（端口 5000）';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setStreamingContent('');
    setError(null);
  };

  return (
    <div className="app">
      <div className="container">
        <UserMenu />
        <Navigation />
        <div className="agent-app">
          <div className="agent-header">
            <h1>
              <span className="icon">🤖</span>
              <span>AI 助手</span>
            </h1>
            {messages.length > 0 && (
              <button className="clear-button" onClick={clearMessages}>
                🗑️ 清空对话
              </button>
            )}
          </div>

          <div className="agent-chat-container">
            <div className="agent-messages" ref={messagesContainerRef}>
              {messages.length === 0 && !isLoading && (
                <div className="welcome-message">
                  <div className="welcome-icon">💬</div>
                  <h2>开始对话</h2>
                  <p>输入您的问题，AI 助手将为您解答</p>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={index} className={`message ${message.role}`}>
                  <div className="message-avatar">
                    {message.role === 'user' ? '👤' : '🤖'}
                  </div>
                  <div className="message-content">
                    <div className="message-text">{message.content}</div>
                    <div className="message-time">
                      {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && streamingContent && (
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="message-text">{streamingContent}</div>
                    <div className="message-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              {isLoading && !streamingContent && (
                <div className="message assistant">
                  <div className="message-avatar">🤖</div>
                  <div className="message-content">
                    <div className="message-typing">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="error-message">
                  <span className="error-icon">⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
              {showScrollToBottom && (
                <button 
                  className="scroll-to-bottom-button"
                  onClick={scrollToBottom}
                  title="滚动到底部"
                >
                  ⬇️
                </button>
              )}
            </div>

            <div className="agent-input-container">
            <div className="agent-input-wrapper">
              <textarea
                className="agent-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入消息... (Shift+Enter 换行，Enter 发送)"
                rows={1}
                disabled={isLoading}
              />
              <button
                className="send-button"
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? '⏳' : '📤'}
              </button>
            </div>
            <div className="input-hint">
              AI 助手由 OpenAI 兼容 API 驱动
            </div>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentApp;

