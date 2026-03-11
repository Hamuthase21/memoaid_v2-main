/**
 * Add sample emergency contacts and medical info
 * Run this in the browser console after logging in
 */

const API_BASE = 'http://10.133.243.127:5000/api';
const token = localStorage.getItem('authToken');

if (!token) {
    console.error('❌ Not logged in! Please log in first.');
} else {
    console.log('🚨 Adding sample emergency contacts...\n');

    const sampleContacts = [
        {
            name: 'Dr. Sharma',
            relationship: 'Family Doctor',
            phone: '+91-98765-43210',
            type: 'doctor',
            priority: 10,
            notes: 'Available Mon-Sat, 9 AM - 6 PM'
        },
        {
            name: 'Rajesh (Son)',
            relationship: 'Son',
            phone: '+91-98765-11111',
            type: 'family',
            priority: 9,
            notes: 'Call anytime for emergencies'
        },
        {
            name: 'Meera (Daughter)',
            relationship: 'Daughter',
            phone: '+91-98765-22222',
            type: 'family',
            priority: 9,
            notes: 'Lives nearby, can come quickly'
        },
        {
            name: 'Ambulance - 108',
            relationship: 'Emergency Service',
            phone: '108',
            type: 'emergency_service',
            priority: 10,
            notes: 'Free emergency ambulance service'
        },
        {
            name: 'Police - 100',
            relationship: 'Emergency Service',
            phone: '100',
            type: 'emergency_service',
            priority: 8,
            notes: 'Police emergency hotline'
        }
    ];

    const medicalInfo = {
        bloodType: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        conditions: ['Hypertension', 'Type 2 Diabetes'],
        medications: ['Metformin 500mg', 'Amlodipine 5mg'],
        emergencyNotes: 'Wears hearing aid. May need extra time to respond.'
    };

    // Add contacts
    Promise.all(sampleContacts.map(contact =>
        fetch(`${API_BASE}/emergency/contacts`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(contact)
        })
    ))
        .then(responses => Promise.all(responses.map(r => r.json())))
        .then(contacts => {
            console.log(`✅ Added ${contacts.length} emergency contacts`);
            contacts.forEach((c, i) => {
                console.log(`   ${i + 1}. ${c.name} - ${c.phone}`);
            });

            // Add medical info
            return fetch(`${API_BASE}/emergency/medical-info`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(medicalInfo)
            });
        })
        .then(response => response.json())
        .then(medical => {
            console.log('\n✅ Added medical information');
            console.log(`   Blood Type: ${medical.bloodType}`);
            console.log(`   Allergies: ${medical.allergies.join(', ')}`);
            console.log(`   Conditions: ${medical.conditions.join(', ')}`);
            console.log('\n🎉 Emergency setup complete!');
            console.log('💡 Click the red SOS button (top-left) to test!');
        })
        .catch(error => {
            console.error('❌ Error:', error);
        });
}
