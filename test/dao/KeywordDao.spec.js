const dotenv = require('dotenv');
dotenv.config({ path: './config/.env.test' });

const keywordDao = require('../../dao/KeywordDao');
const { expect } = require('chai');

describe('# KeywordDao Test', () => {
    before(async function () {
        await require('./common/presets.js')(this);
    });
    describe('# readAll Test', () => {
        it('# success case', (done) => {
            keywordDao
                .readAll()
                .then((result) => {
                    expect(result.rows.length).gt(0);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# readAllOfPerfume Test', () => {
        it('# success case', (done) => {
            keywordDao
                .readAllOfPerfume(1)
                .then((result) => {
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# readAllOfPerfume Test', () => {
        it('# success case', (done) => {
            keywordDao
                .readAllOfPerfumeIdxList([1])
                .then((result) => {
                    expect(result.length).gt(1);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# readAllPerfumeKeywordCount Test', () => {
        it('# success case', (done) => {
            keywordDao
                .readAllPerfumeKeywordCount([1])
                .then((result) => {
                    expect(result.length).gt(1);
                    done();
                })
                .catch((err) => done(err));
        });
    });
});

describe('# readPerfumeKeywordCount Test', () => {
    it('# success case', (done) => {
        keywordDao
            .readPerfumeKeywordCount({ perfumeIdx: 1, keywordIdx: 1 })
            .then((result) => {
                expect(result.count).eq(1);
                done();
            })
            .catch((err) => done(err));
    });
});
