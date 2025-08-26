
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'src')));

// Create 'data' folder if it doesn't exist
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// CSV setup
const csvFilePath = path.join(dataDir, 'submissions.csv');
const csvWriter = createCsvWriter({
    path: csvFilePath,
    header: [
        { id: 'name', title: 'Name' },
        { id: 'id', title: 'ID' },
        { id: 'problem', title: 'Problem' }
    ],
    append: fs.existsSync(csvFilePath)
});

// Form submission route
app.post('/submit', (req, res) => {
    const { name, id, problem } = req.body;
    if (!name || !id || !problem) {
        return res.status(400).send('All fields are required!');
    }

    csvWriter.writeRecords([{ name, id, problem }])
        .then(() => res.send('Submission successful!'))
        .catch(err => res.status(500).send('Error saving submission'));
});

// CSV download route
app.get('/download', (req, res) => {
    if (fs.existsSync(csvFilePath)) {
        res.download(csvFilePath);
    } else {
        res.status(404).send('No submissions yet!');
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
