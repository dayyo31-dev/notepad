import { useEffect, useState, useCallback, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Link from '@tiptap/extension-link';
import {
  Bold, Italic, UnderlineIcon, Strikethrough, Code, Highlighter,
  List, ListOrdered, CheckSquare, Quote, Minus, Link2,
  Heading1, Heading2, Heading3, Undo, Redo,
  Pin, PinOff, Trash2, Book, Tag, X, ChevronDown,
} from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

export default function NoteEditor({
  note, notebooks, tags, onSave, onDelete, onUpdate,
}) {
  const [title, setTitle] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [selectedNotebook, setSelectedNotebook] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [showNotebookPicker, setShowNotebookPicker] = useState(false);
  const [showTagPicker, setShowTagPicker] = useState(false);
  const saveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Highlight.configure({ multicolor: false }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Link.configure({ openOnClick: false }),
    ],
    content: '',
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[400px] px-8 py-6',
      },
    },
    onUpdate: ({ editor }) => {
      if (isFirstLoad.current) return;
      scheduleSave({ content: editor.getHTML() });
    },
  });

  const scheduleSave = useCallback((changes) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onSave(changes);
    }, 800);
  }, [onSave]);

  useEffect(() => {
    if (!note || !editor) return;
    isFirstLoad.current = true;
    setTitle(note.title === '제목 없음' ? '' : note.title);
    setIsPinned(note.isPinned);
    setSelectedNotebook(note.notebook || null);
    setSelectedTags(note.tags?.map(({ tag }) => tag) || []);
    editor.commands.setContent(note.content || '');
    setTimeout(() => { isFirstLoad.current = false; }, 100);
  }, [note?.id]);

  useEffect(() => {
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, []);

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Book className="w-8 h-8 opacity-40" />
          </div>
          <p className="text-lg font-medium">노트를 선택하세요</p>
          <p className="text-sm mt-1">왼쪽 목록에서 노트를 선택하거나 새 노트를 만드세요</p>
        </div>
      </div>
    );
  }

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    scheduleSave({ title: e.target.value || '제목 없음' });
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      editor?.commands.focus();
    }
  };

  const handleTogglePin = () => {
    const newPinned = !isPinned;
    setIsPinned(newPinned);
    onSave({ isPinned: newPinned });
  };

  const handleNotebookSelect = (nb) => {
    setSelectedNotebook(nb);
    setShowNotebookPicker(false);
    onSave({ notebookId: nb?.id || null });
  };

  const handleTagToggle = (tag) => {
    const exists = selectedTags.find((t) => t.id === tag.id);
    let newTags;
    if (exists) {
      newTags = selectedTags.filter((t) => t.id !== tag.id);
    } else {
      newTags = [...selectedTags, tag];
    }
    setSelectedTags(newTags);
    onSave({ tagIds: newTags.map((t) => t.id) });
  };

  const ToolbarBtn = ({ onClick, active, title: t, children }) => (
    <button
      onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      title={t}
      className={`p-1.5 rounded transition ${
        active ? 'bg-cyan-100 text-cyan-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>수정: {format(new Date(note.updatedAt), 'yyyy.MM.dd HH:mm', { locale: ko })}</span>

          {/* Notebook picker */}
          <div className="relative">
            <button
              onClick={() => { setShowNotebookPicker(!showNotebookPicker); setShowTagPicker(false); }}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
            >
              <Book className="w-3 h-3" />
              <span>{selectedNotebook?.name || '노트북 없음'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showNotebookPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px] py-1">
                <button
                  onClick={() => handleNotebookSelect(null)}
                  className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 text-gray-500"
                >
                  없음
                </button>
                {notebooks.map((nb) => (
                  <button
                    key={nb.id}
                    onClick={() => handleNotebookSelect(nb)}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-gray-50 ${
                      selectedNotebook?.id === nb.id ? 'text-cyan-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {nb.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tag picker */}
          <div className="relative">
            <button
              onClick={() => { setShowTagPicker(!showTagPicker); setShowNotebookPicker(false); }}
              className="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded transition"
            >
              <Tag className="w-3 h-3" />
              <span>{selectedTags.length > 0 ? `태그 ${selectedTags.length}개` : '태그'}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            {showTagPicker && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px] py-1">
                {tags.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">태그가 없습니다</p>
                ) : (
                  tags.map((tag) => {
                    const selected = selectedTags.find((t) => t.id === tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => handleTagToggle(tag)}
                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2"
                      >
                        <div
                          className={`w-3 h-3 rounded border flex items-center justify-center ${selected ? 'border-transparent' : 'border-gray-300'}`}
                          style={{ background: selected ? tag.color : 'transparent' }}
                        >
                          {selected && <X className="w-2 h-2 text-white" />}
                        </div>
                        <span style={{ color: tag.color }}>{tag.name}</span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleTogglePin}
            className={`p-1.5 rounded transition ${isPinned ? 'text-cyan-500 bg-cyan-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title={isPinned ? '고정 해제' : '고정'}
          >
            {isPinned ? <Pin className="w-4 h-4" /> : <PinOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition"
            title="삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tags display */}
      {selectedTags.length > 0 && (
        <div className="flex gap-1.5 px-8 py-2 border-b border-gray-100 flex-wrap">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
              style={{ background: `${tag.color}22`, color: tag.color }}
            >
              {tag.name}
              <button onClick={() => handleTagToggle(tag)}>
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <div className="px-8 pt-6 pb-2">
        <input
          value={title}
          onChange={handleTitleChange}
          onKeyDown={handleTitleKeyDown}
          placeholder="제목을 입력하세요..."
          className="w-full text-2xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none bg-transparent"
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-6 py-2 border-b border-gray-100 flex-wrap">
        <ToolbarBtn onClick={() => editor?.chain().focus().undo().run()} t="실행 취소"><Undo className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().redo().run()} t="다시 실행"><Redo className="w-4 h-4" /></ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()} active={editor?.isActive('heading', { level: 1 })}><Heading1 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()} active={editor?.isActive('heading', { level: 2 })}><Heading2 className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} active={editor?.isActive('heading', { level: 3 })}><Heading3 className="w-4 h-4" /></ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={editor?.isActive('bold')}><Bold className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleItalic().run()} active={editor?.isActive('italic')}><Italic className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleUnderline().run()} active={editor?.isActive('underline')}><UnderlineIcon className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleStrike().run()} active={editor?.isActive('strike')}><Strikethrough className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleHighlight().run()} active={editor?.isActive('highlight')}><Highlighter className="w-4 h-4" /></ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBulletList().run()} active={editor?.isActive('bulletList')}><List className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleOrderedList().run()} active={editor?.isActive('orderedList')}><ListOrdered className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleTaskList().run()} active={editor?.isActive('taskList')}><CheckSquare className="w-4 h-4" /></ToolbarBtn>
        <div className="w-px h-4 bg-gray-200 mx-1" />
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleBlockquote().run()} active={editor?.isActive('blockquote')}><Quote className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={editor?.isActive('code')}><Code className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn onClick={() => editor?.chain().focus().setHorizontalRule().run()}><Minus className="w-4 h-4" /></ToolbarBtn>
        <ToolbarBtn
          onClick={() => {
            const url = window.prompt('링크 URL:');
            if (url) editor?.chain().focus().setLink({ href: url }).run();
          }}
          active={editor?.isActive('link')}
        >
          <Link2 className="w-4 h-4" />
        </ToolbarBtn>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
