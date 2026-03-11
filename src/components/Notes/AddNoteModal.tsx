import { useState, useRef } from 'react';
import { X, Type, Mic, Image as ImageIcon, Video as VideoIcon, Tag, Plus, MapPin, Paperclip } from 'lucide-react';
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
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaData, setMediaData] = useState(() => {
    // For existing notes, use mediaData if it's a valid data URL, otherwise use mediaUrl
    const data = existing?.mediaData;
    if (data && data.startsWith('data:')) {
      return data;
    }
    return '';
  });
  const [location, setLocation] = useState(existing?.location || '');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  // Check if a URL is a valid data URL (not a blob URL)
  const isValidDataUrl = (url: string) => url && url.startsWith('data:');
  
  // Get the media source for preview - prefer mediaData (valid data URL)
  const getMediaSource = () => mediaData && isValidDataUrl(mediaData) ? mediaData : mediaUrl;

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>, mediaType: 'audio' | 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL for immediate display
      const previewUrl = URL.createObjectURL(file);
      setMediaUrl(previewUrl);
      
      // Convert file to Base64 for persistent storage
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setMediaData(base64String);
      };
      reader.readAsDataURL(file);
      setType(mediaType);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (existing) {
      updateNote(existing.id, { title: title.trim(), content: content.trim() || undefined, type, tags, mediaData: mediaData || undefined, location: location.trim() || undefined });
    } else {
      addNote({ title: title.trim(), content: content.trim() || undefined, type, tags, mediaData: mediaData || undefined, location: location.trim() || undefined });
    }
    onClose();
  };

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
          setLoadingLocation(false);
        },
        () => {
          setLoadingLocation(false);
          alert('Unable to get your location. Please enable location services.');
        }
      );
    } else {
      setLoadingLocation(false);
      alert('Geolocation is not supported by your browser.');
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
          {/* Title Input */}
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

          {/* Content/Text Area - Always Visible (Email Format) */}
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

          {/* Attachment Section - Like Email */}
          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-3">
              <Paperclip className="w-5 h-5 inline mr-2" />
              Attachments
            </label>
            
            {/* Hidden File Inputs */}
            <input
              ref={audioInputRef}
              type="file"
              accept="audio/*"
              onChange={(e) => handleMediaUpload(e, 'audio')}
              className="hidden"
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleMediaUpload(e, 'image')}
              className="hidden"
            />
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => handleMediaUpload(e, 'video')}
              className="hidden"
            />

            {/* Attachment Buttons */}
            <div className="flex gap-3 mb-4">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-semibold"
              >
                <ImageIcon className="w-5 h-5" />
                Image
              </button>
              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-semibold"
              >
                <Mic className="w-5 h-5" />
                Audio
              </button>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
              >
                <VideoIcon className="w-5 h-5" />
                Video
              </button>
            </div>

            {/* Media Preview */}
            {(mediaUrl || mediaData) && (
              <div className="mb-4">
                {type === 'image' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">📷 Image attached</p>
                    <img
                      src={getMediaSource()}
                      alt="Preview"
                      className="rounded-xl max-h-48 object-cover border-2 border-blue-200"
                    />
                  </div>
                )}
                {type === 'video' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">🎥 Video attached</p>
                    <video controls src={getMediaSource()} className="rounded-xl max-h-48 border-2 border-red-200 w-full" />
                  </div>
                )}
                {type === 'audio' && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">🎵 Audio attached</p>
                    <audio controls src={getMediaSource()} className="w-full border-2 border-purple-200 rounded-lg p-2" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => { setMediaUrl(''); setMediaData(''); setType('text'); }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  Remove attachment
                </button>
              </div>
            )}
          </div>

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

          <div>
            <label className="block text-gray-700 text-lg font-semibold mb-2">
              <MapPin className="w-5 h-5 inline mr-2" />
              Location
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1 px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:outline-none transition-colors"
                placeholder="Enter location or use current location..."
              />
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                disabled={loadingLocation}
                className="px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors disabled:bg-gray-400"
              >
                {loadingLocation ? 'Getting...' : 'Current'}
              </button>
            </div>
          </div>

          <div className="flex gap-3">
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
