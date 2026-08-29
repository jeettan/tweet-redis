import { useState } from "react"
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios'
import { toast } from "react-toastify";
import StaticModal from "../Modal/StaticModal"
import Chip from "@mui/material/Chip";

const Postbox = ({ tweet_id, tweet_username, tweet_date, tweet_likes, tweet_title, tweet_tweet, likes, id, comments, setLikes, setTweet, updateTweets, shared_post }) => {

    const [commentsOn, setCommentsOn] = useState(false);
    const [newComment, setNewComment] = useState("")

    const [show, setShow] = useState(false)
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    function submitComment() {

        setNewComment("")

        axios.post('/comments', { user_id: id, post_id: tweet_id, comment_content: newComment }).then((res) => {
            updateTweets()
            toast("Comment posted")
        }).catch((err) =>
            console.log(err)
        )
    }

    function tapHeart(e, tweet_id) {

        let val = likes.includes(tweet_id) ? -1 : 1

        if (val === 1) {

            setLikes(prev => [...prev, tweet_id])

            setTweet((prev) =>
                prev.map((tweet) =>
                    tweet.id === tweet_id
                        ? { ...tweet, likes: tweet.likes + 1 }
                        : tweet
                )
            );

            axios.post('/likes', { user_id: id, post_id: tweet_id }).then((res) => {

                toast("You liked a post!")

            }).catch((err) =>
                console.log(err)
            )

        } else if (val === -1) {

            setLikes(prev => prev.filter(item => item !== tweet_id));

            setTweet((prev) =>
                prev.map((tweet) =>
                    tweet.id === tweet_id
                        ? { ...tweet, likes: tweet.likes - 1 }
                        : tweet
                )
            )

            axios.delete('/likes', { data: { user_id: id, post_id: tweet_id } }).then((res) => {
                toast("You unliked a post!")
            }).catch((err) =>
                console.log(err)

            )
        }
    }

    function sharePost() {

        handleClose()

        axios.post('/share', { tweet_id, user_id: id }).then((res) => {

            updateTweets()

        }).catch((err) =>
            console.log(err)

        ).finally(() => {

            toast("Retweeted post")

        })
    }


    return <div className="tweet-box" key={tweet_id}>
        <StaticModal show={show} handleClose={handleClose} sharePost={sharePost} />
        <div className="post-detail">
            <h4>{tweet_username}</h4>
            <span>Date posted: {tweet_date}</span>
            {shared_post && (<Chip label="Retweet" color="secondary" sx={{
                paddingTop: "5px",
                paddingBottom: "2px",
            }} />)}
        </div>
        <hr />
        <h3>{tweet_title}</h3>
        <p>{tweet_tweet}</p>
        <div className="like-box">
            {likes.includes(tweet_id) ? <img src="/heart_tapped.png" alt="Liked heart" width={20} onClick={(e) => tapHeart(e, tweet_id)} style={{
                cursor: "pointer"
            }} /> : <img src="/heart.png" alt="Heart" width={20} onClick={(e) => tapHeart(e, tweet_id)} style={{
                cursor: "pointer"
            }} />}
            <span>{tweet_likes} likes</span>
            <img src="/chat-bubble.png" alt="Comments" width={18} style={{ marginLeft: "5px" }} onClick={() => setCommentsOn(prev => !prev)}></img>
            <span>{comments.length === 0 ? "0 comments" : comments.length + " comments"}</span>

            <img src="./send.png" alt="Share" width={17} onClick={() => handleShow()}></img>

        </div>
        {commentsOn && (
            <div className="comment-box">
                <div className="comment-input">
                    <input type="text" placeholder="Write your comments here" maxLength={100} value={newComment} onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                submitComment();
                            }
                        }}
                    />
                    <button type="submit">
                        <SendIcon color="primary" fontSize="small" sx={{ marginTop: "3px" }} onClick={() => submitComment()} />
                    </button>
                </div>
                <div className="comment-display">
                    {comments.map((comment) => {
                        return (

                            <div key={comment.id} className="comment-bubble">
                                <div style={{ fontWeight: "bold" }}>
                                    {comment.first_name} {comment.last_name}
                                </div>
                                <div>
                                    {comment.comment}
                                </div>

                            </div>
                        )
                    })}
                </div>
            </div>

        )}

    </div>

}

export default Postbox