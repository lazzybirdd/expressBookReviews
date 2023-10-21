const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
let loginUser = require("./auth_users.js").loginUser;
const jwt = require('jsonwebtoken');
const session = require('express-session')

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    //console.log("username: " + username + ", password: " + password);

    if (username && password) {
      if (!isValid(username)) { 
        users.push({"username":username,"password":password});
        return res.status(200).json({message: "User successfully registred. Now you can login"});
      } else {
        return res.status(404).json({message: "User already exists!"});    
      }
    } 
    return res.status(404).json({message: "Unable to register user."});
});

//only registered users can login
public_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!req.session) {
        return res.status(404).json({message: "Please enable cookies, so session can work properly"});
    }
    
    //console.log("username: " + username + ", password: " + password);

    if (!username || !password) {
        return res.status(404).json({message: "Error logging in"});
    }
  
    if (loginUser(username, password)) {

        let accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60 });
  
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");

    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    // if isbn valid and book exists
    if (isbn && books[isbn]) {
        let book = books[isbn];
        res.send(book);
    } else {
        res.status(404).send("No book found by isbn");
    }
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
    const author = req.params.author;

    // get list of books, so we can interate through it
    let bookList = [];
    Object.keys(books).forEach(key => bookList.push(books[key]));

    // now filter list of books by author (may return more than one book)
    let filtered_books = bookList.filter((book) => book.author.toLowerCase() === author.toLowerCase());

    if (filtered_books.length > 0) {
        res.send(JSON.stringify(filtered_books));
    } else{
        res.status(404).send("No book found by author");
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const title = req.params.title;

    // get list of books, so we can interate through it
    let bookList = [];
    Object.keys(books).forEach(key => bookList.push(books[key]));

    // now filter list of books by author (may return more than one book)
    let filtered_books = bookList.filter((book) => book.title.toLowerCase() === title.toLowerCase());

    if (filtered_books.length > 0) {
        res.send(JSON.stringify(filtered_books));
    } else{
        res.status(404).send("No book found by title");
    }});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    let isbn = req.params.isbn;
    // if isbn valid and book exists then return reviews
    if (isbn && books[isbn]) {
        let book = books[isbn];
        res.send(book.reviews);
    } else {
        res.status(404).send("No book found by isbn");
}});

module.exports.general = public_users;
