<script setup lang="ts">
import {$createParagraphNode, $createTextNode, $getRoot, ElementNode} from 'lexical'
import {
  LexicalAutoFocusPlugin,
  LexicalComposer,
  LexicalContentEditable,
  LexicalHashtagPlugin,
  LexicalHistoryPlugin,
  LexicalLinkPlugin,
  LexicalListPlugin,
  LexicalRichTextPlugin,
  LexicalTreeViewPlugin,
  LexicalMarkdownShortcutPlugin
} from 'lexical-vue'
import {TEXT_FORMAT_TRANSFORMERS, TEXT_MATCH_TRANSFORMERS, HEADING, QUOTE, CODE} from '@lexical/markdown'
import { $createHeadingNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListItemNode, ListNode } from '@lexical/list'
import { CodeHighlightNode, CodeNode } from '@lexical/code'
import { AutoLinkNode, LinkNode } from '@lexical/link'
import { HashtagNode } from '@lexical/hashtag'
import {
  OutlineViewPlugin,
  OutlineBulletIconPlugin,
  OutlineNode,
  $createOutlineNode,
  OutlineItemNode,
  $createOutlineItemNode,
  BulletIconNode,
  $createBulletIconNode,
  $createOutlineItemContentNode, OutlineItemContentNode,
  OutlineCheckPlugin,
  LexicalCodeHighlightPlugin,
  OutlineDeletePlugin,
  OutlineBackspacePlugin,
  CannotBackspaceErrorCodeType
} from 'lexical-outline'
import {onUnmounted,onMounted} from 'vue'

let unregister: () => void


function preOutlineText() {
  const root = $getRoot()

  
  if (root.getFirstChild() === null) {
    const outline2 = $createOutlineNode(true)
    const outlineItemNode2 = $createOutlineItemNode('id:2', false)
        .append($createOutlineItemContentNode()
            .append($createBulletIconNode())
            .append($createParagraphNode().append($createTextNode('Hello!'))))
    const outlineItemNode3 = $createOutlineItemNode('id:3', false)
        .append($createOutlineItemContentNode()
            .append($createBulletIconNode())
            .append($createParagraphNode().append($createTextNode('World!'))))
    outline2.append(outlineItemNode2).append(outlineItemNode3)

    const outline = $createOutlineNode(true)
    const outlineItemNode = $createOutlineItemNode('id:1', false)
    outline
        .append(outlineItemNode
            .append($createOutlineItemContentNode()
                .append($createBulletIconNode())
                .append($createParagraphNode()
                    .append($createTextNode('This is a '))
                    .append($createTextNode('playground').setFormat("bold"))
                    .append($createTextNode(' for the outline plugin.'))
                )
                // .append($createHeadingNode('h1').append($createTextNode('Welcome to the playground')))
            )
            .append(outline2)
        )


    root.append(outline)
  }
}

const config = {
  theme: {
    ltr: 'ltr',
    rtl: 'rtl',
    placeholder: 'editor-placeholder',
    paragraph: 'editor-paragraph',
    quote: 'editor-quote',
    bParagraph: 'editor-bParagraph',
    heading: {
      h1: 'editor-heading-h1',
      h2: 'editor-heading-h2',
      h3: 'editor-heading-h3',
      h4: 'editor-heading-h4',
      h5: 'editor-heading-h5',
    },
    list: {
      nested: {
        listitem: 'editor-nested-listitem',
      },
      ol: 'editor-list-ol',
      ul: 'editor-list-ul',
      listitem: 'editor-listitem',
    },
    image: 'editor-image',
    link: 'editor-link',
    hashtag: 'editor-text-hashtag',
    text: {
      bold: 'editor-text-bold',
      italic: 'editor-text-italic',
      underline: 'editor-text-underline',
      strikethrough: 'editor-text-strikethrough',
      underlineStrikethrough: 'editor-text-underlineStrikethrough',
      code: 'editor-text-code',
    },
    code: 'editor-code',
    codeHighlight: {
      'atrule': 'editor-tokenAttr',
      'attr': 'editor-tokenAttr',
      'boolean': 'editor-tokenProperty',
      'builtin': 'editor-tokenSelector',
      'cdata': 'editor-tokenComment',
      'char': 'editor-tokenSelector',
      'class': 'editor-tokenFunction',
      'class-name': 'editor-tokenFunction',
      'comment': 'editor-tokenComment',
      'constant': 'editor-tokenProperty',
      'deleted': 'editor-tokenProperty',
      'doctype': 'editor-tokenComment',
      'entity': 'editor-tokenOperator',
      'function': 'editor-tokenFunction',
      'important': 'editor-tokenVariable',
      'inserted': 'editor-tokenSelector',
      'keyword': 'editor-tokenAttr',
      'namespace': 'editor-tokenVariable',
      'number': 'editor-tokenProperty',
      'operator': 'editor-tokenOperator',
      'prolog': 'editor-tokenComment',
      'property': 'editor-tokenProperty',
      'punctuation': 'editor-tokenPunctuation',
      'regex': 'editor-tokenVariable',
      'selector': 'editor-tokenSelector',
      'string': 'editor-tokenSelector',
      'symbol': 'editor-tokenProperty',
      'tag': 'editor-tokenProperty',
      'url': 'editor-tokenOperator',
      'variable': 'editor-tokenVariable',
    },
  },
  nodes: [
    HeadingNode,
    ListNode,
    ListItemNode,
    QuoteNode,
    CodeNode,
    CodeHighlightNode,
    AutoLinkNode,
    LinkNode,
    HashtagNode,
    OutlineNode,
    OutlineItemNode,
    OutlineItemContentNode,
    BulletIconNode,
  ],
  editable: true,
  editorState: preOutlineText,
}

