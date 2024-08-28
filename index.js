const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Configure multer for file upload
const upload = multer({ dest: 'uploads/' });

// Function to extract numbers from strings
function extractNumbers(str) {
    return (str.match(/\d+/g) || []).map(Number);
}

// Endpoint to receive file and process data
app.post('/process-file', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        return res.status(400).send('No file uploaded.');
    }

    const filePath = path.join(__dirname, file.path);

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading file.');
        }

        try {
            const objectsArray = JSON.parse(data);
            const result = objectsArray.map(obj => {
                const processedObj = {};
                for (const key in obj) {
                    processedObj[key] = typeof obj[key] === 'string' ? extractNumbers(obj[key]) : obj[key];
                }
                return processedObj;
            });

            fs.unlink(filePath, err => {
                if (err) console.error('Error deleting file:', err);
            });

            res.json(result);
        } catch (parseError) {
            res.status(400).send('Invalid JSON format.');
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
