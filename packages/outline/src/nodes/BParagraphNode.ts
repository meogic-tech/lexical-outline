import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
import {NodeId} from "@/nodes/index";

export type SerializedMNode = Spread<
  {
    id: NodeId
    textContent: string
  },
  SerializedElementNode
>;

export class BParagraphNode extends ElementNode {
  __id: NodeId;

  __selected = false;
  static __selectedClass = 'meo-Outline-item';

  static getType(): string {
    return 'outline';
  }

  static clone(node: BParagraphNode): BParagraphNode {
    return new BParagraphNode(node.__id, node.__key)
  }

  getId(): NodeId {
    return this.__id;
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

  createDOM(_config: EditorConfig, _editor: LexicalEditor): HTMLElement {
    const div = document.createElement('div');
    div.classList.add('editor-outline-item');
    // div.addEventListener('click', (event) => {
    //   console.log("click event", event);
    // })
    return div;
  }

  updateDOM(prevNode: BParagraphNode, _: HTMLElement, _config: EditorConfig): boolean {
    if (prevNode.__selected !== this.__selected)
      return true;

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
      textContent: ''
    };
  }
}

export function $createBParagraphNode(id: NodeId, key?: NodeKey): BParagraphNode {
  return new BParagraphNode(id, key);
}

export function $isMNode(
  node: LexicalNode | null | undefined,
): node is BParagraphNode {
  return node instanceof BParagraphNode;
}