import config from '@common/utils/config';
import Taro from '@tarojs/taro';

export default class Socket {
    async init() {
        const task = await Taro.connectSocket({
            url: config.Socket,
            success: function () {
                console.log('connect success');
            }
        });

        return task;
    }
}
