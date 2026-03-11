/**
 * Check how many routines are in MongoDB
 * Run this in the browser console to see what's stored
 */

const API_BASE = 'http://10.133.243.127:5000/api';
const token = localStorage.getItem('authToken');

if (!token) {
    console.error('❌ Not logged in!');
} else {
    fetch(`${API_BASE}/routines`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            console.log(`📊 Total routines in MongoDB: ${data.length}`);
            console.log('\n📋 Routines:');
            data.forEach((routine, index) => {
                const time = new Date(routine.time);
                console.log(`${index + 1}. ${routine.title} - ${time.toLocaleTimeString()}`);
            });

            if (data.length === 1) {
                console.log('\n⚠️ Only 1 routine found! The import may have failed.');
                console.log('💡 Try running the import script again.');
            }
        })
        .catch(err => {
            console.error('❌ Error fetching routines:', err);
        });
}
