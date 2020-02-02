import { action } from 'mobx';
import Socket from '@store/common/socket';

export default class GameStore {
    socket: Socket;

    @action.bound
    initSocket() {
        this.socket = new Socket();
        return this.socket.init();
    }
}