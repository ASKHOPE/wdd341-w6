const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const { MongoClient } = require("mongodb");
const punycode = require("punycode/");

require("dotenv").config();

// Configure Passport (Optional)
require("./auth/oauth.js");

const app = express();
const port = process.env.PORT || 8080;

// Session and Passport Configuration
const SECT_SRECT = process.env.SESSION_SECRET;
const CRY_SRECT = process.env.CRYPTO_SECRET;

// Ensure that the session secret is set
if (!SECT_SRECT) {
  console.error(
    "Error: The session secret is not set. Please check your .env file."
  );
  process.exit(1);
}

app.use(
  session({
    secret: SECT_SRECT,
    saveUninitialized: true,
    resave: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_API_KEY,
      crypto: {
        secret: CRY_SRECT,
      },
    }),
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Authentication Routes
app.get("/login", (req, res) => {
  res.send('<a href="/auth/google">Authenticate with Google</a>');
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/user",
    failureRedirect: "/google/failure",
  })
);

app.get("/google/failure", (req, res) => {
  res.send("Something went wrong with the authentication...");
});

// Logout Route (Optional)
app.get("/logout", (req, res) => {
  req.session.destroy();
  res.send("Goodbye! You have logged out.");
  res.redirect("/");
});



// isLoggedIn Middleware (Optional)
function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

// Body Parser and CORS Configuration
app
  .use(bodyParser.json())
  .use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  })
  .use("/", isLoggedIn, require("./routes"));

// Database Connection
const mongoClient = new MongoClient(process.env.MONGO_API_KEY, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoClient
  .connect()
  .then(() => {
    app.listen(port, () => {
      console.log(`DB Connected and server running on ${port}.`);
    });
  })
  .catch((err) => {
    console.error("Cannot connect to the database!", err);
    process.exit(1);
  });
