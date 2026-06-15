import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import { Plus, Pin, Search, FileText } from 'lucide-react';

function stripHtml(html) {
  if (!html) return '';
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

export default function NoteList({
  notes, selectedId, onSelect, onCreateNote, filter,
  searchQuery, onSearchChange,
}) {
  const title = filter.type === 'all' ? '모든 노트'
    : filter.type === 'pinned' ? '고정된 노트'
    : filter.type === 'search' ? '검색'
    : filter.name || '노트';

  return (
    <div className="w-72 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onCreateNote}
            className="w-7 h-7 bg-cyan-500 hover:bg-cyan-400 text-white rounded-lg flex items-center justify-center transition"
            title="새 노트"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {filter.type === 'search' && (
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
            <input
              autoFocus
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-400 bg-gray-50"
            />
          </div>
        )}
      </div>

      {/* Note list */}
      <div className="flex-1 overflow-y-auto">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-400">
            <FileText className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">노트가 없습니다</p>
            <button
              onClick={onCreateNote}
              className="mt-2 text-xs text-cyan-500 hover:underline"
            >
              새 노트 만들기
            </button>
          </div>
        ) : (
          notes.map((note) => (
            <button
              key={note.id}
              onClick={() => onSelect(note)}
              className={`w-full text-left px-4 py-3 border-b border-gray-100 transition hover:bg-gray-50 ${
                selectedId === note.id ? 'bg-cyan-50 border-l-2 border-l-cyan-400' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className={`text-sm font-medium truncate flex-1 ${
                  selectedId === note.id ? 'text-cyan-700' : 'text-gray-800'
                }`}>
                  {note.title || '제목 없음'}
                </p>
                {note.isPinned && <Pin className="w-3 h-3 text-cyan-500 flex-shrink-0 mt-0.5" />}
              </div>
              <p className="text-xs text-gray-400 truncate mb-1.5">
                {stripHtml(note.content) || '내용 없음'}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true, locale: ko })}
                </span>
                {note.notebook && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded truncate max-w-[80px]">
                    {note.notebook.name}
                  </span>
                )}
              </div>
              {note.tags?.length > 0 && (
                <div className="flex gap-1 mt-1.5 flex-wrap">
                  {note.tags.slice(0, 3).map(({ tag }) => (
                    <span
                      key={tag.id}
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: `${tag.color}22`, color: tag.color }}
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}
