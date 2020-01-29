import Taro, { Component, Config } from '@tarojs/taro';
import { View } from '@tarojs/components';
import { observer, inject } from '@tarojs/mobx';
import { Store } from '@store/index';
import AuthStore from '@store/auth';
import { AtButton } from 'taro-ui';

import './index.scss';
import { IWeappUserInfo } from '@common/interface/auth';

@inject((store: Store) => ({
  authStore: store.authStore
}))
@observer
export default class Auth extends Component<IAuthProps, IAuthState> {
  config: Config = {
    navigationBarTitleText: '你画我猜精简版'
  }

  handlerGetUserInfo = ev => {
    const { authStore: { addUserInfo } } = this.props;

    const userInfo: IWeappUserInfo = ev.detail.userInfo;
    if (userInfo) {
      Taro.setStorageSync('userInfo', userInfo);
      Taro.redirectTo({ url: '/pages/entry/index' });
      addUserInfo({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });
    }
  }

  render() {
    return (
      <View className='auth-page'>
        <View className='auth-content'>
          <AtButton
            type='primary'
            size='normal'
            openType='getUserInfo'
            onGetUserInfo={this.handlerGetUserInfo}
          >
            去授权
          </AtButton>
        </View>
      </View>
    );
  }
}

interface IAuthProps {
  authStore?: AuthStore;
}

interface IAuthState {

}