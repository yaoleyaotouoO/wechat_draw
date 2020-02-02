import { action } from 'mobx';
import { post } from '@common/utils/http';
import { IResult } from '@common/interface';
import { ICreateOrFindRoomQuery } from '@common/interface/entry';

export default class EntryStore {
    @action.bound
    createRoom(query: ICreateOrFindRoomQuery) {
        return this.api().createRoom(query);
    }

    @action.bound
    findRoom(query: ICreateOrFindRoomQuery) {
        return this.api().findRoom(query);
    }

    api() {
        return {
            createRoom: (query: ICreateOrFindRoomQuery): Promise<IResult> => {
                return post(`/api/createRoom`, query);
            },
            findRoom: (query: ICreateOrFindRoomQuery): Promise<IResult> => {
                return post(`/api/findRoom`, query);
            }
        };
    }
}