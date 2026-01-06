import './App.css';
import { useState, useRef } from 'react'
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './components/Navbar'
import { useNavigate } from 'react-router-dom'

function Login() {

  let navigate = useNavigate();

  const [tab, setTab] = useState(false);

  const switchTab = () => {

    setTab(!tab)

  }

  const clearForm = () => {
    const inputs = inputRef.current.querySelectorAll("input");

    inputs.forEach(input => {
      input.value = "";
    });
  };

  const handleLogin = (e) => {

    e.preventDefault()
    const formData = new FormData(loginRef.current);
    const data = Object.fromEntries(formData.entries());

    axios.post('http://localhost:8080/login', data, { withCredentials: true }).then(response => {

      toast("Login successful");
      navigate('/')

    }).catch(err => {

      console.log(err)

      if (err.response) {

        toast.error(err.response.data.error)

      } else if (err.request) {
        toast.error("Server is unreachable at the moment")

      }

    })

  }

  const handleRegister = (e) => {

    e.preventDefault()
    const formData = new FormData(inputRef.current);
    const data = Object.fromEntries(formData.entries());

    if (data.pwd !== data.pwdagain) {

      toast.error("Passwords do not match");
      return;
    }

    axios.post('http://localhost:8080/register', data, { withCredentials: true }).then(response => {

      toast("Registered succesfully")
      clearForm();
      console.log(response.data)
    }).catch(err => {

      console.log(err)

      if (err.code === "ERR_NETWORK") {
        toast.error("Could not connect to server");
      } else {

        toast.error(err.response.data.error)
      }
    })

  }

  const inputRef = useRef(null)
  const loginRef = useRef(null)

  return (
    <div className="App">
      <Navbar />
      <div className="App-main">
        <div className="App-login">
          <div className={tab ? "hidden" : "tab-1"}>
            <form onSubmit={(e) => handleLogin(e)} ref={loginRef}>
              <h2 id="h2-login">Please enter your login info below</h2>
              <input type="text" placeholder="Username" className="input-box" name="username"></input><br />
              <input type="password" placeholder="Password" className="input-box" name="pwd"></input><br />
              <button className="button-login">Login</button>
              <p id="p-login">Click <span onClick={() => switchTab()} className="span-clickable">here</span> to register</p>
            </form>
          </div>
          <div className={tab ? "tab-2" : "hidden"}>
            <form onSubmit={(e) => handleRegister(e)} ref={inputRef}>
              <h2 id="h2-login">Register</h2>
              <label htmlFor="firstName">First Name</label>
              <input type="text" id="firstName" placeholder="First Name" name="firstName" required></input>
              <label htmlFor="lastName">Last Name</label>
              <input type="text" id="lastName" placeholder="Last Name" name="lastName" required></input>
              <label htmlFor="user">Username</label>
              <input type="text" id="user" placeholder="Desired username" name="username" required></input>
              <label htmlFor="pass">Password</label>
              <input type="password" id="pass" placeholder="Desired password" name="pwd" required></input>
              <label htmlFor="passa">Password Again</label>
              <input type="password" id="passa" placeholder="Enter password again" name="pwdagain" required></input>
              <button type="submit" className="button-login">Register</button>
              <p id="p-login" onClick={() => switchTab()} style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}>Back</p>
            </form>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div >
  );
}

export default Login;
