import {Link} from "react-router-dom";
import "./Signup.css";
import { useRef } from "react";
import type { MouseEvent } from "react";

function Signup() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    
    if(usernameRef.current == null || passwordRef.current == null) {
      console.error("Username or password input is null");
      return;
    }

    if(usernameRef.current.value === "" || passwordRef.current.value === "") {
      console.error("Username or password is empty");
      return;
    }
    
    postData(usernameRef.current?.value, passwordRef.current?.value);
  }

  const postData = async (username: string, password: string) => {
    const list = {username: username, password: password}
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(list)
    }

    const response = await fetch('/api/users', options);

    const data = await response.json();
    console.log(data);
  }

  return (
    <>
      <h1>Welcome to Beyond Eyes! Please signup with username and password</h1>
      <div className = "signup">
        <label className="signup-contents" htmlFor = "usernameInput">Username: </label>
        <input ref={usernameRef} className="signup-contents" type="text" id="usernameInput" aria-label="Input one of two"></input><br/>

        <label className="signup-contents" htmlFor = "passwordInput">Password: </label>
        <input ref={passwordRef} className="signup-contents" type="password" id="passwordInput" aria-label="Input two of two"></input> <br/>

        <button className="signup-contents" type="submit" onClick={handleClick}>Submit</button>
      </div>
      <Link to="/">Home</Link>
    </>
  )
}

export default Signup;