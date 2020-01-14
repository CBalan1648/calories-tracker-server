# Calories Tracker Server

The server-side Node.js application for the Calories Tracker Web App, intended to support the companion Angular project (Calories Tracker - Client) and learn Nest.js

## Description

When started the server provides API documentation at ```/api```

In short the available endpoints are : 
### Guest operations
- **POST** ```api/new```  _Accepts :_ User data  -  _Returns :_ Created DB Record
- **POST** ```api/login```  _Accepts :_ User credentials  -  _Returns :_ JWT
- **POST** ```api/token```  _Accepts :_ JWT  -  _Returns :_ JWT if valid
### Users operations
- **POST** ```api/users```  _Accepts :_ User data  -  _Returns :_ Created DB Record - ***AUTH***
- **GET** ```api/users```  _Returns :_ All users - ***AUTH***
- **DELETE** ```api/users/{userId}```  _Returns :_ Number of deleted records - ***AUTH***
- **PUT** ```api/users/{userId}``` _Accepts :_ User data - _Returns :_ Number of updated records - ***AUTH***
- **GET** ```api/users/{userId}```  _Returns :_ User data - ***AUTH***
### Meals operations
- **POST** ```api/users/{userId}/meals```  _Accepts :_ Meal data  -  _Returns :_ Created DB Record - ***AUTH***
- **GET** ```api/users/{userId}/meals```  _Returns :_ All user meals - ***AUTH***
- **DELETE** ```api/users/{userId}/meals/{mealId}```  _Returns :_ Number of deleted records - ***AUTH***
- **PUT** ```api/users/{userId}/meals/{mealId}``` _Accepts :_ Meal data - _Returns :_ Number of updated records - ***AUTH***
<br>

Some endpoints have roles limitations, those can be ***SELF, USER, USER_MANAGER, ADMIN*** :

- **SELF** Can only be used by the account owner
- **USER** Can only be accessed by the USER Authorization level users, this is the default for new accounts
- **USER_MANAGER** Can only be accessed by the USER_MANAGER Authorization level users, can CRUD meals for every user
- **ADMIN** Can only be accessed by the ADMIN Authorization level users, can CRUD meals and users

## Technologies used

**Http Server Framework** : <br>
<a href="https://nestjs.com/" target="blank">NestJS</a> powered by <a href="https://expressjs.com/" target="blank">Express</a>

**Database** : <br>
<a href="https://www.mongodb.com/" target="blank">MongoDB</a> - <a href="https://mongoosejs.com/" target="blank">Mongoose</a>

**Testing Framework** : <br>
<a href="https://jestjs.io/" target="blank">Jest</a>

**Others** : <br>
<a href="https://www.typescriptlang.org/" target="blank">TypeScript</a> - 
<a href="https://swagger.io/" target="blank">Swagger</a>

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Add License

