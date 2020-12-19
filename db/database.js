// база данных
const crypto = require("crypto");
const pg = require("pg");

let options;
let pgWrapper;
let resultsDB;
let tokensDB;
let userDB;

module.exports = (injectedOptions) => {
    options = injectedOptions;

    pgWrapper = require("./pgWrapper")(pg, options);
    resultsDB = require("./resultsDB")(pgWrapper);
    tokensDB = require("./tokensDB")(pgWrapper);
    userDB = require("./userDB")(pgWrapper, crypto);

    return {
        pgWrapper : pgWrapper,
        resultsDB : resultsDB,
        tokensDB : tokensDB, 
        userDB : userDB,
        getTestRouter : getTestRouter,
    };
}

function getTestRouter(express) {
    const router = express.Router();

    router.get("/test", function(req, res) {
        let username = "admin"; 
        let password = "admin";
        console.log(`start test --- username = ${username} --- password = ${password} ---`);

        userDB.insertUser(username, password, (err, result) => {
            console.log(`Insert user complete --- err = ${err} --- result = ${result} ---`);

            if (err) return res.send(err.message);
            cbSelectUser(res, username, password);
        });
    });

    return router;
}

function cbSelectUser(res, username, password) {
    userDB.selectUser(username, password, (err, result) => {
        console.log(`Select user complete --- err = ${err} --- result = ${result} ---`);

        if (err) return res.send(err.message);
        cbRandomToken(res, result.id);
    });
}

function cbRandomToken(res, userId) {
    crypto.randomBytes(64, (err, buffer) => {
        console.log(`Random token complete --- err = ${err} --- buffer = ${buffer} ---`);

        if (err) return res.send(err.message);
        let token = crypto.createHash('sha1').update(buffer).digest('hex');
        cbInsertToken(res, userId, token);
    });
}

function cbInsertToken(res, userId, token) {
    tokensDB.insertToken(userId, token, (err, result) => {
        console.log(`Insert token complete --- err = ${err} --- token = ${token} --- result = ${result} ---`);

        if (err) return res.send(err.message);
        cbInsertResult(res, userId);
    });    
}

function cbInsertResult(res, userId) {
    let userResult = 123;
    resultsDB.insertResult(userId, userResult, (err, result) => {
        console.log(`Insert result complete --- err = ${err} --- result = ${result} ---`);

        if (err) return res.send(err.message);
        res.send('ok');
    });
}
