/**
 * FORCE SYNC - Clear localStorage and reload from MongoDB
 * This will force the app to re-fetch all routines from MongoDB
 * Run this in the browser console
 */

console.log('🔄 FORCE SYNCING ROUTINES FROM MONGODB...\n');

// Step 1: Clear localStorage routines
localStorage.removeItem('memoaid_routines');
console.log('✅ Cleared localStorage routines');

// Step 2: Reload the page to trigger fresh fetch from MongoDB
console.log('🔄 Reloading page in 1 second...');
console.log('   This will fetch all routines from MongoDB and save them to localStorage');

setTimeout(() => {
    window.location.reload();
}, 1000);
