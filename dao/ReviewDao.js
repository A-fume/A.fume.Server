const { NotMatchedError } = require('../utils/errors/errors.js');
const {
    sequelize,
    Sequelize,
    Review,
    Perfume,
    Brand,
    User,
    LikeReview,
    JoinReviewKeyword,
    JoinPerfumeKeyword,
    Keyword,
} = require('../models');
const { Op } = Sequelize;

/**
 * 시향노트 작성
 *
 * @param {Object} Review
 * @returns {Promise}
 */

module.exports.create = async ({
    perfumeIdx,
    userIdx,
    score,
    longevity,
    sillage,
    seasonal,
    gender,
    access,
    content,
}) => {
    const result = await Review.create({
        perfumeIdx,
        userIdx,
        score,
        longevity,
        sillage,
        seasonal,
        gender,
        access,
        content,
    });

    return result;
};

/**
 * 시향노트 조회
 *
 * @param {Object} whereObj
 * @returns {Promise<Review>}
 */

// const SQL_REVIEW_SELECT_BY_IDX = `SELECT p.image_thumbnail_url as imageUrl, b.english_name as brandName, p.name, rv.score, rv.content, rv.longevity, rv.sillage, rv.seasonal, rv.gender, rv.access, rv.create_time as createTime, u.user_idx as userIdx, u.nickname FROM review rv NATURAL JOIN perfume p JOIN brand b ON p.brand_idx = b.brand_idx JOIN user u ON rv.user_idx = u.user_idx WHERE review_idx = ?`;
module.exports.read = async (reviewIdx) => {
    const reviewList = await Review.findByPk(reviewIdx, {
        where: { id: reviewIdx },
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [
            {
                model: Perfume,
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
                include: {
                    model: Brand,
                    as: 'Brand',
                    attributes: {
                        exclude: ['createdAt', 'updatedAt'],
                    },
                },
            },
        ],
        raw: true,
        nest: true,
    });

    const keywordList = await JoinReviewKeyword.findAll({
        where: { reviewIdx },
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: [
            {
                model: Keyword,
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            },
        ],
        raw: true,
        nest: true,
    });

    reviewList.keywordList = await keywordList.map((it) => {
        return {
            keywordIdx: it.Keyword.id,
            keyword: it.Keyword.name,
        };
    });

    if (reviewList.length == 0) {
        throw new NotMatchedError();
    }

    return reviewList;
};

/**
 * 내가 쓴 시향노트 전체 조회
 *  = 마이퍼퓸 조회
 *  @param {number} userIdx
 *  @returns {Promise<Review[]>} reviewList
 */

module.exports.readAllOfUser = async (
    userIdx,
    sort = [['createdAt', 'desc']]
) => {
    let result = await Review.findAll({
        where: { userIdx },
        include: {
            model: Perfume,
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
            include: {
                model: Brand,
                as: 'Brand',
                attributes: {
                    exclude: ['createdAt', 'updatedAt'],
                },
            },
        },
        order: sort,
        raw: true,
        nest: true,
    });

    return result;
};

/**
 * 특정 상품의 시향노트 전체 조회(인기순 정렬, 디폴트)
 * 좋아요 개수가 0인 시향노트들은 맨 후반부에 출력됨.
 * 1차 정렬 기준은 좋아요 개수순, 만약 좋아요 개수가 같거나 없는 경우는 최신 순으로 해당부분만 2차 정렬됨.
 *
 * @param {number} perfumeIdx
 * @returns {Promise<Review[]>} reviewList
 */

SQL_READ_ALL_OF_PERFUME = `
    SELECT 
    r.id as reviewIdx, 
    r.score as score, 
    r.longevity as longevity, 
    r.sillage as sillage, 
    r.seasonal as seasonal, 
    r.gender as gender, 
    r.access as access, 
    r.content as content, 
    u.user_idx as "User.userIdx", 
    u.email as "User.email",
    u.nickname as "User.nickname", 
    u.password as "User.password", 
    u.gender as "User.gender",  
    u.birth as "User.birth", 
    u.grade as "User.grade", 
    u.access_time as "User.accessTime",
    IF( likeCount IS NULL, 0, likeCount) as "LikeReview.likeCount"
    FROM reviews r
    join users u on u.user_idx = r.user_idx 
    left outer join (SELECT review_idx, COUNT(review_idx) as likeCount FROM like_reviews Group By review_idx) AS lr on r.id = lr.review_idx    
    where r.perfume_idx = $1
    order by "LikeReview.likeCount" desc;`;

module.exports.readAllOfPerfume = async (perfumeIdx) => {
    let reviewList = await sequelize.query(SQL_READ_ALL_OF_PERFUME, {
        bind: [perfumeIdx],
        // order: [["likeCount", 'desc']],
        nest: true,
        raw: true,
        model: Review,
        mapToModel: true,
        type: sequelize.QueryTypes.SELECT,
    });
    // sequelize 시도
    // let result = await Review.findAll({
    //     attributes: {
    //         exclude: ['createdAt', 'updatedAt'],
    //     },
    //     include: [
    //         {
    //             model: User,
    //             attributes: {
    //                 exclude: ['createdAt', 'updatedAt'],
    //             },
    //         },
    //         {
    //             model: LikeReview,
    //             as: 'ReviewLike',
    //             attributes: [sequelize.literal('(SELECT COUNT(*) FROM like_reviews WHERE like_reviews.review_idx = Review.id)'), 'likeCount']
    //             // attributes:[[sequelize.fn('count', 'reviewIdx'), 'likeCount']],
    //         }
    //     ],
    //     order: [[sequelize.literal('"likeCount"'), 'DESC']],
    //     where: {perfumeIdx: perfumeIdx},
    //     raw: true,
    //     nest: true
    // });
    return reviewList;
};

/**
 * 시향노트 수정
 *
 * @param {number} reviewIdx
 * @returns {Promise}
 */

module.exports.update = async ({
    score,
    longevity,
    sillage,
    seasonal,
    gender,
    access,
    content,
    reviewIdx,
}) => {
    const result = await Review.update(
        { score, longevity, sillage, seasonal, gender, access, content },
        { where: { id: reviewIdx } }
    );

    if (result[0] == 0) {
        //update result[0]가 곧 affectedRow
        throw new NotMatchedError();
    }

    return result;
};

/**
 * 시향노트 삭제
 *
 * @param {number} reviewIdx
 * @return {Promise}
 */

module.exports.delete = async (reviewIdx) => {
    return await Review.destroy({ where: { id: reviewIdx } });
};

/**
 * 데이터 무결성을 위해, 향수 키워드 중 count가 0이하인 행 제거
 *
 * @param {number} reviewIdx
 * @return {Promise}
 */

module.exports.deleteZeroCount = async() => {
    return await JoinPerfumeKeyword.destroy(
        {
            where: {
                count: {
                    [Op.lte]: 0,
                },
            }
        }
    );
}
