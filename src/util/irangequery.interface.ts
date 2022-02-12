import { IRange } from "./irangefield.interface";

export interface IRangeQuery{
    joinOperator: string;
    range: IRange[];
}