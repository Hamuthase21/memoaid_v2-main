import React, { useState, useEffect } from 'react';
import { Phone, X, AlertCircle, Heart, User, Stethoscope, Edit2, Trash2, Plus } from 'lucide-react';
import { api } from '../api';

interface EmergencyContact {
    _id: string;
    name: string;
    relationship: string;
    phone: string;
    type: 'family' | 'doctor' | 'emergency_service' | 'other';
    priority: number;
    notes: string;
}

interface MedicalInfo {
    bloodType: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    emergencyNotes: string;
}

interface EmergencyModalProps {
    onClose: () => void;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ onClose }) => {
    const [contacts, setContacts] = useState<EmergencyContact[]>([]);
    const [medicalInfo, setMedicalInfo] = useState<MedicalInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [showContactForm, setShowContactForm] = useState(false);
    const [editingContactId, setEditingContactId] = useState<string | null>(null);
    const [contactForm, setContactForm] = useState({
        name: '',
        relationship: '',
        phone: '',
        type: 'family' as 'family' | 'doctor' | 'emergency_service' | 'other',
        priority: 0,
        notes: '',
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [contactsData, medicalData] = await Promise.all([
                api.emergency.contacts.getAll(),
                api.emergency.medicalInfo.get(),
            ]);
            setContacts(contactsData);
            setMedicalInfo(medicalData);
        } catch (error) {
            console.error('Error loading emergency data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const handleSaveContact = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingContactId) {
                await api.emergency.contacts.update(editingContactId, contactForm);
            } else {
                await api.emergency.contacts.create(contactForm);
            }
            setShowContactForm(false);
            setEditingContactId(null);
            setContactForm({ name: '', relationship: '', phone: '', type: 'family', priority: 0, notes: '' });
            loadData();
        } catch (error) {
            console.error('Error saving contact:', error);
        }
    };

    const handleEditContact = (contact: EmergencyContact) => {
        setEditingContactId(contact._id);
        setContactForm({
            name: contact.name,
            relationship: contact.relationship,
            phone: contact.phone,
            type: contact.type,
            priority: contact.priority,
            notes: contact.notes,
        });
        setShowContactForm(true);
    };

    const handleDeleteContact = async (id: string) => {
        if (confirm('Are you sure you want to delete this contact?')) {
            try {
                await api.emergency.contacts.delete(id);
                loadData();
            } catch (error) {
                console.error('Error deleting contact:', error);
            }
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'doctor':
                return <Stethoscope className="w-6 h-6" />;
            case 'family':
                return <User className="w-6 h-6" />;
            case 'emergency_service':
                return <AlertCircle className="w-6 h-6" />;
            default:
                return <Phone className="w-6 h-6" />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'doctor':
                return 'bg-blue-500';
            case 'family':
                return 'bg-green-500';
            case 'emergency_service':
                return 'bg-red-600';
            default:
                return 'bg-gray-500';
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999]">
                <div className="bg-white rounded-3xl p-8">
                    <p className="text-xl">Loading emergency information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[9999] p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-3xl sticky top-0 z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-10 h-10 text-white" />
                            <h2 className="text-3xl font-bold text-white">Emergency</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition"
                        >
                            <X className="w-8 h-8" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Emergency Contacts */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                                <Phone className="w-6 h-6 text-red-500" />
                                Emergency Contacts
                            </h3>
                            <button
                                onClick={() => {
                                    setShowContactForm(true);
                                    setEditingContactId(null);
                                    setContactForm({ name: '', relationship: '', phone: '', type: 'family', priority: 0, notes: '' });
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm"
                            >
                                <Plus className="w-4 h-4" />
                                Add Contact
                            </button>
                        </div>
                        {contacts.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-xl">
                                <p className="text-gray-500">No emergency contacts added yet</p>
                                <p className="text-sm text-gray-400 mt-2">Click "Add Contact" to get started</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {contacts.map((contact) => (
                                    <div
                                        key={contact._id}
                                        className="w-full bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-4 border-2 border-gray-200"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`${getTypeColor(contact.type)} text-white p-3 rounded-full`}>
                                                {getTypeIcon(contact.type)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-xl font-bold text-gray-800">{contact.name}</p>
                                                <p className="text-sm text-gray-600">{contact.relationship}</p>
                                                <p className="text-2xl font-mono font-bold text-red-600 mt-1">{contact.phone}</p>
                                                {contact.notes && (
                                                    <p className="text-xs text-gray-500 mt-1">{contact.notes}</p>
                                                )}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleCall(contact.phone)}
                                                    className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                                                    title="Call"
                                                >
                                                    <Phone className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditContact(contact)}
                                                    className="p-3 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition"
                                                    title="Edit"
                                                >
                                                    <Edit2 className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContact(contact._id)}
                                                    className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Medical Information */}
                    {medicalInfo && (
                        <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
                            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Heart className="w-6 h-6 text-blue-600" />
                                Medical Information
                            </h3>
                            <div className="space-y-3 text-sm">
                                {medicalInfo.bloodType && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Blood Type:</span>
                                        <span className="ml-2 text-gray-900 font-bold">{medicalInfo.bloodType}</span>
                                    </div>
                                )}
                                {medicalInfo.allergies && medicalInfo.allergies.length > 0 && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Allergies:</span>
                                        <span className="ml-2 text-red-600 font-semibold">{medicalInfo.allergies.join(', ')}</span>
                                    </div>
                                )}
                                {medicalInfo.conditions && medicalInfo.conditions.length > 0 && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Conditions:</span>
                                        <span className="ml-2 text-gray-900">{medicalInfo.conditions.join(', ')}</span>
                                    </div>
                                )}
                                {medicalInfo.medications && medicalInfo.medications.length > 0 && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Medications:</span>
                                        <span className="ml-2 text-gray-900">{medicalInfo.medications.join(', ')}</span>
                                    </div>
                                )}
                                {medicalInfo.emergencyNotes && (
                                    <div>
                                        <span className="font-semibold text-gray-700">Notes:</span>
                                        <p className="mt-1 text-gray-900">{medicalInfo.emergencyNotes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* I'm OK Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl text-xl transition-all shadow-lg"
                    >
                        I'm OK - Close
                    </button>
                </div>
            </div>

            {/* Contact Form Modal */}
            {showContactForm && (
                <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-[10000] p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold">
                                {editingContactId ? 'Edit Contact' : 'Add Contact'}
                            </h3>
                            <button
                                onClick={() => {
                                    setShowContactForm(false);
                                    setEditingContactId(null);
                                }}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSaveContact} className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Phone *</label>
                                <input
                                    type="tel"
                                    required
                                    value={contactForm.phone}
                                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Relationship</label>
                                <input
                                    type="text"
                                    value={contactForm.relationship}
                                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    placeholder="e.g., Son, Doctor, etc."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                                <select
                                    value={contactForm.type}
                                    onChange={(e) => setContactForm({ ...contactForm, type: e.target.value as any })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="family">Family</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="emergency_service">Emergency Service</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Notes</label>
                                <textarea
                                    value={contactForm.notes}
                                    onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    rows={2}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowContactForm(false);
                                        setEditingContactId(null);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                                >
                                    {editingContactId ? 'Update' : 'Add'} Contact
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmergencyModal;
