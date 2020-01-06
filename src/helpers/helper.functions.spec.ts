import { keyExists } from './helper.functions';

const testObject = {
    testKey: 'key',
};
const existingKey = 'testKey';
const inexistingKey = 'thisKeyIsNotInTheTestObject';

describe('Helper functions', () => {

    it('Should return true because the key exists in the target object', async () => {

        const bindedFunction = keyExists.bind(null, existingKey);

        const returnValue = bindedFunction(testObject);

        expect(returnValue).toBe(true);
    });

    it('Should return false because the key do not exists in the target object', async () => {

        const bindedFunction = keyExists.bind(null, inexistingKey);

        const returnValue = bindedFunction(testObject);

        expect(returnValue).toBe(false);
    });
});
