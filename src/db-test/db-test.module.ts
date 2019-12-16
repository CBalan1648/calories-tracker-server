import { MongooseModule } from '@nestjs/mongoose';
import { mongoose } from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export default () => MongooseModule.forRootAsync({
  useFactory: async () => {
    const mongod = new MongoMemoryServer();
    const port = await mongod.getPort();
    const database = await mongod.getDbName();

    return {
      uri: `mongodb://localhost:${port}/${database}`,
    };
  },
});
