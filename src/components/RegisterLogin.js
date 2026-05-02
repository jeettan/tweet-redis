import { useNavigate } from 'react-router-dom'
import axios from '../axios';
import { useState, useRef } from 'react'
import { ToastContainer, toast } from 'react-toastify';

function RegisterLogin() {

  const [tab, setTab] = useState(1);
  const [loading, setLoading] = useState(false)

  let navigate = useNavigate();

  const inputRef = useRef(null)
  const loginRef = useRef(null)

  const clearForm = () => {
    const inputs = inputRef.current.querySelectorAll("input");

    inputs.forEach(input => {
      input.value = "";
    });
  };

  const handleRegister = (e) => {

    e.preventDefault()
    const formData = new FormData(inputRef.current);
    const data = Object.fromEntries(formData.entries());

    if (data.pwd !== data.pwdagain) {

      toast.error("Passwords do not match");
      return;
    }

    axios.post('/register', data).then(() => {

      toast("Registered succesfully")
      clearForm();
    }).catch((err) => {

      console.log(err)


      if (err.message === "Request failed with status code 500") {

        return toast.error("Cannot connect to server")
      }

      if (err.response) {
        return toast.error(err.response.data?.error)
      } else if (err.request) {
        return toast.error("Could not connect to server");
      } else {
        return toast.error(err.response.data.error)
      }
    })

  }

  const handleLogin = (e) => {

    e.preventDefault()

    setLoading(true)
    const formData = new FormData(loginRef.current);
    const data = Object.fromEntries(formData.entries());

    axios.post('/login', data, { withCredentials: true }).then(() => {

      toast("Login successful");
      navigate('/')

    }).catch((err) => {

      console.log(err)

      if (err.message === "Request failed with status code 500") {

        toast.error("Could not connect to server")
      }

      if (err.response) {

        toast.error(err.response.data?.error)

      } else if (err.request) {

        toast.error("Server is unreachable at the moment")

      } else {

        toast.error("Unexpected application error")
      }

    }).finally(() => {

      setLoading(false)
    })

  }

  const tabs = [
    {

      label: "Tab 1",
      content: <div className="tab-1"><form onSubmit={(e) => handleLogin(e)} ref={loginRef}>
        <h2 id="h2-login">Please enter your login info below</h2>
        <input type="text" placeholder="Username" className="input-box" name="username"></input><br />
        <input type="password" placeholder="Password" className="input-box" name="pwd"></input><br />
        <button className="button-login" style={{ opacity: loading ? 0.5 : 1 }} disabled={loading}>Login</button>
        <p id="p-login">Click <span onClick={() => setTab(2)} className="span-clickable">here</span> to register</p>
      </form>
      </div >

    },
    {

      label: "Tab 2",
      content: <div className="tab-2"><form onSubmit={(e) => handleRegister(e)} ref={inputRef}>
        <h2 id="h2-login">Register</h2>
        <label htmlFor="firstName">First Name</label>
        <input type="text" id="firstName" placeholder="First Name" name="firstName" required></input>
        <label htmlFor="lastName">Last Name</label>
        <input type="text" id="lastName" placeholder="Last Name" name="lastName" required></input>
        <label htmlFor="user">Username</label>
        <input type="text" id="user" placeholder="Desired username" name="username" required></input>
        <label htmlFor="pass">Password</label>
        <input type="password" id="pass" placeholder="Desired password" name="pwd" required></input>
        <label htmlFor="password">Password Again</label>
        <input type="password" id="passa" placeholder="Enter password again" name="pwdagain" required></input>
        <button type="submit" className="button-login">Register</button>
        <p id="p-login" onClick={() => setTab(1)} style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}>Back</p>
      </form>
      </div>
    }

  ]

  return (
    <div className="App-main">
      <div className="App-login">
        {tabs.map((t, i) => (
          tab - 1 === i ? (
            <div key={tab} style={{
              animation: "fadeSlide 0.25s ease",
            }}>{t.content}</div>
          ) : null
        ))}
      </div>
      <ToastContainer />
    </div>
  )
}

export default RegisterLogin
