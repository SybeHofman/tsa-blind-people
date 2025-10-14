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
  
  response.json(newData);
})

router.get("/from/:id", (request, response) => {
  const from = request.params.id;
  database.find({from: id}, (error, data) => {
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
})

router.get("/to/:id", (request, response) => {
  const to = request.params.id;
  database.find({to: id}, (error, data) => {
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
});

module.exports = router;