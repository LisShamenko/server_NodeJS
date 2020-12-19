let pgWrapper;

module.exports = (injectedPgWrapper) => {
    pgWrapper = injectedPgWrapper;

    return {
        insertToken : insertToken,
        selectToken : selectToken,
    };
};

function insertToken(userId, token, cbFunc) {
    const query = `INSERT INTO tokens (user_id, token) VALUES ('${userId}', '${token}')`;
    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        cbFunc(false, null);
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
