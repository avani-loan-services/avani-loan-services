// Simple in‑memory User model
let users = [];

class User {
  constructor(id, email, passwordHash) {
    this.id = id;
    this.email = email;
    this.passwordHash = passwordHash;
  }
}

module.exports = { users, User };
