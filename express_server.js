
const express = require("express");
const cookieParser = require('cookie-parser');

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
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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



app.use(express.urlencoded({ extended: true})); // To make this data readable will translate, or parse the body

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req,res) => { // add routes
  res.json(urlDatabase);
});




// add a route for urls
app.get("/urls", (req, res) => {
  const user = users[req.cookies.user_id]; // retrieve the user object using user_id
  const templateVars  = { 
    user: user,
    urls: urlDatabase,
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars  = { 
    user: user,
    urls: urlDatabase,
  };
  res.render("urls_new", templateVars);
});

app.get("/u/:id", (req, res) => {
  const shortUrl = req.params.id; // extract short url from request
  const longURL = urlDatabase[shortUrl]; // get the long url 


// edge in short url not exist
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.status(404).send("Short URL not found");
}
});


// add a second route and template
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const user = users[req.cookies.user_id];
  const templateVars  = { 
    user: user,
    id: id,
    longURL: longURL,
  };  
  res.render("urls_show", templateVars);
});



app.get("/hello", (req, res) => {
  res.send("<html> <body>Hello <b>World</b></body></html>\n"); // sending html
});

app.get("/register", (req, res) => {
  res.render("register");
  });

  app.get("/login", (req, res) => {
    res.render("login");
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

// object new user
  const newUser = {
    id: userID,
    email,
    password
  };
// add new user to database
  users[userID] = newUser;

  
  // set userId cookie
  res.cookie("user_id", userID);
  res.redirect("/urls");
})





app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(); //generate the random short  URL
  const longURL = req.body.longURL; // get the long url from request
  urlDatabase[shortUrl] = longURL; // save the key-value pair to urlDatabase
  res.redirect(`/urls/${shortUrl}`);// redirect to a new page with new shortURL
});

app.post("/urls/:id/edit", (req, res) => { // post updated URL
  
  const id = req.params.id;
  const newlongURL = req.body.longURL; // get the updated Url from body
  urlDatabase[id] = newlongURL;
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  
  const id = req.params.id;
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
if (user && user.password === password) {
  // set the username cookie
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