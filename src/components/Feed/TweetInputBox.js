import { useState } from "react"
import axios from "axios"
import { toast } from "react-toastify";

export default function TweetInputBox({ title, setTitle, text, setText, id, updateTweets }) {

    const [loading, setLoading] = useState(false);

    async function postTweet() {

        let textTrim = text.trim()
        let titleTrim = title.trim()

        setLoading(true);

        if (textTrim === "" || titleTrim === "") {

            toast.error("One or more of your fields are empty")
            setLoading(false)
            return
        }

        axios.post('/post-tweet', { title: titleTrim, text: textTrim, user_id: id, shared_post: false }).then(res => {

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

        <div className="tweet-box-input">
            <h3 style={{ marginBottom: "10px", marginTop: "0px" }}>Post your tweet here</h3>
            <input type="text" maxLength={40} className="input-tweet-box" placeholder="Insert your title here" style={{ marginBottom: "10px" }} onChange={(e) => setTitle(e.target.value)} value={title}></input>
            <textarea maxLength={150} rows={7} cols={50} placeholder="Post your tweet here" style={{ marginBottom: "10px", padding: "10px" }} onChange={(e) => setText(e.target.value)} value={text}>Hello</textarea>
            <button aria-label="tweet-input" onClick={postTweet} disabled={loading}>{loading ? <div class="loader"></div> : "Submit"}</button>
        </div>)

}