
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

const generateRandomString = function() {
  let characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let shortUrl = '';

  for (let i = 0; i < 6; i++) {
    let randomString = Math.floor(Math.random() * characters.length);
    shortUrl += characters[randomString];
  }
  return shortUrl;
};

app.set("view engine", "ejs"); // for Use templating engine

const urlDatabase = {
  "b2xVn2": "http://lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  const templateVars  = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
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
  const templateVars = { id, longURL};
  res.render("urls_show", templateVars);
});



app.get("/hello", (req, res) => {
  res.send("<html> <body>Hello <b>World</b></body></html>\n"); // sending html
});


app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(); //generate the random short  URL
  const longURL = req.body.longURL; // get the long url from request
  urlDatabase[shortUrl] = longURL; // save the key-value pair to urlDatabase
  res.redirect(`/urls/${shortUrl}`);// redirect to a new page with new shortURL
});

app.post("/urls/:id/delete", (req, res) => {
  
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});