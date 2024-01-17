import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
type NodeId = string
export type SerializedOutlineNode = Spread<
  {
  },
  SerializedElementNode
>;

export class OutlineNode extends ElementNode {

  static getType(): string {
    return 'outline';
  }

  static clone(node: OutlineNode): OutlineNode {
    return new OutlineNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('editor-outline');
    return div;
  }

  updateDOM(prevNode: OutlineNode, _: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedOutlineNode): OutlineNode {
    return $createOutlineNode();
  }

  exportJSON(): SerializedOutlineNode {
    return {
      ...super.exportJSON(),
    };
  }
}

export function $createOutlineNode(key?: NodeKey): OutlineNode {
  return new OutlineNode(key);
}

export function $isOutlineNode(
  node: LexicalNode | null | undefined,
): node is OutlineNode {
  return node instanceof OutlineNode;
}