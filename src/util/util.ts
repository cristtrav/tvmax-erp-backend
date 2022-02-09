import { IWhereParam } from "./iwhereparam.interface";

export class Util {
    public static buildAndWhereParam(params): IWhereParam {
        var lastParamIndex: number = 0;
        var paramsFiltered = { ...params }
        var whereStr: string = "";
        const whereParams: any[] = [];
        for (let propName in paramsFiltered) {
            if (paramsFiltered[propName] === null || paramsFiltered[propName] === undefined) {
                delete paramsFiltered[propName];
            }
        }
        const objKeysArray: string[] = Object.keys(paramsFiltered);
        const keysLength: number = objKeysArray.length;
        for (let i = 0; i < keysLength; i++) {
            if (i === 0) whereStr += `WHERE`;
            if (i > 0) whereStr += ` AND`;
            if(Array.isArray(paramsFiltered[objKeysArray[i]])){
                whereStr += ` ${objKeysArray[i]} IN (${paramsFiltered[objKeysArray[i]].join()})`;
            }else{
                whereStr += ` ${objKeysArray[i]}=$${i + 1}`;
                whereParams.push(paramsFiltered[objKeysArray[i]]);
                lastParamIndex = i+1;
            }
        }
        return { whereStr, whereParams, lastParamIndex };
    }

    public static buildSortOffsetLimitStr(sort: string, offset: number, limit: number): string {
        var queryStr: string = ``;
        if (sort) {
            const srtOrder: string = sort.substring(0, 1) === '-' ? 'DESC' : 'ASC';
            const srtColumn: string = sort.substring(1, sort.length);
            queryStr += `ORDER BY ${srtColumn} ${srtOrder}`;
        }
        if (offset) {
            if (queryStr.length > 0) queryStr += ' ';
            queryStr += `OFFSET ${offset}`;
        }
        if (limit) {
            if (queryStr.length > 0) queryStr += ' ';
            queryStr += `LIMIT ${limit}`;
        }
        return queryStr;
    }
}