import {
  _decorator,
  AudioClip,
  AudioSource,
  Button,
  Collider2D,
  Component,
  Contact2DType,
  director,
  instantiate,
  IPhysics2DContact,
  Label,
  log,
  Node,
  Prefab,
  RichText,
  UITransform,
  v2,
  v3,
  Vec2,
  Vec3
} from 'cc'
import { Joystick } from './Joystick'
const { ccclass, property } = _decorator

@ccclass('head')
export class head extends Component {
  @property(Prefab)
  public bodyPrefab: Prefab = null!
  @property(Prefab)
  public foodPrefab: Prefab = null!
  @property(Node)
  public parentNode: Node = null!
  // @property(Node)
  public array: Node[] = []
  // 方向
  public snakeDir: Vec3 = null
  public snakeDirOld: Vec3 = null
  @property(Node)
  public joystick: Node = null!
  // 速度
  public speed: number = 3
  // 得分
  public score: number = 0
  // UI
  @property(Label)
  public uiScore: Label = null!
  @property(Button)
  public uiButton: Button = null!
  @property(AudioClip)
  public eatSound: AudioClip = null!

  protected onLoad(): void {
    this.node.setPosition(this.randomPosition()) // 设置初始位置
    this.array.push(this.node)
    // 初始角度
    this.node.angle = 90 - (v2(0, 0).signAngle(v2(this.node.position.x, this.node.position.y)) * 180) / Math.PI
    // 初始方向 和角度一样
    this.snakeDirOld = this.node.position.clone().normalize()
  }

  onBeginContact(selfCollider: Collider2D, other: Collider2D, contact: IPhysics2DContact | null) {
    if (other.group === 4) {
      other.node.destroy() // 碰到食物，销毁
      for (let i = 0; i < 5; i++) {
        this.getNewBody()
      }
      this.getNewFood()
      this.score++
      this.eatSound.play()
    }
  }

  start() {
    let collider = this.node.getComponent(Collider2D)
    collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this)
    this.getOneBody()
    this.getNewFood()
    //循环20次
    for (let i = 0; i < 20; i++) {
      this.getNewBody()
    }
    this.uiButton.node.on(Button.EventType.CLICK, () => {
      //开始游戏
      if (director.isPaused()) {
        director.resume()
      }
      this.uiButton.node.active = false
    })
    director.pause() // 暂停游戏
  }

  update(deltaTime: number) {
    // 遥感方向
    this.snakeDir = this.joystick.getComponent(Joystick).dir.normalize()
    if (this.snakeDir.length() === 0) {
      // 方向为空时，保持当前角度
      this.snakeDir = this.snakeDirOld.clone().normalize()
    } else {
      // 方向不为空时，记录到old
      this.snakeDirOld = this.snakeDir.clone().normalize()
    }
    // 沿着snakeDir移动
    let headPos = this.node.position.clone()
    this.node.position = this.node.position.clone().add(this.snakeDir.multiplyScalar(this.speed)) // 移动10个单位
    this.node.angle = this.calculateAngle() - 90 // 修正角度
    // 将arrag倒数第一个插入到第二个位置
    this.array.splice(1, 0, this.array.pop())
    this.array[1].setPosition(headPos)
    this.sort()
    this.isWall()
    this.uiScore.string = this.score.toString()
  }
  //排序
  sort() {
    //将node层级提到最前
    this.node.setSiblingIndex(this.parentNode.children.length - 1)
    this.array.forEach((node, index) => {
      node.setSiblingIndex(this.parentNode.children.length - index - 1)
    })
  }

  // 边界检测
  isWall() {
    let x = this.node.position.x
    let y = this.node.position.y
    if (x > 566 || x < -566) {
      this.node.position = v3(-x, y, 0)
    }
    if (y > 293 || y < -293) {
      this.node.position = v3(x, -y, 0)
    }
  }

  // 随机位置
  randomPosition() {
    // 生成 -560~560 之间的随机位置
    let x = Math.floor(Math.random() * 1000) - 500
    let y = Math.floor(Math.random() * 500) - 250
    return v3(x, y, 0)
  }
  // 计算角度
  public calculateAngle() {
    let angleRad = Math.atan2(this.snakeDir.y, this.snakeDir.x)
    // 将弧度转换为角度（以度数表示）
    let roleAngle = (angleRad * 180) / Math.PI
    return roleAngle
  }

  // 获得一个身体节点
  public getOneBody() {
    let body = instantiate(this.bodyPrefab)
    this.parentNode.addChild(body)
    let dir = this.node.position.clone().normalize()
    body.setPosition(this.node.position.clone().subtract(dir.multiplyScalar(this.speed)))
    this.array.push(body)
    return body
  }

  // 获得一个身体节点
  public getNewBody() {
    let body = instantiate(this.bodyPrefab)
    this.parentNode.addChild(body)
    let lastBody = this.array[this.array.length - 1]
    let second = this.array[this.array.length - 2]
    // 倒数第二减去倒数第一得到方向向量
    let dir = second.position.clone().subtract(lastBody.position).normalize()
    // 后退45单位生成新节点
    body.position = lastBody.position.clone().subtract(dir.multiplyScalar(this.speed))
    this.array.push(body)
    return body
  }
  // 获得一个食物节点
  public getNewFood() {
    this.parentNode.addChild(instantiate(this.foodPrefab)) // 实例化食物
  }
}
