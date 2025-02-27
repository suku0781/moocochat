import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const TypeOrmTestBase = (entities: Array<any>) =>
  TypeOrmModule.forRootAsync({
    imports: [ConfigModule],
    inject: [ConfigService],
    useFactory: () => {
      return {
        type: 'postgres',
        database: `moocochat`,
        host: `localhost`,
        username: `common`,
        password: `common`,
        port: 5432,
        synchronize: true,
        logging: true,
        namingStrategy: new SnakeNamingStrategy(),
        ssl:
          process.env.NODE_ENV === 'prod'
            ? { rejectUnauthorized: false }
            : false,
        entities: entities,
      };
    },
  });
