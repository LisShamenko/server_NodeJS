let pgWrapper;
let crypto;

module.exports = (injectedPgWrapper, injectedCrypto) => {
    pgWrapper = injectedPgWrapper;
    crypto = injectedCrypto;

    return {
        insertUser : insertUser,
        selectUser : selectUser,
    };
};

function insertUser(username, password, cbFunc) {
    let shaPass = crypto.createHash("sha256").update(password).digest("hex");

    const query = `INSERT INTO users (name, password) VALUES ('${username}', '${shaPass}')`;

    pgWrapper.query(query, cbFunc);
}

function selectUser(username, password, cbFunc) {
    let shaPass = crypto.createHash("sha256").update(password).digest("hex");

    const query = `SELECT * FROM users WHERE name = '${username}' AND password = '${shaPass}'`;

    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        let isExist = (results.rows && results.rowCount >= 1);
        cbFunc(false, isExist ? results.rows[0] : null);
    });
}
