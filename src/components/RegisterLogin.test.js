import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import RegisterLogin from "./RegisterLogin";
import { handleRegister } from "./RegisterLogin";
import { useNavigate } from 'react-router-dom'
import axios from "../axios";

jest.mock("../axios", () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn()
}));

test("displays the button", () => {

  render(
    <BrowserRouter>
      <RegisterLogin />
    </BrowserRouter>

  );

  expect(screen.getByRole("button")).toHaveTextContent("Login");
})

test("change tab works", () => {

  render(
    <BrowserRouter>
      <RegisterLogin />
    </BrowserRouter>

  );

  expect(screen.queryByText("First Name")).not.toBeInTheDocument();

  let button = screen.getByLabelText("changeTab")

  fireEvent.click(button)

  expect(screen.queryByText("First Name")).toBeInTheDocument();


})

test("change tab to tab one then back to tab 2 works", () => {

  render(
    <BrowserRouter>
      <RegisterLogin />
    </BrowserRouter>

  );

  expect(screen.queryByText("First Name")).not.toBeInTheDocument();

  let button = screen.getByLabelText("changeTab")

  fireEvent.click(button)

  expect(screen.queryByText("First Name")).toBeInTheDocument();

  let back = screen.getByLabelText("back")

  fireEvent.click(back)

  expect(screen.queryByText("First Name")).not.toBeInTheDocument();


})

test("Test register function", async () => {

  axios.post.mockResolvedValue({

    data: {
      success: true,
      userId: 123
    }
  });

  render(
    <BrowserRouter>
      <RegisterLogin />
    </BrowserRouter>

  );

  const changeTabButton = screen.getByLabelText("changeTab");

  fireEvent.click(changeTabButton);

  const registerButton = screen.getByRole("button", {
    name: /register/i
  });

  fireEvent.click(registerButton);

  await waitFor(() => {

    expect(axios.post).toHaveBeenCalledWith(
      "/register",
      expect.anything()
    );

  })

})

test("Test login function on empty submit", async () => {

  axios.post.mockResolvedValue({
    data: {
      success: true,
      userId: 123
    }
  });

  render(
    <BrowserRouter>
      <RegisterLogin />
    </BrowserRouter>

  );

  const loginButton = screen.getByRole("button", {
    name: /login/i
  });

  fireEvent.click(loginButton);

  await waitFor(() => {

    expect(axios.post).toHaveBeenCalledWith(
      "/login",
      {
        username: "",
        pwd: ""
      },
      { withCredentials: true }
    );

  })

});

test("Test login function on login details username: jeet pwd: 123", async () => {

  axios.post.mockResolvedValue({
    data: {
      success: true,
      userId: 123
    }
  });

  render(
    <BrowserRouter>
      <RegisterLogin />
    </BrowserRouter>

  );

  fireEvent.change(
    screen.getByPlaceholderText("Username"),
    {
      target: { value: "jeet" }
    }
  );

  fireEvent.change(
    screen.getByPlaceholderText("Password"),
    {
      target: { value: "123" }
    }
  );

  const loginButton = screen.getByRole("button", {
    name: /login/i
  });

  fireEvent.click(loginButton);

  await waitFor(() => {

    expect(axios.post).toHaveBeenCalledWith(
      "/login",
      {
        username: "jeet",
        pwd: "123"
      },
      { withCredentials: true }
    );

  })
});



