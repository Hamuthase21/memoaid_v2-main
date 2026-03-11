/**
 * Import Sample Notes to MongoDB via API
 * This script adds notes through the authenticated API so they persist in MongoDB
 * Run this in the browser console while logged in
 */

const sampleNotes = [
    {
        "title": "Morning Medication Routine",
        "content": "Take blood pressure medication with breakfast at 8:00 AM. The white pill is in the blue container on the kitchen counter. Remember to drink a full glass of water with it.",
        "tags": ["health", "medication", "daily"],
        "category": "health"
    },
    {
        "title": "Dr. Sharma's Appointment",
        "content": "Next appointment: February 20, 2026 at 10:30 AM\nLocation: City Medical Center, 3rd Floor, Room 305\nBring: Insurance card, list of current medications, blood pressure log\nParking: Use the west entrance parking lot",
        "tags": ["appointment", "health", "doctor"],
        "category": "health"
    },
    {
        "title": "Grandchildren's Names and Ages",
        "content": "1. Priya - 8 years old (loves drawing and unicorns)\n2. Arjun - 5 years old (obsessed with dinosaurs)\n3. Baby Ananya - 2 years old (just started talking)\n\nPriya's birthday: March 15th\nArjun's birthday: July 22nd\nAnanya's birthday: November 8th",
        "tags": ["family", "grandchildren", "important"],
        "category": "family"
    },
    {
        "title": "Emergency Contact Numbers",
        "content": "Son (Rajesh): +91 98765 43210\nDaughter (Meera): +91 98765 43211\nNeighbor (Mrs. Patel): +91 98765 43212\nFamily Doctor: +91 11 2345 6789\nEmergency: 112\n\nRajesh lives 10 minutes away and has a spare key.",
        "tags": ["emergency", "contacts", "important"],
        "category": "important"
    },
    {
        "title": "Where I Keep Important Things",
        "content": "House keys: Hanging on the hook by the front door\nSpare keys: In the blue ceramic bowl on the dining table\nWallet: Usually in my brown handbag or on the bedroom dresser\nPhone charger: Bedside table drawer\nGlasses: Case on the coffee table or in the kitchen\nImportant documents: Filing cabinet in the study, top drawer",
        "tags": ["organization", "daily", "important"],
        "category": "daily"
    },
    {
        "title": "Tuesday Yoga Class",
        "content": "Every Tuesday at 4:00 PM at Community Center\nInstructor: Ms. Anjali\nBring: Yoga mat (in the hall closet), water bottle, comfortable clothes\nMrs. Verma from next door also goes - we can go together!\nClass ends at 5:00 PM",
        "tags": ["activity", "exercise", "weekly"],
        "category": "activity"
    },
    {
        "title": "How to Use the TV Remote",
        "content": "1. Press the RED power button to turn on TV\n2. Press 'SOURCE' button and select 'HDMI 1' for cable box\n3. Use the CABLE remote (black one) to change channels\n4. Volume buttons are on both remotes\n5. For Netflix: Press 'SOURCE' and select 'Smart TV', then click Netflix icon\n\nIf confused, call Rajesh - he set it up!",
        "tags": ["technology", "instructions", "daily"],
        "category": "daily"
    },
    {
        "title": "Favorite Recipes - Dal Tadka",
        "content": "My special dal recipe that everyone loves:\n\n1 cup toor dal, 3 cups water, turmeric, salt\nTadka: cumin seeds, mustard seeds, curry leaves, dried red chili, hing\nCook dal in pressure cooker for 3 whistles\nMash well, add tadka\n\nRajesh's favorite! He always asks for this when he visits.",
        "tags": ["cooking", "recipe", "family"],
        "category": "personal"
    },
    {
        "title": "Garden Watering Schedule",
        "content": "Morning watering (7:00 AM):\n- Roses near the gate\n- Tulsi plant by the entrance\n- Vegetable patch in the back\n\nEvening watering (6:00 PM):\n- Potted plants on the balcony\n- Jasmine creeper on the side wall\n\nDon't water if it rained! Check the soil first.",
        "tags": ["garden", "routine", "daily"],
        "category": "daily"
    },
    {
        "title": "Bank Account Information",
        "content": "Bank: State Bank of India\nBranch: Rajendra Nagar\nAccount Number: XXXX-XXXX-1234 (full number in the safe)\nCustomer ID: Written in the red diary\n\nATM PIN: Don't write it down! It's our old house number.\nBank Manager: Mr. Kapoor - very helpful\nBranch Phone: +91 11 2345 6780",
        "tags": ["finance", "important", "banking"],
        "category": "important"
    },
    {
        "title": "Weekly Grocery List",
        "content": "Regular items to buy:\n- Milk (2 liters)\n- Bread (brown bread)\n- Eggs (6)\n- Fresh vegetables: tomatoes, onions, potatoes, spinach\n- Fruits: bananas, apples\n- Rice (check if we have enough)\n- Dal (toor and moong)\n- Tea leaves\n- Sugar\n\nPreferred shop: Sharma Stores on Main Road - they deliver!",
        "tags": ["shopping", "groceries", "weekly"],
        "category": "daily"
    },
    {
        "title": "Meera's Wedding Anniversary",
        "content": "Meera and Vikram's anniversary: February 14th\nThey've been married 12 years now\nThey love going to that Italian restaurant - Casa Bella\nMaybe send flowers or call them in the morning\n\nLast year I forgot and felt terrible - setting reminder this time!",
        "tags": ["family", "anniversary", "important"],
        "category": "family"
    },
    {
        "title": "How to Video Call Grandchildren",
        "content": "Step by step for WhatsApp video call:\n1. Open WhatsApp (green icon with phone)\n2. Find 'Family Group' chat\n3. Tap the video camera icon at the top\n4. Wait for them to answer\n5. Smile and wave!\n\nBest time to call: Weekends around 11 AM\nPriya loves to show me her drawings on video call!",
        "tags": ["technology", "family", "grandchildren"],
        "category": "family"
    },
    {
        "title": "Evening Walk Route",
        "content": "My safe walking route (30 minutes):\n1. Exit from main gate, turn right\n2. Walk to the park (5 minutes)\n3. Two rounds around the park\n4. Stop at the bench near the fountain if tired\n5. Return home the same way\n\nMeet Mrs. Patel and Mrs. Gupta at the park around 6 PM\nCarry phone and water bottle\nWear comfortable shoes",
        "tags": ["exercise", "routine", "daily"],
        "category": "activity"
    },
    {
        "title": "Important Dates This Month",
        "content": "February 2026:\n- Feb 14: Meera's anniversary\n- Feb 20: Doctor appointment (10:30 AM)\n- Feb 25: Electricity bill due\n- Feb 28: Priya's school annual day (she's performing!)\n\nMark these on the wall calendar in the kitchen!",
        "tags": ["calendar", "important", "monthly"],
        "category": "important"
    }
];

