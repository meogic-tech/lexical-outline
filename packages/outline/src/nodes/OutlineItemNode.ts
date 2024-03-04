import {EditorConfig, ElementNode, LexicalEditor, LexicalNode, NodeKey, SerializedElementNode, Spread} from "lexical";
import {$isOutlineItemContentNode, OutlineItemContentNode} from "@/nodes/OutlineItemContentNode";
type NodeId = string
export type SerializedOutlineItemNode = Spread<
  {
    id: NodeId
    collapsed: boolean
  },
  SerializedElementNode
>;

export class OutlineItemNode extends ElementNode {
  __id: NodeId;

  __selected = false;
  static __selectedClass = 'outline-item';

  __collapsed: boolean

  static getType(): string {
    return 'outline-item';
  }

  static clone(node: OutlineItemNode): OutlineItemNode {
    return new OutlineItemNode(node.__id, node.__collapsed, node.__key)
  }

  getId(): NodeId {
    return this.__id;
  }

  setCollapsed(collapsed: boolean): this {
    this.getWritable().__collapsed = collapsed
    return this
  }

  getCollapse(): boolean {
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
    div.classList.add('editor-outline-item');
    return div;
  }

  updateDOM(prevNode: OutlineItemNode, _: HTMLElement, _config: EditorConfig): boolean {
    if (prevNode.__selected !== this.__selected)
      return true;

    return false;
  }

  static importJSON(serializedNode: SerializedOutlineItemNode): OutlineItemNode {
    const node = $createOutlineItemNode(serializedNode.id, serializedNode.collapsed);
    node.setFormat(serializedNode.format);
    node.setIndent(serializedNode.indent);
    node.setDirection(serializedNode.direction);
    return node;
  }

  exportJSON(): SerializedOutlineItemNode {
    return {
      ...super.exportJSON(),
      id: this.getId(),
      collapsed: this.getCollapse(),
      textContent: ''
    };
  }

  getOutlineItemContentNode(): OutlineItemContentNode {
    for (let child of this.getChildren()) {
      if ($isOutlineItemContentNode(child)) {
        return child
      }
    }
    throw new Error('OutlineItemNode has no OutlineItemContentNode child', this)
  }
}

export function $createOutlineItemNode(id: NodeId, collapsed: boolean, key?: NodeKey): OutlineItemNode {
  return new OutlineItemNode(id, collapsed, key);
}

export function $isOutlineItemNode(
  node: LexicalNode | null | undefined,
): node is OutlineItemNode {
  return node instanceof OutlineItemNode;
}