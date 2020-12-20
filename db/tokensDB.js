let pgWrapper;

module.exports = (injectedPgWrapper) => {
    pgWrapper = injectedPgWrapper;

    return {
        insertToken : insertToken,
        selectToken : selectToken,
        findToken : findToken,
    };
};

function insertToken(userId, token, cbFunc) {
    const query = `INSERT INTO tokens (user_id, token) VALUES ('${userId}', '${token}') returning id`;
    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        let isExist = (results.rows && results.rowCount >= 1);
        cbFunc(false, isExist ? results.rows[0] : null);
    });
}

function selectToken(userId, cbFunc) {
    const query = `SELECT * FROM tokens WHERE user_id = '${userId}'`;
    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        let isExist = (results.rows && results.rowCount >= 1);
        cbFunc(false, isExist ? results.rows[0] : null);
    });
}

function findToken(userId, token, cbFunc) {
    const query = `SELECT * FROM tokens WHERE user_id = '${userId}' AND token = '${token}'`;
    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        let isExist = (results.rows && results.rowCount >= 1);
        cbFunc(false, isExist ? results.rows[0] : null);
    });
}
