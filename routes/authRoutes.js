const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");

//in memory storage
const users = [];
let nextId = 1;

const signOnToken = (user) => {
  return jsonwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
  );
};

//registration post mothod
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  // checks that all fields have been filled out
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  //checks if email is registered
  const existing = users.find((u) => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "Email already registered." });
  }

  //use bcrypt to hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  //create a new user and adds it to the array
  const user = { id: nextId++, name, email, password: hashedPassword };
  users.push(user);

  //token
  const token = signOnToken(user);

  //feedback that the user was successfully created
  res.status(201).json({
    message: "User created successfully.",
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
});

// post method for logging in
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Look up user by email
  const user = users.find((u) => u.email === email);
  //if email doesn't match, return 401 message
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  // Compare password against the stored password
  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  const token = signOnToken(user);

  res.json({
    message: "Login successful.",
    user: { id: user.id, name: user.name, email: user.email },
    token,
  });
});

module.exports = router;
