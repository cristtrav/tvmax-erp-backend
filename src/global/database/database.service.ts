import { Injectable } from '@nestjs/common';
import { Pool, Client, Result} from 'pg';

@Injectable()
export class DatabaseService {

    private dbpool: Pool

    constructor(){
        this.dbpool = new Pool()
        this.dbpool.on('error', (err, client)=>{
            console.error('Error en el cliente de base de datos', err)
            process.exit(-1)
        });
    }

    async execute(query: string, params?: any[]): Result {
        const dbcli: Client = await this.dbpool.connect()
        try{                
            return await dbcli.query(query, params)
        }catch(e){
            throw e
        }finally{            
            dbcli.release()
        }
    }

    async getDBClient(): Client{
        return await this.dbpool.connect();
    }

}
