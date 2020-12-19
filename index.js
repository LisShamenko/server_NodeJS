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

// регистрация пользователя
app.post("/register", function(req, res) {
    let username =  req.body.name;
    let password = req.body.password;
    database.userDB.selectUser(username, password, (err, result) => {
        if (err) return sendJson(res, err.message, 'fail', '');
        if (result != null && result.id) return sendJson(res, 'Пользователь уже существует!', 'fail', '');
        insertUser(res, username, password);
    });
});

function insertUser(res, username, password) {
    database.userDB.insertUser(username, password, (err, result) => {
        if (err) return sendJson(res, err.message, 'fail', '');
        userLogin(res, result.id);
    });
}

// аутентификация пользователя
app.post("/login", function(req, res) {
    let username = req.body.name;
    let password = req.body.password;
    database.userDB.selectUser(username, password, (err, result) => {
        if (err) return sendJson(res, err.message, 'fail', '');
        userLogin(res, result.id);
    });
});

function userLogin(res, userId) {
    database.createToken(userId, (err, token) => {
        if (err) return sendJson(res, err.message, 'fail', '');
        insertAndSendToken(res, userId, token);
    });
}

function insertAndSendToken(res, userId, token) {
    database.tokensDB.insertToken(userId, token, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', '');
        sendJson(res, '', 'success', { userId:userId, token:token });
    });
}

app.use((req, res, next) => {
    let userId = req.body.userId;
    let token = req.body.token;
    database.tokensDB.selectToken(userId, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', '');
        if (!results || results.length < 1 || token !== results[0].token) return sendJson(res, 'Нет доступа!', 'fail', '');
        next();
    });
});

// список результатов
app.get("/results", function(req, res) {
    database.resultsDB.selectTopResults(10, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', '');
        sendJson(res, '', 'success', { results:results });
    });
});

// отправку json ответа
function sendJson(res, message, status, result) {
    return res.json({
        message: message,
        status: status,
        result: result,
    });
}

// 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`http://localhost:${ PORT }/`);
});
