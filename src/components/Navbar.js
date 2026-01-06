import '../App.css';
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function Navbar() {

  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {

    axios.get('http://localhost:8080/profile', { withCredentials: true }).then(response => {

      if (response.data.loggedIn === true) {

        setLoggedIn(true)

      }

    }).catch(err => {

      console.log(err)

    })

  }, [])

  const logout = () => {

    axios.get('http://localhost:8080/logout', { withCredentials: true }).then(response => {

      setLoggedIn(false);
      navigate('/login');

    }).catch(err => {

      console.log(err)
    })

  }

  return (
    <div>
      <nav><ul>
        <li><Link to="/">Dashboard</Link></li>
        {loggedIn ? <li><Link onClick={() => logout()}>Logout</Link></li> : <li><Link to="/login">Login</Link></li>}
      </ul>
      </nav>
    </div >
  );
}

export default Navbar;