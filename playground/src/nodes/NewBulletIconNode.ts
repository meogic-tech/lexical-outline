import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey,
  Spread,
  TextNode,
} from 'lexical';
import {BulletIconNode, SerializedBulletIconNode} from "lexical-outline";

export type SerializedNewBulletIconNode = Spread<
  {
  },
  SerializedBulletIconNode
>;

export class NewBulletIconNode extends BulletIconNode {
  static getType(): string {
    return 'new-bullet-icon';
  }

  static clone(node: NewBulletIconNode): NewBulletIconNode {
    return new NewBulletIconNode(node._rotated, node.__key)
  }

  constructor(_rotated: boolean, key?: NodeKey) {
    super(_rotated, key); // 调用父类构造函数
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.className = 'editor-outline-item-spot'; // 设置类名
    div.setAttribute('contenteditable', 'false'); // 设置不可编辑
    const down = document.createElement('div')
    down.className = 'editor-outline-chevron-container'
    const button = document.createElement('button')
    if (this._rotated) {
      button.style.rotate = '-90deg'
    }
    button.type = 'button'
    button.innerHTML = '<svg t="1705893423330" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4241" width="16" height="16"><path d="M736 480c-12.5-12.5-32.8-12.5-45.3 0L523.3 647.4c-6.2 6.2-16.4 6.2-22.6 0L333.3 480c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L466.7 704c25 25 65.5 25 90.5 0L736 525.3c12.5-12.5 12.5-32.8 0-45.3z" p-id="4242"></path></svg>'
    down.append(button)
    div.append(down)
    return div;
  }

  // 如果TextNode类有其他DOM更新逻辑，可能需要重写updateDOM方法
  updateDOM(prevNode: BulletIconNode, dom: HTMLElement, _config: EditorConfig): boolean {
    if (this._rotated !== prevNode._rotated) {
      const button = dom.querySelector('button')
      if (!button) {
        return false
      }
      if (this._rotated) {
        button.style.rotate = '-90deg'
      } else {
        button.style.rotate = 'unset'
      }
      return true;
    }
    return false;
  }

  static importJSON(serializedNode: SerializedNewBulletIconNode): NewBulletIconNode {
    return $createNewBulletIconNode();
  }

  exportJSON(): SerializedNewBulletIconNode {
    return {
      ...super.exportJSON(),
      type: 'bullet-icon',
    };
  }

  isToken(): boolean {
    return true;
  }

  getTextContent(): string {
    return '';
  }
}

// 如果TextNode类有对应的工厂函数，也应该实现NewBulletIconNode的工厂函数
export function $createNewBulletIconNode(key?: NodeKey): NewBulletIconNode {
  return new NewBulletIconNode(key);
}

export function $isNewBulletIconNode(
  node: LexicalNode | null | undefined,
): node is NewBulletIconNode {
  return node instanceof NewBulletIconNode;
}
