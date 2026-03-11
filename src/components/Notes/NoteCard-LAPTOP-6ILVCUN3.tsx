import { useState, useRef } from 'react';
import { Type, Mic, Image as ImageIcon, Tag, Clock, Bell, Video, Play, Pause } from 'lucide-react';
import { Note } from '../../types';
import { useData } from '../../contexts/DataContext';
import { ReminderModal } from '../Reminders/ReminderModal';
import { AddNoteModal } from './AddNoteModal';

interface NoteCardProps {
  note: Note;
}

export const NoteCard = ({ note }: NoteCardProps) => {
  const { deleteNote } = useData();
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this memory?')) {
      deleteNote(note.id);
    }
  };

  const getIcon = () => {
    switch (note.type) {
      case 'text':
        return <Type className="w-6 h-6" />;
      case 'audio':
        return <Mic className="w-6 h-6" />;
      case 'image':
        return <ImageIcon className="w-6 h-6" />;
      case 'video':
        return <Video className="w-6 h-6" />;
    }
  };
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'audio' | null>(null);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isTextOnly = note.type === 'text';

  return (
    <>
      <div className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all p-6 border-2 border-gray-100 hover:border-emerald-200 relative flex flex-col ${isTextOnly ? 'min-h-[140px]' : 'min-h-[260px]'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
              {getIcon()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">{note.title}</h3>
              <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
                <Clock className="w-4 h-4" />
                <span>{formatDate(note.timestamp)}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={() => setShowReminderModal(true)}
              className="p-1 hover:bg-emerald-50 rounded-md transition-colors text-emerald-600"
              title="Set reminder"
            >
              <Bell className="w-4 h-4" />
            </button>
            <button onClick={() => setShowEditModal(true)} className="p-1 hover:bg-emerald-50 rounded-md transition-colors text-emerald-600" title="Edit note">
              <Tag className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex-1">
          {note.content && note.type === 'text' && (
            <p className="text-gray-700 text-base mb-4 leading-relaxed">{note.content}</p>
          )}

          {note.mediaUrl && note.type === 'image' && (
            <img
              src={note.mediaUrl}
              alt={note.title}
              className="w-full rounded-xl mb-4 h-40 object-cover cursor-pointer"
              onClick={() => { setPreviewSrc(note.mediaUrl!); setPreviewType('image'); }}
            />
          )}

          {note.mediaUrl && note.type === 'video' && (
            <div className="mb-4">
              <div className="relative rounded-xl overflow-hidden h-40">
                <video
                  className="w-full h-full object-cover cursor-pointer"
                  src={note.mediaUrl}
                  controls={false}
                  onClick={() => { setPreviewSrc(note.mediaUrl!); setPreviewType('video'); }}
                />
                <button onClick={() => { setPreviewSrc(note.mediaUrl!); setPreviewType('video'); }} className="absolute inset-0 m-auto w-12 h-12 text-white bg-black/40 rounded-full flex items-center justify-center">
                  <Play className="w-6 h-6" />
                </button>
              </div>
            </div>
          )}

          {note.mediaUrl && note.type === 'audio' && (
            <div className="mb-4">
              <audio ref={audioRef} src={note.mediaUrl} />
            </div>
          )}

          {note.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-gray-400" />
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-sm font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between mt-4">
          <div>
            {/* empty left area for balance */}
          </div>
          <div className="flex items-center gap-3">
            {note.type === 'audio' && (
              <button
                onClick={async () => {
                  if (!audioRef.current) return;
                  try {
                    if (isPlaying) {
                      audioRef.current.pause();
                      audioRef.current.currentTime = 0;
                      setIsPlaying(false);
                    } else {
                      await audioRef.current.play();
                      setIsPlaying(true);
                      audioRef.current.onended = () => setIsPlaying(false);
                    }
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="text-sm px-3 py-1 border rounded bg-white"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            )}
            {note.type === 'video' && (
              <button onClick={() => { setPreviewSrc(note.mediaUrl!); setPreviewType('video'); }} className="text-sm px-3 py-1 border rounded bg-white">Play</button>
            )}
            <button onClick={handleDelete} className="text-sm px-3 py-1 border rounded text-red-600">Delete</button>
          </div>
        </div>
      </div>

      {showReminderModal && (
        <ReminderModal noteId={note.id} onClose={() => setShowReminderModal(false)} />
      )}
      {showEditModal && (
        <AddNoteModal onClose={() => setShowEditModal(false)} existing={note} />
      )}
      {previewSrc && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-4">
            <div className="flex justify-end">
              <button onClick={() => { setPreviewSrc(null); setPreviewType(null); }} className="p-2">Close</button>
            </div>
            <div>
              {previewType === 'image' && <img src={previewSrc} className="w-full rounded" />}
              {previewType === 'video' && <video src={previewSrc} controls className="w-full rounded" />}
              {previewType === 'audio' && <audio src={previewSrc} controls className="w-full" />}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
