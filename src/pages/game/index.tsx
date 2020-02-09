import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, Canvas, Input, Button } from '@tarojs/components';
import { observer, inject } from '@tarojs/mobx';
import { Store } from '@store/index';
import GameStore from '@store/game';
import { AtBadge, AtAvatar, AtModal, AtMessage, AtButton, AtToast, AtModalHeader, AtModalContent, AtModalAction } from 'taro-ui';
import { PenWidthType } from '@common/enums';
import { ITouchEvent } from '@tarojs/components/types/common';
import { IWeappUserInfo } from '@common/interface/auth';
import { IUserInfo, IMessage } from '@common/interface/game';

import './index.scss';

const penColorData = {
  red: '#FF0000',
  yellow: '#FFFF00',
  blue: '#87CEFA',
  green: '#90EE90',
  purple: '#EE82EE',
  black: '#000000'
};

@inject((store: Store) => ({
  gameStore: store.gameStore
}))
@observer
export default class Game extends Component<IGameProps, IGameState> {
  config: Config = {
    navigationBarTitleText: '你画我猜精简版',
    navigationBarBackgroundColor: '#F7CE56',
    disableScroll: true
  };
  ctx: Taro.CanvasContext;
  roomId: string;
  socket: Taro.SocketTask;
  userInfo: IWeappUserInfo;

  constructor(props: IGameProps) {
    super(props);

    this.state = {
      isOpenClear: false,
      isOpenTopicName: false,
      isOpenGameOver: false,
      answer: '',
      penColor: penColorData.black,
      penWidth: PenWidthType.Small,
      userList: [],
      inTheGame: false,
      canDraw: false,
      topicName: '',
      topicPrompt: '',
      gameTime: null,
      messageList: []
    };

    const { roomId } = this.$router.params;
    this.roomId = roomId;
  }

  componentDidMount() {
    const userInfo = Taro.getStorageSync('userInfo') as IWeappUserInfo;
    this.userInfo = userInfo;
    if (!userInfo) {
      Taro.redirectTo({ url: '/pages/auth/index' });
    }

    this.initCanvas();
    this.initSocket();
  }

  componentWillUnmount() {
    this.socket.close({
      reason: JSON.stringify({
        userId: this.userInfo.id
      })
    });
  }

  initCanvas = () => {
    const { penColor, penWidth } = this.state;
    const ctx = Taro.createCanvasContext('drawCanvas');
    this.ctx = ctx;

    this.ctx.setStrokeStyle(penColor);
    this.ctx.setLineWidth(penWidth);
    this.ctx.draw();
  }

  initSocket = async () => {
    const { gameStore: { initSocket } } = this.props;

    const socket = await initSocket();
    this.socket = socket;
    socket.onOpen(() => {
      console.info('onOpen');
      const { id, nickName, avatarUrl } = this.userInfo;
      socket.send({
        data: JSON.stringify({
          type: 'joinRoom',
          data: {
            roomId: this.roomId,
            userId: id,
            user: {
              id,
              nickName,
              avatarUrl,
              roomId: this.roomId
            }
          }
        })
      });
    });

    socket.onMessage(event => {
      const message = JSON.parse(event.data);
      console.log('onMessage: ', message);
      const dataRoomId = message.data.roomId;
      const messageData = message.data;
      if (dataRoomId !== this.roomId) {
        return;
      }

      switch (message.type) {
        case 'joinRoomFail':
          Taro.atMessage({
            message: messageData.errMsg,
            type: 'error'
          });
          setTimeout(() => {
            Taro.redirectTo({ url: '/pages/entry/index' });
          }, 2000);
          break;
        case 'updateRoomUser':
          this.setState({ userList: messageData.userList });
          break;
        case 'startGame':
          this.clearCanvas();
          Taro.atMessage({
            message: '游戏马上开始！',
            type: 'success'
          });
          let { userList: stateUserList = [] } = this.state;
          stateUserList = stateUserList.map(item => {
            return { ...item, ...{ score: 0 } };
          })
          this.setState({
            inTheGame: true,
            userList: stateUserList
          });
          const { drawUserId } = messageData;
          if (drawUserId === this.userInfo.id) {
            this.setState({ canDraw: true });
          }
          break;
        case 'updateCanvas':
          if (messageData.type === "changePenColor") {
            this.setPenColor(messageData.data);
          } else if (messageData.type === "changePenWidth") {
            this.setPenWidth(messageData.data);
          } else {
            this.draw(messageData);
          }
          break;
        case 'updateMessage':
          const stateMessage = this.state.messageList;
          stateMessage.push(messageData.message);
          this.setState({
            messageList: stateMessage
          });
          break;
        case 'updateGameInfo':
          const { roomData: { drawUserId: drawId, topicName, topicPrompt }, gameTime } = messageData;

          // 新一轮游戏开始
          if (gameTime === 100) {
            this.clearCanvas();
          }

          this.setState({
            gameTime,
            topicName,
            topicPrompt,
            canDraw: drawId === this.userInfo.id,
          });
          break;
        case 'gameOver':
          const { userList } = messageData;

          this.clearCanvas();
          this.setState({
            gameTime: null,
            canDraw: false,
            inTheGame: false,
            isOpenGameOver: true,
            userList
          });
          break;
        case 'showAnswer':
          const { topicName: answerTopicName } = messageData;

          this.clearCanvas();
          this.setState({
            topicName: answerTopicName,
            isOpenTopicName: true
          });
          break;
        default:
          console.warn('webSocket onmessage not type!: ', message);
      }
    });

    socket.onError(function () {
      console.info('onError');
    });

    socket.onClose(function (e) {
      console.info('onClose: ', e);
    });
  }

