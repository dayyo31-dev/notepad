import { useState } from 'react';
import {
  BookOpen, Book, Tag, Pin, Search, Plus, Trash2,
  ChevronDown, ChevronRight, LogOut, User,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Sidebar({
  notebooks, tags, filter, setFilter,
  onCreateNotebook, onDeleteNotebook,
  onCreateTag, onDeleteTag,
  totalNotes, pinnedCount,
}) {
  const { user, logout } = useAuth();
  const [notebooksOpen, setNotebooksOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(true);
  const [showTagInput, setShowTagInput] = useState(false);
  const [tagName, setTagName] = useState('');
  const [showNotebookInput, setShowNotebookInput] = useState(false);
  const [notebookName, setNotebookName] = useState('');

  const handleCreateNotebook = (e) => {
    e.preventDefault();
    if (!notebookName.trim()) return;
    onCreateNotebook(notebookName.trim());
    setNotebookName('');
    setShowNotebookInput(false);
  };

  const handleCreateTag = (e) => {
    e.preventDefault();
    if (!tagName.trim()) return;
    onCreateTag(tagName.trim());
    setTagName('');
    setShowTagInput(false);
  };

  const navItem = (key, label, icon, count) => {
    const active = filter.type === key && !filter.id;
    return (
      <button
        key={key}
        onClick={() => setFilter({ type: key })}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition ${
          active ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-300 hover:bg-white/10'
        }`}
      >
        <span className="flex items-center gap-2.5">
          {icon}
          {label}
        </span>
        <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-cyan-400/30 text-cyan-300' : 'bg-white/10 text-slate-400'}`}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div className="w-56 flex-shrink-0 bg-slate-900 flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cyan-400 rounded-lg flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-slate-900" />
          </div>
          <span className="font-bold text-white text-base">내 메모장</span>
        </div>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-white/10">
        <button
          onClick={() => setFilter({ type: 'search' })}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
            filter.type === 'search' ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
          }`}
        >
          <Search className="w-4 h-4" />
          검색
        </button>
      </div>

      {/* Nav */}
      <div className="p-3 space-y-1 border-b border-white/10">
        {navItem('all', '모든 노트', <Book className="w-4 h-4" />, totalNotes)}
        {navItem('pinned', '고정된 노트', <Pin className="w-4 h-4" />, pinnedCount)}
      </div>

      {/* Notebooks */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setNotebooksOpen(!notebooksOpen)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
          >
            {notebooksOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            노트북
          </button>
          <button
            onClick={() => setShowNotebookInput(true)}
            className="text-slate-500 hover:text-cyan-400 transition"
            title="노트북 추가"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showNotebookInput && (
          <form onSubmit={handleCreateNotebook} className="mt-2">
            <input
              autoFocus
              value={notebookName}
              onChange={(e) => setNotebookName(e.target.value)}
              onBlur={() => { setShowNotebookInput(false); setNotebookName(''); }}
              placeholder="노트북 이름"
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </form>
        )}

        {notebooksOpen && (
          <div className="mt-1 space-y-0.5">
            {notebooks.map((nb) => {
              const active = filter.type === 'notebook' && filter.id === nb.id;
              return (
                <div key={nb.id} className="group flex items-center">
                  <button
                    onClick={() => setFilter({ type: 'notebook', id: nb.id, name: nb.name })}
                    className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded text-xs transition ${
                      active ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="truncate">{nb.name}</span>
                    <span className="text-slate-500 ml-1">{nb._count?.notes ?? 0}</span>
                  </button>
                  <button
                    onClick={() => onDeleteNotebook(nb.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="p-3 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <button
            onClick={() => setTagsOpen(!tagsOpen)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-400 uppercase tracking-wider hover:text-slate-200 transition"
          >
            {tagsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            태그
          </button>
          <button
            onClick={() => setShowTagInput(true)}
            className="text-slate-500 hover:text-cyan-400 transition"
            title="태그 추가"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>

        {showTagInput && (
          <form onSubmit={handleCreateTag} className="mt-2">
            <input
              autoFocus
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              onBlur={() => { setShowTagInput(false); setTagName(''); }}
              placeholder="태그 이름"
              className="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </form>
        )}

        {tagsOpen && (
          <div className="mt-1 space-y-0.5">
            {tags.map((tag) => {
              const active = filter.type === 'tag' && filter.id === tag.id;
              return (
                <div key={tag.id} className="group flex items-center">
                  <button
                    onClick={() => setFilter({ type: 'tag', id: tag.id, name: tag.name })}
                    className={`flex-1 flex items-center justify-between px-2 py-1.5 rounded text-xs transition ${
                      active ? 'bg-cyan-400/20 text-cyan-400' : 'text-slate-300 hover:bg-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Tag className="w-3 h-3" style={{ color: tag.color }} />
                      <span className="truncate">{tag.name}</span>
                    </span>
                    <span className="text-slate-500">{tag._count?.notes ?? 0}</span>
                  </button>
                  <button
                    onClick={() => onDeleteTag(tag.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-600 hover:text-red-400 transition p-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-cyan-400/20 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <span className="text-xs text-slate-300 truncate flex-1">{user?.name}</span>
          <button onClick={logout} className="text-slate-500 hover:text-red-400 transition" title="로그아웃">
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
