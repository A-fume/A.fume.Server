const dotenv = require('dotenv');
dotenv.config({ path: './config/.env.test' });

const chai = require('chai');
const { expect } = chai;
const ingredientDao = require('../../dao/IngredientDao.js');
const { DuplicatedEntryError } = require('../../utils/errors/errors.js');
const { sequelize, Ingredient } = require('../../models');

describe('# ingredientDao Test', () => {
    before(async () => {
        sequelize.sync();
        await require('./seeds.js')();
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
                    expect(result.name).eq('테스트 데이터1');
                    done();
                })
                .catch((err) => done(err));
        });
        it(' # success case (By Name)', (done) => {
            ingredientDao
                .readByName('테스트 데이터2')
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
                    expect(result.length).greaterThan(0);
                    done();
                })
                .catch((err) => done(err));
        });
    });

    describe('# read By seriesIdx Test', () => {
        it('# success case', (done) => {
            ingredientDao
                .readBySeriesIdx(1)
                .then((result) => {
                    expect(result.length).eq(5);
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
