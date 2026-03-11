
import mongoose from 'mongoose';
console.log('Connecting...');
mongoose.connect('mongodb://localhost:27017/test', { serverSelectionTimeoutMS: 2000 })
    .then(() => console.log('Connected'))
    .catch(err => console.log('Connect failed as expected:', err.message));