function onError(error: Error) {
  throw error
}

onUnmounted(() => {
})
let id = 10
function getNewOutlineItemId() {
  return (id ++).toString()
}

let checkErrorTimeout: number | null = null

const onCheckError = (relativeHTMLElement: HTMLElement | null) => {
  if (!relativeHTMLElement) {
    return
  }
  if (relativeHTMLElement.classList.contains('error-shake')) {
    relativeHTMLElement.classList.remove('error-shake')
    checkErrorTimeout && clearTimeout(checkErrorTimeout)
  }

  relativeHTMLElement.classList.add('error-shake')
  checkErrorTimeout = setTimeout(() => {
    relativeHTMLElement.classList.remove('error-shake')
  }, 800)
}

let cannotBackspaceErrorTimeout: number | null = null

const onCannotBackspaceError = (relativeHTMLElement: HTMLElement | null, errorCode: CannotBackspaceErrorCodeType) => {
  if (!relativeHTMLElement) {
    return
  }
  if (relativeHTMLElement.classList.contains('error-shake')) {
    relativeHTMLElement.classList.remove('error-shake')
    cannotBackspaceErrorTimeout && clearTimeout(cannotBackspaceErrorTimeout)
  }
  relativeHTMLElement.classList.add('error-shake')
  cannotBackspaceErrorTimeout = setTimeout(() => {
    relativeHTMLElement.classList.remove('error-shake')
  }, 800)
  console.log("errorCode", errorCode);
}
</script>

<template>
  <LexicalComposer :initial-config="config" @error="onError">
    <div class="editor-container">
      <div class="editor-inner">
        <LexicalRichTextPlugin>
          <template #contentEditable>
            <LexicalContentEditable class="editor-input" />
          </template>
          <template #placeholder>
            <div class="editor-placeholder">
              Enter some text...
            </div>
          </template>
        </LexicalRichTextPlugin>
        <LexicalTreeViewPlugin
            view-class-name="tree-view-output"
            time-travel-panel-class-name="debug-timetravel-panel"
            time-travel-button-class-name="debug-timetravel-button"
            time-travel-panel-slider-class-name="debug-timetravel-panel-slider"
            time-travel-panel-button-class-name="debug-timetravel-panel-button"
        />
        <LexicalHistoryPlugin />
        <LexicalAutoFocusPlugin />
        <LexicalListPlugin />
        <LexicalLinkPlugin />
        <LexicalHashtagPlugin />
        <OutlineViewPlugin
            :getNewOutlineItemId="getNewOutlineItemId"
        />
        <OutlineBulletIconPlugin />
        <OutlineCheckPlugin @check-error="onCheckError" />
        <LexicalCodeHighlightPlugin />
        <LexicalMarkdownShortcutPlugin :transformers="[...TEXT_FORMAT_TRANSFORMERS, ...TEXT_MATCH_TRANSFORMERS, HEADING, QUOTE, CODE]"/>
        <OutlineDeletePlugin @cannotDelete="onCannotBackspaceError"/>
        <OutlineBackspacePlugin @cannotBackspace="onCannotBackspaceError"/>
      </div>
    </div>
  </LexicalComposer>
</template>
