const bcrypt = require("bcryptjs");

function getHashed(password) {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);

  return hash;
}

function compareHash(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }

  module.exports = {
    getHashed,
    compareHash,
  };
