import {
  $isLexicalOutlineItemContentNode,
  $isLexicalOutlineItemNode,
  $isLexicalOutlineNode,
  LexicalOutlineItemContentNode,
  LexicalOutlineItemNode,
  LexicalOutlineNode
} from "@/nodes";
import {$isRootNode, DecoratorNode, ElementNode, LexicalNode} from "lexical";
import {CANNOT_BACKSPACE_ERROR_CODE_3} from "@/util";

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
 * 多层级地选中上一个
 * @param outlineItemNode
 */
export function $getPreviousOutlineItem(outlineItemNode: LexicalOutlineItemNode): LexicalOutlineItemNode | null {
  const siblingsOutlineItem = outlineItemNode.getSiblingsOutlineItemNodes()
  const index = siblingsOutlineItem.indexOf(outlineItemNode)
  const previousOutlineItemNode = siblingsOutlineItem[index - 1]
  if (previousOutlineItemNode) {
    /**
     * 因为是要聚焦上个outlineItem，而它又是可能有子节点的，所以要调用这个来递归获取
     * - outline
     *   - outline-item
     *     - bullet-icon
     *     - outline-item-content
     *       - paragraph
     *       - outline
     *         - outline-item
     *           - outline-item-content
     *             - bullet-icon
     *             - paragraph
     *             - outline
     *               - outline-item
     *                 - outline-item-content
     *                   - bullet-icon
     *                   - paragraph                <-- need to select here
     *         - outline-item
     *           - bullet-icon
     *           - outline-item-content
     *             - paragraph                      <-- when backspace as first of this paragraph
     */
    return $getTheLastOutlineItemInOutlineItem(previousOutlineItemNode)
  } else {
    const outlineNode = $getParentOutline(outlineItemNode)
    if (!outlineNode) {
      console.warn("cannot find parent outline by node", outlineItemNode)
      return null
    }
    return $getParentOutlineItem(outlineNode)
  }
}

/**
 * 多层级地选中下一个
 * @param outlineItemNode
 */
export function $getNextOutlineItem(outlineItemNode: LexicalOutlineItemNode): LexicalOutlineItemNode | null {
  const siblingsOutlineItem = outlineItemNode.getSiblingsOutlineItemNodes()
  const index = siblingsOutlineItem.indexOf(outlineItemNode)
  const nextOutlineItemNode = siblingsOutlineItem[index + 1]
  if (nextOutlineItemNode) {
    return nextOutlineItemNode
  } else {
    const outlineNode = $getParentOutline(outlineItemNode)
    if (!outlineNode) {
      console.warn("cannot find parent outline by node", outlineItemNode)
      return null
    }
    const parentOutlineItem = $getParentOutlineItem(outlineNode)
    if (!parentOutlineItem) {
      console.warn("cannot find parent outline item by node", outlineItemNode)
      return null
    }
    return $getNextOutlineItem(parentOutlineItem)
  }

}

export function $getTheLastOutlineItemInOutlineItem(outlineItemNode: LexicalOutlineItemNode): LexicalOutlineItemNode {
  const childOutlineNode = outlineItemNode.getChildOutlineNode()
  if (!childOutlineNode) {
    return outlineItemNode
  }
  const lastChild = childOutlineNode.getLastChild()
  if ($isLexicalOutlineItemNode(lastChild)) {
    return $getTheLastOutlineItemInOutlineItem(lastChild)
  }
  return outlineItemNode
}

export function $getTheLastContentInOutlineItem(outlineItemNode: LexicalOutlineItemNode): ElementNode | DecoratorNode<unknown> | null {
  const lastOutlineItemNode = $getTheLastOutlineItemInOutlineItem(outlineItemNode)
  const outlineItemContentNode = lastOutlineItemNode.getOutlineItemContentNode()
  if (!outlineItemContentNode) {
    return null
  }
  /**
   * 现在outlineItemContentNode下第一个是bullet icon node
   * 第二个才是paragraph node之类的
   */
  return outlineItemContentNode.getTextElementNode()
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