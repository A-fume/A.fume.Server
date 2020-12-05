const dotenv = require('dotenv');
dotenv.config({path: './config/.env.tst'});

const chai = require('chai');
const { expect } = chai;
const seriesDao = require('../../dao/SeriesDao.js');
const {
    DuplicatedEntryError,
    NotMatchedError
} = require('../../utils/errors/errors.js');
const pool = require('../../utils/db/pool.js');

describe('# seriesDao Test', () => {
    describe(' # create Test', () => {
        // 중복 데이터 미리 삭제
        before(async () => {
            await pool.queryParam_None("DELETE FROM series WHERE name = '테스트 데이터'");
        });
        // 성공 케이스
        it(' # success case', (done) => {
            seriesDao.create({name : '테스트 데이터', englishName : 'Test Data', description : '왈라왈라'}).then((result) => {
                expect(result).gt(0);
                done();
            }).catch((err) => {
                expect(false).true();
                done();
            });
        });
        // 중복 데이터 발생 케이스
        it(' # DuplicatedEntryError case', (done) => {
            seriesDao.create({name : '테스트 데이터', englishName : 'Test Data', description : '왈라왈라'}).then((result) => {
                expect(false).true();
                done();
            }).catch((err) => {
                expect(err).instanceOf(DuplicatedEntryError);
                done();
            });
        });
        // 테스트 데이터 삭제
        after(async() => {
            await pool.queryParam_None("DELETE FROM series WHERE name='테스트 데이터'");
        });
    });

    describe('# read Test', () => {
        let seriesIdx;
        before(async () => {
            await pool.queryParam_Parse("INSERT series(name, english_name) VALUES(?, ?)", ["읽기 데이터", "Test Data"]);
            const result = await pool.queryParam_Parse("SELECT series_idx FROM series WHERE name = ?", ["읽기 데이터"]);
            seriesIdx = result[0].series_idx;
        });
        it('# success case', (done) => {
            seriesDao.read(seriesIdx).then((result) => {
                expect(result.name).eq('읽기 데이터');
                done();
            }).catch((err) => {
                expect(false).true();
                done();
            });
        });
        after(async() => {
            await pool.queryParam_None(`DELETE FROM series WHERE series_idx=${seriesIdx}`);
        });
    });

    describe(' # readAll Test', () => {
        it(' # success case', (done) => {
            seriesDao.readAll().then((result) => {
                expect(result.length).greaterThan(0);
                done();
            }).catch((err) => {
                expect(false).true();
                done();
            });
        });
    });

    describe('# update Test', () => {
        let seriesIdx;
        before(async () => {
            await pool.queryParam_None("DELETE FROM series WHERE name='테스트 데이터'");
            const result = await pool.queryParam_None("INSERT INTO series(name, english_name) VALUES('테스트 데이터','Test Data')");
            seriesIdx = result.insertId;
        });
        it('# success case', (done) => {
            seriesDao.update({seriesIdx, name:'수정 데이터', english_name:'Update Data'})
            .then((result) => {
                expect(result).eq(1);
                done();
            }).catch((err) => {
                console.log(err)
                expect(false).true();
                done();
            });
        });
        after(async () => {
            await pool.queryParam_None(`DELETE FROM series WHERE series_idx=${seriesIdx}`);
        });
    });
    
    describe('# delete Test', () => {
        let seriesidx;
        before(async () => {
            await pool.queryParam_None("DELETE FROM series WHERE name='삭제테스트'");
            const result = await pool.queryParam_None("INSERT series(name, english_name) values('삭제 데이터','Delete Data')");
            seriesIdx = result.insertId;
        });
        it('# success case', (done) => {
            seriesDao.delete(seriesIdx).then((result) => {
                expect(result).eq(1);
                done();
            }).catch((err) => {
                expect(false).true();
                done();
            });
        });
        after(async () => {
            if(!seriesIdx) return;
            await pool.queryParam_None(`DELETE FROM series WHERE series_idx=${seriesIdx}`);
        });
    });
});