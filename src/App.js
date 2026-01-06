import './App.css';
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react';
import axios from 'axios'
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './components/Navbar'

function App() {

  const [tweets, setTweet] = useState([])

  const [text, setText] = useState("")
  const [title, setTitle] = useState("")

  const [id, setId] = useState("")
  const [username, setUsername] = useState("")

  const [loading, setLoading] = useState(false);

  let navigate = useNavigate();

  async function updateTweets() {

    axios.get('http://localhost:8080/get-data-from-cache').then(response => {

      setTweet(response.data)

    }).catch(err => {

      console.log(err)
    })

  }

  useEffect(() => {

    axios.get('http://localhost:8080/profile', { withCredentials: true }).then(response => {

      if (response.data.loggedIn === false) {

        navigate('/login')
        return
      }

      setId(response.data.user.id)
      setUsername(response.data.user.username)
      updateTweets()

    }).catch(err => {

      navigate('/login')
      console.log(err)
    })

  }, [])

  async function postTweet() {

    let textTrim = text.trim()
    let titleTrim = title.trim()

    setLoading(true);

    if (textTrim === "" || titleTrim === "") {

      toast.error("One or more of your fields are empty")
      setLoading(false)
      return
    }

    axios.post('http://localhost:8080/post-tweet', { title: titleTrim, text: textTrim, id: id }).then(res => {

      updateTweets()
      setText("")
      toast("Tweet posted!")
      setTitle("")
      setLoading(false);

    }

    ).catch(err => {

      console.log(err)
    })

  }

  return (
    <div className="App">
      <ToastContainer />
      <Navbar />
      <div className="App-main">
        <div className="main-frame">
          <h2>Welcome {username}</h2>
          <div className="tweet-box">
            <h3 style={{ marginBottom: "10px", marginTop: "0px" }}>Post your tweet here</h3>
            <input type="text" className="input-tweet-box" placeholder="Insert your title here" style={{ marginBottom: "10px" }} onChange={(e) => setTitle(e.target.value)} value={title}></input>
            <textarea rows={7} cols={50} placeholder="Post your tweet here" style={{ marginBottom: "10px", padding: "10px" }} onChange={(e) => setText(e.target.value)} value={text}>Hello</textarea>
            <button onClick={postTweet} disabled={loading}>{loading ? <div class="loader"></div> : "Submit"}</button>

          </div>

          {tweets.map((tweet) => {
            return <div className="tweet-box" key={tweet.id}>
              <h4>posted by: {tweet.username}</h4>
              <span>Date posted: {tweet.date.split("T")[0]}</span>
              <h3>{tweet.title}</h3>
              <p>{tweet.tweet}</p>
            </div>
          })}

        </div>
      </div>
    </div >
  );
}

export default App;
