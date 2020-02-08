const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
const Book = require("../models/book");
const Author = require("../models/author");
const uploadPath = path.join("public", Book.coverImageBasePath);
const imageMimeTypes = ["image/jpeg", "image/png", "image/gif"];
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype));
  }
});
//All Books Route
router.get("/", async (req, res) => {
  let query = Book.find();
  if (req.query.title != null && req.query.title != "") {
    query = query.regex("title", new RegExp(req.query.title, "i"));
  }
  if (req.query.publishedBefore != null && req.query.publishedBefore != "") {
    query = query.lte("publishDate", req.query.publishedBefore);
  }
  if (req.query.publishedAfter != null && req.query.publishedAfter != "") {
    query = query.gte("publishDate", req.query.publishedAfter);
  }
  const books = await query.exec();
  try {
    res.render("books/index", {
      books: books,
      searchOption: req.query
    });
  } catch {
    res.redirect("/");
  }
});
//New Books Route
router.get("/new", async (req, res) => {
  renderNewPage(res, new Book());
});
//Creating new Books route
router.post("/", upload.single("cover"), async (req, res) => {
  const filename = req.file != null ? req.file.filename : null;
  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: filename,
    description: req.body.description
  });
  try {
    const newBook = await book.save();
    res.redirect("books");
  } catch {
    if (book.coverImageName != null) {
      removeBookCover(book.coverImageName);
    }
    renderNewPage(res, book, true);
  }
});

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors,
      book: book
    };
    if (hasError) params.errorMessage = "Failed Creating New Book";
    res.render("books/new", params);
  } catch {
    res.redirect("/books");
  }
}
function removeBookCover(filename) {
  fs.unlink(path.join(uploadPath, filename), err => {
    if (err) console.error(err);
  });
}
module.exports = router;
