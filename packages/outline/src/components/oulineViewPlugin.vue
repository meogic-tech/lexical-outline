<script setup lang="ts">
import type {
  EditorState,
  ElementNode,
  GridSelection,
  LexicalNode,
  NodeSelection,
  RangeSelection,
} from 'lexical'

import { $isMarkNode } from '@lexical/mark'
import {
  $getRoot,
  $getSelection,
  $isElementNode,
  $isRangeSelection,
  $isTextNode,
} from 'lexical'
import { onUnmounted, ref, watchEffect } from 'vue'
import type { LinkNode } from '@lexical/link'
import { $isLinkNode } from '@lexical/link'
import { useEditor } from 'lexical-vue'
import {$createBParagraphNode} from '../nodes'

defineProps<{
  viewClassName: string
}>()
const NON_SINGLE_WIDTH_CHARS_REPLACEMENT: Readonly<Record<string, string>>
  = Object.freeze({
    '\t': '\\t',
    '\n': '\\n',
  })
const NON_SINGLE_WIDTH_CHARS_REGEX = new RegExp(
  Object.keys(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).join('|'),
  'g',
)
const SYMBOLS: Record<string, string> = Object.freeze({
  ancestorHasNextSibling: '|',
  ancestorIsLastChild: ' ',
  hasNextSibling: '├',
  isLastChild: '└',
  selectedChar: '^',
  selectedLine: '>',
})



function generateContent(editorState: EditorState): string {
  let res = ' root\n'

   editorState.read(() => {
    const selection = $getSelection()

    visitTree($getRoot(), (node: LexicalNode, indent: Array<string>) => {
      const nodeKey = node.getKey()
      const nodeKeyDisplay = `(${nodeKey})`
      const typeDisplay = node.getType() || ''
      const isSelected = node.isSelected()
      const idsDisplay = $isMarkNode(node)
        ? ` id: [ ${node.getIDs().join(', ')} ] `
        : ''

      res += `${isSelected ? SYMBOLS.selectedLine : ' '} ${indent.join(
        ' ',
      )} ${nodeKeyDisplay} ${typeDisplay} ${idsDisplay} ${printNode(node)}\n`

      res += printSelectedCharsLine({
        indent,
        isSelected,
        node,
        nodeKeyDisplay,
        selection,
        typeDisplay,
      })
    })

  })

  return `${res}\n `
}

function visitTree(
  currentNode: ElementNode,
  visitor: (node: LexicalNode, indentArr: Array<string>) => void,
  indent: Array<string> = [],
) {
  const childNodes = currentNode.getChildren()
  const childNodesLength = childNodes.length

  childNodes.forEach((childNode, i) => {
    visitor(
      childNode,
      indent.concat(
        i === childNodesLength - 1
          ? SYMBOLS.isLastChild
          : SYMBOLS.hasNextSibling,
      ),
    )

    if ($isElementNode(childNode)) {
      visitTree(
        childNode,
        visitor,
        indent.concat(
          i === childNodesLength - 1
            ? SYMBOLS.ancestorIsLastChild
            : SYMBOLS.ancestorHasNextSibling,
        ),
      )
    }
  })
}

function normalize(text: string) {
  return Object.entries(NON_SINGLE_WIDTH_CHARS_REPLACEMENT).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(key, 'g'), String(value)),
    text,
  )
}

function printNode(node: LexicalNode) {
  if ($isTextNode(node)) {
    const text = node.getTextContent()
    const title = text.length === 0 ? '(empty)' : `"${normalize(text)}"`
    const properties = printAllTextNodeProperties(node)
    return [title, properties.length !== 0 ? `{ ${properties} }` : null]
      .filter(Boolean)
      .join(' ')
      .trim()
  }
  else if ($isLinkNode(node)) {
    const link = node.getURL()
    const title = link.length === 0 ? '(empty)' : `"${normalize(link)}"`
    const properties = printAllLinkNodeProperties(node)
    return [title, properties.length !== 0 ? `{ ${properties} }` : null]
      .filter(Boolean)
      .join(' ')
      .trim()
  }
  else {
    return ''
  }
}

