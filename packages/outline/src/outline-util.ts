import {
  $createLexicalBulletIconNode,
  $createLexicalOutlineItemContentNode,
  $createLexicalOutlineItemNode,
  $isLexicalOutlineItemContentNode,
  $isLexicalOutlineItemNode,
  $isLexicalOutlineNode,
  LexicalOutlineItemContentNode,
  LexicalOutlineItemNode,
  LexicalOutlineNode
} from "@/nodes";
import {
  $isRangeSelection,
  $isRootNode,
  $isTextNode,
  BaseSelection,
  DecoratorNode,
  ElementNode,
  LexicalNode, ParagraphNode,
  TextNode
} from "lexical";
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
  // 先自己这个层级
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
    if (previousOutlineItemNode.getCollapsed()) {
      // 如果自己折叠了，那么就不需要找自己的子节点了
      return previousOutlineItemNode
    }
    return $getTheLastOutlineItemInOutlineItem(previousOutlineItemNode)
  } else {
    // 说明自己已经是第一个，那么直接返回上一层级
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
 * @param containerChildren 是否选中自己的子节点
 */
export function $getNextOutlineItem(outlineItemNode: LexicalOutlineItemNode, containerChildren: boolean = true): LexicalOutlineItemNode | null {
  // 包含要搜索子节点，而且自己没有折叠
  if (containerChildren && !outlineItemNode.getCollapsed())  {
    // 先找自己的子层级的第一个
    const childOutlineNode = outlineItemNode.getChildOutlineNode()
    if (childOutlineNode) {
      const firstChild = childOutlineNode.getOutlineItemNodes()[0]
      if ($isLexicalOutlineItemNode(firstChild)) {
        return firstChild
      }
    }
  }
  const siblingsOutlineItem = outlineItemNode.getSiblingsOutlineItemNodes()
  const index = siblingsOutlineItem.indexOf(outlineItemNode)
  // 自己当前这一层级
  const nextOutlineItemNode = siblingsOutlineItem[index + 1]
  if (nextOutlineItemNode) {
    return nextOutlineItemNode
  } else {
    // 没有找到的话则返回上一层级的下一个
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
    return $getNextOutlineItem(parentOutlineItem, false)
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


export function $addNewOutlineItemNode(
  selection: BaseSelection,
  anchor: DecoratorNode<unknown> | ElementNode | TextNode,
  createParagraphNode: () => ElementNode,
  getNewOutlineItemId: () => string,
) {
  const newParagraphNode = createParagraphNode()
  const parentOutlineItemNode = $getParentOutlineItem(anchor)
  if (parentOutlineItemNode === null) {
    console.warn('cannot find parent outline item node', anchor)
    return false
  }
  if ($isTextNode(anchor) && $isRangeSelection(selection)) {
    const anchorOffset = selection.anchor.offset
    let nodesToMove: LexicalNode[] = [];
    nodesToMove = anchor.getNextSiblings().reverse();
    const textContentLength = anchor.getTextContentSize();
    if (anchorOffset === 0) {
      nodesToMove.push(anchor);
    } else if (anchorOffset !== textContentLength) {
      const [, splitNode] = anchor.splitText(anchorOffset);
      nodesToMove.push(splitNode);
    }
    for (let i = nodesToMove.length - 1; i >= 0; i--) {
      newParagraphNode.append(nodesToMove[i]);
    }
  }
  const outlineItemNode = $createLexicalOutlineItemNode(getNewOutlineItemId(), false)
  outlineItemNode
    .append($createLexicalOutlineItemContentNode()
      .append($createLexicalBulletIconNode(false))
      .append(newParagraphNode))
  const childOutline = parentOutlineItemNode.getChildOutlineNode()
  if (childOutline && !parentOutlineItemNode.getCollapsed()) {
    childOutline.splice(0, 0, [outlineItemNode])
  } else {
    parentOutlineItemNode.insertAfter(outlineItemNode)
  }
  newParagraphNode.select(0, 0)
}