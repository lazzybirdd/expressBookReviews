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

    let username = req.session.authorization["username"];

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
        let r = book.reviews[username];
        if (r) {
            // if review does exist already - then update existing review (overwrite)
            book.reviews[username] = review;
        } else {
            // if review does not exist - then create one
            book.reviews[username] = review;
        }

        res.send("Review of user " + username + " is updated");
    } else {
        res.status(404).send("No book found by isbn");
    }
});

//delete book review
regd_users.delete("/auth/review/:isbn", (req, res) => {

    let username = req.session.authorization["username"];

    let isbn = req.params.isbn;
    // if isbn valid and book exists
    if (isbn && books[isbn]) {
        let book = books[isbn];

        // delete review if it exists
        if (book.reviews[username]) {
            delete book.reviews[username];
        }

        res.send("Review of user " + username + " is deleted");
    } else {
        res.status(404).send("No book found by isbn");
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.loginUser = loginUser;
module.exports.users = users;
