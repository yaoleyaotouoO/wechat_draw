import Taro, { Component, Config } from '@tarojs/taro';
import { View, Text, Canvas, Input } from '@tarojs/components';
import { observer, inject } from '@tarojs/mobx';
import { Store } from '@store/index';
import GameStore from '@store/game';
import { AtBadge, AtAvatar, AtModal } from 'taro-ui';
import { PenWidthType } from '@common/enums';
import { ITouchEvent } from '@tarojs/components/types/common';

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

  constructor(props: IGameProps) {
    super(props);

    this.state = {
      isOpenClear: false,
      answer: '',
      penColor: penColorData.black,
      penWidth: PenWidthType.Small
    };
  }

  componentDidMount() {
    this.initCanvas();
    this.initSocket();
  }

  initCanvas = () => {
    const { penColor, penWidth } = this.state;
    const ctx = Taro.createCanvasContext('drawCanvas');
    this.ctx = ctx;

    this.ctx.setStrokeStyle(penColor);
    this.ctx.setLineWidth(penWidth);
    this.ctx.draw();
  }

  initSocket = () => {

  }

  handlerConfirmAnswer = (value: string) => {
    console.log("handlerConfirm: ", value);

    this.setState({ answer: '' });
  }

  handleConfirmClear = () => {
    this.setState({ isOpenClear: false });
    this.draw({ type: 'clear' });
  }

  setPenColor = (color: string) => {
    this.setState({ penColor: color });
    this.draw({ type: 'changePenColor', data: color });
  }

  setPenWidth = (width: PenWidthType) => {
    this.setState({ penWidth: width });
    this.draw({ type: 'changePenWidth', data: width });
  }

  draw = (data) => {
    const { penColor, penWidth } = this.state;

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
        this.ctx.clearRect(0, 0, 375, 603);
        this.ctx.draw();
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
  }

  touchStart = (e: ITouchEvent) => {
    const { x, y } = this.getPoint(e);
    this.draw({ x, y, type: 'start' });
  }

  touchMove = (e: ITouchEvent) => {
    const { x, y } = this.getPoint(e);
    this.draw({ x, y, type: 'move' });
  }

  touchEnd = () => {
    this.draw({ type: 'end' });
  }

  getPoint = (e: any) => {
    const touch = e.touches[0];
    const x = touch.x;
    const y = touch.y;

    return { x, y };
  }

  render() {
    const { isOpenClear, answer, penColor, penWidth } = this.state;

    return (
      <View className='game-page'>
        <View className='game-head'>
          <View className='at-row'>
            <View className='at-col at-col-3'>60</View>
            <View className='at-col at-col-6'>苹果</View>
            {/* <View className='at-col at-col-3'>退出游戏</View> */}
          </View>
        </View>
        <View className='game-body'>
          <View className='at-row'>
            <View className='at-col at-col-11 game-body-left'>
              <Canvas
                canvasId='drawCanvas'
                style='border: 1px solid; border-radius: 20px;height: 100%;width : 100%;'
                onTouchStart={e => this.touchStart(e)}
                onTouchMove={e => this.touchMove(e)}
                onTouchEnd={() => this.touchEnd()}
              />
            </View>
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
            </View>
          </View>
        </View>
        <View className='game-toolbar'>

        </View>
        <View className='game-bottom'>
          <View className='at-row'>
            <View className='at-col at-col-2 game-bottom-left'>
              <AtBadge value='10'>
                <AtAvatar size='small' circle text='空'></AtAvatar>
              </AtBadge>
              <Text className='text'>test</Text>
              <AtBadge value=''>
                <AtAvatar size='small' circle text='空'></AtAvatar>
              </AtBadge>
              <Text className='text'></Text>
              <AtBadge value=''>
                <AtAvatar size='small' circle text='空'></AtAvatar>
              </AtBadge>
              <Text className='text'></Text>
            </View>
            <View className='at-col at-col-8 game-bottom-mid'>
              <View className='body'>
                2
              </View>
            </View>
            <View className='at-col at-col-2 game-bottom-right'>
              <AtBadge value=''>
                <AtAvatar size='small' circle text='空'></AtAvatar>
              </AtBadge>
              <Text className='text'></Text>
              <AtBadge value=''>
                <AtAvatar size='small' circle text='空'></AtAvatar>
              </AtBadge>
              <Text className='text'></Text>
              <AtBadge value=''>
                <AtAvatar size='small' circle text='空'></AtAvatar>
              </AtBadge>
              <Text className='text'></Text>
            </View>
          </View>
        </View>
        <View className='game-answer'>
          <Input
            name='value'
            type='text'
            style={{ height: '100%' }}
            placeholder='输入您的答案'
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
      </View>
    );
  }
}

interface IGameProps {
  gameStore?: GameStore;
}

interface IGameState {
  isOpenClear: boolean;
  answer: string;
  penColor: string;
  penWidth: PenWidthType;
}