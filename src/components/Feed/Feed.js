import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import { useEffect, useState, useCallback } from 'react';
import axios from 'axios'
import Postbox from './PostBox/Postbox';
import TweetInputBox from "./TweetInputBox"

function Feed() {

  const [tweets, setTweet] = useState([])

  const [text, setText] = useState("")
  const [title, setTitle] = useState("")

  const [id, setId] = useState("")
  const [username, setUsername] = useState("")

  const [tweetLoading, setTweetLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0)
  const [allComments, setAllComments] = useState([])
  const [likes, setLikes] = useState([]);

  let navigate = useNavigate();

  const updateTweets = useCallback(async () => {

    axios.get('/get-tweets-from-cache', { params: { user_id: id } }).then(response => {
      setTweet(response.data)
    }).catch(err => {
      console.log(err)
    }).finally(() => {

      if (loadingStage < 3) {
        setLoadingStage(prev => prev + 1)
      }

    })


    axios.get("/comments").then((res) => {
      setAllComments(res.data.rows)
    }).finally(() => {

      if (loadingStage < 3) {
        setLoadingStage(prev => prev + 1)
      }

    })

  }, [loadingStage])

  const updateLikes = useCallback(async (userId) => {

    axios.get('/get-likes-from-cache', { params: { user_id: userId } }).then(response => {
      setLikes(response.data.map(Number));
    }).catch(err => {

      console.log(err)
    }).finally(() => {

      if (loadingStage < 3) {
        setLoadingStage(prev => prev + 1)
      }

    })

  }, [loadingStage])


  useEffect(() => {

    axios.get('/profile', { withCredentials: true }).then(response => {

      if (response.data.loggedIn === false) {

        navigate('/login')
        return
      }

      setId(response.data.user.id)
      setUsername(response.data.user.username)

      updateTweets()
      updateLikes(response.data.user.id)

      // eslint-disable-next-line react-hooks/exhaustive-deps


    }).catch(err => {

      navigate('/login')
      console.log(err)
    })

  }, [])

  useEffect(() => {

    if (loadingStage === 3) {
      setTweetLoading(false)
    }

  }, [loadingStage])


  return (
    <div className="App-main">
      <div className="main-frame">
        <h2>Welcome {username}</h2>
        <TweetInputBox title={title} setTitle={setTitle} text={text} setText={setText} id={id} updateTweets={updateTweets} />

        {tweetLoading ? <span className="spinner" /> : tweets.map((tweet) => {
          let comments = allComments.filter((it) => it.post_id === tweet.id)
          return <Postbox tweet_id={tweet.id} tweet_username={tweet.username} tweet_date={tweet.date.split("T")[0]}
            tweet_likes={tweet.likes} tweet_title={tweet.title} tweet_tweet={tweet.tweet}
            likes={likes} id={id} comments={comments} setLikes={setLikes} setTweet={setTweet} updateTweets={updateTweets}
            shared_post={tweet.shared_post}

          />
        })}

      </div>
      <ToastContainer />
    </div>
  )
}

export default Feed
