'use strict';

var Review = require('../service/ReviewService');
const { OK } = require('../utils/statusCode.js');

module.exports.postReview = function postReview(req, res, next) {
    const perfumeIdx = req.swagger.params['perfumeIdx'].value;
    const userIdx = req.middlewareToken.loginUserIdx;
    const {
        score,
        longevity,
        sillage,
        seasonal,
        gender,
        access,
        content,
        keywordList,
    } = req.swagger.params['body'].value;
    Review.postReview({
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
    })
        .then((response) => {
            res.status(OK).json({
                message: '시향노트 추가 성공',
                data: {
                    reviewIdx : response
                },
            });
        })
        .catch((err) => next(err));
};

module.exports.getReviewByIdx = function getReviewByIdx(req, res, next) {
    var reviewIdx = req.swagger.params['reviewIdx'].value;
    Review.getReviewByIdx(reviewIdx)
        .then((response) => {
            res.status(OK).json({
                message: '시향노트 조회 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

module.exports.getPerfumeReview = function getPerfumeReview(
    req,
    res,
    next
) {
    var perfumeIdx = req.swagger.params['perfumeIdx'].value;
    Review.getReviewOfPerfumeByLike(perfumeIdx)
        .then((response) => {
            res.status(OK).json({
                message: '특정 향수의 시향노트 목록 인기순 조회 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

// module.exports.getReviewOfPerfumeByScore = function getReviewOfPerfumeByScore(
//     req,
//     res,
//     next
// ) {
//     var perfumeIdx = req.swagger.params['perfumeIdx'].value;
//     Review.getReviewOfPerfumeByScore(perfumeIdx)
//         .then((response) => {
//             res.status(OK).json({
//                 message: '특정 향수의 시향노트 목록 별점순 조회 성공',
//                 data: response,
//             });
//         })
//         .catch((err) => next(err));
// };

module.exports.getReviewOfUser = function getReviewOfUser(req, res, next) {
    const userIdx = req.middlewareToken.loginUserIdx;
    Review.getReviewOfUser(userIdx)
        .then((response) => {
            res.status(OK).json({
                message: '마이퍼퓸 조회 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

module.exports.getReviewOfPerfumeByRecent = function getReviewOfPerfumeByRecent(
    req,
    res,
    next
) {
    var perfumeIdx = req.swagger.params['perfumeIdx'].value;
    Review.getReviewOfPerfumeByRecent(perfumeIdx)
        .then((response) => {
            res.status(OK).json({
                message: '특정 향수의 시향노트 목록 최신순 조회 성공',
                data: response,
            });
        })
        .catch((err) => next(err));
};

module.exports.putReview = (req, res, next) => {
    var reviewIdx = req.swagger.params['reviewIdx'].value;
    const userIdx = req.middlewareToken.loginUserIdx;
    var {
        score,
        longevity,
        sillage,
        seasonal,
        gender,
        access,
        content,
        keywordList
    } = req.swagger.params['body'].value;
    Review.updateReview({
        reviewIdx,
        userIdx,
        score,
        longevity,
        sillage,
        seasonal,
        gender,
        access,
        content,
        userIdx,
        keywordList
    })
        .then(() => {
            res.status(OK).json({
                message: '시향노트 수정 성공',
            });
        })
        .catch((err) => next(err));
};

module.exports.deleteReview = (req, res, next) => {
    const reviewIdx = req.swagger.params['reviewIdx'].value;
    const userIdx = req.middlewareToken.loginUserIdx;
    Review.deleteReview({ reviewIdx, userIdx })
        .then(() => {
            res.status(OK).json({
                message: '시향노트 삭제 성공',
            });
        })
        .catch((err) => next(err));
};

module.exports.likeReview = (req, res, next) => {
    const reviewIdx = req.swagger.params['reviewIdx'].value;
    const userIdx = req.middlewareToken.loginUserIdx;
    Review.likeReview(reviewIdx, userIdx)
        .then((result) => {
            res.status(OK).json({
                message: '시향노트 좋아요 상태 변경 성공',
                data: result,
            });
        })
        .catch((err) => next(err));
};
