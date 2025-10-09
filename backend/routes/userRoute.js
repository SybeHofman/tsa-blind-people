const argon2 = require("argon2");
const path = require("path");
const Datastore = require("nedb");
const express = require("express");

const database = new Datastore({filename: path.resolve(__dirname, "../databases/users.db"), autoload: true});

const router = express.Router();

//Post new user (signup)
router.post("/", async (request, response) => {
    const data = request.body;

    const username = data.username;
    const password = data.password;

    let hash;

    if (!username || !password) {
      return response.status(400).send("Username and password are required");
    }

    try {
      hash = await argon2.hash(password);
    } catch (error) {
      console.log(error);
      response.status(500).send("Error hashing password");
      return;
    }

    const newData = {
      username: username,
      password: hash,
      messages : []
    }
    
    database.insert(newData, (error) => {
      if (error) {
        console.error("Error inserting data into the database:", error);
        return response.status(500).send("Error saving user to the database");
      }
      console.log(newData);
      response.json(newData);
    });
})

//Get all users
router.get("/", (request, response) => {
    database.find({}, (error, data) => {
        if (error) {
            response.end();
            return;
        }
        response.json(data);
    })

    console.log("I got a request!");
})

//Add new messages
router.put("/messages", (request, response) => {
  const {fromUserId, toUserId, newMessage} = request.body;

  database.findOne({ id: fromUserId }, (error, user) => {
    if (error) {
      console.log("Error add user messages to from user: ", error);
      return response.status(500).send("Error add user messages to from user");
    }

    if (!user) {
      return response.status(400).send("User not found");
    }

    user.messages.push({ sent: true, text: newMessage});
  })

  database.findOne({ id: toUserId }, (error, user) => {
    if(error) {
      console.log("Error add user messages to for user: ", error);
      return response.status(500).send("Error add user messages to for user");
    }

    if(!user) {
      return response.status(400).send("User not found");
    }

    user.messages.push({ sent: false, text: newMessage});
  })
  return response.status(200).send("Message sent");
})

//Get user messages
router.get("/messages", (request, response) => {
  const userId = request.id;
  database.findOne({ id: userId }, (error, user) => {
    if (error) {
      console.log("Error finding user messages: ", error);
      return response.status(500).send("Error finding user messages");
    }

    if (!user) {
      return response.status(400).send("User not found");
    }

    response.json(user.messages);
  })
})

//Authenticate user (login)
router.post("/authenticate", async (request, response) => {
  const {username, password} = request.body;

  console.log(username);
  console.log(password);

  // Validate username and password
  if (!username || !password) {
    return response.status(400).send("Username and password are required");
  }

  database.findOne({ username: username }, async (error, user) => {
    if (error) {
      console.error("Error finding user:", error);
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
    } catch (error) {
      console.log(error);
      return response.status(500).send("Error verifying password");
    }

    response.json(user.id);
  });
})

module.exports = router;