import { IRange } from "./irangefield.interface";
import { IRangeQuery } from "./irangequery.interface";
import { ISearchField } from "./isearchfield.interface";
import { IWhereParam } from "./iwhereparam.interface";

export class WhereParam {

    whereStr: string = '';
    whereParams: any[] = [];
    sortOffsetLimitStr: string = '';

    constructor(andParams: Object | null, orParams: Object | null, rangeParams: IRangeQuery | null, searchParams: ISearchField[] | null, sof: ISortOffsetLimit | null) {
        let whereParams: any[] = [];
        let whereStr: string = ``;
        const andParamsFiltered: Object = this.filterParams(andParams);
        const andSentenceStr: string = andParams ? this.buildConditionalSentence(andParamsFiltered, 'AND', 1) : '';
        whereParams = whereParams.concat(Object.values(andParamsFiltered));

        const orParamsFiltered: Object = this.filterParams(orParams);
        const orSentenceStr: string = orParams ? this.buildConditionalSentence(orParamsFiltered, 'OR', whereParams.length + 1) : '';
        whereParams = whereParams.concat(Object.values(orParamsFiltered));

        const rangeParamsFiltered: Object = this.filterParamsRange(rangeParams?.range);
        const rangeSentenceStr: String = this.buildRangeSentenceStr(rangeParams, whereParams.length + 1);
        whereParams = whereParams.concat(Object.values(rangeParamsFiltered));

        const searchParamsFiltered: Object = this.filterParamsSearch(searchParams);
        const searchSentenceStr: string = this.buildSearchSentence(searchParams, whereParams.length + 1);
        whereParams = whereParams.concat(Object.values(searchParamsFiltered));

        if (andSentenceStr.length !== 0) whereStr += ` (${andSentenceStr})`;

        if (orSentenceStr.length !== 0) {
            if (whereStr.length !== 0) whereStr += ` AND`;
            whereStr += ` (${orSentenceStr})`;
        }
        if (rangeSentenceStr.length !== 0) {
            if (whereStr.length !== 0) whereStr += ` AND`;
            whereStr += ` (${rangeSentenceStr})`;
        }

        if (searchSentenceStr.length !== 0) {
            if (whereStr.length !== 0) whereStr += ` AND`;
            whereStr += ` (${searchSentenceStr})`;
        }
        this.whereStr = whereStr.length !== 0 ? `WHERE ${whereStr.trim()}` : '';
        this.whereParams = whereParams;
        if (sof) this.sortOffsetLimitStr = this.buildSortOffsetLimitStr(sof?.sort, sof?.offset, sof?.limit);
    }

    private buildConditionalSentence(params, operator, startParamNum: number): string {
        let currentParNum: number = startParamNum;
        let andSentenceStr: string = '';
        const objKeysArray: string[] = Object.keys(params);
        const keysLength: number = objKeysArray.length;
        for (let i = 0; i < keysLength; i++) {
            if (i > 0) andSentenceStr += ` ${operator}`;
            if (Array.isArray(params[objKeysArray[i]])) andSentenceStr += ` ${objKeysArray[i]} = ANY($${currentParNum})`
            else andSentenceStr += ` ${objKeysArray[i]}=$${currentParNum}`;
            currentParNum++;
        }
        return andSentenceStr;
    }

    private buildRangeSentenceStr(rangesQuery: IRangeQuery, startParamNum: number): string {
        let currentParNum: number = startParamNum;
        let rangeSentenceStr: string = '';
        if (rangesQuery?.range) {
            const rangeFiltered: IRange[] = [];
            rangesQuery.range.forEach((rg: IRange) => {
                if ((typeof rg.startValue !== 'undefined' && rg.startValue !== null) || (typeof rg.endValue !== 'undefined' && rg.endValue !== null)) rangeFiltered.push(rg);
            });
            console.log('cantidad de rangos>' + rangeFiltered.length);

            rangeFiltered.forEach((rg: IRange, i: number) => {
                if (rangeSentenceStr.length !== 0) rangeSentenceStr += ` ${rangesQuery.joinOperator}`;
                if (rangeFiltered.length > 1) rangeSentenceStr += ' (';
                if (rg.startValue) {
                    rangeSentenceStr += ` ${rg.fieldName} >= $${currentParNum}`;
                    currentParNum++;
                }
                if (rg.endValue) {
                    if (rg.startValue) rangeSentenceStr += ` AND`;
                    rangeSentenceStr += ` ${rg.fieldName} <= $${currentParNum}`;
                    currentParNum++;
                }
                if (rangeFiltered.length > 1) rangeSentenceStr += ' )';
            });
        }
        return rangeSentenceStr;
    }

    private buildSearchSentence(params: ISearchField[], startParamNum: number): string {
        let currentParNum: number = startParamNum;
        let searchSentenceStr: string = ``;
        if (params) {
            params.forEach((sf: ISearchField) => {
                if (sf.fieldValue) {
                    if (searchSentenceStr.length > 0) searchSentenceStr += ` OR`;
                    if (sf.exactMatch) {
                        searchSentenceStr += ` LOWER(${sf.fieldName}::text) = $${currentParNum}`;
                    } else {
                        searchSentenceStr += ` LOWER(${sf.fieldName}::text) LIKE $${currentParNum}::text`;
                    }
                    currentParNum++;
                }
            });
        }
        return searchSentenceStr;
    }

    private filterParams(params: Object): any {
        let paramsFiltered: Object = {};
        if (params) {
            for (let propName in params) {
                if (params[propName] !== null && params[propName] !== undefined) {
                    paramsFiltered[`${propName}`] = params[propName];
                }
            }
        }
        return paramsFiltered;
    }

    private filterParamsRange(params: IRange[]): Object {
        const paramsFiltered: Object = {};
        if (params) {
            params.forEach((rg: IRange) => {
                if (rg.startValue) paramsFiltered[`start${rg.fieldName}`] = rg.startValue;
                if (rg.endValue) paramsFiltered[`end${rg.fieldName}`] = rg.endValue;
            });
        }
        return paramsFiltered;
    }

    public filterParamsSearch(params: ISearchField[]): Object {
        let filterParams: Object = {};
        if (params) {
            params.forEach((sf: ISearchField) => {
                if (sf.fieldValue) {
                    if (!sf.exactMatch) {
                        filterParams[sf.fieldName] = `%${sf.fieldValue?.toLowerCase()}%`;
                    } else {
                        filterParams[sf.fieldName] = sf.fieldValue;
                    }
                }
            });
        }
        return filterParams;
    }

    private buildSortOffsetLimitStr(sort: string, offset: number, limit: number): string {
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

interface ISortOffsetLimit {
    sort: string | null;
    offset: number | null;
    limit: number | null;
}