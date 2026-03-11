import React, { useState, useEffect } from 'react';
import { useData } from '../contexts/DataContext';

const MemoBotModal: React.FC<{ onClose: () => void; action?: string; openFamily?: boolean; showRoutine?: boolean; onShowRoutine?: () => void }> = ({ onClose, action, openFamily, showRoutine, onShowRoutine }) => {
  const { people, addPerson, playVoice, playTTS, stopVoice } = useData() as any;
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [relation, setRelation] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // For repeating TTS when reminding family
  const [remindInterval, setRemindInterval] = useState<number | null>(null as any);

  useEffect(() => {
    return () => {
      if (remindInterval) window.clearInterval(remindInterval);
      stopVoice && stopVoice();
    };
  }, [remindInterval, stopVoice]);

  const startRemindFamily = () => {
    // If any person has audio avatar, play their audio in loop using playVoice
    const personWithAudio = people.find((p: any) => p.avatarUrl && (p.avatarType === 'audio' || p.avatarType === 'video'));
    if (personWithAudio && personWithAudio.avatarUrl) {
      playVoice(personWithAudio.avatarUrl, true);
      return;
    }
    // Use playTTS to repeat until stopped
    playTTS('This is a reminder for family. Please check your tasks.', 8000);
  };

  const stopReminders = () => {
    if (remindInterval) {
      window.clearInterval(remindInterval);
      setRemindInterval(null);
    }
    stopVoice && stopVoice();
  };

  const handleCallSon = () => {
    const son = people.find((p: any) => (p.relation || '').toLowerCase().includes('son') || (p.name || '').toLowerCase().includes('son'));
    if (son && son.phone) {
      window.location.href = `tel:${son.phone}`;
      onClose();
      return;
    }
    // If no people, prompt to add
    if (!people || people.length === 0) {
      setShowAddForm(true);
      return;
    }
    alert('No son with phone number found. Please add or edit a family member with phone.');
  };

  const handleAddPerson = () => {
    let avatarUrl: string | undefined = undefined;
    let avatarType: any = undefined;
    if (avatarFile) {
      avatarUrl = URL.createObjectURL(avatarFile);
      avatarType = avatarFile.type.startsWith('audio') ? 'audio' : avatarFile.type.startsWith('video') ? 'video' : 'image';
    }
    addPerson({ name: name.trim(), relation: relation.trim() || undefined, phone: phone.trim() || undefined, avatarUrl, avatarType });
    setName(''); setRelation(''); setPhone(''); setAvatarFile(null); setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">MemoBot</h3>
          <div className="flex items-center gap-2">
            <button onClick={stopReminders} className="px-3 py-1 border rounded text-sm">Stop voice</button>
            <button onClick={onClose} className="p-1">✕</button>
          </div>
        </div>

        <div className="space-y-4">
          {openFamily && (
            <div>
              <h4 className="font-semibold">Family Members</h4>
              <p className="text-sm text-gray-600">Add people so MemoBot can call or play their recording.</p>
              {people.length === 0 ? (
                <div className="mt-3">
                  <p className="text-sm text-gray-600">No family members yet. Add one below.</p>
                  <button onClick={() => setShowAddForm(true)} className="mt-2 px-3 py-2 bg-emerald-500 text-white rounded">Add family member</button>
                </div>
              ) : (
                <ul className="mt-3 space-y-2">
                  {people.map((p:any) => (
                    <li key={p.id} className="flex items-center gap-3">
                      {p.avatarUrl ? <img src={p.avatarUrl} className="w-10 h-10 rounded-full" /> : <div className="w-10 h-10 rounded-full bg-gray-100" />}
                      <div>
                        <div className="font-medium">{p.name}</div>
                        <div className="text-sm text-gray-600">{p.relation} {p.phone ? `• ${p.phone}` : ''}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {action === 'call-son' && (
            <div>
              <button onClick={handleCallSon} className="px-4 py-2 bg-emerald-500 text-white rounded">Call my son</button>
            </div>
          )}

          {action === 'remind-family' && (
            <div>
              <button onClick={startRemindFamily} className="px-4 py-2 bg-emerald-500 text-white rounded mr-2">Remind my family</button>
              <button onClick={stopReminders} className="px-4 py-2 border rounded">Stop</button>
            </div>
          )}

          {showRoutine && (
            <div>
              <button onClick={() => { onShowRoutine && onShowRoutine(); onClose(); }} className="px-4 py-2 bg-emerald-500 text-white rounded">Show my morning routine</button>
            </div>
          )}

          {showAddForm && (
            <div className="mt-2 p-3 border rounded">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full px-3 py-2 border rounded mb-2" />
              <input value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="Relation" className="w-full px-3 py-2 border rounded mb-2" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full px-3 py-2 border rounded mb-2" />
              <input type="file" accept="image/*,audio/*,video/*" onChange={(e) => setAvatarFile(e.target.files?.[0] || null)} />
              <div className="mt-3 flex gap-2">
                <button onClick={handleAddPerson} className="px-3 py-2 bg-emerald-500 text-white rounded">Save</button>
                <button onClick={() => setShowAddForm(false)} className="px-3 py-2 border rounded">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemoBotModal;