const FORMAT_PREDICATES = [
  (node: LexicalNode | RangeSelection) => node.hasFormat('bold') && 'Bold',
  (node: LexicalNode | RangeSelection) => node.hasFormat('code') && 'Code',
  (node: LexicalNode | RangeSelection) => node.hasFormat('italic') && 'Italic',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('strikethrough') && 'Strikethrough',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('subscript') && 'Subscript',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('superscript') && 'Superscript',
  (node: LexicalNode | RangeSelection) =>
    node.hasFormat('underline') && 'Underline',
]

const DETAIL_PREDICATES = [
  (node: LexicalNode) => node.isDirectionless() && 'Directionless',
  (node: LexicalNode) => node.isUnmergeable() && 'Unmergeable',
]

const MODE_PREDICATES = [
  (node: LexicalNode) => node.isToken() && 'Token',
  (node: LexicalNode) => node.isSegmented() && 'Segmented',
]

function printAllTextNodeProperties(node: LexicalNode) {
  return [
    printFormatProperties(node),
    printDetailProperties(node),
    printModeProperties(node),
  ]
    .filter(Boolean)
    .join(', ')
}

function printAllLinkNodeProperties(node: LinkNode) {
  return [printTargetProperties(node), printRelProperties(node)]
    .filter(Boolean)
    .join(', ')
}

function printDetailProperties(nodeOrSelection: LexicalNode) {
  let str = DETAIL_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()

  if (str !== '')
    str = `detail: ${str}`

  return str
}

function printModeProperties(nodeOrSelection: LexicalNode) {
  let str = MODE_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()

  if (str !== '')
    str = `mode: ${str}`

  return str
}

function printFormatProperties(nodeOrSelection: LexicalNode | RangeSelection) {
  let str = FORMAT_PREDICATES.map(predicate => predicate(nodeOrSelection))
    .filter(Boolean)
    .join(', ')
    .toLocaleLowerCase()

  if (str !== '')
    str = `format: ${str}`

  return str
}

function printTargetProperties(node: LinkNode) {
  let str = node.getTarget()
  if (str != null)
    str = `target: ${str}`

  return str
}

function printRelProperties(node: LinkNode) {
  let str = node.getRel()
  if (str != null)
    str = `rel: ${str}`

  return str
}

function printSelectedCharsLine({
  indent,
  isSelected,
  node,
  nodeKeyDisplay,
  selection,
  typeDisplay,
}: {
  indent: Array<string>
  isSelected: boolean
  node: LexicalNode
  nodeKeyDisplay: string
  selection: GridSelection | NodeSelection | RangeSelection | null
  typeDisplay: string
}) {
  // 没有选择或未选择节点。
  if (
    !$isTextNode(node)
    || !$isRangeSelection(selection)
    || !isSelected
    || $isElementNode(node)
  )
    return ''

  // 没有选定的字符
  const anchor = selection.anchor
  const focus = selection.focus

  if (
    node.getTextContent() === ''
    || (anchor.getNode() === selection.focus.getNode()
      && anchor.offset === focus.offset)
  )
    return ''

  const [start, end] = $getSelectionStartEnd(node, selection)

  if (start === end)
    return ''

  const selectionLastIndent
    = indent[indent.length - 1] === SYMBOLS.hasNextSibling
      ? SYMBOLS.ancestorHasNextSibling
      : SYMBOLS.ancestorIsLastChild

  const indentionChars = [
    ...indent.slice(0, indent.length - 1),
    selectionLastIndent,
  ]
  const unselectedChars = Array(start + 1).fill(' ')
  const selectedChars = Array(end - start).fill(SYMBOLS.selectedChar)
  const paddingLength = typeDisplay.length + 3 // 2 for the spaces around + 1 for the double quote.

  const nodePrintSpaces = Array(nodeKeyDisplay.length + paddingLength).fill(
    ' ',
  )

  return (
    `${[
      SYMBOLS.selectedLine,
      indentionChars.join(' '),
      [...nodePrintSpaces, ...unselectedChars, ...selectedChars].join(''),
    ].join(' ')}\n`
  )
}

