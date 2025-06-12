export interface ResultInterface{
    uid: number;
    delivered: boolean;
    errorLocation: 'sender' | 'destination';
    destinationEmail: string;
    cause: string;
}