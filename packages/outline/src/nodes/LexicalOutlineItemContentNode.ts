import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
type NodeId = string
export type SerializedLexicalOutlineItemContentNode = Spread<
  {
  },
  SerializedElementNode
>;

export class LexicalOutlineItemContentNode extends ElementNode {

  static getType(): string {
    return 'outline-item-content';
  }

  static clone(node: LexicalOutlineItemContentNode): LexicalOutlineItemContentNode {
    return new LexicalOutlineItemContentNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('editor-outline-item-content');
    return div;
  }

  updateDOM(prevNode: LexicalOutlineItemContentNode, _: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedLexicalOutlineItemContentNode): LexicalOutlineItemContentNode {
    return $createLexicalOutlineItemContentNode();
  }

  exportJSON(): SerializedLexicalOutlineItemContentNode {
    return {
      ...super.exportJSON(),
      type: 'outline-item-content',
    };
  }

  /**
   * 获取用于显示的文本节点
   */
  getTextElementNode(): ElementNode | null {
    return this.getChildAtIndex(1) as ElementNode | null
  }

  /**
   * 加上这个才能成功触发markdown的快捷方式
   */
  isShadowRoot(): boolean {
    return true
  }
}

export function $createLexicalOutlineItemContentNode(key?: NodeKey): LexicalOutlineItemContentNode {
  return new LexicalOutlineItemContentNode(key);
}

export function $isLexicalOutlineItemContentNode(
  node: LexicalNode | null | undefined,
): node is LexicalOutlineItemContentNode {
  return node instanceof LexicalOutlineItemContentNode;
}