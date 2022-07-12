const express = require("express");
const multer = require("multer");
var path = require("path");
const fs = require("fs");
var path = require("path");
const sendEmail = require("./email");
const res = require("express/lib/response");
const cookieParser = require("cookie-parser");
const Downloader = require("nodejs-file-downloader");

var files = 0;

const baseURL = process.env.BASE || "https://sharefy.app/";

var dir = "./.data";

function make4DigitCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

fs.readdir("./.data", (err, ulf) => {
  try {
    ulf.forEach((file) => {
      fs.unlinkSync(`./.data/${file}`);
    });
  } catch {}
});

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./.data/");
  },
  filename: function (req, file, cb) {
    console.log(req.cookies);

    // Only allow 100 files to be uploaded
    if (files > 100) {
      return cb(null, "trash");
    }

    files++;

    const fdc = make4DigitCode();
    const fname = file.originalname;

    username = req.cookies.username || "Unknown";

    fs.writeFileSync(
      `./.data/${fdc}.json`,
      `{"name":"${file.originalname}","code":"${fdc}","username":"${username}"}`
    );

    req.body.fname = fdc;

    setTimeout(function () {
      fs.unlinkSync(`./.data/${fname}`);
      fs.unlinkSync(`./.data/${fdc + ".json"}`);
      files--;
      // }, 10 * 1000);
    }, 24 * 60 * 60 * 1000); // Delete the file after an hour

    cb(null, fname); // Appending extension
  },
});

const upload = multer({
  storage: storage,
});

const app = express();

app.use(express.static("public", { extensions: ["html"] }));
app.use(cookieParser());
// app.use(express.static("uploads"));

app.post("/upload", upload.single("uploaded"), function (req, res, next) {
  // console.log(req.body.fname);
  res.redirect("/?" + req.body.fname);
});

// app.post(
//   "/uploadAndSend",
//   upload.single("uploaded"),
//   function (req, res, next) {
//     const name = req.body.name;
//     const target = req.body.target;

//     if (target.includes(",")) var maillist = target.split(",");

//     const url = `${baseURL}${req.body.fname}`;

//     if (maillist) {
//       sendEmail(maillist, name, url);
//     } else {
//       sendEmail(target, name, url);
//     }

//     res.redirect("/?" + req.body.fname);
//   }
// );

app.get("/dl", (req, res) => {
  var id = req.query.id;

  if (id == null) {
    res.redirect("/dl404.html");
    return;
  }

  if (!fs.existsSync(`./.data/${id}.json`)) {
    res.redirect("/dl404.html");
    return;
  }

  var file = JSON.parse(fs.readFileSync(`./.data/${id}.json`)).name;

  if (!fs.existsSync(`./.data/${file}`)) {
    res.redirect("/dl404.html");
    return;
  }

  res.download(`./.data/${file}`);
});

app.get("/preview", (req, res) => {
  id = req.query.id;

  if (id == null) {
    res.redirect("/dl404.html");
    return;
  }

  if (!fs.existsSync(`./.data/${id}.json`)) {
    res.redirect("/dl404.html");
    return;
  }

  var file = JSON.parse(fs.readFileSync(`./.data/${id}.json`)).name;
  var ext = path.extname(file);

  var img = [
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".apng",
    ".avif",
    ".gif",
    ".svg",
  ];

  if (img.includes(ext)) {
    res.redirect("/previewimg.html?" + id);
    return;
  }

  var aud = [
    ".mp3",
    ".wav",
    ".wave",
    ".m4a",
    ".3gp",
    ".aac",
    ".ogg",
    ".ogv",
    ".oga",
    ".ogx",
    ".ogm",
    ".spx",
    ".opus",
  ];

  if (aud.includes(ext)) {
    mime = "";

    if ([".wav", ".wave"].includes(ext)) mime = "audio/wav";
    if (ext == ".mp3") mime = "audio/mp3";
    if ([".m4a", ".3gp"].includes(ext)) mime = "audio/aac";
    if ([".ogg", ".ogv", ".oga", ".ogx", ".ogm", ".spx", ".opus"].includes(ext))
      mime = "audio/ogg";

    res.redirect("/previewaudio.html?" + id + ":" + mime);
    return;
  }

  if (ext == ".txt") {
    res.redirect("/previewtxt.html?" + id);
    return;
  }

  res.redirect(`/nopreview.html?${id}:${ext}`);
});

app.get("/isUsernameTaken", (req, res) => {
  taken = req.query.username.toLowerCase() == "aylias";

  res.send(`{"taken":${taken}}`);
});

app.get("/signUp", (req, res) => {
  username = req.query.username;
  password = req.query.password;

  if (username == null || password == null) {
    res.end(`{"success":false}`);
  } else {
    res.end(`{"success":true}`);
  }
});

app.get("/uploadData", (req, res) => {
  var id = req.query.id;

  res.end(fs.readFileSync(`./.data/${id}.json`));
});

app.get("/shareURL", (req, res) => {
  var url = req.query.url;

  const downloader = new Downloader({
    url: url,
    directory: "./.data",
    onBeforeSave: (deducedName) => {
      console.log(`The file name is: ${deducedName}`);
      code = make4DigitCode();

      fs.writeFileSync(
        `./.data/${code}.json`,
        `{"name":"${deducedName}","code":"${code}"}`
      );

      res.redirect("/?" + code);
    },
  }).download();
});

// app.get("*", function (req, res, next) {
//   // var err = new Error();
//   // err.status = 404;
//   // next(err);
//   res.write(fs.readFileSync("./public/404.html"));
//   res.end();
// });

const port = process.env.PORT || 8080;
app.listen(port);
