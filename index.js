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
    sendJson(res, '', 'success', { Version:'1.0.0' });
});

// регистрация пользователя
app.post("/Register", function(req, res) {
    let username =  req.body.Name;
    let password = req.body.Password;
    database.userDB.selectUser(username, password, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        if (results != null && results.id) return sendJson(res, 'Пользователь уже существует!', 'fail', null);
        insertUser(res, username, password);
    });
});

function insertUser(res, username, password) {
    database.userDB.insertUser(username, password, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        if (!results || !results.id) return sendJson(res, 'Пользователь не создан!', 'fail', null);
        userLogin(res, results.id);
    });
}

// аутентификация пользователя
app.post("/Login", function(req, res) {
    let username = req.body.Name;
    let password = req.body.Password;
    database.userDB.selectUser(username, password, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        if (!results || !results.id) return sendJson(res, 'Пользователь не найден!', 'fail', null);
        userLogin(res, results.id);
    });
});

function userLogin(res, userId) {
    database.createToken(userId, (err, token) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        insertAndSendToken(res, userId, token);
    });
}

function insertAndSendToken(res, userId, token) {
    database.tokensDB.insertToken(userId, token, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        if (!results || !results.id) return sendJson(res, 'Токен не создан!', 'fail', null);
        sendJson(res, '', 'success', { UserId:userId, Token:token });
    });
}

app.use((req, res, next) => {
    let userId = req.headers.userid;
    let token = req.headers.token;
    if (!userId || !token) return sendJson(res, 'Ошибка аутентификации!', 'fail', null);
    database.tokensDB.findToken(userId, token, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        if (!results) return sendJson(res, 'Нет доступа!', 'fail', null);
        next();
    });
});

// добавить результат
app.post("/Result", function(req, res) {
    let userId = req.body.UserId;
    let result = req.body.Data;
    database.resultsDB.insertResult(userId, result, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        if (!results || !results.id) return sendJson(res, 'Ошибка сохранения!', 'fail', null);
        sendJson(res, '', 'success', null);
    });
});

// список результатов
app.get("/Results", function(req, res) {
    database.resultsDB.selectTopResults(10, (err, results) => {
        if (err) return sendJson(res, err.message, 'fail', null);
        sendJson(res, '', 'success', { Results:results });
    });
});

// отправку json ответа
function sendJson(res, message, status, results) {
    return res.json({
        Message: message,
        Status: status,
        Result: results,
    });
}

// 
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`http://localhost:${ PORT }/`);
});
