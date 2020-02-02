export interface IAddUserInfoQuery {
    nickName: string;
    avatarUrl: string;
}

export interface IWeappUserInfo {
    id: number;
    nickName: string;
    gender: number;
    language: string;
    city: string;
    province: string;
    country: string;
    avatarUrl: string;
}