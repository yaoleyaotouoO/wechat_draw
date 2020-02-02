import Taro from '@tarojs/taro';
import config from './config';

export const request = <T>(url: string, data: any, method: any, header?: any) => {
    return new Promise<T>((resolve, reject) => {
        Taro.request({
            url: `${config.Url}${url}`,
            data: data,
            header: header,
            method: method,
            success: (res => {
                if (res.statusCode === 200) {
                    //200: 服务端业务处理正常结束
                    resolve(res.data as any);
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

export const get = <T>(url: string, data: any) => {
    return request<T>(url, data, 'GET');
};

export const post = <T>(url: string, data: any) => {
    return request<T>(url, data, 'POST');
};