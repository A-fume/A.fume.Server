const dotenv = require('dotenv');
dotenv.config({ path: './config/.env.test' });

const chai = require('chai');
const { expect } = chai;

const PerfumeDefaultReviewDao = require('../../dao/PerfumeDefaultReviewDao.js');
const { PerfumeDefaultReview, Sequelize } = require('../../models');

describe('# perfumeDefaultReviewDao Test', () => {
    before(async function () {
        await require('./common/presets.js')(this);
    });
    describe('# read Test', () => {
        const perfumeIdx = 1;
        it('# success case', (done) => {
            PerfumeDefaultReviewDao.read(perfumeIdx)
                .then((it) => {
                    expect(it.perfumeIdx).to.eq(perfumeIdx);
                    expect(it.rating).to.eq(1.95);
                    expect(it.seasonal).to.deep.eq({
                        spring: 4,
                        summer: 3,
                        fall: 2,
                        winter: 1,
                    });
                    expect(it.sillage).to.deep.eq({
                        light: 1,
                        medium: 2,
                        heavy: 3,
                    });
                    expect(it.longevity).to.deep.eq({
                        veryWeak: 1,
                        weak: 2,
                        normal: 3,
                        strong: 4,
                        veryStrong: 5,
                    });
                    expect(it.gender).to.deep.eq({
                        male: 0,
                        neutral: 1,
                        female: 2,
                    });
                    done();
                })
                .catch((err) => done(err));
        });

        it('# fail case (no result)', (done) => {
            PerfumeDefaultReviewDao.read(999)
                .then((it) => {
                    expect(it.perfumeIdx).to.eq(999);
                    expect(it.rating).to.eq(0);
                    expect(it.seasonal).to.deep.eq({
                        spring: 0,
                        summer: 0,
                        fall: 0,
                        winter: 0,
                    });
                    expect(it.sillage).to.deep.eq({
                        light: 0,
                        medium: 0,
                        heavy: 0,
                    });
                    expect(it.longevity).to.deep.eq({
                        veryWeak: 0,
                        weak: 0,
                        normal: 0,
                        strong: 0,
                        veryStrong: 0,
                    });
                    expect(it.gender).to.deep.eq({
                        male: 0,
                        neutral: 0,
                        female: 0,
                    });
                    done();
                })
                .catch((err) => done(err));
        });
    });
});
