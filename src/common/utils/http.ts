import Taro from '@tarojs/taro';

export const request = (url: string, data: any, method: any, header?: any) => {
    return new Promise((resolve, reject) => {
        Taro.request({
            url: url,
            data: data,
            header: header,
            method: method,
            success: (res => {
                if (res.statusCode === 200) {
                    //200: 服务端业务处理正常结束
                    resolve(res);
                } else {
                    //其它错误，提示用户错误信息
                    console.error('request sucess status code !== 200!');
                    reject(res);
                }
            }),
            fail: (res => {
                console.error('request fail!');
                reject(res);
            })
        });
    });
};

export const get = (url: string, data: any) => {
    return request(url, data, 'GET');
};

export const post = (url: string, data: any) => {
    return request(url, data, 'POST');
};