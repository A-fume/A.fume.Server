const dotenv = require('dotenv');
dotenv.config({ path: './config/.env.test' });

const chai = require('chai');
const { expect } = chai;
const ingredientDao = require('../../dao/IngredientDao.js');
const {
    DuplicatedEntryError,
    NotMatchedError,
} = require('../../utils/errors/errors.js');
const { Ingredient } = require('../../models');

describe('# ingredientDao Test', () => {
    before(async function () {
        await require('./common/presets.js')(this);
    });
    describe(' # create Test', () => {
        before(async () => {
            await Ingredient.destroy({ where: { name: '테스트 데이터' } });
        });
        it(' # success case', (done) => {
            ingredientDao
                .create({
                    name: '테스트 데이터',
                    englishName: 'Test Data',
                    description: '왈라왈라',
                    seriesIdx: 1,
                    imageUrl: '',
                })
                .then((result) => {
                    expect(result).gt(0);
                    done();
                })
                .catch((err) => done(err));
        });
        // 중복 데이터 발생 케이스
        it(' # DuplicatedEntryError case', (done) => {
            ingredientDao
                .create({
                    name: '테스트 데이터',
                    englishName: 'Test Data',
                    description: '왈라왈라',
                    seriesIdx: 1,
                    imageUrl: '',
                })
                .then(() => done(new Error('expected DuplicatedEntryError')))
                .catch((err) => {
                    expect(err).instanceOf(DuplicatedEntryError);
                    done();
                })
                .catch((err) => done(err));
        });
        after(async () => {
            await Ingredient.destroy({ where: { name: '테스트 데이터' } });
        });
    });

    describe(' # read test', () => {
        it(' # success case (By PrimaryKey)', (done) => {
            ingredientDao
                .readByIdx(1)
                .then((result) => {
                    expect(result.name).eq('재료1');
                    done();
                })
                .catch((err) => done(err));
        });
        it(' # success case (By Name)', (done) => {
            ingredientDao
                .readByName('재료2')
                .then((result) => {
                    expect(result.ingredientIdx).eq(2);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe(' # readAll Test', () => {
        it(' # success case', (done) => {
            ingredientDao
                .readAll()
                .then((result) => {
                    expect(result.rows.length).greaterThan(4);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# read By seriesIdx Test', () => {
        it('# success case', (done) => {
            ingredientDao
                .readAll({ seriesIdx: 1 })
                .then((result) => {
                    expect(result.rows.length).eq(1);
                    expect(
                        result.rows.reduce(
                            (prev, cur) => prev && cur.seriesIdx == 1,
                            true
                        )
                    ).to.be.true;
                    done();
                })
                .catch((err) => done(err));
        });
        it('# success case', (done) => {
            ingredientDao
                .readBySeriesIdxList([1, 2, 3, 4, 5])
                .then((result) => {
                    expect(result.length).eq(5);
                    done();
                })
                .catch((err) => done(err));
        });

        it('# findIngredient success case', (done) => {
            ingredientDao
                .findIngredient({
                    name: '재료1',
                })
                .then((result) => {
                    expect(result.name).eq('재료1');
                    expect(result.ingredientIdx).eq(1);
                    done();
                })
                .catch((err) => done(err));
        });
        it('# findIngredient not found case', (done) => {
            ingredientDao
                .findIngredient({
                    name: '재료10',
                })
                .then(() => {
                    throw new Error('Must be occur NotMatchedError');
                })
                .catch((err) => {
                    expect(err).instanceOf(NotMatchedError);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# read By perfumeIdx Test', () => {
        it('# success case', (done) => {
            ingredientDao
                .readByPerfumeIdx(1)
                .then((result) => {
                    expect(result.length).to.be.gte(3);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# update Test', () => {
        let ingredientIdx;
        before(async () => {
            ingredientIdx = (
                await Ingredient.upsert({
                    name: '테스트 데이터',
                    englishName: 'Test Data',
                    description: '',
                    seriesIdx: 1,
                    imageUrl: '',
                })
            )[0].ingredientIdx;
        });
        it('# success case', (done) => {
            ingredientDao
                .update({
                    ingredientIdx,
                    name: '수정 데이터',
                    englishName: 'Update Data',
                })
                .then((result) => {
                    expect(result).eq(1);
                    return Ingredient.findByPk(ingredientIdx);
                })
                .then((result) => {
                    expect(result.name).eq('수정 데이터');
                    expect(result.englishName).eq('Update Data');
                    done();
                })
                .catch((err) => done(err));
        });
        it('# Duplicate Error case', (done) => {
            ingredientDao
                .update({
                    ingredientIdx,
                    name: '재료5',
                    englishName: 'Update Data',
                })
                .then((result) => {
                    throw new Error('Must be occur NotMatchedError');
                })
                .catch((err) => {
                    expect(err).instanceOf(DuplicatedEntryError);
                    done();
                })
                .catch((err) => done(err));
        });
        after(async () => {
            await Ingredient.destroy({ where: { ingredientIdx } });
        });
    });

    describe('# delete Test', () => {
        let ingredientIdx;
        before(async () => {
            ingredientIdx = (
                await Ingredient.upsert({
                    name: '삭제 데이터',
                    englishName: 'Delete Data',
                    description: '',
                    seriesIdx: 1,
                    imageUrl: '',
                })
            )[0].ingredientIdx;
        });
        it('# success case', (done) => {
            ingredientDao
                .delete(ingredientIdx)
                .then((result) => {
                    expect(result).eq(1);
                    done();
                })
                .catch((err) => done(err));
        });
        after(async () => {
            await Ingredient.destroy({ where: { ingredientIdx } });
        });
    });
});
