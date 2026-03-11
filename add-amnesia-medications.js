import fetch from 'node-fetch';

const API_BASE = 'http://10.133.243.127:5000/api';

// You'll need to replace this with a valid auth token from your logged-in user
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN_HERE';

const amnesiaRelatedMedications = [
    {
        name: 'Donepezil (Aricept)',
        dosage: '5mg tablet',
        frequency: 'Once daily at bedtime',
        notes: 'Used to treat memory loss and cognitive decline in Alzheimer\'s disease and dementia. Start with 5mg, may increase to 10mg after 4-6 weeks. Take with food to reduce stomach upset.',
        refillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        enabled: true
    },
    {
        name: 'Memantine (Namenda)',
        dosage: '10mg tablet',
        frequency: 'Twice daily (morning and evening)',
        notes: 'Used for moderate to severe Alzheimer\'s disease to improve memory, awareness, and daily function. Can be taken with or without food. Drink plenty of water.',
        refillDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        enabled: true
    }
];

async function addMedications() {
    console.log('🏥 Adding amnesia-related medications...\n');

    if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN_HERE') {
        console.error('❌ ERROR: Please update the AUTH_TOKEN in this script first!');
        console.log('\nTo get your auth token:');
        console.log('1. Open your browser and log into the app');
        console.log('2. Open Developer Tools (F12)');
        console.log('3. Go to Console tab');
        console.log('4. Type: localStorage.getItem("authToken")');
        console.log('5. Copy the token and paste it in this script\n');
        return;
    }

    for (const medication of amnesiaRelatedMedications) {
        try {
            const response = await fetch(`${API_BASE}/medications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${AUTH_TOKEN}`
                },
                body: JSON.stringify(medication)
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`HTTP ${response.status}: ${error}`);
            }

            const result = await response.json();
            console.log(`✅ Added: ${medication.name}`);
            console.log(`   Dosage: ${medication.dosage}`);
            console.log(`   Frequency: ${medication.frequency}\n`);
        } catch (error) {
            console.error(`❌ Failed to add ${medication.name}:`, error.message);
        }
    }

    console.log('✨ Done! Check your Medication Panel to see the new medications.');
}

addMedications();
