import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
import {$getParentOutline, $getParentOutlineItem} from "@/table-util";
type NodeId = string
export type SerializedOutlineNode = Spread<
  {
    display: boolean
  },
  SerializedElementNode
>;

export class OutlineNode extends ElementNode {

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

  static clone(node: OutlineNode): OutlineNode {
    return new OutlineNode(node._display, node.__key)
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
    }
    return div;
  }

  updateDOM(prevNode: OutlineNode, dom: HTMLElement, _config: EditorConfig): boolean {
    if (this._display !== prevNode._display) {
      if (this._display) {
        dom.style.maxHeight = ''
        dom.style.opacity = ''
      } else {
        dom.style.maxHeight = '0'
        dom.style.opacity = '0'
      }
      return true;
    }
    return false;
  }

  static importJSON(serializedNode: SerializedOutlineNode): OutlineNode {
    return $createOutlineNode(serializedNode.display);
  }

  exportJSON(): SerializedOutlineNode {
    return {
      display: this._display,
      ...super.exportJSON(),
    };
  }
}

export function $createOutlineNode(display: boolean, key?: NodeKey): OutlineNode {
  return new OutlineNode(display, key);
}

export function $isOutlineNode(
  node: LexicalNode | null | undefined,
): node is OutlineNode {
  return node instanceof OutlineNode;
}