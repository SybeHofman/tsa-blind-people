import {Link} from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Homepage() {
  const [fromMessages, setFromMessages] = useState([{content: "Loading messages..."}]);
  const [toMessages, setToMessages] = useState([{content: "Loading messages..."}]);
  const [username, setUsername] = useState("Guest");
  const _id = sessionStorage.getItem("_id")?.replaceAll("\"", ""); //Remove quotes from id
  const messageRef = useRef<HTMLInputElement>(null);

  //Gets messages made by the user
  const fetchFromMessages = async () => {
    try{
      const response = await fetch(`/api/messages/from/${_id}`);
      if(!response.ok) {
        console.log("Failed to fetch messages");
        return;
      }

      const responseJson = await response.json();
      if(responseJson.length === 0) {
        setFromMessages([{content: "No sent messages"}]);
      } else{
        setFromMessages(responseJson);
      }
    } catch(error) {
      console.log("Error fetching messages:", error);
    }
  }

  //Gets messages sent to the user
  const fetchToMessages = async () => {
    try{
      const response = await fetch(`/api/messages/to/${_id}`);
      if(!response.ok) {
        console.log("Failed to fetch messages");
        return;
      }

      const responseJson = await response.json();
      if(responseJson.length === 0) {
        setToMessages([{content: "No recieved messages"}]);
      } else{
        setToMessages(responseJson);
      }
    } catch(error) {
      console.log("Error fetching messages:", error);
    }
  }

  const fetchId = async(username: string) => {
    const response = await fetch(`/api/users/id/${username}`);
    if(!response.ok) {
      console.log("Failed to fetch id");
      return;
    }

    const data = await response.json();
    console.log("Fetched Id: ", data._id + "");
    return data._id + "";
  }

  useEffect(() => {
    fetchFromMessages();
    fetchToMessages();
  }, [_id])

  const postMessage = async () => {
    const content = messageRef.current?.value;

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({from: _id, to: await fetchId("Tygo"), content: content})
    }

    const response = await fetch("/api/messages", options);
    if(!response.ok) {
      console.log("Failed to post message");
      return;
    }

    console.log(JSON.stringify(response.body));

    fetchFromMessages();
    fetchToMessages();

    return response.json();
  }

  return (
    <>
      <Link to="/Login">Login</Link>
      {
        _id === null ?
        //Not logged in
        <>
          <h1>Welcome to beyond eyes!</h1>
        </> :
        //Logged in
        <>
          <div className = "from-messages">
            Your sent messages:
            {fromMessages.map((message, index) => (
              <div className="message"key={index}>{message.content}</div>
            ))}
          </div>

          <div className = "to-messages">
            Your recieved messages:
            {toMessages.map((message, index) => (
              <div className="message"key={index}>{message.content}</div>
            ))}
          </div>
          
          <div className = "message-input">
            <input ref={messageRef} type = "text" id="messageInput" aria-label="Input message"></input>
            <button type="submit" onClick={postMessage}>Submit</button>
          </div>
        </>
      }
    </>
  )
}

export default Homepage;