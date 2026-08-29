import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import TweetInputBox from "./TweetInputBox";
import { useNavigate } from 'react-router-dom'
import { useState } from "react"

jest.mock("axios", () => ({
    __esModule: true,
    default: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        defaults: {
            baseURL: "",
            withCredentials: false
        }
    }
}));

function updateTweetsMock() {

    return 1
}

function TestWrapper() {
    const [title, setTitle] = useState("Hello");
    const [text, setText] = useState("World");

    return (
        <TweetInputBox
            title={title}
            setTitle={setTitle}
            text={text}
            setText={setText}
            id="id" updateTweets={updateTweetsMock}
        />
    );
}


test("display the box", () => {

    render(
        <BrowserRouter>
            <TestWrapper />
        </BrowserRouter>
    )
    const button = screen.getByLabelText("tweet-input");
    expect(button).toBeInTheDocument();

})


test("display the box empty input", () => {

    render(
        <BrowserRouter>
            <TweetInputBox />
        </BrowserRouter>
    )
    const button = screen.getByLabelText("tweet-input");
    expect(button).toBeInTheDocument();

})

test("Input the box works", () => {

    render(
        <BrowserRouter>
            <TestWrapper />
        </BrowserRouter>
    )
    const input = screen.getByPlaceholderText("Insert your title here");
    expect(input).toHaveValue("Hello");
    const tweetBox = screen.getByPlaceholderText("Post your tweet here");
    expect(tweetBox).toHaveValue("World");

})

test("usestate working as expected on the inputbox", () => {

    render(
        <BrowserRouter>
            <TestWrapper />
        </BrowserRouter>
    )
    const input = screen.getByPlaceholderText("Insert your title here");
    expect(input).not.toHaveValue("");
    const tweetBox = screen.getByPlaceholderText("Post your tweet here");
    expect(tweetBox).not.toHaveValue("");

})
