<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {useEditor} from "lexical-vue";
import {
  $createParagraphNode, $getNodeByKey,
  $getSelection, $isDecoratorNode, $isElementNode, $isNodeSelection,
  $isRangeSelection, $isTextNode, BaseSelection, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW, DecoratorNode, ElementNode,
  INSERT_PARAGRAPH_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DELETE_COMMAND, KEY_DOWN_COMMAND,
  KEY_ENTER_COMMAND, KEY_TAB_COMMAND, LexicalNode, ParagraphNode, RangeSelection, TextNode,
} from "lexical";
import {mergeRegister} from '@lexical/utils';
import {$createLexicalBulletIconNode, $isLexicalBulletIconNode} from "@/nodes/LexicalBulletIconNode";
import {$createLexicalOutlineItemNode, $isLexicalOutlineItemNode, NodeId, LexicalOutlineItemNode} from "@/nodes/LexicalOutlineItemNode";
import {$createLexicalOutlineNode, $isLexicalOutlineNode, LexicalOutlineNode} from "@/nodes/LexicalOutlineNode";
import {
  $addNewOutlineItemNode,
  $getOffsetInParent,
  $getParentOutline, $getParentOutlineItem,
} from "@/outline-util";
import {$createLexicalOutlineItemContentNode, LexicalOutlineItemContentNode} from "@/nodes";
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
  createParagraphNode: (() => ElementNode) | undefined
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
    if ($isLexicalOutlineItemNode(outlineItemNode) && $isLexicalOutlineItemNode(previousOutlineItemNode)) {
      let outlineNode = previousOutlineItemNode.getChildOutlineNode()
      if (!outlineNode) {
        outlineNode = $createLexicalOutlineNode(true)
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
        if ($isLexicalOutlineItemNode(outlineItem) && outlineItem.getChildOutlineNode()) {
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
          if ($isLexicalOutlineItemNode(outlineItem)) {
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


onMounted(() => {
  editor.getRootElement()!.addEventListener('click', onClick)
  unregister = mergeRegister(
    editor.registerCommand(COLLAPSE_OUTLINE_COMMAND, (payload: {
      outlineItemKey: string,
      collapsed: boolean
    }, editor) => {
      const outlineItemNode = $getNodeByKey(payload.outlineItemKey)
      if (!$isLexicalOutlineItemNode(outlineItemNode)) {
        return false;
      }
      outlineItemNode.setCollapsed(payload.collapsed)
      outlineItemNode.getChildOutlineNode()?.setDisplay(!payload.collapsed)
      const firstChild = outlineItemNode.getOutlineItemContentNode()?.getFirstChild()
      if (!$isLexicalBulletIconNode(firstChild)) {
        return false
      }
      firstChild.setRotated(payload.collapsed)
      return false
    }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(INSERT_PARAGRAPH_COMMAND, (payload, editor) => {
      const selection = $getSelection()
      if (!selection) {
        return false
      }
      let anchor: DecoratorNode<unknown> | ElementNode | TextNode | null = null
      if (!$isRangeSelection(selection)) {
        if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes()
          const firstNode = nodes[0]
          if (firstNode && $isDecoratorNode(firstNode) &&
              !firstNode.isIsolated() && !firstNode.isInline() && firstNode.isKeyboardSelectable()
          ) {
            anchor = firstNode
          }
        }
        if (!anchor) {
          console.warn('not range selection when insert paragraph')
          return false
        }
      } else {
        anchor = selection.anchor.getNode()
      }
      //region 处理和代码块相关的换行
      if ($isElementNode(anchor) && $isRangeSelection(selection) && internal$isCodeNode(anchor)) {
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
          $addNewOutlineItemNode(selection, anchor, internal$CreateParagraphNode, props.getNewOutlineItemId)
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
      if ($isElementNode(parent) && $isRangeSelection(selection) && internal$isCodeNode(parent)) {
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
      $addNewOutlineItemNode(selection, anchor, internal$CreateParagraphNode, props.getNewOutlineItemId)
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
