// конфигурация
const config = require("./config/config");
config.initDotenv();

// экспресс
const express = require("express");
const app = express();

// парсинг - тело запроса
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// парсинг - кукки
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// база данных
const database = require("./db/database")({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    port: process.env.DB_PORT,
});

const testRouter = database.getTestRouter(express);
app.use(testRouter);

// запрос версии игры для проверки соединения
app.get("/GameVersion", function(req, res) {
    res.send('ok');
});


// 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`http://localhost:${ PORT }/`);
});
