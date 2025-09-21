const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const url = process.env.MONGO_URL;

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(bodyParser.json());
app.use(express.static("public"));

// // Connect to MongoDB
// mongoose.connect(url, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// // Schema
// const sihSchema = new mongoose.Schema({
//   username: { type: String, required: true, unique: true },
//   password: { type: String, required: true },
// });

// const Sih = mongoose.model("Sih", sihSchema);

// Routes
app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { message: null });
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user = await Sih.findOne({ username });

  if (!user) {
    return res.render("login", { message: "User not found" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { message: "Invalid password" });
  }

  res.redirect("/home");
});

app.get("/signup", (req, res) => {
  res.render("signup", { message: null });
});

app.post("/signup", async (req, res) => {
  try {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new Sih({ username, password: hashedPassword });
    await newUser.save();

    res.render("login", { message: "Signup successful! Please log in." });
  } catch (err) {
    if (err.code === 11000) {
      res.render("signup", { message: "Username already exists!" });
    } else {
      res.render("signup", { message: "Server error, try again." });
    }
  }
});

// Dummy groundwater data (replace later with DB data)
const groundwaterData = [
  {
    state: "Madhya Pradesh",
    district: "Indore",
    year: 2020,
    info: "Water level declined by 5m.",
  },
  {
    state: "Maharashtra",
    district: "Pune",
    year: 2021,
    info: "Rainfall improved recharge by 10%.",
  },
  {
    state: "Rajasthan",
    district: "Jaipur",
    year: 2022,
    info: "Groundwater extraction exceeded recharge.",
  },
];

// Home route
app.get("/home", (req, res) => {
  const { state, district, year } = req.query;

  let filtered = groundwaterData;

  if (state) filtered = filtered.filter((d) => d.state === state);
  if (district) filtered = filtered.filter((d) => d.district === district);
  if (year) filtered = filtered.filter((d) => d.year.toString() === year);

  res.render("home", {
    data: filtered,
    filters: { state, district, year },
    message: filtered.length
      ? null
      : "Showing current news on groundwater resources...",
    chatbotUrl: process.env.CHATBOT_API_URL,
  });
});

app.post("/chatbot", (req, res) => {
  // Forward user query to your n8n workflow / AI agent
  res.json({ reply: "This is a placeholder reply from chatbot." });
});

// Start server
app.listen(5000, () => console.log("Server running on http://localhost:5000"));
