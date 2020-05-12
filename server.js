require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

const posts = [
  { username: "Jorge", title: "Post 1" },
  { username: "Eva", title: "Post 2" },
];

const app = express();

app.use(express.json());
app.use(morgan("combined"));

app.get("/posts", authenticateToken, (req, res) => {
  res.json(posts.filter((post) => post.username === req.user.username));
});

function authenticateToken(req, res, next) {
  const token = req.headers["x-access-token"];
  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
