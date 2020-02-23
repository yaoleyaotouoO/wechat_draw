const isDev = process.env.NODE_ENV === 'development';

const config = {
    DEV: {
        Url: 'http://192.168.2.132:3500',
        Socket: 'ws://192.168.2.132:3500/ws/'
    },
    LIVE: {
        Url: 'https://wx.yaoleyaotou.xin',
        Socket: 'wss://wx.yaoleyaotou.xin/ws/'
    }
};

export default isDev ? config.DEV : config.LIVE;