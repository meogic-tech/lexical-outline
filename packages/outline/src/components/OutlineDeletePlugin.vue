<script lang="ts" setup>
import {onMounted, onUnmounted} from "vue";
import {useEditor} from "lexical-vue";
import {
  $getSelection, $isElementNode,
  $isRangeSelection, $isTextNode, COMMAND_PRIORITY_HIGH, KEY_DELETE_COMMAND
} from "lexical";
import {
  $getOffsetInParent, $getParentOutline,
  $getParentOutlineItem, $getNextOutlineItem, $getPreviousOutlineItem,
} from "@/outline-util";
import {
  CANNOT_DELETE_ERROR_CODE_1,
  CANNOT_DELETE_ERROR_CODE_2,
  CANNOT_DELETE_ERROR_CODE_3,
  CannotBackspaceErrorCodeType,
  CannotDeleteErrorCodeType,
} from "@/util";
import {LexicalOutlineItemNode} from "@/nodes";

const editor = useEditor()
let unregisterListener: () => void

const emit = defineEmits<{
  (event: 'cannotDelete', relativeHTMLElement: HTMLElement | null, errorCode: CannotDeleteErrorCodeType): void;
}>();

function $appendOtherOutlineItem(
    event: KeyboardEvent,
    outlineItemNode: LexicalOutlineItemNode,
    otherOutlineItemNode: LexicalOutlineItemNode
): boolean {
  const childOutlineNode = otherOutlineItemNode.getChildOutlineNode()
  if (childOutlineNode) {
    // 第一个弟弟节点有子节点的时候，不能DELETE
    console.debug("cannot delete because it is the first sibling outline item in outline node and it has child outline items");
    event.preventDefault()
    emit('cannotDelete', editor.getElementByKey(outlineItemNode.getKey()), CANNOT_DELETE_ERROR_CODE_2)
    return true
  }
  // 如果有弟弟节点，且它没有子节点，那么应该把它的所有children追加到当前节点的末尾
  const otherOutlineItemNodeContentElementNode = otherOutlineItemNode.getOutlineItemContentNode()?.getTextElementNode()
  const currentOutlineItemContentElementNode = outlineItemNode.getOutlineItemContentNode()?.getTextElementNode()
  if ($isElementNode(otherOutlineItemNodeContentElementNode) && $isElementNode(currentOutlineItemContentElementNode)) {
    currentOutlineItemContentElementNode.append(...otherOutlineItemNodeContentElementNode.getChildren())
  } else {
    console.debug("otherOutlineItemNodeContentElementNode or currentOutlineItemContentElementNode is not ElementNode");
  }
  const parentOutline = $getParentOutline(otherOutlineItemNode)
  parentOutline?.getChildrenSize() === 1 && parentOutline.remove()
  otherOutlineItemNode.remove()
  event.preventDefault()
  return true
}

function $appendSiblingOutlineItem(
    event: KeyboardEvent,
    outlineItemNode: LexicalOutlineItemNode,
    siblingsOutlineItem: LexicalOutlineItemNode[]
): boolean {
  const index = siblingsOutlineItem.indexOf(outlineItemNode)
  // 第一个弟弟节点
  const nextSiblingOutlineItem = siblingsOutlineItem[index + 1]
  if (nextSiblingOutlineItem) {
    $appendOtherOutlineItem(event, outlineItemNode, nextSiblingOutlineItem)
    return true
  }
  return false
}

function $appendFirstChildOutlineItem(
    event: KeyboardEvent,
    outlineItemNode: LexicalOutlineItemNode,
    childrenOutlineItem: LexicalOutlineItemNode[]
): boolean {
  // 第一个弟弟节点
  const firstChildOutlineItem = childrenOutlineItem[0]
  if (firstChildOutlineItem) {
    $appendOtherOutlineItem(event, outlineItemNode, firstChildOutlineItem)
    return true
  }
  return false
}

onMounted(() => {
  /**
   * 1. 没有弟弟节点也没有子节点的时候，不能DELETE
   * 2. 第一个弟弟节点有子节点的时候，不能DELETE
   * 3. 第一个子节点有它的子节点的时候，不能DELETE
   */
  unregisterListener = editor.registerCommand(KEY_DELETE_COMMAND, (event: KeyboardEvent, editor) => {
    const selection = $getSelection()
    if (!$isRangeSelection(selection)) {
      return false
    }
    const nodes = selection.getNodes()
    if (nodes.length !== 1 || !selection.isCollapsed()) {
      return false
    }
    const node = nodes[0]
    const outlineItemNode = $getParentOutlineItem(node)
    if (!outlineItemNode) {
      return false
    }
    const siblingsOutlineItem = outlineItemNode.getSiblingsOutlineItemNodes()
    const outlineNode = outlineItemNode.getChildOutlineNode()
    const childrenOutlineItemNodes = outlineNode?.getOutlineItemNodes() ?? []
    let offset = selection.focus.offset
    // 判断是否在行末
    if ($isTextNode(node)) {
      offset = $getOffsetInParent(node, selection.focus.offset)
    }
    const parentTextLength = node.getParent()?.getTextContentSize()
    // 只处理当前光标在行末的情况
    if (offset !== parentTextLength) {
      return false
    }

    const nextOutlineItem = $getNextOutlineItem(outlineItemNode)
    if (nextOutlineItem) {
      const result3 = $appendOtherOutlineItem(event, outlineItemNode, nextOutlineItem)
      if (result3) {
        return true
      }
    }

    console.debug("cannot delete because it is the last outline item in root outline node");
    event.preventDefault()
    emit('cannotDelete', editor.getElementByKey(outlineItemNode.getKey()), CANNOT_DELETE_ERROR_CODE_1)
    return true
  }, COMMAND_PRIORITY_HIGH)
})

onUnmounted(() => {
  unregisterListener()
})
</script>

<template>
</template>

<style scoped lang="scss">

</style>