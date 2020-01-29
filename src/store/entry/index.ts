import { observable } from 'mobx';

export default class EntryStore {
    @observable text = 'test';
}