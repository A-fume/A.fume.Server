const pool = require('../utils/db/pool.js');
const {
    NotMatchedError, FailedToCreateError
} = require('../utils/errors/errors.js');

/**
 * 계열 생성
 * 
 */
const SQL_SERIES_INSERT = "INSERT INTO series(name, english_name, description) VALUES(?, ?, ?)";
module.exports.create = async ({name, englishName, description}) => {
    const result = await pool.queryParam_Parse(SQL_SERIES_INSERT, [name, englishName, description]);
    return result.insertId;
}


/**
 * 계열 조회
 * 
 */
const SQL_SERIES_SELECT_BY_IDX = "SELECT series_idx as seriesIdx, name, english_name as englishName FROM series WHERE series_idx = ?";
module.exports.read = async (seriesIdx) => {
    const result = await pool.queryParam_Parse(SQL_SERIES_SELECT_BY_IDX, [seriesIdx]);
    if(result.length == 0) {
        throw new NotMatchedError();
    }
    return result[0];
}


/**
 * 계열 전체 조회
 */
const SQL_SERIES_SELECT_ALL = "SELECT series_idx as seriesIdx, name, english_name as englishName FROM series";
module.exports.readAll = async () => {
    const result = await pool.queryParam_None(SQL_SERIES_SELECT_ALL);
    return result;
}


/**
 * 계열 수정
 */
const SQL_SERIES_UPDATE = "UPDATE series SET name = ?, english_name = ?, description = ? WHERE series_idx = ?";
module.exports.update = async ({seriesIdx, name, englishName, description}) => {
    const result = await pool.queryParam_Parse(SQL_SERIES_UPDATE, [name, englishName, description, seriesIdx]);
    return result.affectedRows;
}


/**
 * 계열 삭제
 */
const SQL_SERIES_DELETE = "DELETE FROM series WHERE series_idx = ?";
module.exports.delete = async (seriesIdx) => {
    const result = await pool.queryParam_Parse(SQL_SERIES_DELETE, [seriesIdx]);   
    return result.affectedRows;
}