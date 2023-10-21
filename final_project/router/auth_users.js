const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => { //returns boolean
    let userswithsamename = users.filter((user)=>{
        return user.username === username
    });
    if(userswithsamename.length > 0){
        return true;
    } else {
        return false;
    }    
}

const loginUser = (username, password) => { //returns boolean
    let validusers = users.filter((user)=>{
        return (user.username === username && user.password === password)
    });
    if(validusers.length > 0){
        return true;
    } else {
        return false;
    }
}

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {

    if (!req.user) {
        res.status(404).send("Session expired. Please login again");
        return;
    }

    let review = req.query.review;
    if (!review) {
        res.status(404).send("Review parameter missing");
        return;
    }

    let isbn = req.params.isbn;
    // if isbn valid and book exists
    if (isbn && books[isbn]) {
        let book = books[isbn];

        // get review of current user
        let r = book.reviews[user];
        if (r) {
            // if review does exist already - then update existing review (overwrite)
            book.reviews[user] = review;
        } else {
            // if review does not exist - then create one
            book.reviews[user] = review;
        }

        res.send("");
    } else {
        res.status(404).send("No book found by isbn");
    }
});

//delete book review
// Add a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    if (!req.user) {
        res.status(404).send("Session expired. Please login again");
        return;
    }

    let isbn = req.params.isbn;
    // if isbn valid and book exists
    if (isbn && books[isbn]) {
        let book = books[isbn];

        // delete review if it exists
        if (book.reviews[user])
            delete book.reviews[user];

        res.send("");
    } else {
        res.status(404).send("No book found by isbn");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.loginUser = loginUser;
module.exports.users = users;
