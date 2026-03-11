
import express from 'express';
const app = express();
const PORT = 5000;
app.get('/', (req, res) => res.send('Debug Server Working'));
app.listen(PORT, () => {
    console.log('Test server listening on port ' + PORT);
});
