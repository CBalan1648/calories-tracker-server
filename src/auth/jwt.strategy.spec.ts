import { Request } from 'express';
import { JwtStrategy } from './jtw.strategy';

const request = {
    user: 'user',
};

describe('JWTStrategy', () => {

    it('Should return the requester user data after validaiton', async () => {
        const strategyObject = new JwtStrategy();

        const returnedAfterValidation = await strategyObject.validate(request as unknown as Request);

        expect(returnedAfterValidation).toBe(request.user);
    });
});
