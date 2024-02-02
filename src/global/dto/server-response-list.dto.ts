export class ServerResponseList<Type> {
    
    data: Type[]
    queryRowCount: number;

    constructor(data: Type[], queryRowCount: number){
        this.data = data;
        this.queryRowCount = queryRowCount;
    }

}