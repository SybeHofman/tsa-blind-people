import "./Login.css";

function Login () {
  return (
    <>
      <div className = "login">
        <h1>Welcome! Please login to your account</h1>
        <form>
          <label className="login-contents" htmlFor = "usernameInput">Username: </label>
          <input className="login-contents" type="text" id="usernameInput" aria-label="Input one of two"></input><br/>

          <label className="login-contents" htmlFor = "passwordInput">Password: </label>
          <input className="login-contents" type="password" id="passwordInput" aria-label="Input two of two"></input>
        </form>
      </div>
    </>
  )
}

export default Login;