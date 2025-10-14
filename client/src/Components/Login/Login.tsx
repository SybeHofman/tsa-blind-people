import "./Login.css";
import {Link} from 'react-router-dom';
import { useRef, useState } from "react";
import type { MouseEvent } from "react";

function Login () {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [rememberMe, changeRememberMe] = useState(false);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    //e.preventDefault();

    if(usernameRef.current == null || passwordRef.current == null) {
      console.error("Username or password input is null");
      return;
    }

    if(usernameRef.current.value === "" || passwordRef.current.value === "") {
      console.error("Username or password is empty");
      return;
    }

    authenticate(usernameRef.current?.value, passwordRef.current?.value);
  }

  const authenticate = async (username: string, password: string) => {

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({username, password})
    }

    const response = await fetch('/api/users/authenticate', options);

    if(!response.ok) {
      console.log("Authentication failed");
      return;
    }

    const id = await response.json();
    console.log(id);
    // if(rememberMe){
    //   localStorage.setItem("_id", JSON.stringify(id.id));
    // } else {
    //   sessionStorage.setItem("_id", JSON.stringify(id.id));
    // }

    sessionStorage.setItem("_id", JSON.stringify(id.id));
  }

  return (
    <>
      <div className = "login">
        <h1>Welcome! Please login to your account</h1>
        <div>
          <label className="login-contents" htmlFor = "usernameInput">Username: </label>
          <input ref={usernameRef} className="login-contents" type="text" id="usernameInput" aria-label="Input one of two"></input><br/>

          <label className="login-contents" htmlFor = "passwordInput">Password: </label>
          <input ref = {passwordRef} className="login-contents" type="password" id="passwordInput" aria-label="Input two of two"></input>
          <button className="login-contents" type="button" onClick={() => changeRememberMe(previous => !previous)}>{rememberMe + ""}</button>
          <Link to="/">
            <button className="login-contents" type="submit" onClick={handleClick}>Submit</button>
          </Link>
        </div>
        <Link to="/signup">Signup</Link>
      </div>
    </>
  )
}

export default Login;