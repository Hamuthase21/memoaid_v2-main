/**
 * FINAL DIAGNOSTIC - Check if routines are in React state
 * Paste this in console and refresh the page, then run again
 */

console.log('=== FINAL DIAGNOSTIC ===\n');

// Step 1: Check localStorage
const localRoutines = JSON.parse(localStorage.getItem('memoaid_routines') || '[]');
console.log(`1️⃣ localStorage routines: ${localRoutines.length}`);

// Step 2: Check MongoDB via API
const API_BASE = 'http://10.133.243.127:5000/api';
const token = localStorage.getItem('authToken');

if (token) {
    fetch(`${API_BASE}/routines`, {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
        .then(r => r.json())
        .then(mongoRoutines => {
            console.log(`2️⃣ MongoDB routines: ${mongoRoutines.length}`);

            if (mongoRoutines.length > localRoutines.length) {
                console.log(`\n⚠️ MISMATCH DETECTED!`);
                console.log(`   MongoDB has ${mongoRoutines.length} routines`);
                console.log(`   localStorage has ${localRoutines.length} routines`);
                console.log(`\n💡 SOLUTION: The data sync from MongoDB to localStorage isn't working.`);
                console.log(`   Try these steps:`);
                console.log(`   1. Hard refresh the page (Ctrl+Shift+R or Cmd+Shift+R)`);
                console.log(`   2. Clear localStorage and refresh:`);
                console.log(`      localStorage.removeItem('memoaid_routines');`);
                console.log(`      location.reload();`);
            } else if (mongoRoutines.length === localRoutines.length) {
                console.log(`\n✅ Data is synced correctly!`);
                console.log(`   Both have ${mongoRoutines.length} routines`);
                console.log(`\n🔍 If you still don't see them in the UI:`);
                console.log(`   1. Check React DevTools to see if routines are in state`);
                console.log(`   2. Try scrolling in the Daily Routine panel`);
                console.log(`   3. Check browser console for React errors`);
            }
        });
}
