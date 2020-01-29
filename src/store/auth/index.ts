import { observable, action } from 'mobx';
import { post } from '@common/utils/http';
import { IAddUserInfoQuery } from '@common/interface/auth';

export default class AuthStore {
    @observable text = 'test';

    @action.bound
    addUserInfo(query: IAddUserInfoQuery) {
        this.api().addUserInfo(query);
    }

    api() {
        return {
            addUserInfo: (query: IAddUserInfoQuery) => {
                return post(``, query);
            }
        }
    }
}