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

// Path to JSON file
const dataFilePath = path.join(__dirname, 'submissions.json');

// Ensure JSON file exists
if (!fs.existsSync(dataFilePath)) {
    fs.writeFileSync(dataFilePath, JSON.stringify([]));
}

// --- Form submission route ---
app.post('/submit', (req, res) => {
    const { name, id, problem } = req.body;
    if (!name || !id || !problem) {
        return res.status(400).send('All fields are required!');
    }

    const submissions = JSON.parse(fs.readFileSync(dataFilePath));
    submissions.push({ name, id, problem, createdAt: new Date() });
    fs.writeFileSync(dataFilePath, JSON.stringify(submissions, null, 2));

    res.send('Submission successful!');
});

// --- Download all submissions as CSV ---
app.get('/download', (req, res) => {
    const submissions = JSON.parse(fs.readFileSync(dataFilePath));

    if (submissions.length === 0) return res.status(404).send('No submissions yet!');

    const csvWriter = createCsvWriter({
        path: 'submissions.csv',
        header: [
            { id: 'name', title: 'Name' },
            { id: 'id', title: 'ID' },
            { id: 'problem', title: 'Problem' },
            { id: 'createdAt', title: 'CreatedAt' }
        ]
    });

    csvWriter.writeRecords(submissions)
        .then(() => res.download('submissions.csv'))
        .catch(err => res.status(500).send('Error generating CSV'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
