const express = require('express');
const path = require('path');
const app = express();
const argon2 = require('argon2');
const cors = require('cors');

const Datastore = require('nedb');

app.use(express.json());

const database = new Datastore('database.db');
database.loadDatabase();

// Serve static files from the current directory
app.use(express.static(__dirname, {
    etag: false, // Disable ETag for static files
    lastModified: false // Disable Last-Modified header
}));

app.use(cors({ origin: 'http://localhost:3000' })); // Replace with your client URL

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/api', async (request, response) => {
    const data = request.body;

    const username = data.username;
    const password = data.password;

    let hash;

    try {
      hash = await argon2.hash("password");
    } catch (err) {
      console.log(err);
      response.status(500).send("Error hashing password");
      return;
    }

    const newData = {
      username: username,
      password: hash
    }
    
    database.insert(newData);
    console.log(newData);
    response.json(newData);
})

app.get('/api', (request, response) => {
    database.find({}, (error, data) => {
        if (error) {
            response.end();
            return;
        }
        response.json(data);
    })

    console.log("I got a request!");
})