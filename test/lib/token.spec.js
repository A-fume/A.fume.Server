const dotenv = require('dotenv');
dotenv.config({
    path: './config/.env.test'
});

const chai = require('chai');
const {
    expect
} = chai;
const {
    InvalidTokenError,
    ExpiredTokenError
} = require('../../utils/errors/errors.js');
const jwt = require('../../lib/token.js');

describe('# publish Test', () => {
    it(' # create case', () => {
        const payload = {
            test: 'test'
        };
        const {
            token,
            refreshToken
        } = jwt.publish(payload);
        expect(token.length).to.not.eq(0);
    });
});


describe('# create Test', () => {
    it(' # success case', () => {
        const token = jwt.create({
            test: 'test'
        });
        expect(token.length).to.not.eq(0);
    });
});

describe('# verify Test', () => {
    let token;
    const payload = {
        test: 'test'
    };
    before(() => {
        token = jwt.create(payload);
    });
    it(' # success case', () => {
        const result = jwt.verify(token);
        delete result.iat;
        delete result.exp;
        delete result.iss;
        expect(result).to.deep.eq(payload);
    });
    it(' # fail case (Expired Token)', () => {
        const expiredToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0ZXN0IjoidGVzdCIsImlhdCI6MTYwNjQwMTEzOSwiZXhwIjoxNjA2NDAxMTM5LCJpc3MiOiJhZnVtZS1qYWNrcG90In0.oFuXYJgAiwZoX3zvYZnxW8Rv9uIyX0spgao92X05dF4';
        try {
            jwt.verify(expiredToken);
            expect(false).eq(true);
        } catch (err) {
            expect(err).instanceOf(ExpiredTokenError);
        }
    });
    it(' # fail case (Invalid Token)', () => {
        try {
            jwt.verify(token + 'a');
            expect(false).eq(true);
        } catch (err) {
            expect(err).instanceOf(InvalidTokenError);
        }
    });
});


describe('# reissue Test', () => {
    let token, refreshToken;
    const payload = {
        test: 'test'
    };
    before(() => {
        const result = jwt.publish(payload);
        token = result.token;
        refreshToken = result.refreshToken;
    });
    it(' # success case', () => {
        const tokenStr = jwt.reissue(refreshToken);
        const result = jwt.verify(tokenStr);
        delete result.iat;
        delete result.exp;
        delete result.iss;
        expect(result).to.deep.eq(payload);
    });
});