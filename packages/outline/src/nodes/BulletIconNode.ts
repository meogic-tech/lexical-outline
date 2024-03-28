import {
  EditorConfig, ElementNode,
  LexicalEditor,
  LexicalNode,
  NodeKey, SerializedElementNode,
  SerializedTextNode,
  Spread,
  TextNode
} from "lexical";


export type SerializedBulletIconNode = Spread<
  {
    type: 'bullet-icon'
  },
  SerializedElementNode
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
    down.innerHTML = `<button type="button">
       <svg t="1705893423330" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="4241" width="16" height="16"><path d="M736 480c-12.5-12.5-32.8-12.5-45.3 0L523.3 647.4c-6.2 6.2-16.4 6.2-22.6 0L333.3 480c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L466.7 704c25 25 65.5 25 90.5 0L736 525.3c12.5-12.5 12.5-32.8 0-45.3z" p-id="4242"></path></svg>
     </button>`
    div.append(down)
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

// 如果TextNode类有对应的工厂函数，也应该实现BulletIconNode的工厂函数
export function $createBulletIconNode(key?: NodeKey): BulletIconNode {
  return new BulletIconNode(key);
}



export function $isBulletIconNode(
  node: LexicalNode | null | undefined,
): node is BulletIconNode {
  return node instanceof BulletIconNode;
}