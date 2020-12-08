'use strict';

const reviewDao = require('../dao/ReviewDao.js');


/**
 * 시향노트 삭제
 * 댓글 삭제하기
 *
 * reviewIdx Long 시향노트 Idx
 * no response value expected for this operation
 **/
exports.deleteReview = (reviewIdx) => {
  return reviewDao.delete(reviewIdx);
};


/**
 * 시향노트 반환
 * 특정 시향노트 가져오기
 *
 * reviewIdx Long 시향노트 Idx
 * returns ReviewInfo
 **/
exports.getReviewByIdx = (reviewIdx) => {
  return reviewDao.read(reviewIdx);
};

/**
 * 내가 쓴 시향기 전체 조회
 *  = 마이퍼퓸 조회
 *
 * userIdx Long 유저 Idx
 * returns List
 **/
exports.getReviewByUser = (userIdx) => {
  return reviewDao.readAllByUser(userIdx);
};

/**
 * 전체 시향노트 반환(인기순)
 * 특정 향수에 달린 전체 시향노트 별점순으로 가져오기
 *
 * perfumeIdx Long 향수 Idx
 * returns List
 **/
exports.getReviewOfPerfumeByLike = (perfumeIdx) => {
  return reviewDao.readAllOrderByLike(perfumeIdx);
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
 * 시향노트 추가\"
 * 특정 향수에 시향노트 추가하기
 *
 * perfumeIdx Long 향수 Idx
 * body ReviewInfo 시향노트 정보
 * no response value expected for this operation
 **/
exports.postReview = function({perfumeIdx, userIdx, score, longevity, sillage, seasonal, gender, access, content}) {
  return reviewDao.create({perfumeIdx, userIdx, score, longevity, sillage, seasonal, gender, access, content});
};


/**
 * 시향노트 수정
 * 시향노트 수정하기
 *
 * reviewIdx Long 시향노트 Idx
 * body ReviewInfo  (optional)
 * no response value expected for this operation
 **/
exports.updateReview = ({reviewIdx, score, longevity, sillage, seasonal, gender, access, content}) => {
  return reviewDao.update({reviewIdx, score, longevity, sillage, seasonal, gender, access, content});
};