const argon2 = require('argon2');
const path = require('path');
const Datastore = require('nedb');
const express = require('express');

const database = new Datastore({filename: path.resolve(__dirname, '../databases/users.db'), autoload: true});

const router = express.Router();

//Post new user (signup)
router.post('/', async (request, response) => {
    const data = request.body;

    const username = data.username;
    const password = data.password;

    let hash;

    if (!username || !password) {
      return response.status(400).send("Username and password are required");
    }

    try {
      hash = await argon2.hash(password);
    } catch (err) {
      console.log(err);
      response.status(500).send("Error hashing password");
      return;
    }

    const newData = {
      username: username,
      password: hash
    }
    
    database.insert(newData, (err) => {
      if (err) {
        console.error("Error inserting data into the database:", err);
        return response.status(500).send("Error saving user to the database");
      }
      console.log(newData);
      response.json(newData);
    });
})

//Get all users
router.get('/', (request, response) => {
    database.find({}, (error, data) => {
        if (error) {
            response.end();
            return;
        }
        response.json(data);
    })

    console.log("I got a request!");
})

//Get user by username
router.post('/authenticate', async (request, response) => {
  const {username, password} = request.body;

  console.log(username);
  console.log(password);

  // Validate username and password
  if (!username || !password) {
    return response.status(400).send("Username and password are required");
  }

  database.findOne({ username: username }, async (err, user) => {
    if (err) {
      console.error("Error finding user:", err);
      return response.status(500).send("Error finding user");
    }

    if (!user) {
      return response.status(400).send("Invalid username");
    }

    console.log(user.password);

    try {
      const validPassword = await argon2.verify(user.password, password);
      if (!validPassword) {
        return response.status(400).send("Invalid username or password");
      }
    } catch (err) {
      console.log(err);
      return response.status(500).send("Error verifying password");
    }

    response.json(user);
  });
})

module.exports = router;