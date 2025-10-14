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

//Get id by username
router.get("/id/:username", (request, response) => {
  const username = request.params.username;

  database.findOne({ username: username }, (error, user) => {
    if(error) {
      console.log("Error finding id: ", error);
      return response.status(500).send("Error finding id");
    }

    if(!user) {
      console.log("id not found");
      return response.status(400).send("id not found");
    }

    response.json({_id: user._id});
  })
})

//Add new messages
router.put("/messages", async (request, response) => {
  try{
    const {fromUserId, toUserId, newMessage} = request.body;

    const newFromUserId = (fromUserId + "").replaceAll("\"", "");
    const newToUserId = (toUserId + "").replaceAll("\"", "");

    // Get user from database
    const fromUserDb = await new Promise((resolve, reject) => {
      console.log({ _id: newFromUserId });
      database.findOne({ _id: newFromUserId }, (error, user) => {
        if (error) {
          return reject("Error adding messages to from user");
        }

        if(!user) {
          return reject("From user not found");
        }

        resolve(user)
      })
    })

    fromUserDb.messages.push({ sent: true, text: newMessage});

    //Update user in database
    await new Promise((resolve, reject) => {
      database.update(
        { _id: fromUserDb._id },
        { $set: { messages: fromUserDb.messages } },
        { upsert: false},
        (error, numReplaced, upsert) => {
          if (error) {
            return reject("Error updating from user messages");
          }
          console.log(`Updated ${numReplaced} document(s) for fromUser`);
          console.log("Upsert: ", upsert);
          resolve();
        }
      );
    });

    // Get to user from database
    const toUserDb = await new Promise((resolve, reject) => {
      database.findOne({ _id: newToUserId }, (error, user) => {
        if (error) {
          return reject("Error adding messages for to user");
        }

        if(!user) {
          return reject("To user not found");
        }

        resolve(user)
      })
    })

    toUserDb.messages.push({ sent: true, text: newMessage});

    //Update user in database
    await new Promise((resolve, reject) => {
      database.update(
        { _id: toUserDb._id },
        { $set: { messages: toUserDb.messages } },
        {upsert: false},
        (error, numReplaced, upsert) => {
          if (error) {
            return reject("Error updating to user messages");
          }
          console.log(`Updated ${numReplaced} document(s) for toUser`);
          console.log("Upsert: ", upsert);
          resolve();
        }
      );
    });

    console.log("All good!");
    return response.status(200).send({message: newMessage});
  } catch (error) {
    console.log("Error adding messages: ", error);
    return response.status(500).send("Error adding messages");
  }
})

//Get user messages
router.get("/messages/:id", (request, response) => {
  const userId = request.params.id;
  database.findOne({ _id: userId }, (error, user) => {
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

    console.log(user._id);

    response.status(200).json({id: user._id});
  });
})

module.exports = router;