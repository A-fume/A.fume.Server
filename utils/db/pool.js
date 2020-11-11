const poolPromise = require('../../config/dbConfig.js');
const { DatabaseError, NoReferencedRowError, DuplicatedEntryError } = require('../errors/errors.js');

module.exports = {
    queryParam_None: async (query) => {
        let result = null;
        try {
            const pool = await poolPromise;
            const connection = await pool.getConnection();
            try {
                result = await connection.query(query);
            } catch (queryError) {
                connection.rollback(() => {});
                switch(queryError.errno){
                    case 1453:
                        result = new NoReferencedRowError();
                        break;
                    case 1062:
                        result = new DuplicatedEntryError();
                        break;
                    default:
                        result = queryError;
                }
            }
            pool.releaseConnection(connection);
        } catch (connectionError) {
            throw connectionError;
        }
        if(result instanceof Error) {
            throw result;
        }
        if(!result) {
            throw new DatabaseError();
        }
        return result;
    },
    queryParam_Arr: async (...args) => {
        this.queryParam_Parse(args[0], args[1]);
    },
    queryParam_Parse: async (query, value) => {
        let result = null;
        try {
            const pool = await poolPromise;
            const connection = await pool.getConnection();
            try {
                result = await connection.query(query, value) || null;
            } catch (queryError) {
                connection.rollback(() => {});
                switch(queryError.errno){
                    case 1453:
                        result = new NoReferencedRowError();
                        break;
                    case 1062:
                        result = new DuplicatedEntryError();
                        break;
                    default:
                        result = queryError;
                }
            }
            pool.releaseConnection(connection);
        } catch (connectionError) {
            throw connectionError;
        }
        if(result instanceof Error) {
            throw result;
        }
        if(!result) {
            throw new DatabaseError();
        }
        return result;
    },
    Transaction: async (...args) => {
        let result = true;
        try {
            const pool = await poolPromise;
            const connection = await pool.getConnection()
            try {
                await connection.beginTransaction();
                args.forEach((it) => it(connection));
                await connection.commit();
            } catch (transactionError) {
                await connection.rollback();
                throw transactionError;
            }
            pool.releaseConnection(connection);
        } catch (connectionError) {
            throw connectionError;
        }
        if(result instanceof Error) {
            throw result;
        }
        if(!result) {
            throw new DatabaseError();
        }
        return result;
    }
}