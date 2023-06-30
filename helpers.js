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
module.exports = { findUserByEmail }