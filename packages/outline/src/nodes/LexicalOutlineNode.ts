import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
import {$getParentOutline, $getParentOutlineItem} from "@/outline-util";
import {$isLexicalOutlineItemNode, LexicalOutlineItemNode} from "@/nodes/LexicalOutlineItemNode";
type NodeId = string
export type SerializedLexicalOutlineNode = Spread<
  {
    display: boolean
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
export class LexicalOutlineNode extends ElementNode {

  _display: boolean

  setDisplay(display: boolean): this {
    this.getWritable()._display = display
    return this
  }

  getDisplay(): boolean {
    return this.getLatest()._display
  }

  static getType(): string {
    return 'outline';
  }

  static clone(node: LexicalOutlineNode): LexicalOutlineNode {
    return new LexicalOutlineNode(node._display, node.__key)
  }

  constructor(display: boolean, key?: NodeKey) {
    super(key);
    this._display = display
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('editor-outline');
    if (!this._display) {
      div.style.maxHeight = '0'
      div.style.opacity = '0'
      div.setAttribute('contenteditable', 'false')
    }
    return div;
  }

  updateDOM(prevNode: LexicalOutlineNode, dom: HTMLElement, _config: EditorConfig): boolean {
    if (this._display !== prevNode._display) {
      if (this._display) {
        dom.style.maxHeight = ''
        dom.style.opacity = ''
        dom.removeAttribute('contenteditable')
      } else {
        dom.style.maxHeight = '0'
        dom.style.opacity = '0'
        dom.setAttribute('contenteditable', 'false')
      }
      return true;
    }
    return false;
  }

  static importJSON(serializedNode: SerializedLexicalOutlineNode): LexicalOutlineNode {
    return $createLexicalOutlineNode(serializedNode.display);
  }

  exportJSON(): SerializedLexicalOutlineNode {
    return {
      ...super.exportJSON(),
      display: this._display,
      type: 'outline',
    };
  }

  getOutlineItemNodes(): LexicalOutlineItemNode[] {
    const children = this.getChildren()
    const result: LexicalOutlineItemNode[] = []
    for (const child of children) {
      if ($isLexicalOutlineItemNode(child)) {
        result.push(child)
      }
    }
    return result
  }

  /**
   *  root
   *   └ (71) outline
   * @param node
   */
  getRootOutlineNode(): LexicalOutlineNode {
    const parent = $getParentOutline(this)
    if (parent === null) return this
    return parent.getRootOutlineNode()
  }
}

export function $createLexicalOutlineNode(display: boolean, key?: NodeKey): LexicalOutlineNode {
  return new LexicalOutlineNode(display, key);
}

export function $isLexicalOutlineNode(
  node: LexicalNode | null | undefined,
): node is LexicalOutlineNode {
  return node instanceof LexicalOutlineNode;
}