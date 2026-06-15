import { useState, useEffect, useCallback } from 'react';
import client from '../api/client';
import Sidebar from '../components/Sidebar';
import NoteList from '../components/NoteList';
import NoteEditor from '../components/NoteEditor';

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [notebooks, setNotebooks] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [filter, setFilter] = useState({ type: 'all' });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNotebooks = useCallback(async () => {
    const res = await client.get('/notebooks');
    setNotebooks(res.data);
  }, []);

  const fetchTags = useCallback(async () => {
    const res = await client.get('/tags');
    setTags(res.data);
  }, []);

  const fetchNotes = useCallback(async () => {
    const params = {};
    if (filter.type === 'notebook' && filter.id) params.notebookId = filter.id;
    if (filter.type === 'tag' && filter.id) params.tagId = filter.id;
    if (filter.type === 'pinned') params.pinned = 'true';
    if (filter.type === 'search' && searchQuery) params.search = searchQuery;

    const res = await client.get('/notes', { params });
    setNotes(res.data);
  }, [filter, searchQuery]);

  useEffect(() => {
    Promise.all([fetchNotebooks(), fetchTags(), fetchNotes()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const handleCreateNote = async () => {
    try {
      const data = { title: '제목 없음', content: '' };
      if (filter.type === 'notebook' && filter.id) data.notebookId = filter.id;
      if (filter.type === 'tag' && filter.id) data.tagIds = [filter.id];

      const res = await client.post('/notes', data);
      setNotes((prev) => [res.data, ...prev]);
      setSelectedNote(res.data);
      await fetchNotebooks();
      await fetchTags();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveNote = useCallback(async (changes) => {
    if (!selectedNote) return;
    try {
      const res = await client.put(`/notes/${selectedNote.id}`, changes);
      setSelectedNote(res.data);
      setNotes((prev) => prev.map((n) => (n.id === res.data.id ? res.data : n)));
      if (changes.notebookId !== undefined) fetchNotebooks();
      if (changes.tagIds !== undefined) fetchTags();
    } catch (err) {
      console.error(err);
    }
  }, [selectedNote]);

  const handleDeleteNote = async () => {
    if (!selectedNote) return;
    if (!window.confirm('이 노트를 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/notes/${selectedNote.id}`);
      setNotes((prev) => prev.filter((n) => n.id !== selectedNote.id));
      setSelectedNote(null);
      fetchNotebooks();
      fetchTags();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateNotebook = async (name) => {
    try {
      const res = await client.post('/notebooks', { name });
      setNotebooks((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotebook = async (id) => {
    if (!window.confirm('노트북을 삭제하시겠습니까? 노트는 삭제되지 않습니다.')) return;
    try {
      await client.delete(`/notebooks/${id}`);
      setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
      if (filter.type === 'notebook' && filter.id === id) setFilter({ type: 'all' });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTag = async (name) => {
    try {
      const res = await client.post('/tags', { name });
      setTags((prev) => [...prev, res.data]);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTag = async (id) => {
    if (!window.confirm('태그를 삭제하시겠습니까?')) return;
    try {
      await client.delete(`/tags/${id}`);
      setTags((prev) => prev.filter((t) => t.id !== id));
      if (filter.type === 'tag' && filter.id === id) setFilter({ type: 'all' });
      fetchNotes();
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchQuery('');
    setSelectedNote(null);
  };

  const pinnedCount = notes.filter((n) => n.isPinned).length;
  const totalNotes = notebooks.reduce((acc, nb) => acc + (nb._count?.notes ?? 0), 0);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar
        notebooks={notebooks}
        tags={tags}
        filter={filter}
        setFilter={handleFilterChange}
        onCreateNotebook={handleCreateNotebook}
        onDeleteNotebook={handleDeleteNotebook}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
        totalNotes={notes.length}
        pinnedCount={pinnedCount}
      />
      <NoteList
        notes={notes}
        selectedId={selectedNote?.id}
        onSelect={setSelectedNote}
        onCreateNote={handleCreateNote}
        filter={filter}
        searchQuery={searchQuery}
        onSearchChange={(q) => { setSearchQuery(q); }}
      />
      <NoteEditor
        note={selectedNote}
        notebooks={notebooks}
        tags={tags}
        onSave={handleSaveNote}
        onDelete={handleDeleteNote}
        onUpdate={setSelectedNote}
      />
    </div>
  );
}
