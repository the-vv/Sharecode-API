export interface ITokenData {
    id: string,
    email: string
}

export type TMongoDefault = {
    _id?: string;
    __v?: string | number
}

export interface IListResponse<T> {
    result: T[],
    totalItems: number
}