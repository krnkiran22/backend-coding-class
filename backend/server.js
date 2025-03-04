const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect(
    "mongodb+srv://kirandev2210:kirankiran@secretapp.a7xtu.mongodb.net/?retryWrites=true&w=majority&appName=secretapp",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
    .then(() => console.log("✅ MongoDB Connected Successfully!"))
    .catch((err) => console.error("❌ MongoDB Connection Failed:", err));
  

    const secretSchema = new mongoose.Schema({
        secretId: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true },
        secretText: { type: String, required: true },
      });
      
      const Secret = mongoose.model("Secret", secretSchema);
      
// Save a secret
app.post("/save-secret", async (req, res) => {
  const { secretId, password, secretText } = req.body;

  if (!secretId || !password || !secretText) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newSecret = new Secret({
    secretId,
    passwordHash: hashedPassword,
    secretText,
  });

  await newSecret.save();
  res.json({ message: "Secret saved successfully!" });
});

// Retrieve a secret
app.post("/get-secret", async (req, res) => {
  const { secretId, password } = req.body;

  const secret = await Secret.findOne({ secretId });

  if (!secret) {
    return res.status(404).json({ message: "Secret not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, secret.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  res.json({ secretText: secret.secretText });
});

// Update a secret
app.post("/update-secret", async (req, res) => {
  const { secretId, password, newSecretText } = req.body;

  const secret = await Secret.findOne({ secretId });

  if (!secret) {
    return res.status(404).json({ message: "Secret not found" });
  }

  const isPasswordValid = await bcrypt.compare(password, secret.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Incorrect password" });
  }

  secret.secretText = newSecretText;
  await secret.save();

  res.json({ message: "Secret updated successfully!" });
});

// Start server
app.listen(5000, () => {
  console.log("Server is running on port 5000");
});