import { MongooseModule } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from '../src/users/user.controller';
import { AuthModule } from '../src/auth/auth.module';
import dbTestModule from '../src/db-test/db-test.module';
import { UserRegistrationBodyDto } from '../src/users/models/user-registration-body.model';
import { User } from '../src/users/models/user.model';
import { UserSchema } from '../src/users/user.schema';
import { UserService } from '../src/users/user.service';
import * as request from 'supertest';
import { GuestController } from '../src/users/guest.controller';

let admin_token;
let normal_token;

describe('UserController (e2e)', () => {
    let app;
    let userController: UserController;
    let guestController: GuestController;
    let userService: UserService;
    let module: TestingModule;

    beforeEach(async () => {
        module = await Test.createTestingModule({
            imports: [
                dbTestModule(),
                MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
                AuthModule,
            ],
            controllers: [UserController, GuestController],
            providers: [UserService],
        }).compile();

        userController = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);
        guestController = module.get<GuestController>(GuestController);

        app = module.createNestApplication();
        await app.init();

        const adminUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'admin@admin.com',
            password: '123123123123',
            authLevel: 'ADMIN',
        };

        const normalUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'admin@admin.com',
            password: '123123123123',
            authLevel: 'ADMIN',
        };

        await userService.createNewUserWithPrivileges(adminUser);
        const adminLogin = await guestController.login({ email: adminUser.email, password: adminUser.password });
        admin_token = adminLogin.access_token;

        await userService.createNewUserWithPrivileges(normalUser);
        const normalLogin = await guestController.login({ email: normalUser.email, password: normalUser.password });
        normal_token = normalLogin.access_token;
    });

    describe('/api/users/ (POST)', () => {

        const testUser: UserRegistrationBodyDto = {
            firstName: 'TestFirstName',
            lastName: 'TestLastName',
            email: 'test@test.test',
            password: 'password123',
        };

        it('Should create a new user ignoring the authLevel', async () => {

            const response = await request(app.getHttpServer())
                .post('/api/users')
                .send(testUser)
                .set('Accept', 'application/json')
                .set('Authorization', `Bearer ${admin_token}`)
                .expect('Content-Type', /json/)
                .expect(201);

            const createdNewUser = response.body;

            expect(createdNewUser._id).toBeTruthy();
            expect(createdNewUser.firstName).toEqual(testUser.firstName);
            expect(createdNewUser.lastName).toEqual(testUser.lastName);
            expect(createdNewUser.email).toEqual(testUser.email);
            // @ts-ignore
            expect(createdNewUser.password).toBeUndefined();
            expect(createdNewUser.authLevel).toEqual('USER');
        });

        test.todo("ERROR 400")
        test.todo("ERROR 401")
        test.todo("ERROR 403")

    });

    // describe('createNewUserWithPrivileges', () => {

    //     const testUser: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName',
    //         lastName: 'TestLastName',
    //         email: 'test2@test.test',
    //         password: 'password123',
    //         authLevel: 'ADMIN',
    //     };

    //     it('Should create a new user respecting the authLevel', async () => {
    //         const createNewUser = await userService.createNewUserWithPrivileges(testUser);

    //         expect(createNewUser._id).toBeTruthy();
    //         expect(createNewUser.firstName).toEqual(testUser.firstName);
    //         expect(createNewUser.lastName).toEqual(testUser.lastName);
    //         expect(createNewUser.email).toEqual(testUser.email);
    //         // @ts-ignore
    //         expect(createNewUser.password).toBeUndefined();
    //         expect(createNewUser.authLevel).toEqual(testUser.authLevel);
    //     });

    // });

    // describe('findAll', () => {

    //     const testUser: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName1',
    //         lastName: 'TestLastName1',
    //         email: 'test3@test.test',
    //         password: 'password123',
    //         authLevel: 'ADMIN',
    //     };

    //     const testUserTwo: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName2',
    //         lastName: 'TestLastName2',
    //         email: 'test4@test.test',
    //         password: 'password123',
    //         authLevel: 'USER',
    //     };

    //     const addedUsersArray = [testUser, testUserTwo];

    //     it('Should return all users minus passwords and meals', async () => {
    //         await userService.createNewUserWithPrivileges(testUser);
    //         await userService.createNewUserWithPrivileges(testUserTwo);
    //         const users = await userService.findAll();

    //         for (const [index, testedUser] of [...users].entries()) {

    //             const addedUser = addedUsersArray[index];
    //             expect(testedUser._id).toBeTruthy();
    //             expect(testedUser.firstName).toEqual(addedUser.firstName);
    //             expect(testedUser.lastName).toEqual(addedUser.lastName);
    //             expect(testedUser.email).toEqual(addedUser.email);
    //             expect(testedUser.authLevel).toEqual(addedUser.authLevel);
    //             // @ts-ignore
    //             expect(testedUser.password).toBeUndefined();
    //             // @ts-ignore
    //             expect(testedUser.meals).toBeUndefined();
    //         }

    //     });

    // });

    // describe('update', () => {

    //     const testUserRegisterBody: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName1',
    //         lastName: 'TestLastName1',
    //         email: 'test3@test.test',
    //         password: 'password123',
    //         authLevel: 'ADMIN',
    //     };

    //     const testUser: User = {
    //         firstName: 'ModifiedFirstName',
    //         lastName: 'ModifiedFirstName',
    //         email: 'NewEmail@test.test',
    //         authLevel: 'USER',
    //         _id: 'This does not matter',
    //         targetCalories: 321,
    //     };

    //     it('Should update target user but email and authLevel', async () => {
    //         const newUser = await userService.createNewUserWithPrivileges(testUserRegisterBody);
    //         const updated = await userService.update(newUser._id, testUser);
    //         const users = await userService.findAll();

    //         expect(updated.nModified).toEqual(1);

    //         const modifiedUser = users[0];

    //         expect(modifiedUser._id).toEqual(newUser._id);
    //         expect(modifiedUser.firstName).toEqual(testUser.firstName);
    //         expect(modifiedUser.lastName).toEqual(testUser.lastName);
    //         expect(modifiedUser.email).toEqual(testUserRegisterBody.email);
    //         expect(modifiedUser.authLevel).toEqual(testUserRegisterBody.authLevel);

    //     });

    // });

    // describe('updateWithPrivileges', () => {

    //     const testUserRegisterBody: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName1',
    //         lastName: 'TestLastName1',
    //         email: 'test3@test.test',
    //         password: 'password123',
    //         authLevel: 'ADMIN',
    //     };

    //     const testUser: User = {
    //         firstName: 'ModifiedFirstName',
    //         lastName: 'ModifiedFirstName',
    //         email: 'NewEmail@test.test',
    //         authLevel: 'USER',
    //         _id: 'This does not matter',
    //         targetCalories: 321,
    //     };

    //     it('Should update target user but email', async () => {
    //         const newUser = await userService.createNewUserWithPrivileges(testUserRegisterBody);
    //         const updated = await userService.updateWithPrivileges(newUser._id, testUser);
    //         const users = await userService.findAll();

    //         expect(updated.nModified).toEqual(1);

    //         const modifiedUser = users[0];

    //         expect(modifiedUser._id).toEqual(newUser._id);
    //         expect(modifiedUser.firstName).toEqual(testUser.firstName);
    //         expect(modifiedUser.lastName).toEqual(testUser.lastName);
    //         expect(modifiedUser.email).toEqual(testUserRegisterBody.email);
    //         expect(modifiedUser.authLevel).toEqual(testUser.authLevel);

    //     });

    // });

    // describe('delete', () => {

    //     const testUser: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName1',
    //         lastName: 'TestLastName1',
    //         email: 'test3@test.test',
    //         password: 'password123',
    //         authLevel: 'ADMIN',
    //     };

    //     const testUserTwo: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName2',
    //         lastName: 'TestLastName2',
    //         email: 'test4@test.test',
    //         password: 'password123',
    //         authLevel: 'USER',
    //     };

    //     it('Should delete the target user', async () => {
    //         const userOne = await userService.createNewUserWithPrivileges(testUser);
    //         const userTwo = await userService.createNewUserWithPrivileges(testUserTwo);
    //         const users = await userService.findAll();
    //         const updated = await userService.delete(userOne._id);
    //         const usersAfterDelete = await userService.findAll();

    //         expect(users.length).toEqual(2);
    //         expect(usersAfterDelete.length).toEqual(1);
    //         expect(updated.deletedCount).toEqual(1);

    //         const remainingUser = usersAfterDelete[0];
    //         expect(remainingUser._id).toEqual(userTwo._id);

    //     });

    // });

    // describe('findUser', () => {

    //     const testUser: UserRegistrationBodyDto = {
    //         firstName: 'TestFirstName1',
    //         lastName: 'TestLastName1',
    //         email: 'test3@test.test',
    //         password: 'password123',
    //         authLevel: 'ADMIN',
    //     };

    //     it('Should get the target user', async () => {
    //         const userOne = await userService.createNewUserWithPrivileges(testUser);
    //         const foundUser = await userService.findUser(userOne._id);

    //         expect(foundUser[0]._id).toEqual(userOne._id);
    //         expect(foundUser[0].authLevel).toEqual(testUser.authLevel);
    //         expect(foundUser[0].firstName).toEqual(testUser.firstName);
    //         expect(foundUser[0].lastName).toEqual(testUser.lastName);
    //         expect(foundUser[0].email).toEqual(testUser.email);
    //     });
    // });
});
