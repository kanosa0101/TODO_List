import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import noteService from '../services/noteService';
import authService from '../services/authService';
import Navigation from './Navigation';
import UserMenu from './UserMenu';
import '../styles/App.css';
import '../styles/components.css';

function NoteApp() {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('NoteApp: 正在获取笔记列表...');
      const data = await noteService.getAllNotes();
      console.log('NoteApp: 获取到笔记数据:', data);
      setNotes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('获取笔记列表失败:', err);
      if (err.message === 'Unauthorized' || err.status === 401) {
        authService.logout();
        navigate('/login');
      } else {
        setError('加载笔记失败: ' + (err.message || '未知错误'));
        setNotes([]);
      }
    } finally {
      setLoading(false);
      console.log('NoteApp: 加载完成，loading=false');
    }
  }, [navigate]);

  const saveCurrentNote = useCallback(async () => {
    if (!title.trim()) return;

    // 不保存未命名的空笔记
    if (title.startsWith('未命名-') && !content.trim()) {
      console.log('跳过保存：未命名的空笔记');
      return;
    }

    try {
      if (currentNote && currentNote.id) {
        const updatedNote = await noteService.partialUpdateNote(currentNote.id, { title, content: content || '' });
        setCurrentNote(updatedNote);
      } else {
        const newNote = await noteService.createNote({ title, content: content || '' });
        setCurrentNote(newNote);
      }
      await fetchNotes();
      setIsDirty(false);
    } catch (err) {
      console.error('保存失败:', err);
      throw err;
    }
  }, [title, content, currentNote, fetchNotes]);

  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      setError('笔记标题不能为空');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await saveCurrentNote();
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        navigate('/login');
      } else {
        setError('保存笔记失败: ' + (err.message || '未知错误'));
      }
    } finally {
      setSaving(false);
    }
  }, [saveCurrentNote, navigate, title]);

  const handleNewNote = () => {
    setError(null);
    const timestamp = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const newTitle = `未命名-${timestamp}`;
    setCurrentNote(null);
    setTitle(newTitle);
    setContent('');
    setViewMode('edit');
    setIsDirty(true);
    // 不立即创建笔记，等用户手动保存
  };

  const handleSelectNote = async (note) => {
    try {
      setError(null);
      const fullNote = await noteService.getNoteById(note.id);
      setCurrentNote(fullNote);
      setTitle(fullNote.title);
      setContent(fullNote.content || '');
      setIsDirty(false);
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        navigate('/login');
      } else {
        setError('加载笔记失败: ' + (err.message || '未知错误'));
      }
    }
  };

  // 初始化时加载笔记列表
  useEffect(() => {
    console.log('NoteApp: 开始加载笔记列表');
    fetchNotes().catch((err) => {
      console.error('初始化笔记失败:', err);
      setError('加载笔记失败，请刷新页面重试');
    });
  }, [fetchNotes]);

  // Ctrl+S 手动保存
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (title.trim()) {
          handleSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, handleSave]);

  const handleDelete = async () => {
    if (!currentNote) return;
    if (!window.confirm('确定要删除这个笔记吗？删除后不可恢复。')) return;

    try {
      setError(null);
      await noteService.deleteNote(currentNote.id);
      setCurrentNote(null);
      setTitle('');
      setContent('');
      setIsDirty(false);
      await fetchNotes();
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        navigate('/login');
      } else {
        setError('删除笔记失败: ' + (err.message || '未知错误'));
      }
    }
  };

  const handleDownload = () => {
    if (!content && !title) {
      setError('没有可下载的内容');
      return;
    }

    const blob = new Blob([content || ''], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      setError('请上传 .md 格式的文件');
      return;
    }

    try {
      setError(null);
      const text = await file.text();
      const fileName = file.name.replace(/\.md$/i, '');

      const newNote = await noteService.createNote({
        title: fileName,
        content: text
      });

      setCurrentNote(newNote);
      setTitle(newNote.title);
      setContent(newNote.content || '');
      setIsDirty(false);
      await fetchNotes();
    } catch (err) {
      if (err.message === 'Unauthorized' || err.status === 401) {
        navigate('/login');
      } else {
        setError('上传文件失败: ' + (err.message || '未知错误'));
      }
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setIsDirty(true);
  };

  const handleContentChange = (value) => {
    setContent(value || '');
    setIsDirty(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 渲染Markdown预览
  const renderMarkdown = (markdown) => {
    // ReactMarkdown已经处理了XSS安全
    return (
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {markdown || '*暂无内容*'}
      </ReactMarkdown>
    );
  };

  console.log('NoteApp render:', { loading, notes: notes.length, error, currentNote: !!currentNote });

  return (
    <div className="app note-page">
      <div className="container">
        <UserMenu />
        <Navigation />
        <div className="header">
          <h1>
            <span className="icon">📝</span>
            <span>我的笔记</span>
          </h1>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <span>加载中...</span>
          </div>
        ) : (
          <div className="note-app-container">
            <div className="note-sidebar">
              <div className="note-actions">
                <button className="note-action-btn" onClick={handleNewNote}>
                  ➕ 新建笔记
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".md"
                  onChange={handleUpload}
                  style={{ display: 'none' }}
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="note-action-btn">
                  📤 上传文件
                </label>
              </div>
              <div className="note-list">
                {notes.length === 0 ? (
                  <div className="empty-note-list">暂无笔记</div>
                ) : (
                  notes.map(note => (
                    <div
                      key={note.id}
                      className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
                      onClick={() => handleSelectNote(note)}
                    >
                      <div className="note-item-title">{note.title}</div>
                      <div className="note-item-date">{formatDate(note.updatedAt)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="note-editor-container">
              {(currentNote || title) ? (
                <>
                  <div className="note-editor-header">
                    <input
                      type="text"
                      className="note-title-input"
                      value={title}
                      onChange={handleTitleChange}
                      placeholder="笔记标题"
                    />
                    <div className="note-editor-actions">
                      <div className="view-mode-toggle">
                        <button
                          className={`view-mode-btn ${viewMode === 'edit' ? 'active' : ''}`}
                          onClick={() => setViewMode('edit')}
                          title="编辑模式"
                        >
                          ✏️ 编辑
                        </button>
                        <button
                          className={`view-mode-btn ${viewMode === 'preview' ? 'active' : ''}`}
                          onClick={() => setViewMode('preview')}
                          title="预览模式"
                        >
                          👁️ 预览
                        </button>
                      </div>
                      {saving && <span className="saving-indicator">保存中...</span>}
                      {isDirty && !saving && <span className="saving-indicator unsaved">未保存</span>}
                      <button className="note-action-btn-small" onClick={handleSave}>
                        💾 保存
                      </button>
                      {currentNote?.id && (
                        <>
                          <button className="note-action-btn-small" onClick={handleDownload}>
                            ⬇️ 下载
                          </button>
                          <button className="note-action-btn-small danger" onClick={handleDelete}>
                            🗑️ 删除
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="note-editor-content">
                    {viewMode === 'edit' && (
                      <div className="note-editor-wrapper">
                        <Editor
                          height="100%"
                          defaultLanguage="markdown"
                          value={content}
                          onChange={handleContentChange}
                          theme="vs"
                          loading={<div style={{ padding: '20px', textAlign: 'center' }}>加载编辑器中...</div>}
                          options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            lineNumbers: 'on',
                            wordWrap: 'on',
                            automaticLayout: true,
                            scrollBeyondLastLine: false,
                            padding: { top: 16, bottom: 16 },
                            fontFamily: 'Courier New, Consolas, monospace',
                            borderRadius: '8px',
                          }}
                        />
                      </div>
                    )}
                    {viewMode === 'preview' && (
                      <div className="note-preview-wrapper">
                        <div className="note-preview">
                          {renderMarkdown(content)}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="note-empty-state">
                  <div className="empty-icon">📄</div>
                  <p>选择一个笔记开始编辑，或创建新笔记</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default NoteApp;
