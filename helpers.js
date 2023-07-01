// find user by email
const findUserByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return undefined; // user not found
};

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

module.exports = { findUserByEmail, generateRandomString }