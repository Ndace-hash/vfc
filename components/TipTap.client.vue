<template>
    <div>
        <div v-if="editor">
            <UButton @click="editor.chain().focus().toggleBold().run()"
                :disabled="!editor.can().chain().focus().toggleBold().run()"
                :class="{ 'is-active': editor.isActive('bold') }">
                <UIcon name="i-material-symbols-format-bold" dynamic />
            </UButton>
            <UButton @click="editor.chain().focus().toggleItalic().run()"
                :disabled="!editor.can().chain().focus().toggleItalic().run()"
                :class="{ 'is-active': editor.isActive('italic') }">
                <UIcon name="i-material-symbols-format-italic" dynamic />
            </UButton>
            <UButton @click="editor.chain().focus().setParagraph().run()"
                :class="{ 'is-active': editor.isActive('paragraph') }">
                paragraph
            </UButton>
            <UButton @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
                :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }">
                H1
            </UButton>
            <UButton @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
                :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }">
                H2
            </UButton>
            <UButton @click="editor.chain().focus().toggleBulletList().run()"
                :class="{ 'is-active': editor.isActive('bulletList') }">
                <UIcon name="i-material-symbols-format-list-bulleted" dynamic />
            </UButton>
            <UButton @click="editor.chain().focus().toggleOrderedList().run()"
                :class="{ 'is-active': editor.isActive('orderedList') }">
                <UIcon name="i-material-symbols-format-list-numbered" dynamic />
            </UButton>
            <UButton @click="editor.chain().focus().toggleBlockquote().run()"
                :class="{ 'is-active': editor.isActive('blockquote') }">

                <UIcon name="i-tabler-blockquote" dynamic />
            </UButton>
            <UButton @click="editor.chain().focus().setHorizontalRule().run()">
                <UIcon name="i-carbon-ruler" dynamic />
            </UButton>
            <button @click="editor.chain().focus().setHardBreak().run()">
                hard break
            </button>
            <UButton @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()">
                <UIcon name="i-ic-baseline-undo" dynamic />
            </UButton>
            <UButton @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()">
                <UIcon name="i-ic-baseline-redo" dynamic />
            </UButton>
        </div>
        <EditorContent :editor="editor" />
    </div>
</template>

<script setup>
import { useEditor, EditorContent } from '@tiptap/vue-3'
import TiptapStarterKit from '@tiptap/starter-kit'
const editor = useEditor({
    content: "<p>I'm running Tiptap with Vue.js. 🎉</p>",
    extensions: [TiptapStarterKit],
});
</script>