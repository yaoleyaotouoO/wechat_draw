import { UserStatus } from '../enums';

export interface IUserInfo {
    id: number;
    nickName: string;
    avatarUrl: string;
    score: number;
    status: UserStatus;
    roomId: string;
    topic: string;
    answer: string;
}

export interface IMessage {
    id: number;
    message: string;
    author: string;
}