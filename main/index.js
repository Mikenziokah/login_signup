const express = require("express");
const path = require("path");
const collection = require("./config");
const bcrypt = require('bcrypt');

const app = express();

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
// Middleware to serve static files
app.use(express.static("public"));
// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: false }));
// Setting EJS as the view engine
app.set("view engine", "ejs");

// Route to render login page
app.get("/", (req, res) => {
    res.render("login");
});

// Route to render signup page
app.get("/signup", (req, res) => {
    res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Check if the username already exists in the database
        const existingUser = await collection.findOne({ name: username });
        if (existingUser) {
            return res.status(400).send('User already exists. Please choose a different username.');
        }

        // Hash the password using bcrypt
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert the new user with the hashed password into the database
        const userdata = await collection.insertOne({ name: username, password: hashedPassword });
        console.log(userdata);

        res.status(201).send('User registered successfully');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Login user 
app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user by username
        const user = await collection.findOne({ name: username });
        if (!user) {
            return res.status(400).send("Username not found");
        }

        // Compare the hashed password from the database with the plaintext password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).send("Wrong Password");
        }

        res.render("home");
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// Define Port for Application
const port = 5000;
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
