const { PerfumeDefaultReview, sequelize, Sequelize } = require('../models');

const emptyReview = {
    rating: 0,
    seasonal: {
        spring: 0,
        summer: 0,
        fall: 0,
        winter: 0,
    },
    sillage: {
        light: 0,
        medium: 0,
        heavy: 0,
    },
    longevity: {
        veryWeak: 0,
        weak: 0,
        normal: 0,
        strong: 0,
        veryStrong: 0,
    },
    gender: {
        male: 0,
        neutral: 0,
        female: 0,
    },
};

/**
 * 향수 기본 리뷰 정보 조회
 * @param {number} perfumeIdx
 * @return {Promise<PerfumeDefaultReview>}
 */
module.exports.read = (perfumeIdx) => {
    return PerfumeDefaultReview.findOne({
        where: { perfumeIdx },
        raw: true,
        nest: true,
    }).then((it) => {
        if (it == null) return Object.assign({ perfumeIdx }, emptyReview);
        const seasonalArr = it.seasonal.split('/').map((it) => parseInt(it));
        it.seasonal = {
            spring: seasonalArr[0],
            summer: seasonalArr[1],
            fall: seasonalArr[2],
            winter: seasonalArr[3],
        };
        const sillageArr = it.sillage.split('/').map((it) => parseInt(it));
        it.sillage = {
            light: sillageArr[0],
            medium: sillageArr[1],
            heavy: sillageArr[2],
        };
        const longevityArr = it.longevity.split('/').map((it) => parseInt(it));
        it.longevity = {
            veryWeak: longevityArr[0],
            weak: longevityArr[1],
            normal: longevityArr[2],
            strong: longevityArr[3],
            veryStrong: longevityArr[4],
        };
        const genderArr = it.gender.split('/').map((it) => parseInt(it));
        it.gender = {
            male: genderArr[0],
            neutral: genderArr[1],
            female: genderArr[2],
        };
        return it;
    });
};
