
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});