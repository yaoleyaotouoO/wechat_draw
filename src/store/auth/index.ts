import { observable, action } from 'mobx';
import { post } from '@common/utils/http';
import { IAddUserInfoQuery } from '@common/interface/auth';

export default class AuthStore {
    @observable text = 'test';

    @action.bound
    addUserInfo(query: IAddUserInfoQuery) {
        return this.api().addUserInfo(query);
    }

    api() {
        return {
            addUserInfo: (query: IAddUserInfoQuery): Promise<number> => {
                return post(`/api/addUserInfo`, query);
            }
        };
    }
}