async function importNotesToMongoDB() {
    const API_BASE = 'http://10.133.243.127:5000/api';
    const token = localStorage.getItem('authToken');

    if (!token) {
        console.error('❌ Not logged in! Please sign in first.');
        return;
    }

    console.log('🚀 Starting to import notes to MongoDB...\n');

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < sampleNotes.length; i++) {
        const note = sampleNotes[i];

        try {
            const response = await fetch(`${API_BASE}/notes`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(note)
            });

            if (response.ok) {
                const data = await response.json();
                console.log(`✅ ${i + 1}/${sampleNotes.length} - Imported: ${note.title}`);
                successCount++;
            } else {
                console.error(`❌ ${i + 1}/${sampleNotes.length} - Failed: ${note.title} (${response.status})`);
                failCount++;
            }

            // Small delay to avoid overwhelming the server
            await new Promise(resolve => setTimeout(resolve, 200));

        } catch (error) {
            console.error(`❌ ${i + 1}/${sampleNotes.length} - Error importing ${note.title}:`, error.message);
            failCount++;
        }
    }

    console.log(`\n✅ Import complete!`);
    console.log(`   Success: ${successCount} notes`);
    console.log(`   Failed: ${failCount} notes`);
    console.log(`\n🔄 Refreshing page in 2 seconds to show new notes...`);

    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

// Run the import
importNotesToMongoDB();
