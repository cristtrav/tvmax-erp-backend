import { ConfigService } from "@nestjs/config";
import { config } from "dotenv";
import { DataSource } from "typeorm";
import { join } from "path";

config();

const configService = new ConfigService();

export default new DataSource({
    type: 'postgres',
    host: configService.get('PGHOST'),
    port: configService.get('PGPORT'),
    username: configService.get('PGUSER'),
    password: configService.get('PGPASSWORD'),
    database: configService.get('PGDATABASE'),
    synchronize: false,
    entities: [
        join(__dirname, '..', 'src', 'global', 'database', '/entity/**/*.entity{.ts,.js}'),
        join(__dirname, '..',  'src', 'global', 'database', '/view/**/*.view{.ts,.js}'),
    ],
    migrations: [
        join(__dirname, '/migrations/*{.ts, .js}')
    ],
    migrationsTableName: 'typeorm_migrations'
});