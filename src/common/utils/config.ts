const isDev = process.env.NODE_ENV === 'development';

export default () => {
    const config = {
        DEV: {
            Url: '',
            Socket: ''
        },
        LIVE: {
            Url: '',
            Socket: ''
        }
    };

    return isDev ? config.DEV : config.LIVE;
};