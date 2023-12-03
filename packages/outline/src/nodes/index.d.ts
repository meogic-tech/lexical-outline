import type { EditorConfig, LexicalNode, NodeKey, SerializedElementNode, Spread } from 'lexical';
import { ElementNode } from 'lexical';
export type NodeId = string;
export type SerializedMNode = Spread<{
    id: NodeId;
    textContent: string;
}, SerializedElementNode>;
export declare class BParagraphNode extends ElementNode {
    __id: NodeId;
    __selected: boolean;
    static __selectedClass: string;
    static getType(): string;
    getId(): NodeId;
    setSelected(): void;
    setUnselected(): void;
    constructor(id: NodeId, key?: NodeKey);
    updateDOM(prevNode: BParagraphNode, _: HTMLElement, _config: EditorConfig): boolean;
    static importJSON(serializedNode: SerializedMNode): BParagraphNode;
    exportJSON(): SerializedMNode;
}
export declare function $createBParagraphNode(id: NodeId, key?: NodeKey): BParagraphNode;
export declare function $isMNode(node: LexicalNode | null | undefined): node is BParagraphNode;
