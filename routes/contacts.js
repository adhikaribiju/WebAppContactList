const express = require("express");
const router = express.Router();

const geo = require("node-geocoder");
const geocoder = geo({ provider: "openstreetmap" });

const logged_in = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.render("unauthorized");
  }
};

router.get("/geoVerify", async (req, res) => {
  const address = req.query.address;
  const result = await geocoder.geocode(address);
  const addressBool = result.length > 0;
  res.json({ addressBool: addressBool });
});


router.get("/", async (req, res) => {
  const contacts = await req.db.getAllContacts();
  res.render("main", { contacts: contacts, user: req.session.user });
});


router.get("/create", async (req, res) => {
  res.render("create");
});


router.post("/create", async (req, res) => {
  const { title, firstname, lastname, phone, email } = req.body;
  let lat, lng, address = "";
  const result = await geocoder.geocode(req.body.address);

  if (result.length > 0) {
    lat = result[0].latitude;
    lng = result[0].longitude;
    address = result[0].formattedAddress;

  } else {
    address = " Invalid Address!";
  }

  // for checkboxes
  const contactByEmail = req.body.contactByEmail ? 1 : 0;
  const contactByPhone = req.body.contactByPhone ? 1 : 0;
  const contactByMail = req.body.contactByMail ? 1 : 0;

  req.db.createContact(
    title,
    firstname,
    lastname,
    phone,
    email,
    address,
    contactByPhone,
    contactByEmail,
    contactByMail,
    lat,
    lng
  );

  res.redirect("/");
});



router.get("/:id", async (req, res) => {
  const contact = await req.db.findContactById(req.params.id);
  if (contact !== undefined) {
    res.render("info", { contact: contact });
  } else {
    res.send("Invalid route");
  }
});

router.get("/:id/delete", logged_in, async (req, res) => {
  const contact = await req.db.findContactById(req.params.id);
  if (contact !== undefined) {
    res.render("delete", { contact: contact });
  } else {
    res.send("Invalid route");
  }
});

router.post("/:id/delete", logged_in, async (req, res) => {
  await req.db.deleteContact(req.params.id);
  res.redirect("/");
});


router.get("/:id/edit", logged_in, async (req, res) => {
  const contact = await req.db.findContactById(req.params.id);
  if (contact !== undefined) {
    res.render("edit", { contact: contact });
  }
  else {
    res.send("Invalid route");
  }
});

router.post("/:id/edit", logged_in, async (req, res) => {
  const contactId = req.params.id;
  const contact = await req.db.findContactById(contactId);

  const { title, firstname, lastname, phone, email} = req.body;


  let lat, lng, address = "";
  const result = await geocoder.geocode(req.body.address);

  if (result.length > 0) {
    lat = result[0].latitude;
    lng = result[0].longitude;
    address = result[0].formattedAddress;

  }
  else {
    address = "Invalid Address!";
  }

  const contactByEmail = req.body.contactByEmail ? 1 : 0;
  const contactByPhone = req.body.contactByPhone ? 1 : 0;
  const contactByMail = req.body.contactByMail ? 1 : 0;

  if (contact !== undefined) {
    req.db.updateContact(
      contactId,
      title,
      firstname,
      lastname,
      phone,
      email,
      address,
      contactByPhone,
      contactByEmail,
      contactByMail,
      lat,
      lng
    );

    res.redirect("/");
  }
  else {
    res.send("Invalid route");
  }
});


router.get("*", (req, res) => {
  res.send("Invalid route");
});

module.exports = router;
