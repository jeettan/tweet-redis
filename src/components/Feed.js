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
  const [loadingStage, setLoadingStage] = useState(0)

  const [likes, setLikes] = useState([]);

  const [likeDisabled, setLikeDisabled] = useState(false);

  let navigate = useNavigate();

  async function updateTweets() {

    axios.get('/get-tweets-from-cache').then(response => {

      setTweet(response.data)

    }).catch(err => {

      console.log(err)
    }).finally(() => {


      if (loadingStage < 2) {

        setLoadingStage(prev => prev + 1)

      }
    }

    )

  }

  useEffect(() => {

    if (loadingStage >= 2) {

      setTweetLoading(false)

    }

  }, [loadingStage])

  useEffect(() => {

    //1

    axios.get('/get-likes-from-cache', { params: { user_id: id } }).then(response => {

      console.log(response)
      
      setLikes(response.data.map(Number));

    }).catch(err => {

      console.log(err)
    }).finally(() => {


      if (loadingStage < 2) {

        setLoadingStage(prev => prev + 1)

      }

    })

  }, [id])


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

    setLikeDisabled(true)

    let val = likes.includes(tweet_id) ? -1 : 1

    if (val == 1) {

      setLikes(prev => [...prev, tweet_id])

      setTweet((prev) =>
        prev.map((tweet) =>
          tweet.id === tweet_id
            ? { ...tweet, likes: tweet.likes + 1 }
            : tweet
        )
      );

      axios.patch('/like-count', { id: tweet_id, val }).then(() => {


        axios.post('/likes', { user_id: id, post_id: tweet_id }).then((res) => {

          setLikeDisabled(false)
          toast("You liked a post!")

        }).catch((err) =>
          console.log(err)
        )



      }).catch((err) => {

        console.log(err)
      })


    } else if (val === -1) {

      setLikes(prev => prev.filter(item => item !== tweet_id));

      setTweet((prev) =>
        prev.map((tweet) =>
          tweet.id === tweet_id
            ? { ...tweet, likes: tweet.likes - 1 }
            : tweet
        )
      )

      axios.patch('/like-count', { id: tweet_id, val }).then(() => {

        axios.delete('/likes', { data: { user_id: id, post_id: tweet_id } }).then((res) => {

          console.log("Deleted like")

          setLikeDisabled(false)

        }).catch((err) =>
          console.log(err)

        )


      }).catch((err) => {

        console.log(err)
      })

    }

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

        {tweetLoading ? <span className="spinner" /> : tweets.map((tweet) => {

          return <div className="tweet-box" key={tweet.id}>
            <div className="post-detail"><h4>{tweet.username}</h4><span>Date posted: {tweet.date.split("T")[0]}</span></div>
            <hr />
            <div className="like-box">
              {likes.includes(tweet.id) ? <img src="/heart_tapped.png" alt="Logo" width={20} onClick={!likeDisabled ? (e) => tapHeart(e, tweet.id) : undefined} style={{
                opacity: likeDisabled ? 0.5 : 1,
                cursor: likeDisabled ? "not-allowed" : "pointer"
              }} /> : <img src="/heart.png" alt="Logo" width={20} onClick={!likeDisabled ? (e) => tapHeart(e, tweet.id) : undefined} style={{
                opacity: likeDisabled ? 0.5 : 1,
                cursor: likeDisabled ? "not-allowed" : "pointer"
              }} />}
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
