import type {
  EditorConfig,
  LexicalEditor,
  LexicalNode,
  NodeKey, SerializedElementNode,
  Spread,
  TextNode,
} from 'lexical';
import {BulletIconNode} from "lexical-outline";

export type SerializedNewBulletIconNode = Spread<
  {
    type: 'bullet-icon'
  },
  SerializedElementNode
>;

export class NewBulletIconNode extends BulletIconNode {
  static getType(): string {
    return 'new-bullet-icon';
  }

  static clone(node: NewBulletIconNode): NewBulletIconNode {
    return new NewBulletIconNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key); // 调用父类构造函数
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.className = 'editor-outline-item-spot'; // 设置类名
    div.setAttribute('contenteditable', 'false'); // 设置不可编辑
    /**
     * <div class="Bullet-module_chevronContainer__G4LBL" data-node-chevron="true">
     *   <button type="button" class="Button-module_button__15yoI undefined Button-module_smaller__4MDg0 Button-module_unstyled__ptMHG CircularButton-module_button__jDSJO Bullet-module_hideChevron__5NJEI" data-intro-transition="true" aria-label="Collapse">
     *     <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg">
     *       <path d="M16.293 9.293 12 13.586 7.707 9.293l-1.414 1.414L12 16.414l5.707-5.707z"></path>
     *     </svg>
     *   </button>
     * </div>
     */
    const down = document.createElement('div')
    down.className = 'editor-outline-chevron-container'
    down.innerHTML = `<button type="button" class="bg-white">
       1111
     </button>`
    div.append(down)
    return div;
  }

  // 如果TextNode类有其他DOM更新逻辑，可能需要重写updateDOM方法
  updateDOM(prevNode: TextNode, dom: HTMLElement, _config: EditorConfig): boolean {
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
