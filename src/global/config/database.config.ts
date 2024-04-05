import { registerAs } from "@nestjs/config";
import { join } from "path";

export default registerAs('database', () => ({
    type: 'postgres',
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT),
    username: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    synchronize: false,
    entities: [
        join(__dirname, '..', '/database/entity/**/*.entity{.ts,.js}'),
        join(__dirname, '..', '/database/view/**/*.view{.ts,.js}')
    ],
    extra: {
        poolSize: 20,
        connectionTimeoutMillis: 30000,
        query_timeout: 20000,
        statement_timeout: 20000
    }
}))