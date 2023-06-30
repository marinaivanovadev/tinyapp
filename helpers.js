// find user by email
const findUserByEmail = (email, users) => {
  for (const userID in users) {
    const user = users[userID];
    if (user.email === email) {
      return user;
    }
  }
  return null; // user not found
};
module.exports = { findUserByEmail }