let pgWrapper;

module.exports = (injectedPgWrapper) => {
    pgWrapper = injectedPgWrapper;

    return {
        insertResult : insertResult,
        selectResult : selectResult,
    };
};

function insertResult(userId, result, cbFunc) {
    const query = `INSERT INTO results ("userId", result) VALUES ('${userId}', '${result}')`;
    pgWrapper.query(query, cbFunc);
}

function selectResult(userId, cbFunc) {
    const query = `SELECT * FROM results WHERE "userId" = '${userId}'`;
    pgWrapper.query(query, (response) => {
        if (err) return cbFunc(err, null);
        let isExist = (results.rows && results.rowCount >= 1);
        cbFunc(false, isExist ? results.rows[0] : null);        
    });
}
