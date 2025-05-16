const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "prueba.js");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).send("Error reading file");
    }
    res.type("text/plain").send(data); // Send as plain text
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
