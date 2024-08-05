const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
    return users.some(user => user.username === username && user.password === password);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const { username, password } = req.body;

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Validate the username
    if (!isValid(username)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Authenticate user
    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Generate a JWT token
    const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });

    // Save the token in the session
    req.session.token = token;
    req.session.username = username

    // Respond with success
    return res.status(200).json({ message: "Login successful", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Extract the ISBN from the URL parameters
  const { isbn } = req.params;
  // Extract the review from the query parameters
  const { review } = req.query;
  // Get the username from the session
  const username = req.session.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  // Check if review is provided
  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Add or update the review
  if (!books[isbn].reviews[username]) {
    books[isbn].reviews[username] = review;
    return res.status(201).json({ message: "Review added successfully" });
  } else {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review updated successfully" });
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
      // Extract the ISBN from the URL parameters
  const { isbn } = req.params;
  // Get the username from the session
  const username = req.session.username;

  // Check if the user is logged in
  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the user has a review for the book
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({ message: "Review not found for the user" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({ message: "Review deleted successfully" });   

});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
