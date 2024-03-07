const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const app = express();
const secretText = "superSecret";
const refreshSecretText = "superSuperSecret";

const posts = [
  {
    username: "deok",
    title: "Post 1",
  },
  {
    username: "yerim",
    title: "Post 2",
  },
];

let refreshTokens = [];

const port = 4000;

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
  res.send("안녕안녕 나는 덕기야~");
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const user = { name: username };


  const accessToken = jwt.sign(user, secretText, { expiresIn: "30s" });



  const refreshToken = jwt.sign(user, refreshSecretText, { expiresIn: "1d" });
  refreshTokens.push(refreshToken);

  res.cookie("jwt", refreshToken, {
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
  });
  res.json({ accessToken: accessToken });
});

app.get("/posts", authMiddleware, (req, res) => {
  res.json(posts);
});

function authMiddleware(req, res, next) {

  const authHeader = req.header["authorization"];

  const token = authHeader && authHeader.split(" ")[1];
  if (token === null) return res.sendStatus(400);

  jwt.verify(token, secretText, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

app.get('/refresh', (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(401);

  const refreshToken = cookies.jwt;

  if (!refreshToken.includes(refreshToken)) {
    return res.sendStatus(403);
  }

  jwt.verify(refreshToken, refreshSecretText, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = jwt.sign({ name: user.name }, secretText, {
      expiresIn: "30s",
    });
    res.json({ accessToken });
  });
});

app.listen(port, () => {
  console.log("listening on port" + port);
});