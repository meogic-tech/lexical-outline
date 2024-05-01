import {
  $isLexicalOutlineItemContentNode,
  $isLexicalOutlineItemNode,
  $isLexicalOutlineNode,
  LexicalOutlineItemContentNode,
  LexicalOutlineItemNode,
  LexicalOutlineNode
} from "@/nodes";
import {$isRootNode, LexicalNode} from "lexical";

export function $getParentOutline(node: LexicalNode): LexicalOutlineNode | null {
  const parent = node.getParent();
  if (parent === null || $isRootNode(parent)) return null;
  if ($isLexicalOutlineNode(parent)) return parent;
  return $getParentOutline(parent);
}

export function $getParentOutlineItem(node: LexicalNode): LexicalOutlineItemNode | null {
  const parent = node.getParent();
  if (parent === null || $isRootNode(parent)) return null;
  if ($isLexicalOutlineItemNode(parent)) return parent;
  return $getParentOutlineItem(parent);
}

export function $getOffsetInParent(node: LexicalNode, currentOffset: number): number {
  const parent = node.getParent();
  if (parent === null || $isRootNode(parent)) return currentOffset;
  let result = 0
  for (let child of parent.getChildren()) {
    if (child === node) {
        return result + currentOffset;
    }
    result += child.getTextContentSize();
  }
  return result;
}


/**
 * (1) outline
 *     ├ (2) outline-item
 *     | ├ (3) bullet-icon
 *     | └ (4) outline-item-content
 *     |   ├ (5) heading
 *     |   | └ (6) text  "Welcome to the playground"
 *     |   ├ (15) outline
 * @param node
 */