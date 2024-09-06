import { error } from 'console';
import express from 'express';
import fs from 'fs';
const app = express();
app.use(express.json());

const locationPath = './location.json';

app.get('/api/location', (req, res) => {
    res.status(200).json(getFileContent(locationPath));
});

app.get('/api/location/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const location = getObjectById(locationPath, id);
    if (location) {
        res.status(200).json(location);
    } else {
        res.status(404).json({ error: `Location with id ${id} not found` });
    }
});

app.post('/api/location', (req, res) => {
    const data = req.body;

    data.id = getLastId(locationPath) + 1;

    let fullData = getFileContent(locationPath);

    fullData.push(data);

    fs.writeFileSync(locationPath, JSON.stringify(fullData, null, 2));

    console.log(getLastId(locationPath));

    res.status(201).json(data);
});

const port = 5000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));

function getFileContent(path) {
    try {
        return JSON.parse(fs.readFileSync(path, 'utf8'));
    } catch (error) {
        return [];
    }
}

function getObjectById(path, id) {
    try {
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));
        return data.find(item => item.id === id);
    } catch (error) {
        return [];
    }
}

function getLastId(path) {
    try {
        const data = JSON.parse(fs.readFileSync(path, 'utf8'));

        if (data.length === 0) {
            throw new Error('File is empty');
        }

        return data[data.length - 1].id;
    } catch (error) {
        return 0;
    }
}
