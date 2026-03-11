/**
 * Import Sample Daily Routines to MongoDB via API
 * This script adds routines through the authenticated API so they persist in MongoDB
 * Run this in the browser console while logged in
 */

const sampleRoutines = [
    {
        "title": "Morning Medication",
        "time": new Date(new Date().setHours(8, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Breakfast Time",
        "time": new Date(new Date().setHours(8, 30, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Morning Walk",
        "time": new Date(new Date().setHours(9, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Mid-Morning Snack",
        "time": new Date(new Date().setHours(11, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Lunch Time",
        "time": new Date(new Date().setHours(13, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Afternoon Nap",
        "time": new Date(new Date().setHours(14, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Evening Tea",
        "time": new Date(new Date().setHours(16, 30, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Garden Watering",
        "time": new Date(new Date().setHours(18, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Evening Walk",
        "time": new Date(new Date().setHours(18, 30, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Dinner Time",
        "time": new Date(new Date().setHours(20, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Call Family",
        "time": new Date(new Date().setHours(20, 30, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Night Routine",
        "time": new Date(new Date().setHours(21, 30, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    },
    {
        "title": "Bedtime",
        "time": new Date(new Date().setHours(22, 0, 0, 0)).getTime(),
        "repeat": "daily",
        "enabled": true
    }
];

async function importRoutinesToMongoDB() {
    const API_BASE = 'http://10.133.243.127:5000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error('❌ Not logged in! Please sign in first.');
        return;
    }

    console.log('🚀 Starting to import routines to MongoDB...\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < sampleRoutines.length; i++) {
        const routine = sampleRoutines[i];

        try {
            const response = await fetch(`${API_BASE}/routines`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(routine)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${i + 1}/${sampleRoutines.length} - Imported: ${routine.title}`);
                successCount++;
            } else {
                const errorText = await response.text();
                console.error(`❌ ${i + 1}/${sampleRoutines.length} - Failed: ${routine.title} (${response.status})`);
                console.error(`   Error: ${errorText}`);
                failCount++;
            }

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
            console.error(`❌ ${i + 1}/${sampleRoutines.length} - Error importing ${routine.title}:`, error.message);
            failCount++;
        }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Success: ${successCount} routines`);
    console.log(`   Failed: ${failCount} routines`);
    console.log(`\n🔄 Refreshing page in 2 seconds to show new routines...`);

    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Run the import
importRoutinesToMongoDB();
