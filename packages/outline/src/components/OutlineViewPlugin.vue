<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {useEditor} from "lexical-vue";
import {
  $createParagraphNode, $getNodeByKey,
  $getSelection, $isElementNode,
  $isRangeSelection, $isTextNode, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW, ElementNode,
  INSERT_PARAGRAPH_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, KEY_DOWN_COMMAND,
  KEY_ENTER_COMMAND, KEY_TAB_COMMAND, LexicalNode, RangeSelection, TextNode,
} from "lexical";
import {mergeRegister} from '@lexical/utils';
import {$createBulletIconNode, $isBulletIconNode} from "@/nodes/BulletIconNode";
import {$createOutlineItemNode, $isOutlineItemNode, NodeId, OutlineItemNode} from "@/nodes/OutlineItemNode";
import {$createOutlineNode, $isOutlineNode, OutlineNode} from "@/nodes/OutlineNode";
import {
  $getOffsetInParent,
  $getParentOutline, $getParentOutlineItem,
} from "@/outline-util";
import {$createOutlineItemContentNode, OutlineItemContentNode} from "@/nodes";
import {COLLAPSE_OUTLINE_COMMAND} from "@/commands";
import {$isCodeHighlightNode, $isCodeNode} from "@lexical/code";
import {
  CANNOT_BACKSPACE_ERROR_CODE_1,
  CANNOT_BACKSPACE_ERROR_CODE_2,
  CANNOT_BACKSPACE_ERROR_CODE_3, CANNOT_DELETE_ERROR_CODE_1, CANNOT_DELETE_ERROR_CODE_2, CANNOT_DELETE_ERROR_CODE_3,
  CannotBackspaceErrorCodeType, CannotDeleteErrorCodeType
} from "@/util";


const editor = useEditor()
const props = defineProps<{
  createParagraphNode: typeof $createParagraphNode | undefined
  getNewOutlineItemId: () => NodeId
  isCodeNode: (node: ElementNode | TextNode | null) => boolean
}>()
let unregister: () => void

const internal$CreateParagraphNode = props.createParagraphNode ?? $createParagraphNode
const internal$isCodeNode = props.isCodeNode ?? $isCodeNode

const emit = defineEmits<{
  (event: 'cannotBackspace', relativeHTMLElement: HTMLElement | null, errorCode: CannotBackspaceErrorCodeType): void;
}>();

function indent(): boolean {
  const selection = $getSelection()
  if (!selection) {
    return false
  }
  const nodes = selection.getNodes()
  if (nodes.length === 1) {
    const firstNode = nodes[0]

    const outlineItemNode = $getParentOutlineItem(firstNode)
    if (!outlineItemNode) {
      return false
    }
    const previousOutlineItemNode = outlineItemNode.getPreviousSibling()
    if ($isOutlineItemNode(outlineItemNode) && $isOutlineItemNode(previousOutlineItemNode)) {
      let outlineNode = previousOutlineItemNode.getChildOutlineNode()
      if (!outlineNode) {
        outlineNode = $createOutlineNode(true)
        previousOutlineItemNode.append(outlineNode)
      }
      outlineNode.append(outlineItemNode)
      editor.dispatchCommand(COLLAPSE_OUTLINE_COMMAND, {
        outlineItemKey: previousOutlineItemNode.getKey(),
        collapsed: false
      })
      return true
    }
  }
  return false
}

/**
 * - outline
 *  - outline-item
 *    - outline-item-content
 *      - paragraph
 *      - outline
 *        - outline-item
 *          - outline-item-content
 *            - paragraph
 *            - outline
 *              - outline-item
 *                - outline-item-content
 *                  - paragraph
 *                  ^ cursor
 *        - outline-item
 *          - outline-item-content
 *            - paragraph
 */
function outdent(): boolean {
  const selection = $getSelection()
  if (!selection) {
    return false
  }
  const nodes = selection.getNodes()
  if (nodes.length === 1) {
    const firstNode = nodes[0]
    const currentOutlineItemNode = $getParentOutlineItem(firstNode)
    if (!currentOutlineItemNode) {
      return false
    }
    const outlineNode = $getParentOutline(firstNode)
    if (!outlineNode) {
      return false
    }
    const parentOutlineItemNode = $getParentOutlineItem(outlineNode)
    if (!parentOutlineItemNode) {
      return false
    }
    // parentOutlineNode.setCollapsed(false)
    parentOutlineItemNode.insertAfter(currentOutlineItemNode)
    if (outlineNode.getOutlineItemNodes().length === 0) {
      outlineNode.remove()
    }
    return true
  }
  return false
}

