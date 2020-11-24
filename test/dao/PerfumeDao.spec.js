const chai = require('chai');
const {
    expect
} = chai;
const perfumeDao = require('../../dao/PerfumeDao.js');
const {
    DuplicatedEntryError,
    NotMatchedError
} = require('../../utils/errors/errors.js');
const pool = require('../../utils/db/pool.js');

describe('# perfumeDao Test', () => {
    describe('# create Test', () => {
        before(async () => {
            await pool.queryParam_None('DELETE FROM perfume WHERE name="삽입테스트"');
        });
        it('# success case', (done) => {
            const perfumeObj = {
                name: '삽입테스트',
                main_series_idx: 1,
                brand_idx: 1,
                english_name: 'insert Test',
                volume_and_price: '{}',
                image_thumbnail_url: 'URL',
                story: '스토리',
                abundance_rate: 2,
                image_url: 'image_url'
            };
            perfumeDao.create(perfumeObj)
                .then((result) => {
                    const flatResult = result.flat();
                    expect(flatResult.map(it => it.affectedRows).filter(it => it == 1)).to.lengthOf(2);
                    return perfumeDao.readByPerfumeIdx(flatResult[0].insertId);
                }).then((result) => {
                    for ([key, value] in Object.entries(perfumeObj)) {
                        expect(result[key]).eq(value);
                    }
                    done();
                });
        });
        it('# DuplicatedEntry Error case', (done) => {
            perfumeDao.create({
                    name: '삽입테스트',
                    main_series_idx: 1,
                    brand_idx: 1,
                    english_name: 'insert Test',
                    volume_and_price: '{}',
                    image_thumbnail_url: 'URL',
                    story: '스토리',
                    abundance_rate: 2,
                    image_url: 'image_url'
                })
                .then((result) => {
                    throw new Error('Must be occur DuplicatedEntryError')
                }).catch((err) => {
                    expect(err).instanceOf(DuplicatedEntryError);
                    done();
                });
        });
    });
    describe('# read Test', () => {
        describe('# read by perfume_idx Test', () => {
            it('# success case', (done) => {
                perfumeDao.readByPerfumeIdx(1).then((result) => {
                    expect(result.name).eq('154 코롱');
                    expect(result.brand_name).eq('조 말론 런던');
                    expect(result.series_name).eq('');
                    expect(result.story).eq('조 말론 런던 1호점이 위치한 런던의 거리 번호입니다. 광범위한 후각적 탐구를 요하는 이 향수는 만다린, 그레이프 프루트, 바질, 너트맥, 베티버와 같은 브랜드를 대표하는 성분들을 모두 함유하고 있습니다. 다양한 느낌을 연출하는 향입니다.');
                    expect(result.abundance_rate).eq(1);
                    expect(result.volume_and_price).eq('{"30":"95000","100":"190000"}');
                    done();
                });
            });
        });

        describe('# search Test', () => {
            it('# success case (series & grand & order by recent)', (done) => {
                const filter = {
                    series: ['플로럴', '우디', '시트러스'],
                    brands: ['조 말론 런던', '르 라보', '딥디크 파리스'],
                    sortBy: 'recent'
                };
                perfumeDao.search(filter).then((result) => {
                    expect(result.length).gte(3);
                    result.forEach(it => {
                        filter.series && filter.series.length > 0 && expect(filter.series.indexOf(it.main_series_name)).to.not.eq(-1);
                        filter.brands && filter.brands.length > 0 && expect(filter.brands.indexOf(it.brand_name)).to.not.eq(-1);
                    })
                    done();
                });
            });
            it('# success case (empty filter)', (done) => {
                perfumeDao.search({}).then((result) => {
                    expect(result.length).gt(3);
                    done();
                });
            });

            it('# success case (series)', (done) => {
                const filter = {
                    series: ['플로럴', '우디', '시트러스']
                };
                perfumeDao.search(filter).then((result) => {
                    expect(result.length).gte(3);
                    result.forEach(it => {
                        filter.series && filter.series.length > 0 && expect(filter.series.indexOf(it.main_series_name)).to.not.eq(-1);
                    })
                    done();
                });
            });

            it('# success case (brand)', (done) => {
                const filter = {
                    brands: ['딥디크 파리스']
                };
                perfumeDao.search(filter).then((result) => {
                    expect(result.length).gte(3);
                    result.forEach(it => {
                        filter.brands && filter.brands.length > 0 && expect(filter.brands.indexOf(it.brand_name)).to.not.eq(-1);
                    })
                    done();
                });
            });

            it('# success case (series & order by like) ', (done) => {
                const filter = {
                    series: ['우디'],
                    sortBy: 'like'
                };
                perfumeDao.search(filter).then((result) => {
                    expect(result.length).gte(3);
                    result.forEach(it => {
                        filter.series && filter.series.length > 0 && expect(filter.series.indexOf(it.main_series_name)).to.not.eq(-1);
                    })
                    done();
                });
            });

            it('# success case (order by recent)', (done) => {
                const filter = {
                    sortBy: 'recent'
                };
                perfumeDao.search(filter).then((result) => {
                    expect(result.length).gte(3);
                    const str1 = result.map(it => it.perfume_idx).join(',');
                    const str2 = result.sort((a, b) => a.create_time - b.create_time).map(it => it.perfume_idx).join(',');
                    expect(str1).eq(str2);
                    done();
                });
            });

            it('# success case (order by like) ', (done) => {
                const filter = {
                    sortBy: 'like'
                };
                perfumeDao.search(filter).then((result) => {
                    expect(result.length).gte(3);
                    const str1 = result.map(it => it.perfume_idx).join(',');
                    const str2 = result.sort((a, b) => a.like - b.like).map(it => it.perfume_idx).join(',');
                    expect(str1).eq(str2);
                    done();
                });
            });

            it('# success case (order by random) ', (done) => {
                const filter = {
                    sortBy: 'random'
                };
                Promise.all([perfumeDao.search(filter), perfumeDao.search(filter), perfumeDao.search(filter)])
                    .then(([result1, result2, result3]) => {
                        expect(result1.length).gte(3);
                        expect(result2.length).gte(3);
                        expect(result3.length).gte(3);
                        const str1 = result1.map(it => it.perfume_idx).join(',');
                        const str2 = result2.map(it => it.perfume_idx).join(',');
                        const str3 = result3.map(it => it.perfume_idx).join(',');
                        expect(str1 == str2 && str1 == str3).eq(false);
                        done();
                    });
            });
        });

        it('# read all of wishlist', (done) => {
            perfumeDao.readAllOfWishlist(2).then((result) => {
                expect(result.length).gte(3);
                done();
            });
        });
    });

    describe('# update Test', () => {
        let perfume_idx;
        before(async () => {
            await pool.queryParam_None('DELETE FROM perfume WHERE name = "수정 테스트"');
            const perfume = await pool.queryParam_Parse('INSERT INTO perfume(brand_idx, main_series_idx, name, english_name, image_thumbnail_url) VALUES(?, ?, ?, ?, ?)', [1, 1, '수정 테스트', 'perfume_delete_test', 'URL']);
            perfume_idx = perfume.insertId;
            await pool.queryParam_Parse('INSERT INTO perfume_detail(perfume_idx, story, abundance_rate, volume_and_price, image_url) VALUES(?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE story = ?, abundance_rate = ?, volume_and_price = ?, image_url = ?', [perfume_idx, '향수 수정 스토리', 2, '{}', '이미지 URL', '향수 수정 스토리', 2, '{}', '이미지 URL']);
        });
        it('# success case', (done) => {
            const perfumeObj = {
                perfume_idx,
                name: '수정된 이름',
                main_series_idx: 2,
                brand_idx: 2,
                english_name: '수정된 영어이름',
                volume_and_price: '{}',
                image_thumbnail_url: '수정된url',
                story: '수정된스토리',
                abundance_rate: 2,
                image_url: '수정된 이미지'
            };
            perfumeDao.update(perfumeObj)
                .then((result) => {
                    expect(result.flat().map(it => it.affectedRows).filter(it => it == 1)).to.lengthOf(2);
                    return perfumeDao.readByPerfumeIdx(perfume_idx);
                }).then((result) => {
                    for ([key, value] in Object.entries(perfumeObj)) {
                        expect(result[key]).eq(value);
                    }
                    done();
                });
        });
        after(async () => {
            if (!perfume_idx) return;
            await pool.queryParam_Parse('DELETE FROM perfume WHERE perfume_idx = ?', [perfume_idx]);
        })
    });
    describe('# delete Test', () => {
        let perfume_idx;
        before(async () => {
            const perfume = await pool.queryParam_Parse('INSERT INTO perfume(brand_idx, main_series_idx, name, english_name, image_thumbnail_url) VALUES(?, ?, ?, ?, ?)', [1, 1, '향수 삭제 테스트', 'perfume_delete_test', 'URL']);
            perfume_idx = perfume.insertId;
            await pool.queryParam_Parse('INSERT INTO perfume_detail(perfume_idx, story, abundance_rate,volume_and_price,  image_url) VALUES(?, ?, ?, ?, ?)', [perfume_idx, '향수 삭제 테스트 용', 2, '{}', '이미지 URL']);
        });

        it('# success case', (done) => {
            perfumeDao.delete(perfume_idx)
                .then((result) => {
                    expect(result.affectedRows).eq(1);
                    return pool.queryParam_Parse('SELECT * FROM perfume_detail WHERE perfume_idx = ?', [perfume_idx]);
                })
                .then((result) => {
                    expect(result.length).eq(0);
                    done();
                });
        });
    });
});