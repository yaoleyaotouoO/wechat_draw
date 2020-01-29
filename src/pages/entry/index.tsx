import Taro, { Component, Config } from '@tarojs/taro';
import { View, Button } from '@tarojs/components';
import { observer, inject } from '@tarojs/mobx';
import { Store } from '@store/index';
import EntryStore from '@store/entry';
import { AtButton, AtModal, AtInput, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui';

import './index.scss';

@inject((store: Store) => ({
  entryStore: store.entryStore
}))
@observer
export default class Entry extends Component<IEntryProps, IEntryState> {
  constructor(props: IEntryProps) {
    super(props);

    this.state = {
      roomName: '',
      openModal: false,
      isCreateRoom: false
    };
  }

  config: Config = {
    navigationBarTitleText: '你画我猜精简版'
  }

  handlerCreateRoom = () => {
    this.setState({
      openModal: true,
      isCreateRoom: true
    });


  }

  handlerFindRoom = () => {
    this.setState({
      openModal: true,
      isCreateRoom: false
    });


  }

  handlerOpenModal = () => {
    this.setState({
      openModal: false,
      roomName: ''
    });

    Taro.navigateTo({ url: '/pages/game/index' });
  }

  render() {
    const { roomName, openModal, isCreateRoom } = this.state;
    // const { entryStore: { text } } = this.props;

    return (
      <View className='entry-page'>
        <View className='entry-content'>
          <AtButton
            type='primary'
            size='normal'
            onClick={this.handlerCreateRoom}
          >
            创建房间
          </AtButton>
          <AtButton
            className='mt-20'
            type='primary'
            size='normal'
            onClick={this.handlerFindRoom}
          >
            查找房间
          </AtButton>
          <AtModal isOpened={openModal}>
            <AtModalHeader>{isCreateRoom ? '创建房间' : '查找房间'}</AtModalHeader>
            <AtModalContent>
              <AtInput
                name='roomName'
                type='text'
                placeholder='房间名字'
                value={roomName}
                onChange={value => this.setState({ roomName: value })}
              />
            </AtModalContent>
            <AtModalAction>
              <Button onClick={() => this.setState({ openModal: false })}>取消</Button>
              <Button onClick={this.handlerOpenModal}>确定</Button>
            </AtModalAction>
          </AtModal>
        </View>
      </View>
    );
  }
}

interface IEntryProps {
  entryStore?: EntryStore;
}

interface IEntryState {
  roomName: string;
  openModal: boolean;
  isCreateRoom: boolean;
}