const onClick = (event: MouseEvent) => {
  // .editor-outline-chevron-container
  const target = event.target as HTMLElement
  const chevronContainer = target.closest('.editor-outline-chevron-container')
  if (!chevronContainer) {
    return
  }
  const spot = target.closest('.editor-outline-item-spot')
  if (!spot) {
    return
  }
  for (const [key, dom] of Array.from(editor._keyToDOMMap.entries())) {
    if (dom === spot) {
      const isGotoCollapse = editor.getEditorState().read(() => {
        const node = $getNodeByKey(key)
        if (!node) {
          return false
        }
        const outlineItem = $getParentOutlineItem(node)
        if ($isOutlineItemNode(outlineItem) && outlineItem.getChildOutlineNode()) {
          return true
        }
      })
      if (isGotoCollapse) {
        editor.update(() => {
          const node = $getNodeByKey(key)
          if (!node) {
            return false
          }
          const outlineItem = $getParentOutlineItem(node)
          if ($isOutlineItemNode(outlineItem)) {
            editor.dispatchCommand(COLLAPSE_OUTLINE_COMMAND, {
              outlineItemKey: outlineItem.getKey(),
              collapsed: !outlineItem.getCollapsed()
            })
          }
        })
      }
    }
  }
}

function $addNewOutlineItemNode(selection: RangeSelection, anchor: ElementNode | TextNode) {
  const newParagraphNode = internal$CreateParagraphNode()
  const parentOutlineItemNode = $getParentOutlineItem(anchor)
  if (parentOutlineItemNode === null) {
    console.warn('cannot find parent outline item node', anchor)
    return false
  }
  if ($isTextNode(anchor)) {
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
  const outlineItemNode = $createOutlineItemNode(props.getNewOutlineItemId(), false)
  outlineItemNode
      .append($createOutlineItemContentNode()
          .append($createBulletIconNode(false))
          .append(newParagraphNode))
  const childOutline = parentOutlineItemNode.getChildOutlineNode()
  if (childOutline && !parentOutlineItemNode.getCollapsed()) {
    childOutline.splice(0, 0, [outlineItemNode])
  } else {
    parentOutlineItemNode.insertAfter(outlineItemNode)
  }
  newParagraphNode.select(0, 0)
}

onMounted(() => {
  editor.getRootElement()!.addEventListener('click', onClick)
  unregister = mergeRegister(
    editor.registerCommand(COLLAPSE_OUTLINE_COMMAND, (payload: {
      outlineItemKey: string,
      collapsed: boolean
    }, editor) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        console.warn('not range selection')
        return false
      }
      const outlineItemNode = $getNodeByKey(payload.outlineItemKey)
      if (!$isOutlineItemNode(outlineItemNode)) {
        return false;
      }
      outlineItemNode.setCollapsed(payload.collapsed)
      outlineItemNode.getChildOutlineNode()?.setDisplay(!payload.collapsed)
      const firstChild = outlineItemNode.getOutlineItemContentNode()?.getFirstChild()
      if (!$isBulletIconNode(firstChild)) {
        return false
      }
      firstChild.setRotated(payload.collapsed)
      return false
    }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(INSERT_PARAGRAPH_COMMAND, (payload, editor) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        console.warn('not range selection when insert paragraph')
        return false
      }
      const anchor = selection.anchor.getNode()
      //region 处理和代码块相关的换行
      if (internal$isCodeNode(anchor)) {
        /**
         * 当前选中了code节点，则说明当前其实光标显示在新的一行上
         */
        const children = (anchor as ElementNode).getChildren()
        const childrenLength = children.length
        if (childrenLength >= 2
            && children[childrenLength - 1].getTextContent() === '\n'
            && children[childrenLength - 2].getTextContent() === '\n'
            && selection.isCollapsed()
            && selection.anchor.key === anchor.getKey()
            && selection.anchor.offset === childrenLength) {
          /**
           * 此时的代码是
           * function A{
           *
           *
           * ^ cursor
           * 此时如果再按回车就会触发添加新的outline item node
           */
          children[childrenLength - 1].remove()
          children[childrenLength - 2].remove()
          $addNewOutlineItemNode(selection, anchor)
          return true
        }
        /**
         * 此时的代码是
         * function A{
         *
         * ^ cursor
         * 执行下面的代码才会运行我继续新增一行以添加}
         */
        selection.insertParagraph()
        return true
      }
      const parent = anchor.getParent()
      if (internal$isCodeNode(parent)) {
        /**
         * 这里时最普通的情况，在高亮代码中进行了回车，然后应该触发拆分高亮代码节点
         */
        selection.insertParagraph()
        return true
      }
      //endregion
      /**
       * 处理和代码块无关的情况
       */
      $addNewOutlineItemNode(selection, anchor)
      return true
    }, COMMAND_PRIORITY_HIGH),
    editor.registerCommand(KEY_TAB_COMMAND, (event: KeyboardEvent, editor) => {
      event.preventDefault()
      return event.shiftKey ? outdent() : indent()
    }, COMMAND_PRIORITY_LOW),
    // editor.registerCommand(KEY_DOWN_COMMAND, (event: KeyboardEvent, editor) => {
    //   console.log("event", event);
    //   if (event.key === 'Backspace') {
    //     return true
    //   }
    //   return false
    // }, COMMAND_PRIORITY_HIGH),
  )
})

onUnmounted(() => {
  unregister()
  editor.getRootElement()?.removeEventListener('click', onClick)
})
</script>

<template>
</template>