  handlerConfirmAnswer = (value: string) => {
    this.socket.send({
      data: JSON.stringify({
        type: 'submitAnswer',
        data: {
          roomId: this.roomId,
          userId: this.userInfo.id,
          answer: value
        }
      })
    });

    this.setState({ answer: '' });
  }

  handleConfirmClear = () => {
    this.setState({ isOpenClear: false });
    this.draw({ type: 'clear' });
  }

  handlerStartGame = () => {
    const { userList } = this.state;

    if (userList.length < 2) {
      Taro.atMessage({
        message: '游戏人数需大于等于2人！',
        type: 'error'
      });

      return;
    }

    const { id } = this.userInfo;
    this.socket.send({
      data: JSON.stringify({
        type: 'startGame',
        data: {
          roomId: this.roomId,
          userId: id,
        }
      })
    });
  }

  setPenColor = (color: string) => {
    this.setState({ penColor: color });
    this.draw({ type: 'changePenColor', data: color });
  }

  setPenWidth = (width: PenWidthType) => {
    this.setState({ penWidth: width });
    this.draw({ type: 'changePenWidth', data: width });
  }

  clearCanvas = () => {
    this.ctx.clearRect(0, 0, 375, 603);
    this.ctx.draw();
    this.setState({
      penColor: penColorData.black,
      penWidth: PenWidthType.Small,
    });
  }

  draw = (data) => {
    const { penColor, penWidth, canDraw } = this.state;

    switch (data.type) {
      case 'start':
        this.ctx.setStrokeStyle(penColor);
        this.ctx.setLineWidth(penWidth);
        this.ctx.moveTo(data.x, data.y);
        break;
      case 'move':
        this.ctx.lineTo(data.x, data.y);
        this.ctx.stroke();
        this.ctx.draw(true);
        this.ctx.moveTo(data.x, data.y);
        break;
      case 'end':
        break;
      case 'clear':
        this.clearCanvas();
        break;
      case 'changePenColor':
        this.ctx.setStrokeStyle(data.data);
        break;
      case 'changePenWidth':
        this.ctx.setLineWidth(data.data);
        break;
      default:
        console.warn('draw not type!');
    }

    if (!canDraw) {
      return;
    }

    this.socket.send({
      data:
        JSON.stringify({
          data: {
            type: data.type,
            x: data.x,
            y: data.y,
            data: data.data,
            roomId: this.roomId
          },
          type: 'updateCanvas'
        })
    });
  }

  touchStart = (e: ITouchEvent) => {
    const { canDraw } = this.state;
    if (!canDraw) {
      return;
    }

    const { x, y } = this.getPoint(e);
    this.draw({ x, y, type: 'start' });
  }

