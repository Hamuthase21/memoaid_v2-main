// BROWSER CONSOLE VERSION - Run this directly in your browser console while logged into the app
// Instructions:
// 1. Log into your MemoAid app
// 2. Open Developer Tools (F12)
// 3. Go to Console tab
// 4. Copy and paste this entire script
// 5. Press Enter

(async function addAmnesiaRelatedMedications() {
    const API_BASE = 'http://10.133.243.127:5000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error('❌ ERROR: You are not logged in! Please log in first.');
        return;
    }

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

    console.log('🏥 Adding amnesia-related medications...\n');

    for (const medication of amnesiaRelatedMedications) {
        try {
            const response = await fetch(`${API_BASE}/medications`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
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

    console.log('✨ Done! Refresh the page or navigate to the Medication Panel to see the new medications.');
})();