function $getSelectionStartEnd(
  node: LexicalNode,
  selection: RangeSelection | GridSelection,
): [number, number] {
  const anchor = selection.anchor
  const focus = selection.focus
  const textContent = node.getTextContent()
  const textLength = textContent.length

  let start = -1
  let end = -1

  // 只有一个节点被选中的情况
  if (anchor.type === 'text' && focus.type === 'text') {
    const anchorNode = anchor.getNode()
    const focusNode = focus.getNode()

    if (
      anchorNode === focusNode
      && node === anchorNode
      && anchor.offset !== focus.offset
    ) {
      [start, end]
        = anchor.offset < focus.offset
          ? [anchor.offset, focus.offset]
          : [focus.offset, anchor.offset]
    }
    else if (node === anchorNode) {
      [start, end] = anchorNode.isBefore(focusNode)
        ? [anchor.offset, textLength]
        : [0, anchor.offset]
    }
    else if (node === focusNode) {
      [start, end] = focusNode.isBefore(anchorNode)
        ? [focus.offset, textLength]
        : [0, focus.offset]
    }
    else {
      // 节点在选择范围内，但既不是锚点，也不是焦点。
      [start, end] = [0, textLength]
    }
  }

  // 处理非单个的字符
  const numNonSingleWidthCharBeforeSelection = (
    textContent.slice(0, start).match(NON_SINGLE_WIDTH_CHARS_REGEX) || []
  ).length
  const numNonSingleWidthCharInSelection = (
    textContent.slice(start, end).match(NON_SINGLE_WIDTH_CHARS_REGEX) || []
  ).length

  return [
    start + numNonSingleWidthCharBeforeSelection,
    end
      + numNonSingleWidthCharBeforeSelection
      + numNonSingleWidthCharInSelection,
  ]
}

const editor = useEditor()

const content = ref('')
const treeElementRef = ref<HTMLPreElement | null>(null)

let unregisterListener: () => void

watchEffect((onInvalidate) => {
  
  content.value = generateContent(editor.getEditorState())

  unregisterListener = editor.registerUpdateListener(() => {
    console.log(editor.getEditorState());
    const compositionKey = editor._compositionKey

    // 遍历Map
//     editor.getEditorState().read(()=>{
//     const nodeMap  = editor.getEditorState()._nodeMap as any
//       nodeMap.forEach((value:any, key:string) => {
//     const Bnode = $createBParagraphNode(key)
//     console.log(Bnode);
    
//     // if (value.__parent === 'root') {
//     //     // 更新__parent为BNode的节点
//     //     value.__parent = Bnode.__key;
//     // }
//     })

// });
    const treeText = generateContent(editor.getEditorState())
    console.log(treeText);
    
    const compositionText
        = compositionKey !== null && `Composition key: ${compositionKey}`
    content.value = [treeText, compositionText].filter(Boolean).join('\n\n')
  })

  onInvalidate(() => {
    unregisterListener()
  })
})

let element: HTMLPreElement | null = null
watchEffect(() => {
  element = treeElementRef.value
  if (element) {
    // @ts-expect-error: Internal field
    element.__lexicalEditor = editor
  }
})

onUnmounted(() => {
  unregisterListener?.()
  if (element) {
    // @ts-expect-error: Internal field
    element.__lexicalEditor = null
  }
})


</script>

<template>
  <div :class="viewClassName">
    <pre ref="treeElementRef">{{ content }}</pre>
  </div>
</template>
