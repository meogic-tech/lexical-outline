<script setup lang="ts">
import {onMounted, onUnmounted} from "vue";
import {useEditor} from "lexical-vue";
import {
  $createParagraphNode, $getNodeByKey,
  $getSelection, $isElementNode,
  $isRangeSelection, $isTextNode, COMMAND_PRIORITY_EDITOR, COMMAND_PRIORITY_HIGH,
  COMMAND_PRIORITY_LOW, ElementNode,
  INSERT_PARAGRAPH_COMMAND, KEY_BACKSPACE_COMMAND, KEY_DOWN_COMMAND,
  KEY_ENTER_COMMAND, KEY_TAB_COMMAND, LexicalNode,
} from "lexical";
import { mergeRegister } from '@lexical/utils';
import {$createBulletIconNode} from "@/nodes/BulletIconNode";
import {$createOutlineItemNode, $isOutlineItemNode, OutlineItemNode} from "@/nodes/OutlineItemNode";
import {$createOutlineNode, $isOutlineNode, OutlineNode} from "@/nodes/OutlineNode";
import {
  $getOffsetInParent,
  $getParentOutline, $getParentOutlineItem,
} from "@/table-util";
import {$createOutlineItemContentNode} from "@/nodes";
import {COLLAPSE_OUTLINE_COMMAND} from "@/commands";


const editor = useEditor()
const props = defineProps<{
  $createParagraphNode: typeof $createParagraphNode | undefined
}>()
let unregister: () => void

const internal$CreateParagraphNode = props.$createParagraphNode ?? $createParagraphNode

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
        previousOutlineItemNode.getOutlineItemContentNode()?.append(outlineNode)
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
        if ($isOutlineItemNode(outlineItem)) {
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

onMounted(() => {
  editor.getRootElement()!.addEventListener('click', onClick)
  unregister = mergeRegister(
    editor.registerCommand(COLLAPSE_OUTLINE_COMMAND, (payload: { outlineItemKey: string, collapsed: boolean }, editor) => {
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
      return false
    }, COMMAND_PRIORITY_LOW),
    editor.registerCommand(INSERT_PARAGRAPH_COMMAND, (payload, editor) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        console.warn('not range selection when insert paragraph')
        return false
      }
      // only append
      const anchor = selection.anchor.getNode()
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
      const outlineItemNode = $createOutlineItemNode('id:2', false)
      outlineItemNode
          .append($createBulletIconNode())
          .append($createOutlineItemContentNode().append(newParagraphNode))
      const childOutline = parentOutlineItemNode.getChildOutlineNode()
      if (childOutline && !parentOutlineItemNode.getCollapsed()) {
        childOutline.splice(0, 0, [outlineItemNode])
      } else {
        parentOutlineItemNode.insertAfter(outlineItemNode)
      }
      newParagraphNode.select(0, 0)
      return true
    }, COMMAND_PRIORITY_LOW),
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
    editor.registerCommand(KEY_BACKSPACE_COMMAND, (event: KeyboardEvent, editor) => {
      const selection = $getSelection()
      if (!$isRangeSelection(selection)) {
        return false
      }
      const nodes = selection.getNodes()
      if (nodes.length !== 1) {
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
      if (!rootOutlineNode)  {
        console.warn("cannot find root outline by node", outlineNode)
        return false
      }
      if (outlineNode === rootOutlineNode) {
        if (siblingsOutlineItem.length === 1) {
          console.debug("cannot backspace because it is the last outline item in root outline node");
          event.preventDefault()
          return true
        }
        return false
      }
      let offset = selection.anchor.offset
      if ($isTextNode(node)) {
        offset = $getOffsetInParent(node, selection.anchor.offset)
      }
      if(offset === 0) {
        // 选中上一个
        const index = siblingsOutlineItem.indexOf(outlineItemNode)
        if (index === 0) {
          /**
           * outline
           * - outline-item
           *  - bullet-icon
           *  - outline-item-content
           *    - paragraph
           *    - outline
           *      - outline-item
           *        - bullet-icon
           *        - outline-item-content
           *          - paragraph
           *          ^ cursor
           */
          const childOutlineNode = outlineItemNode.getChildOutlineNode()
          const childOutlineItemNodes = childOutlineNode?.getOutlineItemNodes()
          if (childOutlineItemNodes && childOutlineItemNodes?.length > 0) {
            console.debug("cannot backspace because it is the first outline item in outline node and it has child outline items");
            event.preventDefault()
            return true
          }
          console.debug("do not backspace because it will be right default behavior");
          return false
        }
        const previousOutlineItemNode = siblingsOutlineItem[index - 1]
        if (!previousOutlineItemNode) {
          return false
        }
        const outlineItemContentNode = previousOutlineItemNode.getOutlineItemContentNode()
        const targetContent = outlineItemContentNode?.getChildAtIndex(0) as ElementNode | null | undefined
        targetContent?.selectEnd()
        const firstContent = outlineItemNode.getOutlineItemContentNode()?.getChildAtIndex(0) as ElementNode | null | undefined
        if (firstContent) {
          targetContent?.append(...firstContent.getChildren())
        }
        outlineItemNode.remove()
        event.preventDefault()
        return true
      }
      return false
    }, COMMAND_PRIORITY_HIGH),
  )
})

onUnmounted(() => {
  unregister()
  editor.getRootElement().removeEventListener('click', onClick)
})
</script>

<template>
</template>
