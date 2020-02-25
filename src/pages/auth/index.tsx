import Taro, { Component, Config } from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import { observer, inject } from '@tarojs/mobx';
import { Store } from '@store/index';
import AuthStore from '@store/auth';
import { AtButton, AtModal, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui';

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

  state = {
    isOpened: false
  }

  componentDidMount() {
    Taro.showShareMenu({
      withShareTicket: true
    });
  }

  handlerGetUserInfo = async ev => {
    const { authStore: { addUserInfo } } = this.props;

    const userInfo: IWeappUserInfo = ev.detail.userInfo;
    if (userInfo) {
      const userId = await addUserInfo({
        nickName: userInfo.nickName,
        avatarUrl: userInfo.avatarUrl
      });
      this.setState({ isOpened: false });
      Taro.setStorageSync('userInfo', { ...userInfo, ...{ id: userId } });
      Taro.navigateTo({ url: '/pages/entry/index' });
    }
  }

  render() {
    const { isOpened } = this.state;

    return (
      <View className='auth-page'>
        <View className='auth-content'>
          <AtButton
            type='primary'
            size='normal'
            onClick={() => this.setState({ isOpened: true })}
          >
            登陆
          </AtButton>
          <View className="auth-hint">
            <View>登陆成功之后仅使用您的昵称和头像, 用于:</View>
            <View>1. 游戏中聊天功能</View>
            <View>2. 统计分数</View>
          </View>
        </View>
        <AtModal isOpened={isOpened}>
          <AtModalHeader>授权</AtModalHeader>
          <AtModalContent>
            <View>该程序将获取以下授权:</View>
            <View>获取您的公开信息 （昵称、头像等）</View>
          </AtModalContent>
          <AtModalAction>
            <Button
              onClick={() => this.setState({ isOpened: false })}
            >
              取消
            </Button>
            <Button
              openType='getUserInfo'
              onGetUserInfo={this.handlerGetUserInfo}
            >
              确定
            </Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

interface IAuthProps {
  authStore?: AuthStore;
}

interface IAuthState {
  isOpened: boolean;
}