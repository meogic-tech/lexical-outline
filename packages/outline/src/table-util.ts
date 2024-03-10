import {
  $isOutlineItemContentNode,
  $isOutlineItemNode,
  $isOutlineNode,
  OutlineItemContentNode,
  OutlineItemNode,
  OutlineNode
} from "@/nodes";
import {$isRootNode, LexicalNode} from "lexical";

export function $getParentOutline(node: LexicalNode): OutlineNode | null {
  const parent = node.getParent();
  if (parent === null || $isRootNode(parent)) return null;
  if ($isOutlineNode(parent)) return parent;
  return $getParentOutline(parent);
}

export function $getParentOutlineItem(node: LexicalNode): OutlineItemNode | null {
  const parent = node.getParent();
  if (parent === null || $isRootNode(parent)) return null;
  if ($isOutlineItemNode(parent)) return parent;
  return $getParentOutlineItem(parent);
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