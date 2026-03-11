/**
 * Check React state for routines
 * Run this in the browser console to see what's in the React state
 */

// Access the React DevTools to inspect the DataContext
console.log('🔍 Checking routines in React state...\n');

// Check localStorage first
const localRoutines = JSON.parse(localStorage.getItem('memoaid_routines') || '[]');
console.log(`📦 Routines in localStorage: ${localRoutines.length}`);
if (localRoutines.length > 0) {
    console.log('Sample routine from localStorage:', localRoutines[0]);
}

// Check if routines are being filtered or limited somewhere
console.log('\n💡 POSSIBLE ISSUES:');
console.log('1. Check if there\'s a scroll container - try scrolling down in the Daily Routine panel');
console.log('2. The UI might have a height limit - check the "max-h-[calc(100vh-200px)]" class');
console.log('3. Routines might be sorted by time - only showing current/upcoming ones');
console.log('\n📋 ACTION: Try scrolling down in the "Daily Routine" panel on the right side');
