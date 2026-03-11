import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
// no auth needed for local-only avatar saves
import { X, Edit, UserPlus, Trash2, Mic } from 'lucide-react';
import RecorderControl from './RecorderControl';

export const PeoplePanel: React.FC = () => {
  const { people, addPerson, updatePerson, deletePerson, addNote, notes } = useData();
  // user not needed for local-only saves
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [recordingFor, setRecordingFor] = useState<string | null>(null);

  const openEdit = (id: string) => {
    const p = people.find((x) => x.id === id);
    if (!p) return;
    setEditingId(id);
    setName(p.name);
    setRelation(p.relation || '');
    setAvatarPreview(p.avatarUrl || null);
    setAvatarFile(null);
    setPhone((p as any).phone || '');
    setShowAdd(true);
  };

  const handleSave = async () => {
    if (!name.trim()) return;
    setUploadProgress(null);
    try {
      let finalUrl = avatarPreview || undefined;
      let finalType: 'image' | 'video' | 'audio' | 'unknown' | undefined = undefined;
      if (avatarFile) {
        // Convert the selected/recorded file to a base64 data URL so it persists locally.
        const toDataUrl = (file: File) => new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onerror = () => reject(new Error('File read error'));
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        try {
          const dataUrl = await toDataUrl(avatarFile);
          finalUrl = dataUrl;
        } catch (err) {
          console.error('Failed to read avatar file as data URL', err);
          if (avatarPreview) finalUrl = avatarPreview;
        }
        if (avatarFile.type.startsWith('video')) finalType = 'video';
        else if (avatarFile.type.startsWith('audio')) finalType = 'audio';
        else if (avatarFile.type.startsWith('image')) finalType = 'image';
        else finalType = 'unknown';
      } else if (avatarPreview) {
        // try to infer type from preview URL
        if (avatarPreview.endsWith('.mp4')) finalType = 'video';
        else finalType = 'image';
      }

      if (editingId) {
        updatePerson(editingId, { name: name.trim(), relation: relation.trim() || undefined, avatarUrl: finalUrl || undefined, avatarType: finalType || undefined, phone: phone.trim() || undefined });
      } else {
        addPerson({ name: name.trim(), relation: relation.trim() || undefined, avatarUrl: finalUrl || undefined, avatarType: finalType || undefined, phone: phone.trim() || undefined });
      }
    } catch (e) {
      // ignore upload errors for now but clear progress
      // eslint-disable-next-line no-console
      console.error('Avatar upload error', e);
    } finally {
      setShowAdd(false);
      setEditingId(null);
      setName('');
      setRelation('');
      setAvatarFile(null);
      setAvatarPreview(null);
      setPhone('');
      setUploadProgress(null);
    }
  };

  const handleFile = (f?: File) => {
    if (!f) return;
    setAvatarFile(f);
    const url = URL.createObjectURL(f);
    setAvatarPreview(url);
  };

  const handleVoiceRecorded = async (personId: string, blob: Blob) => {
    const person = people.find(p => p.id === personId);
    if (!person) return;
    
    // Convert blob to data URL
    const toDataUrl = (blob: Blob) => new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error('File read error'));
      reader.onload = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
    
    try {
      const dataUrl = await toDataUrl(blob);
      // Create a voice note for this person
      addNote({
        title: `Voice note for ${person.name}`,
        content: '',
        type: 'audio',
        tags: [person.name],
        mediaUrl: dataUrl
      });
      setRecordingFor(null);
    } catch (err) {
      console.error('Failed to process voice recording', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">My People</h3>
        <button
          onClick={() => { setShowAdd(true); setEditingId(null); setName(''); setRelation(''); }}
          className="bg-emerald-500 text-white px-3 py-1 rounded-md flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" /> Add
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {people.map((p) => (
          <div key={p.id} className="bg-emerald-50 rounded-lg p-3 flex flex-col items-center gap-2">
            {p.avatarUrl ? (
              p.avatarType === 'video' ? (
                <div className="w-16 h-16 rounded-full bg-black overflow-hidden relative">
                  <img src="/play-overlay.png" alt="play" className="absolute inset-0 m-auto w-8 h-8 z-10" />
                  <video src={p.avatarUrl} className="w-full h-full object-cover opacity-60" muted playsInline />
                </div>
              ) : p.avatarType === 'audio' ? (
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <audio controls src={p.avatarUrl} />
                </div>
              ) : (
                <img src={p.avatarUrl} className="w-16 h-16 rounded-full object-cover" />
              )
            ) : (
              <div className="w-16 h-16 rounded-full bg-gray-200" />
            )}
            <div className="text-sm font-medium">{p.name}</div>
            <div className="text-xs text-gray-600">{p.relation}</div>
            {recordingFor === p.id && (
              <div className="mt-2">
                <RecorderControl onRecorded={(blob) => handleVoiceRecorded(p.id, blob)} />
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button onClick={() => setRecordingFor(recordingFor === p.id ? null : p.id)} className="p-1 hover:bg-white/20 rounded" title="Record voice note">
                <Mic className="w-4 h-4" />
              </button>
              <button onClick={() => openEdit(p.id)} className="p-1 hover:bg-white/20 rounded"><Edit className="w-4 h-4" /></button>
              <button onClick={() => { if(confirm('Delete person?')) deletePerson(p.id); }} className="p-1 hover:bg-white/20 rounded text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
            
            {/* Voice recordings for this person */}
            {(() => {
              const personVoiceNotes = notes.filter(note => note.type === 'audio' && note.tags.includes(p.name));
              if (personVoiceNotes.length > 0) {
                return (
                  <div className="mt-3 w-full">
                    <div className="text-xs text-gray-500 mb-1">Voice Notes:</div>
                    <div className="space-y-1">
                      {personVoiceNotes.slice(0, 2).map(note => (
                        <audio key={note.id} controls className="w-full h-6" src={note.mediaUrl} />
                      ))}
                      {personVoiceNotes.length > 2 && (
                        <div className="text-xs text-gray-400">+{personVoiceNotes.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="mt-4 bg-white rounded-lg p-4 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">{editingId ? 'Edit Person' : 'Add Person'}</h4>
            <button onClick={() => setShowAdd(false)} className="p-1"><X className="w-4 h-4" /></button>
          </div>
          <div className="space-y-3">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border rounded" />
            <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Relation (e.g. Mom)" className="w-full px-3 py-2 border rounded" />
            <div>
              <label className="text-sm block mb-1">Avatar (image, video or audio)</label>
              <input type="file" accept="image/*,video/*,audio/*" onChange={(e) => handleFile(e.target.files?.[0])} />
              {avatarPreview && (
                <div className="mt-2">
                  {avatarPreview.endsWith('.mp4') || (avatarFile && avatarFile.type.startsWith('video')) ? (
                    <video src={avatarPreview} className="w-24 h-24 object-cover rounded" controls />
                  ) : (
                    <img src={avatarPreview} className="w-24 h-24 object-cover rounded" />
                  )}
                </div>
              )}
              {uploadProgress !== null && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                    <div className="bg-emerald-500 h-2" style={{ width: `${uploadProgress}%` }} />
                  </div>
                  <div className="text-xs text-gray-600 mt-1">Uploading: {uploadProgress}%</div>
                </div>
              )}
              <div className="mt-3">
                <label className="text-sm block mb-1">Or record a voice</label>
                <RecorderControl onRecorded={(blob) => { const url = URL.createObjectURL(blob); setAvatarPreview(url); setAvatarFile(new File([blob], 'recording.webm')); }} />
              </div>
            </div>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone (for quick call)" className="w-full px-3 py-2 border rounded" />
            <div className="flex gap-2">
              <button onClick={handleSave} className="bg-emerald-500 text-white px-4 py-2 rounded">Save</button>
              <button onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PeoplePanel;
