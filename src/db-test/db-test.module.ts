import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MONGO_DB_IN_MEMORY_ADDRESS } from '../config';

export default () => MongooseModule.forRootAsync({
  useFactory: async () => {
    const mongod = new MongoMemoryServer();
    const port = await mongod.getPort();
    const database = await mongod.getDbName();

    return {
      uri: `${MONGO_DB_IN_MEMORY_ADDRESS}:${port}/${database}`,
    };
  },
});