  touchMove = (e: ITouchEvent) => {
    const { canDraw } = this.state;
    if (!canDraw) {
      return;
    }
    const { x, y } = this.getPoint(e);
    this.draw({ x, y, type: 'move' });
  }

  touchEnd = () => {
    const { canDraw } = this.state;
    if (!canDraw) {
      return;
    }
    this.draw({ type: 'end' });
  }

  getPoint = (e: any) => {
    const touch = e.touches[0];
    const x = touch.x;
    const y = touch.y;

    return { x, y };
  }

  render() {
    const { isOpenClear, isOpenTopicName, isOpenGameOver, answer, penColor, penWidth, inTheGame, canDraw, userList, gameTime, topicPrompt, topicName, messageList } = this.state;
    const isHomeOwner = (userList[0] || {} as IUserInfo).id === (this.userInfo || {} as IWeappUserInfo).id;
    const getTitle = () => {
      if (!inTheGame) {
        return '';
      }

      if (canDraw) {
        return topicName || '';
      }

      return `${topicName.length}个字 ${gameTime < 70 ? topicPrompt : ''}`;
    };

    return (
      <View className='game-page'>
        <AtMessage />
        <AtToast
          isOpened={isOpenTopicName}
          hasMask={false}
          duration={2000}
          onClick={() => this.setState({ isOpenTopicName: false })}
          text={topicName}
        >
        </AtToast>
        <View className='game-head'>
          <View className='at-row'>
            <View className='at-col at-col-3'>{gameTime || ''}</View>
            <View className='at-col at-col-6'>{getTitle()}</View>
            {/* <View className='at-col at-col-3'>退出游戏</View> */}
          </View>
        </View>
        <View className='game-body'>
          <View className='at-row'>
            <View className='at-col at-col-11 game-body-left'>
              <Canvas
                canvasId='drawCanvas'
                style={`border: 1px solid; border-radius: 20px;height: 100%;width : 100%; display: ${inTheGame ? '' : 'none'}`}
                onTouchStart={e => this.touchStart(e)}
                onTouchMove={e => this.touchMove(e)}
                onTouchEnd={() => this.touchEnd()}
              />
              <View style={`border: 1px solid; border-radius: 20px;height: 100%;width : 100%; display: ${inTheGame ? 'none' : ''}`}></View>
            </View>
            {
              canDraw ?
                <View className='at-col at-col-1 game-body-right'>
                  <View
                    className={`red-pen circle ${penColor === penColorData.red ? 'selected' : ''}`}
                    onClick={() => this.setPenColor(penColorData.red)}
                  ></View>
                  <View
                    className={`yellow-pen circle ${penColor === penColorData.yellow ? 'selected' : ''}`}
                    onClick={() => this.setPenColor(penColorData.yellow)}
                  ></View>
                  <View
                    className={`blue-pen circle ${penColor === penColorData.blue ? 'selected' : ''}`}
                    onClick={() => this.setPenColor(penColorData.blue)}
                  ></View>
                  <View
                    className={`green-pen circle ${penColor === penColorData.green ? 'selected' : ''}`}
                    onClick={() => this.setPenColor(penColorData.green)}
                  ></View>
                  <View
                    className={`purple-pen circle ${penColor === penColorData.purple ? 'selected' : ''}`}
                    onClick={() => this.setPenColor(penColorData.purple)}
                  ></View>
                  <View
                    className={`black-pen circle ${penColor === penColorData.black ? 'selected' : ''}`}
                    onClick={() => this.setPenColor(penColorData.black)}
                  ></View>
                  <View
                    className={`gray-pen small ${penWidth === PenWidthType.Small ? 'selected' : ''}`}
                    onClick={() => this.setPenWidth(PenWidthType.Small)}
                  ></View>
                  <View
                    className={`gray-pen medium ${penWidth === PenWidthType.Medium ? 'selected' : ''}`}
                    onClick={() => this.setPenWidth(PenWidthType.Medium)}
                  ></View>
                  <View
                    className={`gray-pen large ${penWidth === PenWidthType.Large ? 'selected' : ''}`}
                    onClick={() => this.setPenWidth(PenWidthType.Large)}
                  ></View>
                  <View
                    className='erase-pen'
                    onClick={() => this.setState({ isOpenClear: true })}
                  ></View>
                </View> :
                <View className='at-col at-col-1 game-body-right'></View>
            }
          </View>
        </View>
        <View className='game-toolbar'>
          {
            inTheGame ?
              <AtButton
                type='primary'
                size='normal'
                disabled
              >
                游戏进行中。。。
              </AtButton> :
              <View style={{ height: '100%' }}>
                {isHomeOwner ?
                  <AtButton
                    type='primary'
                    size='normal'
                    onClick={this.handlerStartGame}
                  >
                    开始游戏
                  </AtButton> :
                  <AtButton
                    type='primary'
                    size='normal'
                    disabled
                  >
                    等待游戏开始
                  </AtButton>
                }
              </View>
          }
        </View>
        <View className='game-bottom'>
          <View className='at-row'>
            <View className='at-col at-col-2 game-bottom-left'>
              {
                [0, 1, 2].map(item => {
                  const user = userList[item] || {} as IUserInfo;
                  return <View key={item} className='game-bottom-people'>
                    <AtBadge value={user.score}>
                      <AtAvatar size='small' circle text='空' image={user.avatarUrl}></AtAvatar>
                    </AtBadge>
                    <Text className='text'>{user.nickName}</Text>
                  </View>;
                })
              }
            </View>
            <View className='at-col at-col-8 game-bottom-mid'>
              <View className='body'>
                {
                  messageList.map(item => {
                    return <View className='body-message' key={item.id}>
                      <Text>{item.author}: {item.message}</Text>
                    </View>;
                  })
                }
              </View>
            </View>
            <View className='at-col at-col-2 game-bottom-right'>
              {
                [3, 4, 5].map(item => {
                  const user = userList[item] || {} as IUserInfo;
                  return <View key={item} className='game-bottom-people'>
                    <AtBadge value={user.score}>
                      <AtAvatar size='small' circle text='空' image={user.avatarUrl}></AtAvatar>
                    </AtBadge>
                    <Text className='text'>{user.nickName}</Text>
                  </View>;
                })
              }
            </View>
          </View>
        </View>
        <View className='game-answer'>
          <Input
            name='value'
            type='text'
            className={`${canDraw ? 'readOnly' : ''}`}
            disabled={canDraw}
            style={{ height: '100%' }}
            placeholder={`${canDraw ? '画图者不能作答' : '输入您的答案'}`}
            value={answer}
            onConfirm={e => this.handlerConfirmAnswer(e.detail.value)}
            onInput={e => this.setState({ answer: e.detail.value })}
          />
        </View>
        <AtModal
          isOpened={isOpenClear}
          title='提示'
          cancelText='取消'
          confirmText='确认'
          onClose={() => this.setState({ isOpenClear: false })}
          onCancel={() => this.setState({ isOpenClear: false })}
          onConfirm={this.handleConfirmClear}
          content='确定清空所有画布？'
        />
        <AtModal isOpened={isOpenGameOver}>
          <AtModalHeader>游戏结束</AtModalHeader>
          <AtModalContent>
            {
              userList.map(item => {
                return <View key={item.id}>
                  <Text>{item.nickName}: {item.score}</Text>
                </View>;
              })
            }
          </AtModalContent>
          <AtModalAction>
            <Button onClick={() => this.setState({ isOpenGameOver: false })}>取消</Button>
            <Button onClick={() => this.setState({ isOpenGameOver: false })}>确定</Button>
          </AtModalAction>
        </AtModal>
      </View>
    );
  }
}

interface IGameProps {
  gameStore?: GameStore;
}

interface IGameState {
  isOpenClear: boolean;
  isOpenTopicName: boolean;
  isOpenGameOver: boolean;
  answer: string;
  penColor: string;
  penWidth: PenWidthType;
  userList: IUserInfo[];
  inTheGame: boolean;
  canDraw: boolean;
  topicName: string;
  topicPrompt: string;
  gameTime: number;
  messageList: IMessage[];
}