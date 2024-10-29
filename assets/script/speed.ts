import { _decorator, Component, Node, NodeEventType } from 'cc'
import { head } from './head'
import { EventTouch } from 'cc'
const { ccclass, property } = _decorator

@ccclass('speed')
export class speed extends Component {
  @property(Node)
  snakes: Node = null
  @property(Node)
  button: Node = null
  // 原速度
  speed: number = 0

  start() {}

  update(deltaTime: number) {}
  onLoad() {
    this.speed = this.snakes.getComponent(head).speed
    this.button.on(NodeEventType.TOUCH_START, this.onTouchStart, this)
    this.button.on(NodeEventType.TOUCH_END, this.onTouchEnd, this)
  }

  /** 触摸移动 */
  private onTouchStart(event: EventTouch) {
    this.snakes.getComponent(head).speed = this.speed * 2
  }

  /** 触摸结束 */
  private onTouchEnd(event: NodeEventType) {
    this.snakes.getComponent(head).speed = this.speed
  }
}
