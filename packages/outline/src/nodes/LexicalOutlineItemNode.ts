import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
import {$isLexicalOutlineItemContentNode, LexicalOutlineItemContentNode} from "@/nodes/LexicalOutlineItemContentNode";
import {$isLexicalOutlineNode, LexicalOutlineNode} from "@/nodes/LexicalOutlineNode";
export type NodeId = string
export type SerializedLexicalOutlineItemNode = Spread<
  {
    id: NodeId
    collapsed: boolean
  },
  SerializedElementNode
>;
/**
 * outline
 * - outline-item
 *  - bullet-icon
 *  - outline-item-content
 *    - paragraph
 *    - outline
 *      - outline-item
 *        - bullet-icon
 *        - outline-item-content
 *          - paragraph
 * - outline-item
 *  - bullet-icon
 *  - outline-item-content
 *    - paragraph
 */
export class LexicalOutlineItemNode extends ElementNode {
  __id: NodeId;

  __selected = false;
  static __selectedClass = 'outline-item';

  __collapsed: boolean

  static getType(): string {
    return 'outline-item';
  }

  static clone(node: LexicalOutlineItemNode): LexicalOutlineItemNode {
    return new LexicalOutlineItemNode(node.__id, node.__collapsed, node.__key)
  }

  getId(): NodeId {
    return this.__id;
  }

  setCollapsed(collapsed: boolean): this {
    this.getWritable().__collapsed = collapsed
    return this
  }

  getCollapsed(): boolean {
    return this.getLatest().__collapsed
  }

  setSelected() {
    const self = this.getWritable();
    self.__selected = true;
  }

  setUnselected() {
    const self = this.getWritable();
    self.__selected = false;
  }

  constructor(id: NodeId, collapsed: boolean, key?: NodeKey) {
    super(key);
    this.__id = id;
    this.__collapsed = collapsed
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.setAttribute('data-node-id', this.getId());
    div.classList.add('editor-outline-item');
    return div;
  }

  updateDOM(prevNode: LexicalOutlineItemNode, _: HTMLElement, _config: EditorConfig): boolean {
    if (prevNode.__selected !== this.__selected)
      return true;

    return false;
  }

  static importJSON(serializedNode: SerializedLexicalOutlineItemNode): LexicalOutlineItemNode {
    const node = $createLexicalOutlineItemNode(serializedNode.id, serializedNode.collapsed);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedLexicalOutlineItemNode {
    return {
      ...super.exportJSON(),
      id: this.getId(),
      collapsed: this.getCollapsed(),
      type: 'outline-item',
    };
  }

  getOutlineItemContentNode(): LexicalOutlineItemContentNode | null {
    for (let child of this.getChildren()) {
      if ($isLexicalOutlineItemContentNode(child)) {
        return child
      }
    }
    return null
  }

  getChildOutlineNode(): LexicalOutlineNode | null {
    const children = this.getChildren()
    for (const child of children) {
      if ($isLexicalOutlineNode(child)) {
        return child
        }
    }
    return null
  }

  getChildrenOutlineItemNodes(): LexicalOutlineItemNode[] {
    const outlineNode = this.getChildOutlineNode()
    if (outlineNode === null) return []
    return outlineNode.getOutlineItemNodes()
  }
  /**
   * 包括自身
   * @param node
   */
  getSiblingsOutlineItemNodes(): LexicalOutlineItemNode[] {
    const parent = this.getParent()
    if (parent === null) return []
    const children = parent.getChildren()
    const result: LexicalOutlineItemNode[] = []
    for (const child of children) {
      if ($isLexicalOutlineItemNode(child)) {
        result.push(child)
      }
    }
    return result
  }
}

export function $createLexicalOutlineItemNode(id: NodeId, collapsed: boolean, key?: NodeKey): LexicalOutlineItemNode {
  return new LexicalOutlineItemNode(id, collapsed, key);
}

export function $isLexicalOutlineItemNode(
  node: LexicalNode | null | undefined,
): node is LexicalOutlineItemNode {
  return node instanceof LexicalOutlineItemNode;
}