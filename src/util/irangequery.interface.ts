import { IRange } from "./irangefield.interface";

export interface IRangeQuery{
    joinOperator: 'AND' | 'OR';
    range: IRange[];
}