import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

export default (customOpts: any = {}) => MongooseModule.forRootAsync({
  useFactory: async () => {

    const port = await mongod.getPort();
    const database = await mongod.getDbName();

    return {
      type: 'mongodb',
      host: '127.0.0.1',
      port,
      database,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      ...customOpts,
    };
  },
});