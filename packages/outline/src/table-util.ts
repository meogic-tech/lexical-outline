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

export function $getOutlineItem(node: OutlineNode): OutlineItemNode | null {
  const children = node.getChildren();
  for (const child of children) {
    if ($isOutlineItemNode(child)) return child;
  }
  return null;
}

export function $getOutlineItemContent(node: OutlineItemNode): OutlineItemContentNode | null {
  const children = node.getChildren();
  for (const child of children) {
    if ($isOutlineItemContentNode(child)) return child;
  }
  return null;
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
export function $getChildOutline(node: OutlineItemNode): OutlineNode | null {
  const outlineItemContent = $getOutlineItemContent(node);
  if (outlineItemContent === null) return null;
  const children = outlineItemContent.getChildren();
  for (const child of children) {
    if ($isOutlineNode(child)) return child;
  }
  return null;
}

export function $getChildOutlines(node: OutlineItemNode): OutlineNode[] {
  const outlineItemContent = $getOutlineItemContent(node);
  const result: OutlineNode[] = [];
  if (outlineItemContent === null) return result;
  const children = outlineItemContent.getChildren();
  for (const child of children) {
    if ($isOutlineNode(child)) {
      result.push(child);
    }
  }
  return result;
}

export function $getChildOutlinesByOutlineNode(node: OutlineNode): OutlineNode[] {
  const outlineItem = $getOutlineItem(node)
  if (outlineItem) {
    return $getChildOutlines(outlineItem)
  }
  return [];
}