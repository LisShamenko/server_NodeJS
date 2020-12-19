let pgWrapper;

module.exports = (injectedPgWrapper) => {
    pgWrapper = injectedPgWrapper;

    return {
        insertToken : insertToken,
        selectToken : selectToken,
    };
};

function insertToken(userId, token, cbFunc) {
    const query = `INSERT INTO tokens ("userId", token) VALUES ('${userId}', '${token}')`;
    pgWrapper.query(query, cbFunc);
}

function selectToken(userId, cbFunc) {
    const query = `SELECT * FROM tokens WHERE "userId" = '${userId}'`;
    pgWrapper.query(query, (response) => {
        if (err) return cbFunc(err, null);
        let isExist = (results.rows && results.rowCount >= 1);
        cbFunc(false, isExist ? results.rows[0] : null);
    });
}
