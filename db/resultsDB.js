let pgWrapper;

module.exports = (injectedPgWrapper) => {
    pgWrapper = injectedPgWrapper;

    return {
        insertResult : insertResult,
        selectResult : selectResult,
        selectUserResults : selectUserResults,
        selectTopResults : selectTopResults,
    };
};

function insertResult(userId, result, cbFunc) {
    const query = `INSERT INTO results (user_id, result) VALUES ('${userId}', '${result}')`;
    pgWrapper.query(query, cbFunc);
}

function selectResult(userId, cbFunc) {
    const query = `SELECT * FROM results WHERE user_id = '${userId}'`;
    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        let isExist = (results.rows && results.rowCount >= 1);
        cbFunc(false, isExist ? results.rows[0] : null);        
    });
}

function selectUserResults(userId, limit, cbFunc) {
    const query = `SELECT * FROM results WHERE user_id = '${userId}' 
        ORDER BY result DESC LIMIT ${limit}`;

    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        cbFunc(false, results.rows ? results.rows : null);        
    });
}

function selectTopResults(limit, cbFunc) {
    // const query = `SELECT * FROM results WHERE ORDER BY result DESC LIMIT ${limit}`;
    // const query = `SELECT results.id, results.result, users.name FROM results JOIN users ON results.user_id = users.id ORDER BY result DESC LIMIT ${limit}`;
    const query = `
        SELECT results.result, 
            (SELECT users.name FROM users WHERE users.id = results.user_id) as name 
        FROM results 
        ORDER BY results.result DESC LIMIT ${limit}`;
    
    pgWrapper.query(query, (err, results) => {
        if (err) return cbFunc(err, null);
        cbFunc(false, results.rows ? results.rows : null);        
    });
}

