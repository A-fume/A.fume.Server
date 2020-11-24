const pool = require('../utils/db/pool.js');

const { NotMatchedError } = require('../utils/errors/errors.js');

/**
 * 향수 추가
 * - 향수 목록에서 보여지는 정보는 perfume 테이블
 *   향수 세부 정보에서 보여지는 정보는 perfume_detail 테이블로 저장한다.
 * @Transaction
 */
const SQL_PERFUME_INSERT = 'INSERT perfume(brand_idx, main_series_idx, name, english_name, image_thumbnail_url) VALUES(?, ?, ?, ?, ?)';
const SQL_PERFUME_DETAIL_INSERT = 'INSERT perfume_detail(perfume_idx, story, abundance_rate, volume_and_price, image_url) VALUES(?, ?, ?, ?, ?)';
module.exports.create = ({brand_idx, name, english_name, volume_and_price, image_thumbnail_url, main_series_idx, story, abundance_rate, image_url}) => {
    return pool.Transaction(async (connection) => {
        const perfumeResult = await connection.query(SQL_PERFUME_INSERT, [brand_idx, main_series_idx, name, english_name, image_thumbnail_url]);
        const perfume_idx = perfumeResult.insertId;
        const perfumeDetailResult = await connection.query(SQL_PERFUME_DETAIL_INSERT, [perfume_idx, story, abundance_rate, volume_and_price, image_url]);
        return [perfumeResult, perfumeDetailResult];
    });
}

/**
 * 향수 검색
 * - 필터 및 정렬 조건을 받아서 해당하는 향수를 검색한다.
 */
const SQL_PERFUME_SELECT_BY_FILTER = 'SELECT p.perfume_idx, p.main_series_idx, p.brand_idx, p.name, p.english_name, p.image_thumbnail_url, p.create_time, p.update_time, '+
'b.name as brand_name, '+
's.name as main_series_name, '+
'(SELECT COUNT(*) FROM like_perfume lp WHERE lp.perfume_idx = p.perfume_idx) as like_cnt ' +
'FROM perfume p ' +
'INNER JOIN brand b ON p.brand_idx = b.brand_idx ' + 
'INNER JOIN series s ON p.main_series_idx = s.series_idx ';
module.exports.search = ({series = [], brands = [], keywords = [], sortBy}) => {
    let condition = '';
    let orderBy = '';
    if(series.length + brands.length + keywords.length > 0) {
        const conditions = [];
        if(series.length > 0) {
            conditions.push('(' + series.map(it => `s.name = '${it}'`).join(' OR ') + ')');
        }
        if(brands.length > 0) {
            conditions.push('(' + brands.map(it => `b.name = '${it}'`).join(' OR ') + ')');
        }
        if(keywords.length > 0) {
            // TODO Keyword
        }
        condition = 'WHERE ' + conditions.join(' AND ');
    }
    if(sortBy) {
        switch(sortBy){
            case 'like':
                orderBy = ' ORDER BY like_cnt DESC';
                break;
            case 'recent':
                orderBy = ' ORDER BY create_time DESC';
                break;
            case 'random':
                orderBy = ' ORDER BY RAND()';
                break;
        }
    }
    return pool.queryParam_None(SQL_PERFUME_SELECT_BY_FILTER + condition + orderBy);
}

/**
 * 향수 세부 조회
 * 향수 세부 정보를 조회한다.
 *  + brand 정보 join해서 가져오기
 *  + ingredient 정보 조회
 *  + series 정보 join해서 가져오기 (대표 계열)
 */
const SQL_PERFUME_SELECT_BY_PERFUME_IDX = 'SELECT p.perfume_idx, p.brand_idx, p.main_series_idx, p.name, p.english_name, p.image_thumbnail_url, p.create_time, p.update_time, '+
'pd.perfume_idx, pd.story, pd.abundance_rate, pd.volume_and_price, pd.image_url, ' +
'b.name as brand_name, '+
's.name as series_name, ' +
'(SELECT COUNT(*) FROM like_perfume lp WHERE lp.perfume_idx = p.perfume_idx) as like_cnt ' +
'FROM perfume p ' +
'INNER JOIN perfume_detail pd ON p.perfume_idx = pd.perfume_idx ' +
'INNER JOIN brand b ON p.brand_idx = b.brand_idx ' +
'INNER JOIN series s ON p.main_series_idx = s.series_idx ' +
'WHERE p.perfume_idx = ?';
module.exports.readByPerfumeIdx = async (perfume_idx) => {
    const result = await pool.queryParam_Parse(SQL_PERFUME_SELECT_BY_PERFUME_IDX, [perfume_idx]);
    if(result.length == 0) {
        throw new NotMatchedError();
    }
    return result[0];
}

/**
 * 위시 리스트에 속하는 향수 조회
 * 
 */
const SQL_WISHLIST_PERFUME = 'SELECT ' +
'p.perfume_idx, p.main_series_idx, p.brand_idx, p.name, p.english_name, p.image_thumbnail_url, p.create_time, p.update_time, ' +
'b.name as brand_name, ' +
's.name as main_series_name, ' +
'(SELECT COUNT(*) FROM like_perfume lp WHERE lp.perfume_idx = p.perfume_idx) as like_cnt ' +
'FROM wishlist w ' +
'INNER JOIN perfume p ON w.perfume_idx = p.perfume_idx ' +
'INNER JOIN brand b ON p.brand_idx = b.brand_idx ' +
'INNER JOIN series s ON p.main_series_idx = s.series_idx ' +
'WHERE w.user_idx = ? ' +
'ORDER BY w.priority DESC';
module.exports.readAllOfWishlist = (user_idx) => {
    return pool.queryParam_Parse(SQL_WISHLIST_PERFUME, [user_idx]);
}

/**
 * 향수 수정
 * - perfume 테이블과 perfume_detail 테이블을 모두 수정한다.
 * @Transaction
 */
const SQL_PERFUME_UPDATE = 'UPDATE perfume SET brand_idx = ?, main_series_idx = ?, name = ?, english_name = ?, image_thumbnail_url = ? WHERE perfume_idx = ?';
const SQL_PERFUME_DETAIL_UPDATE = 'UPDATE perfume_detail SET story = ?, abundance_rate = ?, volume_and_price = ?, image_url = ? WHERE perfume_idx = ?';
module.exports.update = ({perfume_idx, name, main_series_idx, brand_idx, english_name, volume_and_price, image_thumbnail_url, story, abundance_rate, image_url}) => {
    return pool.Transaction(async (connection) => {
        return connection.query(SQL_PERFUME_UPDATE, [brand_idx, main_series_idx, name, english_name, image_thumbnail_url, perfume_idx]);
    }, async (connection) => {
        return connection.query(SQL_PERFUME_DETAIL_UPDATE, [story, abundance_rate, volume_and_price, image_url, perfume_idx]);
    });
}

/**
 * 향수 삭제
 * - 향수 Primary Key를 이용해서 향수를 삭제한다.
 * ※ perfume table을 삭제하면 perfume_idx를 외래키로 가지고 있는 다른 테이블도 삭제된다.
 *   ex) perfume_detail, like_perfume, wishlist, etc
 */
const SQL_PERFUME_DELETE = 'DELETE FROM perfume WHERE perfume_idx = ?';
module.exports.delete = (perfume_idx) => {   
    return pool.queryParam_Parse(SQL_PERFUME_DELETE, [perfume_idx]);  
}