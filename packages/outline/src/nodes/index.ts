import type { EditorConfig, LexicalNode, NodeKey, SerializedElementNode, Spread } from 'lexical';
import { ElementNode } from 'lexical';
export type NodeId = string

export type SerializedMNode = Spread<
  {
    id: NodeId
    textContent: string
  },
  SerializedElementNode
>;

export class BParagraphNode extends ElementNode {
  __id: NodeId

  __selected = false
  static __selectedClass = 'meo-outine-item'

  static getType(): string {
    return 'm-outline';
  }

  getId(): NodeId {
    return this.__id
  }

  setSelected() {
    const self = this.getWritable();
    self.__selected = true;
  }

  setUnselected() {
    const self = this.getWritable();
    self.__selected = false;
  }

  constructor(id: NodeId, key?: NodeKey) {
    super(key);
    this.__id = id;
  }

  updateDOM(prevNode: BParagraphNode, _: HTMLElement, _config: EditorConfig): boolean {
    if (prevNode.__selected !== this.__selected)
      return true

    return false;
  }

  static importJSON(serializedNode: SerializedMNode): BParagraphNode {
    const node = $createBParagraphNode(serializedNode.id);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedMNode {
    return {
      ...super.exportJSON(),
      id: this.getId(),
      textContent: '',
    };
  }
}

export function $createBParagraphNode(id: NodeId, key?: NodeKey): BParagraphNode {
  return new BParagraphNode(id, key)
}

export function $isMNode(
  node: LexicalNode | null | undefined,
): node is BParagraphNode {
  return node instanceof BParagraphNode;
}
