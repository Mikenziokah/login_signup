const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const session = require("express-session");
const UserModel = require("./config"); // Assuming your Mongoose model is defined in config.js

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

// Session middleware
app.use(
  session({
    secret: "20ad348d81eafea0653addd35199ff6775498e9a9fe292ed503a32bd7552e8b6",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

// Set view engine
app.set("view engine", "ejs");

// Routes
app.get("/", (req, res) => {
  if (req.session.user) {
    res.render("home", { user: req.session.user });
  } else {
    res.render("login");
  }
});

app.get("/signup", (req, res) => {
  res.render("signup");
});

// Register User
app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the username already exists
    const existingUser = await UserModel.findOne({ name: username });

    if (existingUser) {
      return res
        .status(409)
        .send("User already exists. Please choose a different username.");
    }

    // Validate password strength (simple example, customize as needed)
    if (password.length < 8) {
      return res
        .status(400)
        .send("Password must be at least 8 characters long.");
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create a new user document and save it to the database
    const newUser = new UserModel({
      name: username,
      password: hashedPassword,
    });

    await newUser.save();

    res.redirect("/");
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

// Login user
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find the user by username
    const user = await UserModel.findOne({ name: username });

    if (!user) {
      return res.status(404).send("Username not found.");
    }

    // Compare the hashed password
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.status(401).send("Incorrect password.");
    }

    // Set session user
    req.session.user = user;
    res.render("home", { user });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred. Please try again later.");
  }
});

// Logout user
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("An error occurred while logging out.");
    }
    res.redirect("/");
  });
});

// Define Port for Application
const port = 5000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

