require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const morgan = require("morgan");

let refreshTokens = [];

const app = express();

app.use(express.json());
app.use(morgan("combined"));

app.post("/login", (req, res) => {
  // Authenticate user
  const user = ({ username } = req.body);
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.json({ accessToken, refreshToken });
});

app.post("/token", (req, res) => {
  const refreshToken = req.body.token;
  console.log(req.body, refreshTokens);
  if (refreshToken == null) {
    return res.sendStatus(401);
  }
  if (!refreshTokens.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken({ username: user.username });
    res.json({ accessToken });
  });
});

app.delete("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((token) => token !== req.body.token);
  res.sendStatus(204);
});

function generateAccessToken(user) {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15s" });
}

function generateRefreshToken(user) {
  const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);
  refreshTokens.push(refreshToken);
  return refreshToken;
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
