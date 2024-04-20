<script lang="ts" setup>
import {useEditor} from "lexical-vue";
import {onMounted, onUnmounted} from "vue";
import {
  CANNOT_BACKSPACE_ERROR_CODE_1,
  CANNOT_BACKSPACE_ERROR_CODE_2, CANNOT_BACKSPACE_ERROR_CODE_3,
  CannotBackspaceErrorCodeType,
  CannotDeleteErrorCodeType
} from "@/util";
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  COMMAND_PRIORITY_HIGH,
  ElementNode,
  KEY_BACKSPACE_COMMAND
} from "lexical";
import {$getOffsetInParent, $getParentOutline, $getParentOutlineItem} from "@/outline-util";
import {$isOutlineItemNode, OutlineItemNode} from "@/nodes";

const editor = useEditor()
let unregisterListener: () => void
const emit = defineEmits<{
  (event: 'cannotBackspace', relativeHTMLElement: HTMLElement | null, errorCode: CannotBackspaceErrorCodeType): void;
}>();

function $getTheLastContentInOutlineItem(outlineItemNode: OutlineItemNode): ElementNode | null {
  const outlineItemContentNode = outlineItemNode.getOutlineItemContentNode()
  if (!outlineItemContentNode) {
    return null
  }
  /**
   * 现在outlineItemContentNode下第一个是bullet icon node
   * 第二个才是paragraph node之类的
   */
  const content = outlineItemContentNode.getLastChild()
  if (outlineItemNode.getChildrenSize() === 1) {
    return content as ElementNode | null
  }
  const childOutlineNode = outlineItemNode.getChildOutlineNode()
  if (childOutlineNode) {
    const lastOutlineItemNode = childOutlineNode.getLastChild()
    if ($isOutlineItemNode(lastOutlineItemNode)) {
      return $getTheLastContentInOutlineItem(lastOutlineItemNode)
    }
  }
  return null
}

onMounted(() => {
  unregisterListener = editor.registerCommand(KEY_BACKSPACE_COMMAND, (event: KeyboardEvent, editor) => {
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
    const outlineNode = $getParentOutline(node)
    if (!outlineNode) {
      console.warn("cannot find parent outline by node", node)
      return false
    }
    const rootOutlineNode = outlineNode.getRootOutlineNode()
    if (!rootOutlineNode) {
      console.warn("cannot find root outline by node", outlineNode)
      return false
    }
    let offset = selection.focus.offset
    if ($isTextNode(node)) {
      offset = $getOffsetInParent(node, selection.focus.offset)
    }
    if (outlineNode === rootOutlineNode && offset === 0) {
      if (siblingsOutlineItem.length === 1) {
        console.debug("cannot backspace because it is the last outline item in root outline node");
        event.preventDefault()
        emit('cannotBackspace', editor.getElementByKey(outlineItemNode.getKey()), CANNOT_BACKSPACE_ERROR_CODE_1)
        return true
      }
      // 原本这里return false似乎可以有默认的操作
    }
    if (offset === 0 && outlineItemNode.getChildOutlineNode()) {
      console.debug("cannot backspace because it has child outline items");
      emit('cannotBackspace', editor.getElementByKey(outlineItemNode.getKey()), CANNOT_BACKSPACE_ERROR_CODE_2)
      event.preventDefault()
      return true
    }
    if (offset === 0) {
      // 选中上一个
      const index = siblingsOutlineItem.indexOf(outlineItemNode)
      if (index === 0) {
        /**
         * - outline
         *   - outline-item
         *    - outline-item-content
         *      - bullet-icon
         *      - paragraph
         *    - outline
         *      - outline-item
         *        - outline-item-content
         *          - bullet-icon
         *          - paragraph
         *          ^ cursor
         */
        const childOutlineNode = outlineItemNode.getChildOutlineNode()
        const childOutlineItemNodes = childOutlineNode?.getOutlineItemNodes()
        if (childOutlineItemNodes && childOutlineItemNodes?.length > 0) {
          console.debug("cannot backspace because it is the first outline item in outline node and it has child outline items");
          event.preventDefault()
          emit('cannotBackspace', editor.getElementByKey(outlineItemNode.getKey()), CANNOT_BACKSPACE_ERROR_CODE_3)
          return true
        }
      }
      let targetContent: ElementNode | null = null
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
        targetContent = $getTheLastContentInOutlineItem(previousOutlineItemNode)
      } else {
        const parentOutlineItemNode = $getParentOutlineItem(outlineNode)
        if (parentOutlineItemNode) {
          /**
           * 因为确定了要聚焦的父层级的outlineItem，所以直接获取它的第一个content即可
           */
          // @ts-ignore
          targetContent = parentOutlineItemNode.getOutlineItemContentNode()?.getTextElementNode()
        }
      }
      targetContent?.selectEnd()
      const firstContent = outlineItemNode.getOutlineItemContentNode()?.getTextElementNode()
      if (firstContent) {
        targetContent?.append(...firstContent.getChildren())
      }
      outlineNode.getChildrenSize() === 1 && outlineNode.remove()
      outlineItemNode.remove()
      event.preventDefault()
      return true
    }
    return false
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