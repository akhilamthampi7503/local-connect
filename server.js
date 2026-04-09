require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

app.use(cors());
app.use(express.json());

/* ✅ 1. CACHE CONTROL (first) */
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

/* ✅ 2. MIDDLEWARE */
app.use(express.json());

/* ✅ 3. STATIC FILES */
app.use(express.static("public"));

/* ✅ 4. ROOT ROUTE (PLACE HERE) */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ================= REGISTER ================= */
app.post("/api/register", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashed = await bcrypt.hash(password, 10);

    db.query(
      "INSERT INTO users (username,email,password,role) VALUES (?,?,?,?)",
      [username, email, hashed, "tourist"],  // 🔥 default role
      (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: "User already exists" });
        }

        res.json({ message: "Registered successfully" });
      }
    );

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

/* ================= LOGIN ================= */
app.post("/api/login", (req, res) => {
  const { identifier, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=? OR username=?",
    [identifier, identifier],
    async (err, data) => {

      if (err) {
        console.log(err);
        return res.status(500).json({ message: "DB error" });
      }

      if (data.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const user = data[0];

      const valid = await bcrypt.compare(password, user.password);

      if (!valid) {
        return res.status(400).json({ message: "Wrong password" });
      }

      // 🔥 ROLE BASED REDIRECT
      let redirect = "/touristdashboard.html";

      if (user.role === "guide") {
        redirect = "/guidedashboard.html";
      } 
      else if (user.role === "admin") {
        redirect = "/admindashboard.html";
      }

      res.json({
        message: "Login successful",
        role: user.role,
        redirect
      });
    }
  );
});

/* ================= SERVER ================= */
app.listen(5000, () => {
  console.log("🚀 Server running at http://localhost:5000");
});