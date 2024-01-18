import {$isOutlineItemNode, $isOutlineNode, OutlineItemNode, OutlineNode} from "@/nodes";
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