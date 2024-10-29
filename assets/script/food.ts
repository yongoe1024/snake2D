import { _decorator, Component, Node, UITransform, v3 } from 'cc'
const { ccclass, property } = _decorator

@ccclass('food')
export class food extends Component {
  start() {
    this.node.setPosition(this.randomPosition())
  }

  update(deltaTime: number) {}

  // 随机位置
  randomPosition() {
    // 生成 -560~560 之间的随机位置
    let x = Math.floor(Math.random() * 1000) - 500
    let y = Math.floor(Math.random() * 500) - 250
    return v3(x, y, 0)
  }
}
