const express = require("express");
const router = express.Router();

const { getHashed, compareHash } = require("./hash");

router.get("/logout", async (req, res) => {
  req.session.user = undefined;
  res.redirect("/");
});


router.get("/signup", async (req, res) => {
  res.render("signup", { hide_login: true });
});

router.post("/signup", async (req, res) => {
  const username = req.body.username.trim();
  const first_name = req.body.firstname.trim();
  const last_name = req.body.lastname.trim();
  const pass1 = req.body.password.trim();
  const pass2 = req.body.password2.trim();

  if (pass1 != pass2) {
    res.render("signup", {
      hide_login: true,
      message: "Passwords do not match!",
    });
    return;
  }

  const user = await req.db.findUserByUserName(username);
  if (user) {
    res.render("signup", {
      hide_login: true,
      message: "Username already exists!",
    });
    return;
  }

  const hash = getHashed(pass1);

  const id = await req.db.createUser(first_name, last_name, username, hash);
  res.redirect("/login");
});

router.get("/login", async (req, res) => {
  res.render("login", { hide_login: true });
});

router.post("/login", async (req, res) => {
  const username = req.body.username;
  const pass1 = req.body.password.trim();
  const user = await req.db.findUserByUserName(username);

  if (user && compareHash(pass1, user.password)) {
    req.session.user = user;
    res.redirect("/");
    return;
  }
  else {
    res.render("login", {
      hide_login: true,
      message: "Could not authenticate!",
    });
    return;
  }
});


module.exports = router;
