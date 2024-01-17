import {
  EditorConfig, ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  SerializedTextNode,
  Spread,
  TextNode
} from "lexical";


export type SerializedBulletIconNode = Spread<
  {
  },
  SerializedTextNode
>;

export class BulletIconNode extends ElementNode {

  static getType(): string {
    return 'bullet-icon';
  }

  static clone(node: BulletIconNode): BulletIconNode {
    return new BulletIconNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key); // 调用父类构造函数
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.className = 'editor-outline-item-spot'; // 设置类名
    div.setAttribute('contenteditable', 'false'); // 设置不可编辑
    return div;
  }

  // 如果TextNode类有其他DOM更新逻辑，可能需要重写updateDOM方法
  updateDOM(prevNode: TextNode, dom: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedBulletIconNode): BulletIconNode {
    return $createBulletIconNode();
  }

  exportJSON(): SerializedBulletIconNode {
    return {
      ...super.exportJSON(),
    };
  }

  isToken(): boolean {
    return true;
  }

  getTextContent(): string {
    return '';
  }
}

// 如果TextNode类有对应的工厂函数，也应该实现BulletIconNode的工厂函数
export function $createBulletIconNode(key?: NodeKey): BulletIconNode {
  return new BulletIconNode(key);
}



export function $isBulletIconNode(
  node: LexicalNode | null | undefined,
): node is BulletIconNode {
  return node instanceof BulletIconNode;
}