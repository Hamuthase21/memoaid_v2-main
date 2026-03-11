import { useState } from 'react';
import { Search, Plus, Filter } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { NoteCard } from './NoteCard';
import { AddNoteModal } from './AddNoteModal';

export const NotesList = () => {
  const { notes, searchNotes } = useData();
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'text' | 'audio' | 'image'>('all');

  const filteredNotes = searchQuery
    ? searchNotes(searchQuery)
    : filterType === 'all'
    ? notes
    : notes.filter((note) => note.type === filterType);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your memories..."
            className="w-full pl-14 pr-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
          />
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-6 h-6" />
          Add Memory
        </button>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterType('all')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'all'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Filter className="w-5 h-5 inline mr-2" />
          All
        </button>
        <button
          onClick={() => setFilterType('text')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'text'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Text Notes
        </button>
        <button
          onClick={() => setFilterType('audio')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'audio'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Audio
        </button>
        <button
          onClick={() => setFilterType('image')}
          className={`px-5 py-3 rounded-xl font-semibold text-base whitespace-nowrap transition-all ${
            filterType === 'image'
              ? 'bg-emerald-500 text-white shadow-lg'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Images
        </button>
      </div>

      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-2xl font-bold text-gray-700 mb-2">No memories found</h3>
          <p className="text-gray-500 text-lg mb-6">
            {searchQuery
              ? 'Try a different search term'
              : 'Start adding memories to build your personal vault'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg inline-flex items-center gap-2"
            >
              <Plus className="w-6 h-6" />
              Add Your First Memory
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      )}

      {showAddModal && <AddNoteModal onClose={() => setShowAddModal(false)} />}
    </div>
  );
};
