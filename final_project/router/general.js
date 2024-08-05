const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
    const { username, password } = req.body;

    // Check if both username and password are provided
    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    // Check if the username already exists
    const existingUser = users.find(user => user.username === username);

    if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
    }

    // Add the new user to the users array
    users.push({ username, password });

    return res.status(201).json({ message: "User registered successfully" });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
    // Convert the books object to an array
    const booksArray = Object.keys(books).map(key => ({
        id: key,
        ...books[key]
    }));

    if (booksArray.length > 0) {
        return res.status(200).json(booksArray); // Respond with the list of books
    } else {
        return res.status(404).json({ message: "No books found" }); // Handle case where no books are found
    }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  // Extract the ISBN from the request parameters
  const { isbn } = req.params;

  // Check if the book with the given ISBN exists
  const book = books[isbn];

  if (book) {
    // If the book exists, return the book details
    return res.status(200).json(book);
  } else {
    // If the book does not exist, return a 404 error with a message
    return res.status(404).json({ message: "Book not found" });
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const { author } = req.params

    const booksByAuthor = Object.values(books).filter(book => book.author === author);

    if (booksByAuthor.length > 0){
        return res.status(200).json(booksByAuthor);
    } else {
        // Handle case where no books are found by the author
        return res.status(404).json({ message: "No books found by this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const { title } = req.params;

    // Convert the books object to an array
    const booksArray = Object.keys(books).map(key => ({
        id: key,
        ...books[key]
    }));

    // Filter books by title
    const filteredBooks = booksArray.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

    if (filteredBooks.length > 0) {
        return res.status(200).json(filteredBooks); // Respond with the list of filtered books
    } else {
        return res.status(404).json({ message: "No books found with the given title" }); // Handle case where no books match
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const { isbn } = req.params;

    // Check if the book exists
    const book = books[isbn];

    if (book) {
        // If reviews exist, return them; otherwise, return a message indicating no reviews
        if (Object.keys(book.reviews).length > 0) {
            return res.status(200).json(book.reviews);
        } else {
            return res.status(404).json({ message: "No reviews found for this book" });
        }
    } else {
        return res.status(404).json({ message: "Book not found" });
    }
});

module.exports.general = public_users;
