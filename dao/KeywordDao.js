const { NotMatchedError } = require('../utils/errors/errors.js');
const {
    Keyword,
    Sequelize,
    sequelize,
    JoinPerfumeKeyword,
    JoinReviewKeyword,
} = require('../models');
const { Op } = Sequelize;

/**
 * 시향노트에 키워드 추가
 *
 * @param {Object} Review
 * @returns {Promise}
 */
module.exports.create = async ({ reviewIdx, keywordIdx, perfumeIdx }) => {
    return sequelize.transaction(async (t) => {
        try {
            const createReviewKeyword = await JoinReviewKeyword.create(
                {
                    reviewIdx,
                    keywordIdx,
                },
                { transaction: t }
            );

            const createPerfumeKeyword = await JoinPerfumeKeyword.findOrCreate({
                where: { perfumeIdx, keywordIdx },
                transaction: t,
            });

            const updatePerfumeKeyword = await JoinPerfumeKeyword.update(
                { count: sequelize.literal('count + 1') },
                {
                    where: { perfumeIdx, keywordIdx },
                    transaction: t,
                }
            );
            return [
                createReviewKeyword,
                createPerfumeKeyword,
                updatePerfumeKeyword,
            ]
        } catch (err) {
            console.log(err);
        }
    });
};

/**
 * 시향노트에 키워드 삭제
 *
 * @param {Object} Review
 * @returns {Promise}
 */
module.exports.deleteReviewKeyword = async ({ reviewIdx, perfumeIdx }) => {
    return sequelize.transaction(async (t) => {
        try {
            const keywordList = await JoinReviewKeyword.findAll({
                where: { reviewIdx },
                attributes: {
                    exclude: ['reviewIdx', 'createdAt', 'updatedAt'],
                },
                transaction: t,
            });
            const deleteReviewKeyword = await JoinReviewKeyword.destroy({
                where: { reviewIdx },
                transaction: t,
            });
            const updatePerfumeKeyword = await Promise.all(keywordList.map((it) => {
                return JoinPerfumeKeyword.update(
                    { count: sequelize.literal('count - 1') },
                    {
                        where: { perfumeIdx, keywordIdx: it.keywordIdx },
                        transaction: t,
                    }
                );
            }));
            return updatePerfumeKeyword;
        } catch (err) {
            console.log(err);
        }
    });
};

/**
 * 키워드 전체 목록 조회
 *
 * @returns {Promise<Keyword[]>}
 */
//LIMIT는 가져올 게시물의 수, OFFSET은 어디서부터 가져올거냐(몇 페이지를 가져오고 싶냐)
module.exports.readAll = (pagingIndex = 1, pagingSize = 10) => {
    return Keyword.findAndCountAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        offset: (pagingIndex - 1) * pagingSize,
        limit: pagingSize,
        raw: true,
        nest: true,
    });
};

/**
 * 향수별 키워드 목록 조회
 *
 * @param {number} [perfumeIdx = -1]
 * @returns {Promise<Keyword[]>} keywordList
 */
module.exports.readAllOfPerfume = async (
    perfumeIdx,
    sort = [['count', 'desc']],
    condition = { [Op.gte]: 3 },
    limitSize = 9
) => {
    let result = await JoinPerfumeKeyword.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: {
            model: Keyword,
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        },
        order: sort,
        where: { perfumeIdx, count: condition },
        limit: limitSize,
        raw: true, //Set this to true if you don't have a model definition for your query.
        nest: true,
    });

    if (result === undefined) {
        throw new NotMatchedError();
    }

    return result.map((it) => {
        return it.Keyword;
    });
};

/**
 * 향수가 가진 키워드별 개수 조회
 *
 * @param {number} perfumeIdx
 * @returns {Promise<Keyword[]>} keywordList
 */
module.exports.readAllPerfumeKeywordCount = async (
    perfumeIdx,
    sort = [['count', 'desc']]
) => {
    let result = await JoinPerfumeKeyword.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt', 'perfumeIdx'],
        },
        order: sort,
        where: { perfumeIdx },
        raw: true, //Set this to true if you don't have a model definition for your query.
        nest: true,
    });

    if (result === undefined) {
        throw new NotMatchedError();
    }
    return result;
};

/**
 * 향수가 가진 특정 키워드 개수 조회
 *
 * @param {number} perfumeIdx, keywordIdx
 * @returns {Promise<Keyword[]>} keywordList
 */
module.exports.readPerfumeKeywordCount = async ({perfumeIdx, keywordIdx}
) => {
    let result = await JoinPerfumeKeyword.findOne({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        where: {
            perfumeIdx, keywordIdx
        },
        raw: true, //Set this to true if you don't have a model definition for your query.
        nest: true,
    });

    if (!result) {
        throw new NotMatchedError();
    }
    return result.count;
};

/**
 * 향수 idx에 해당하는 모든 Join Keyword 목록 조회
 *
 * @param {number[]} perfumeIdxList
 * @returns {Promise<JoinKeyword[]>}
 */
module.exports.readAllOfPerfumeIdxList = async (
    perfumeIdxList,
    sort = [['count', 'desc']],
    condition = { [Op.gte]: 3 },
    limitSize = 2
) => {
    let result = await JoinPerfumeKeyword.findAll({
        attributes: {
            exclude: ['createdAt', 'updatedAt'],
        },
        include: {
            model: Keyword,
            attributes: {
                exclude: ['createdAt', 'updatedAt'],
            },
        },
        order: sort,
        where: {
            perfumeIdx: {
                [Op.in]: perfumeIdxList,
            },
            count: condition,
        },
        limit: limitSize,
        raw: true, //Set this to true if you don't have a model definition for your query.
        nest: true,
    });

    if (result === undefined) {
        throw new NotMatchedError();
    }

    return result;
};

module.exports.readAllOfReview = async(reviewIdx) => {
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
    return keywordList ? keywordList : []
}
