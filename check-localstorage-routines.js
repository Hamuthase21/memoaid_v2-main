/**
 * Deep diagnostic - Check localStorage routines
 * Run this in browser console
 */

console.log('🔍 DEEP DIAGNOSTIC - Checking localStorage routines\n');

const localRoutines = JSON.parse(localStorage.getItem('memoaid_routines') || '[]');
console.log(`📦 Total routines in localStorage: ${localRoutines.length}`);

if (localRoutines.length > 0) {
    console.log('\n📋 All routines in localStorage:');
    localRoutines.forEach((r, i) => {
        const time = new Date(r.time);
        console.log(`${i + 1}. ${r.title} - ${time.toLocaleTimeString()}`);
    });
} else {
    console.log('❌ localStorage is EMPTY!');
    console.log('\n🔍 This means routines from MongoDB are not being synced to localStorage.');
    console.log('💡 SOLUTION: Refresh the page (F5) to trigger data sync from MongoDB');
}

// Also check if there are duplicates
const titles = localRoutines.map(r => r.title);
const duplicates = titles.filter((title, index) => titles.indexOf(title) !== index);
if (duplicates.length > 0) {
    console.log('\n⚠️ WARNING: Duplicate routines found:');
    duplicates.forEach(d => console.log(`  - ${d}`));
}
