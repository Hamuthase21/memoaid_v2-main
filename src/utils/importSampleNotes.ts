import sampleNotes from './sample-notes.json';

/**
 * Import sample notes into the application
 * This function should be called from the browser console or added as a button in the UI
 */
export const importSampleNotes = async () => {
    try {
        // Get the DataContext's addNote function
        // This will be called from the browser console where we have access to the context

        console.log('Starting to import sample notes...');

        for (const note of sampleNotes) {
            const noteData = {
                title: note.title,
                content: note.content,
                tags: note.tags || [],
                category: note.category || 'personal',
            };

            // Store in localStorage directly for immediate visibility
            const existingNotes = JSON.parse(localStorage.getItem('memoaid_notes') || '[]');
            const newNote = {
                ...noteData,
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                timestamp: Date.now(),
            };

            existingNotes.unshift(newNote);
            localStorage.setItem('memoaid_notes', JSON.stringify(existingNotes));

            console.log(`✓ Imported: ${note.title}`);

            // Small delay to avoid overwhelming the system
            await new Promise(resolve => setTimeout(resolve, 100));
        }

        console.log(`✅ Successfully imported ${sampleNotes.length} sample notes!`);
        console.log('Please refresh the page to see the notes.');

        return { success: true, count: sampleNotes.length };
    } catch (error) {
        console.error('❌ Error importing sample notes:', error);
        return { success: false, error };
    }
};

// Auto-run on import (can be commented out if not desired)
if (typeof window !== 'undefined') {
    console.log('Sample notes importer loaded. Call importSampleNotes() to import notes.');
}
