let pg;
let options;

module.exports = (injectedPg, injectedOptions) => {
    pg = injectedPg;
    options = injectedOptions;

    return {
        query : query,
    };
}

function query(queryString, cbFunc) {
    const pool = new pg.Pool(options);
    pool.query(queryString, (err, results) => {
        cbFunc(err, results ? results : null);
    });
}