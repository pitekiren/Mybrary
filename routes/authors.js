const express = require("express");
const router = express.Router();
const Author = require("../models/author");
//All Authors Route
router.get("/", async (req, res) => {
  let searchOption = {};
  if (req.query.name != null && req.query.name != "") {
    searchOption.name = new RegExp(req.query.name, "i");
  }
  try {
    const authors = await Author.find(searchOption);
    res.render("authors/index", {
      authors: authors,
      searchOption: req.query
    });
  } catch (error) {
    res.redirect("/");
  }
});
//New Authors Route
router.get("/new", (req, res) => {
  res.render("authors/new", { author: new Author() });
});
//Creating new Author route
router.post("/", async (req, res) => {
  const author = new Author({
    name: req.body.name
  });
  try {
    const newAuthor = await author.save();
    //      res.redirect(`authors/${newAuthor.id}`)
    res.redirect("authors");
  } catch (e) {
    res.render("authors/new", {
      author: author,
      errorMessage: "error message"
    });
  }
});
module.exports = router;
