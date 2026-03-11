
console.log('Starting imports...');
try {
    console.log('Importing auth...');
    await import('./routes/auth.js');
    console.log('Importing notes...');
    await import('./routes/notes.js');
    console.log('Importing reminders...');
    await import('./routes/reminders.js');
    console.log('Importing routines...');
    await import('./routes/routines.js');
    console.log('Importing people...');
    await import('./routes/people.js');
    console.log('Importing gemini...');
    await import('./routes/gemini.js');
    console.log('Importing journey...');
    await import('./routes/journey.js');
    console.log('All imports success!');
} catch (e) {
    console.error('Import failed:', e);
}
