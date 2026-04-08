require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./db");

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json());

/* ================= STATIC FILES ================= */
app.use(express.static(path.join(__dirname, "public")));

/* ================= HELPER ================= */
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET || "secret123", {
    expiresIn: "7d"
  });
};

/* ================= ROUTES ================= */

/* ROOT → LOGIN PAGE */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/* ADMIN LOGIN */
app.post("/api/auth/admin-login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM admin WHERE username=?", [username], async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ message: "Admin not found" });

    const admin = data[0];
    const valid = await bcrypt.compare(password, admin.password);

    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(admin.admin_id, "admin");

    res.json({
      token,
      role: "admin",
      redirect: "/admin.html"
    });
  });
});

/* TOURIST LOGIN */
app.post("/api/auth/tourist-login", (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM tourist WHERE email=?", [email], async (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ message: "Tourist not found" });

    const user = data[0];
    const valid = await bcrypt.compare(password, user.password);

    if (!valid) return res.status(400).json({ message: "Wrong password" });

    const token = generateToken(user.tourist_id, "tourist");

    res.json({
      token,
      role: "tourist",
      redirect: "/tourist.html"
    });
  });
});

/* GUIDE LOGIN */
app.post("/api/auth/guide-login", (req, res) => {
  const { phone } = req.body;

  db.query("SELECT * FROM guide WHERE phone=?", [phone], (err, data) => {
    if (err) return res.status(500).json(err);
    if (data.length === 0) return res.status(404).json({ message: "Guide not found" });

    const guide = data[0];

    const token = generateToken(guide.guide_id, "guide");

    res.json({
      token,
      role: "guide",
      redirect: "/guide.html"
    });
  });
});

/* ================= SERVER ================= */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});