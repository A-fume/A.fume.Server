'use strict';

const reviewDao = require('../dao/ReviewDao.js');
const perfumeDao = require('../dao/PerfumeDao')
const keywordDao = require('../dao/KeywordDao');
const {
    NotMatchedError,
    FailedToCreateError,
    UnAuthorizedError,
} = require('../utils/errors/errors.js');

/**
 * 시향노트 작성
 *
 * @param {Object} Review
 * @returns {Promise}
 **/
exports.postReview = async ({
    perfumeIdx,
    userIdx,
    score,
    longevity,
    sillage,
    seasonal,
    gender,
    access,
    content,
    keywordList,
}) => {
    await perfumeDao.readByPerfumeIdx(perfumeIdx);
    const createReview = await reviewDao.create({
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
    const reviewIdx = createReview.id;
    const createReviewKeyword = await Promise.all(keywordList.map((it) => {
        keywordDao.create({ reviewIdx, keywordIdx: it, perfumeIdx })
    }));

    return reviewIdx;
};

/**
 * 시향노트 삭제
 * 시향노트 삭제하기
 *
 * @param {Object} Review
 * @returns {Promise}
 **/
exports.deleteReview = async({ reviewIdx, userIdx }) => {
    const readReviewResult = await reviewDao.read(reviewIdx);
    if (readReviewResult.userIdx != userIdx) {
        throw new UnAuthorizedError();
    };
    const perfumeIdx = readReviewResult.perfumeIdx;
    const deleteReviewKeyword = await keywordDao.deleteReviewKeyword(
        {
            reviewIdx,
            perfumeIdx,
        }
    );
    const deleteOnlyReview = await reviewDao.delete(reviewIdx);

    //데이터 무결성을 위해, 향수 키워드 중 count가 0이하인 행 제거
    const deleteZeroCountResult = await reviewDao.deleteZeroCount();

    return deleteOnlyReview;
};

/**
 * 시향노트 수정
 *
 * @param {Object} Review
 * @returns {Promise}
 **/
exports.updateReview = async ({
    score,
    longevity,
    sillage,
    seasonal,
    gender,
    access,
    content,
    keywordList,
    reviewIdx,
    userIdx
}) => {
    console.log(keywordList)
    const readReviewResult = await reviewDao.read(reviewIdx);
    if (readReviewResult.userIdx != userIdx) {
        throw new UnAuthorizedError();
    };
    const updateReviewResult = await reviewDao.update({
        score,
        longevity,
        sillage,
        seasonal,
        gender,
        access,
        content,
        reviewIdx,
    });
    const deleteReviewKeyword = await keywordDao.deleteReviewKeyword(
        {
            reviewIdx,
            perfumeIdx: readReviewResult.perfumeIdx,
        }
    );
    const createReviewKeyword = await Promise.all(keywordList.map((it) => {
        keywordDao.create({ reviewIdx, keywordIdx: it, perfumeIdx: readReviewResult.perfumeIdx })
    }));

    return reviewIdx;
};


/**
 * 시향노트 조회
 *
 * @param {Object} whereObj
 * @returns {Promise<Review>}
 **/
exports.getReviewByIdx = async (reviewIdx) => {
    const result = await reviewDao.read(reviewIdx);
    result.reviewIdx = result.id;
    delete result.id;
    delete result.perfumeIdx;
    delete result.userIdx;
    result.Brand = {
        brandIdx: result.Perfume.Brand.brandIdx,
        brandName: result.Perfume.Brand.name,
    };
    result.Perfume = {
        perfumeIdx: result.Perfume.perfumeIdx,
        perfumeName: result.Perfume.name,
        imageUrl: result.Perfume.imageUrl,
    };
    return result;
};

/**
 * 내가 쓴 시향기 전체 조회
 *  = 마이퍼퓸 조회
 *
 * @param {number} userIdx
 * @returns {Promise<Review[]>} reviewList
 **/
exports.getReviewOfUser = async (userIdx) => {
    return (await reviewDao.readAllOfUser(userIdx)).map((it) => {
        return {
            reviewIdx: it.id,
            score: it.score,
            perfumeIdx: it.perfumeIdx,
            perfumeName: it.Perfume.name,
            imageUrl: it.Perfume.imageUrl,
            brandIdx: it.Perfume.brandIdx,
            brandName: it.Perfume.Brand.englishName,
        };
    });
};

/**
 * 전체 시향노트 반환(인기순)
 * 특정 향수에 달린 전체 시향노트 인기순으로 가져오기
 *
 * perfumeIdx Long 향수 Idx
 * returns List
 **/
exports.getReviewOfPerfumeByLike = async (perfumeIdx) => {
    const reviewList = await reviewDao.readAllOfPerfume(perfumeIdx);
    // console.log(reviewList)
    await reviewList.reduce(async(prevPromise, it) => {
        await prevPromise
        return {
            reviewIdx: it.reviewIdx,
            score: it.score,
            longevity: it.longevity,
            sillage: it.sillage,
            seasonal: it.seasonal,
            gender: it.gender,
            access: it.access,
            content: it.content,
            likeCount: it.LikeReview.likeCount,
            userGender: it.User.gender,
            age: it.User.birth,
            nickname: it.User.nickname,
            createTime: it.createTime,
            keywordList : await keywordDao.readAllOfReview(it.reviewIdx)
        }
    }, Promise.resolve())   
    // const reviewListWithKeyword = await Promise.all(reviewList.map(async(it) => {
    //     const keywordList = await keywordDao.readAllOfReview(it.reviewIdx)
    //     return {
    //         reviewIdx: it.reviewIdx,
    //         score: it.score,
    //         longevity: it.longevity,
    //         sillage: it.sillage,
    //         seasonal: it.seasonal,
    //         gender: it.gender,
    //         access: it.access,
    //         content: it.content,
    //         likeCount: it.LikeReview.likeCount,
    //         userGender: it.User.gender,
    //         age: it.User.birth,
    //         nickname: it.User.nickname,
    //         createTime: it.createTime,
    //         keywordList
    //     }
    // }));
    // console.log(reviewListWithKeyword)
    return reviewList
};

/**
 * 전체 시향노트 반환(별점순)
 * 특정 향수에 달린 전체 시향노트 별점순으로 가져오기
 *
 * perfumeIdx Long 향수 Idx
 * returns List
 **/
exports.getReviewOfPerfumeByScore = (perfumeIdx) => {
    return reviewDao.readAllOrderByScore(perfumeIdx);
};

/**
 * 전체 시향노트 반환(최신순)
 * 특정 향수에 달린 전체 시향노트 최신순으로 가져오기
 *
 * perfumeIdx Long 향수 Idx
 * returns List
 **/
exports.getReviewOfPerfumeByRecent = (perfumeIdx) => {
    return reviewDao.readAllOrderByRecent(perfumeIdx);
};

/**
 * 향수 좋아요
 *
 * reviewIdx Long 시향노트 Idx
 * returns Boolean
 **/
exports.likeReview = (reviewIdx, userIdx) => {
    return new Promise((resolve, reject) => {
        let isLiked = false;
        reviewDao
            .readLike({ reviewIdx, userIdx })
            .then((res) => {
                isLiked = true;
                return reviewDao.deleteLike({ reviewIdx, userIdx });
            })
            .catch((err) => {
                isLiked = false;
                if (err instanceof NotMatchedError) {
                    return reviewDao.createLike({ reviewIdx, userIdx });
                }
                reject(new FailedToCreateError());
            })
            .then(() => {
                resolve(!isLiked);
            })
            .catch((err) => {
                reject(err);
            });
    });
};
