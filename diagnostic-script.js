/**
 * Browser Console Diagnostic Script
 * Copy and paste this into the browser console to diagnose why notes aren't showing
 */

console.log('=== MemoAid Diagnostic Tool ===\n');

// 1. Check Authentication
console.log('1️⃣ CHECKING AUTHENTICATION...');
const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
const token = localStorage.getItem('authToken');

if (user && token) {
    console.log('✅ User is logged in:', user.email);
    console.log('✅ Auth token exists');
} else {
    console.log('❌ User is NOT logged in');
    console.log('   → This is why notes from MongoDB are not loading!');
    console.log('   → Solution: Sign in to your account');
}

// 2. Check localStorage Notes
console.log('\n2️⃣ CHECKING LOCALSTORAGE...');
const localNotes = JSON.parse(localStorage.getItem('memoaid_notes') || '[]');
console.log(`📝 Notes in localStorage: ${localNotes.length}`);
if (localNotes.length > 0) {
    console.log('Sample note:', localNotes[0]);
} else {
    console.log('❌ No notes in localStorage');
}

// 3. Test API Connection (only if logged in)
if (user && token) {
    console.log('\n3️⃣ TESTING API CONNECTION...');

    const API_BASE = 'http://10.133.243.127:5000/api';

    fetch(`${API_BASE}/notes`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(async response => {
            if (!response.ok) {
                console.log(`❌ API Error: ${response.status} ${response.statusText}`);
                const text = await response.text();
                console.log('Response:', text);
                return null;
            }
            return response.json();
        })
        .then(data => {
            if (data) {
                console.log(`✅ API Connection successful!`);
                console.log(`📝 Notes from MongoDB: ${data.length}`);
                if (data.length > 0) {
                    console.log('Sample note from MongoDB:', data[0]);
                    console.log('\n🔍 DIAGNOSIS:');
                    console.log('   Notes exist in MongoDB but not showing in UI');
                    console.log('   Possible causes:');
                    console.log('   1. React state not updating properly');
                    console.log('   2. UI component not rendering notes');
                    console.log('   3. Data transformation issue');
                    console.log('\n💡 SOLUTION: Try refreshing the page (F5)');
                } else {
                    console.log('\n🔍 DIAGNOSIS:');
                    console.log('   MongoDB is empty - no notes stored yet');
                    console.log('\n💡 SOLUTION: Add notes through the UI or import sample notes');
                }
            }
        })
        .catch(err => {
            console.log('❌ API Connection failed:', err.message);
            console.log('\n🔍 DIAGNOSIS:');
            console.log('   Cannot connect to backend server');
            console.log('   Possible causes:');
            console.log('   1. Backend server not running');
            console.log('   2. Wrong API URL');
            console.log('   3. Network/firewall issue');
            console.log('\n💡 SOLUTION: Check if backend is running on port 5000');
        });
}

// 4. Check for React errors
console.log('\n4️⃣ CHECKING FOR REACT ERRORS...');
console.log('Check the Console tab for any red error messages');
console.log('Common errors to look for:');
console.log('  - QuotaExceededError (should be fixed now)');
console.log('  - Network errors');
console.log('  - Component rendering errors');

console.log('\n=== END DIAGNOSTIC ===');
