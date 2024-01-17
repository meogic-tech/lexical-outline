import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
type NodeId = string
export type SerializedOutlineItemContentNode = Spread<
  {
  },
  SerializedElementNode
>;

export class OutlineItemContentNode extends ElementNode {

  static getType(): string {
    return 'outline-item-content';
  }

  static clone(node: OutlineItemContentNode): OutlineItemContentNode {
    return new OutlineItemContentNode(node.__key)
  }

  constructor(key?: NodeKey) {
    super(key);
  }

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('editor-outline-item-content');
    return div;
  }

  updateDOM(prevNode: OutlineItemContentNode, _: HTMLElement, _config: EditorConfig): boolean {
    return false;
  }

  static importJSON(serializedNode: SerializedOutlineItemContentNode): OutlineItemContentNode {
    return $createOutlineItemContentNode();
  }

  exportJSON(): SerializedOutlineItemContentNode {
    return {
      ...super.exportJSON(),
    };
  }
}

export function $createOutlineItemContentNode(key?: NodeKey): OutlineItemContentNode {
  return new OutlineItemContentNode(key);
}

export function $isOutlineItemContentNode(
  node: LexicalNode | null | undefined,
): node is OutlineItemContentNode {
  return node instanceof OutlineItemContentNode;
}