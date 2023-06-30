const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

// function to generate random string for URLs and User ID
const generateRandomString = function() {
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomString = '';
  
  for (let i = 0; i < 6; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    randomString += characters[randomIndex];
    
  }
  return randomString;
};

// find user by email
const findUserByEmail = (email) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null; // user not found
}

app.set("view engine", "ejs"); // for Use templating engine

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://lighthouselabs.ca",
    userID: "userRandomID"
  }, 
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  } 
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "email2@example.com",
    password: "dishwasher-funk",
  },
};
// function that retrn the URLS belomging to user
const urlsForUser = function(id) {
  const userUrls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }
  return userUrls;
};

app.use(express.urlencoded({ extended: true})); // To make this data readable will translate, or parse the body

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req,res) => { // add routes
  res.json(urlDatabase);
});

// add a route for urls
app.get("/urls", (req, res) => {
  // const user = users[req.cookies.user_id]; // retrieve the user object using user_id
  const userId = req.cookies.user_id;
  const user = users[userId];
  if (!user) {
    return res.redirect("/login");
  }
  
  const userUrls = urlsForUser(userId);

    const templateVars  = { 
    user,
    urls: userUrls,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  // check if the user is already logged in
  if (!user) {
    return res.redirect("/login");
  }
  const templateVars  = { 
    user,
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id; // extract short url from request
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : null;; // get the long url 
  
// edge in short url not exist
  if (!longURL) {
  return res.status(404).send("Short URL not found");
  } else {
    return res.redirect(longURL);
  } 
});

// add a second route and template
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;

  const user = users[req.cookies.user_id];
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  if (!user) {
    return res.status(401).send("You need to be logged in to view this page");
  }

  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to access this URL");
  }

  const templateVars  = { 
    user,
    id,
    longURL: urlDatabase[id].longURL,
  };  
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html> <body>Hello <b>World</b></body></html>\n"); // sending html
});

app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  // check if the user is already logged in
  if (user) {
  return res.redirect("/urls");
  }
  return res.render("register", { user });
});

app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
// check if the user is already logged in
  if (user) {
    return res.redirect("/urls");
  }
    return res.render("login", { user: req.user });
  });


app.post("/register", (req, res) => {
  const userID = generateRandomString(); //generate the random User ID
  const { email, password } = req.body; // extract value from form
  // check if email or password is empty
  if (!email || !password) {
  return res.status(400).send("Email and password cannot be empty");
  }

// check if email is already registered
const oldUser = findUserByEmail(email);
if (oldUser) {
  return res.status(400).send("Email is already registered");
}

const hashedPassword = bcrypt.hashSync(password, 10);

// object new user
  const newUser = {
    id: userID,
    email,
    password: hashedPassword, //save the password
  };
// add new user to database
  users[userID] = newUser;

  
  // set userId cookie
  res.cookie("user_id", userID);
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  const user = users[req.cookies.user_id];
  if (!user) {
    return res.status(401).send("Only Registered Users Can Shorten URLs"); 
  }

  const shortURL = generateRandomString(); //generate the random short  URL
  const longURL = req.body.longURL; // get the long url from request
  urlDatabase[shortURL] = {
    longURL,
    userID: user.id
   }; // save the key-value pair to urlDatabase
  res.redirect(`/urls/${shortURL}`);// redirect to a new page with new shortURL
});

app.post("/urls/:id/edit", (req, res) => { // post updated URL
  const id = req.params.id;
  const newLongURL = req.body.longURL; // get the updated Url from body
  const user = users[req.cookies.user_id];
  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }
  if (!user) {
    return res.status(401).send("You need to be logged in to perform this action");
  }

  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to edit this URL");
  }

    urlDatabase[id].longURL = newLongURL;
    res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const user = users[req.cookies.user_id];

  if (!urlDatabase[id]) {
    return res.status(404).send("URL not found");
  }

  if (!user) {
    return res.status(401).send("You need to be logged in to perform this action");
  }

  if (urlDatabase[id].userID !== user.id) {
    return res.status(403).send("You do not have permission to delete this URL");
  }

  delete urlDatabase[id];
  res.redirect("/urls");
});

//Update the Login Handler
app.post("/login", (req, res) => {
  const { email, password } = req.body;
// find the user by email - function on top 

// check if email or password is empty
if (!email || !password) {
  return res.status(403).send("Email and password cannot be empty");
}
const user = findUserByEmail(email);
if (user && bcrypt.compareSync(password, user.password)) { // compare pass
  // set the user cookie
  res.cookie("user_id", user.id);
  // redirect back to /urls
  res.redirect("/urls");
} else {
  return res.status(403).send("Invalid email or Password");
}
});

app.post("/logout", (req, res) => {
  // clear cookie
  res.clearCookie("user_id");
  // redirect back to /urls
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});