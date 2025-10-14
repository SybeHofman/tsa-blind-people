import {Link} from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Homepage() {
  const [messages, setMessages] = useState([{body: "Loading messages..."}]);
  const [username, setUsername] = useState("Guest");
  const _id = localStorage.getItem("_id") || sessionStorage.getItem("_id");
  const messageRef = useRef<HTMLInputElement>(null);

  const fetchMessages = async () => {
    try{
      const response = await fetch(`/api/users/messages/${_id}`);
      if(!response.ok) {
        console.log("Failed to fetch messages");
        return;
      }

      setMessages(await response.json());
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
    fetchMessages();
  }, [_id])

  const putMessage = async () => {
    const newMessage = messageRef.current?.value;

    const options = {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({fromUserId: _id, toUserId: await fetchId("Tygo"), newMessage})
    }

    const response = await fetch("/api/users/messages", options);
    if(!response.ok) {
      console.log("Failed to post message");
      return;
    }

    console.log(JSON.stringify(response.body));

    fetchMessages();

    return response.json();
  }

  return (
    <>
      <Link to="/Login">Login</Link>
      {messages.map((message, index) => (
        <div className="message"key={index}>{message.body}</div>
      ))}
      
      <div className = "message-input">
        <input ref={messageRef} type = "text" id="messageInput" aria-label="Input message"></input>
        <button type="submit" onClick={putMessage}>Submit</button>
      </div>
    </>
  )
}

export default Homepage;