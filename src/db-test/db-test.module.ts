import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

export default (customOpts: any = {}) => MongooseModule.forRootAsync({
  useFactory: async () => {

    const port = await mongod.getPort();
    const database = await mongod.getDbName();


    return {
      uri: `mongodb://localhost:${port}/${database}`,
    };
  },
});