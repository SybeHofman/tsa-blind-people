const path = require("path");
const Datastore = require("nedb");
const express = require("express");

const database = new Datastore({filename: path.resolve(__dirname, "../databases/messages.db"), autoload: true});

const router = express.Router();

router.post("/", async (request, response) => {
  const data = request.body;

  const from = data.from;
  const to = data.to;
  const content = data.content;

  if(!from || !to || !content) {
    return response.status(400).send("From, to, and content are required");
  }

  const newData = {
    from: from,
    to: to,
    content: content,
    timestamp: new Date(),
  }
  
  database.insert(newData, (error) => {
    if (error) {
      console.error("Error inserting data into the database:", error);
      return response.status(500).send("Error saving message to the database");
    }
    console.log(newData);
    response.json(newData);
  });
})

router.get("/from/:id", (request, response) => {
  try{
    const from = request.params.id;
    database.find({from: from}, (error, data) => {
      if(error) {
        console.log("Error retrieving from messages:", error);
        return response.status(500).send("Error retrieving messages");
      }

      if(!data) {
        console.log("No from messages found from user:", from);
        return response.status(404).send("No messages found from this user");
      }

      response.json(data);
    })
  } catch (error) {
    console.log(error);
    return response.status(500).send("Error retrieving messages");
  }
})

router.get("/to/:id", (request, response) => {
  const to = request.params.id;
  try{
    database.find({to: to}, (error, data) => {
      if(error) {
        console.log("Error retrieving to messages:", error);
        return response.status(500).send("Error retrieving messages");
      }

      if(!data) {
        console.log("No to messages found from user:", from);
        return response.status(404).send("No messages found from this user");
      }

      response.json(data);
    })
  } catch (error) {
    console.log(error);
    return response.status(500).send("Error retrieving messages");
  }
});

module.exports = router;