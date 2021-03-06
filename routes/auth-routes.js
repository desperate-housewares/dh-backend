require("dotenv").config();
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const UserModel = require("../models/user");
const router = express.Router();
const errorFormatter = require("../utils/error-format")

router.use(express.json());

// Register new user
router.post("/register", async (req, res) => {
  try {
    // Get user input
    const { name, email, password } = req.body;

    // Validate user input
    if (!(name && email && password)) {
      return res.status(400).send("All input is required");
    }

    const lowerCaseEmail = email.toLowerCase();

    // Check if user already exist in our database
    const existingUser = await UserModel.findOne({ email: lowerCaseEmail });

    if (existingUser) {
      return res.status(409).send("User Already Exists. Please Login");
    }

    //Encrypt user password
    const encryptedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await UserModel.create({
      name: name,
      email: lowerCaseEmail,
      password: encryptedPassword,
    });

    // Create cookie with user details
    req.session.user = user;

    // Create token
    const token = jwt.sign(
      { user_id: user._id, lowerCaseEmail },
      process.env.TOKEN_KEY,
      {
        expiresIn: "2h",
      }
    );

    // Save token
    req.session.token = token;

    // Return new user
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(400).send(errorFormatter(error.message));
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    // Get user input
    const { email, password } = req.body;

    // Validate user input
    if (!(email && password)) {
      return res.status(400).send("All input is required");
    }

    const lowerCaseEmail = email.toLowerCase();
    // Validate if user exist in our database
    const user = await UserModel.findOne({ email: lowerCaseEmail });

    if (user && (await bcrypt.compare(password, user.password))) {
      // Create cookie with user details
      req.session.user = user;

      // Create token
      const token = jwt.sign(
        { user_id: user._id, lowerCaseEmail },
        process.env.TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );

      // Save the users token to cookie
      req.session.token = token;

      // Return the user
      return res.status(200).json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
    return res.status(400).send("Invalid Credentials");
  } catch (error) {
    res.send(400).send(error.message);
  }
});

// Logout
router.post("/logout", (req, res) => {
  if (req.session.user) {
    req.session.destroy((err) => {
      if (err) {
        res.status(500).send("Something wrong with logout");
      } else {
        res.status(200).send("Successfully logged out");
      }
    });
  } else {
    res.status(200).send("Not logged in");
  }
});

module.exports = router;
