import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import { useEffect, useState } from 'react';
import axios from 'axios'

function Feed() {

  const [tweets, setTweet] = useState([])

  const [text, setText] = useState("")
  const [title, setTitle] = useState("")

  const [id, setId] = useState("")
  const [username, setUsername] = useState("")

  const [loading, setLoading] = useState(false);
  const [tweetLoading, setTweetLoading] = useState(true);

  const [likes, setLikes] = useState([]);

  let navigate = useNavigate();

  async function updateTweets() {

    axios.get('/get-data-from-cache').then(response => {

      setTweet(response.data)

    }).catch(err => {

      console.log(err)
    }).finally(() =>

      setTweetLoading(false)
    )

  }


  useEffect(() => {

    axios.get('/likes', { params: { user_id: id } }).then((res) => {

      let r = res.data

      const missing = r.filter(num => !likes.includes(num.post_id));

      if (missing.length > 0) {

        for (let i in missing) {

          let curr = missing[i].post_id

          setLikes((prev) => [
            ...prev, curr
          ]);

        }

      }

    }).catch((err) => {

      console.log(err)
    })

  }, [tweets]);

  useEffect(() => {

    axios.get('/profile', { withCredentials: true }).then(response => {

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

    axios.post('/post-tweet', { title: titleTrim, text: textTrim, id: id }).then(res => {

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

  function tapHeart(e, tweet_id) {

    let val = likes.includes(tweet_id) ? -1 : 1

    axios.patch('/like-count', { id: tweet_id, val }).then((res) => {

      if (val === 1) {

        axios.post('/likes', { user_id: id, post_id: tweet_id }).then((res) => {

        }).catch((err) =>
          console.log(err)
        )

      } else if (val === -1) {

        axios.delete('/likes', { data: { user_id: id, post_id: tweet_id } }).then((res) => {

          setLikes(prev => prev.filter(item => item !== tweet_id));

        }).catch((err) =>
          console.log(err)

        )
      }

    }).then((res) => {


      console.log(res)
    }).catch((err) => {

      console.log(err)
    }).finally(() => {

      updateTweets()

    })

  }

  return (
    <div className="App-main">
      <div className="main-frame">
        <h2>Welcome {username}</h2>
        <div className="tweet-box-input">
          <h3 style={{ marginBottom: "10px", marginTop: "0px" }}>Post your tweet here</h3>
          <input type="text" maxLength={40} className="input-tweet-box" placeholder="Insert your title here" style={{ marginBottom: "10px" }} onChange={(e) => setTitle(e.target.value)} value={title}></input>
          <textarea maxLength={150} rows={7} cols={50} placeholder="Post your tweet here" style={{ marginBottom: "10px", padding: "10px" }} onChange={(e) => setText(e.target.value)} value={text}>Hello</textarea>
          <button onClick={postTweet} disabled={loading}>{loading ? <div class="loader"></div> : "Submit"}</button>
        </div>

        {tweetLoading ? "" : tweets.map((tweet) => {

          return <div className="tweet-box" key={tweet.id}>
            <div className="post-detail"><h4>{tweet.username}</h4><span>Date posted: {tweet.date.split("T")[0]}</span></div>
            <hr />
            <div className="like-box">
              {likes.includes(tweet.id) ? <img src="/heart_tapped.png" alt="Logo" width={20} onClick={(e) => tapHeart(e, tweet.id)} /> : <img src="/heart.png" alt="Logo" width={20} onClick={(e) => tapHeart(e, tweet.id)} />}
              <span>{tweet.likes} likes</span>
            </div>
            <h3>{tweet.title}</h3>
            <p>{tweet.tweet}</p>
          </div>
        })}

      </div>
      <ToastContainer />
    </div>
  )
}

export default Feed
