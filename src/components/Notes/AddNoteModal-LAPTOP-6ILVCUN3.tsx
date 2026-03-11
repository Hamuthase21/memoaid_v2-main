import { useState } from 'react';
import { X, Type, Mic, Image as ImageIcon, Tag, Plus } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';

interface AddNoteModalProps {
  onClose: () => void;
  existing?: any;
}

export const AddNoteModal = ({ onClose, existing }: AddNoteModalProps) => {
  const { addNote, updateNote } = useData() as any;
  const { user } = useAuth();
  const [title, setTitle] = useState(existing?.title || '');
  const [content, setContent] = useState(existing?.content || '');
  const [type, setType] = useState<'text' | 'audio' | 'image' | 'video'>(existing?.type || 'text');
  const [tags, setTags] = useState<string[]>(existing?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [mediaUrl, setMediaUrl] = useState(existing?.mediaUrl || '');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (existing) {
      updateNote(existing.id, { title: title.trim(), content: content.trim() || undefined, type, tags, mediaUrl: mediaUrl.trim() || undefined });
    } else {
      addNote({ title: title.trim(), content: content.trim() || undefined, type, tags, mediaUrl: mediaUrl.trim() || undefined });
    }
    onClose();
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setMediaUrl(url);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b-2 border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <h2 className="text-2xl font-bold text-gray-800">Add New Memory</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`flex-1 py-4 px-4 rounded-xl font-semibold text-lg transition-all ${
                type === 'text'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Type className="w-6 h-6 mx-auto mb-1" />
              Text
            </button>
            <button
              type="button"
              onClick={() => setType('audio')}
              className={`flex-1 py-4 px-4 rounded-xl font-semibold text-lg transition-all ${
                type === 'audio'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Mic className="w-6 h-6 mx-auto mb-1" />
              Audio
            </button>
            <button
              type="button"
              onClick={() => setType('image')}
              className={`flex-1 py-4 px-4 rounded-xl font-semibold text-lg transition-all ${
                type === 'image'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-6 h-6 mx-auto mb-1" />
              Image
            </button>
            <button
              type="button"
              onClick={() => setType('video')}
              className={`flex-1 py-4 px-4 rounded-xl font-semibold text-lg transition-all ${
                type === 'video'
                  ? 'bg-emerald-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <ImageIcon className="w-6 h-6 mx-auto mb-1" />
              Video
            </button>
          </div>

          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
              placeholder="What is this memory about?"
              required
            />
          </div>

          {type === 'text' && (
            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">
                Description
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors resize-none"
                placeholder="Add details to help you remember..."
                rows={6}
              />
            </div>
          )}

          {(type === 'audio' || type === 'image' || type === 'video') && (
            <div>
              <label className="block text-gray-700 text-lg font-semibold mb-2">
                Upload {type === 'audio' ? 'Audio' : type === 'image' ? 'Image' : 'Video'}
              </label>
              <input
                type="file"
                accept={type === 'audio' ? 'audio/*' : type === 'image' ? 'image/*' : 'video/*'}
                onChange={handleMediaUpload}
                className="w-full px-4 py-4 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-emerald-50 file:text-emerald-700 file:font-semibold hover:file:bg-emerald-100"
              />
              {mediaUrl && type === 'image' && (
                <img
                  src={mediaUrl}
                  alt="Preview"
                  className="mt-4 rounded-xl max-h-48 object-cover"
                />
              )}
              {mediaUrl && type === 'video' && (
                <video controls src={mediaUrl} className="mt-4 rounded-xl max-h-48" />
              )}
            </div>
          )}

          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              <Tag className="w-5 h-5 inline mr-2" />
              Tags
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors"
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-base font-medium"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-emerald-200 rounded-full p-1 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 px-6 bg-gray-200 text-gray-700 rounded-xl text-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 px-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl text-lg font-semibold hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
            >
              Save Memory
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
