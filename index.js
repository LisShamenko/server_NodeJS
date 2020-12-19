const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const config = require("./config/config");
config.initDotenv();

// 
const app = express();

// use
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// 
app.get("/GameVersion", function(req, res) {
    res.send('ok');
});

// 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`http://localhost:${ PORT }/`);
});
