<template>
    <div class="w-full">
        <div v-if="editor" class="flex flex-wrap gap-2 mb-4">
            <UButton @click="editor.chain().focus().toggleBold().run()"
                :disabled="!editor.can().chain().focus().toggleBold().run()" class=" border border-primary" size="xs"
                :variant="editor.isActive('bold') ? 'solid' : 'ghost'">
                <UIcon name="i-material-symbols-format-bold" dynamic class="text-2xl" />
            </UButton>
            <UButton @click="editor.chain().focus().toggleItalic().run()"
                :disabled="!editor.can().chain().focus().toggleItalic().run()" class=" border border-primary" size="xs"
                :variant="editor.isActive('italic') ? 'solid' : 'ghost'">
                <UIcon name="i-material-symbols-format-italic" dynamic class="text-2xl" />
            </UButton>
            <UButton @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" class=" border border-primary"
                size="xs" :variant="editor.isActive('heading', { level: 1 }) ? 'solid' : 'ghost'">
                H1
            </UButton>
            <UButton @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" class=" border border-primary"
                size="xs" :variant="editor.isActive('heading', { level: 2 }) ? 'solid' : 'ghost'">
                H2
            </UButton>
            <UButton @click="editor.chain().focus().toggleBulletList().run()" class=" border border-primary" size="xs"
                :variant="editor.isActive('bulletList') ? 'solid' : 'ghost'">
                <UIcon name="i-material-symbols-format-list-bulleted" dynamic class="text-2xl" />
            </UButton>
            <UButton @click="editor.chain().focus().toggleOrderedList().run()" class=" border border-primary" size="xs"
                :variant="editor.isActive('orderedList') ? 'solid' : 'ghost'">
                <UIcon name="i-material-symbols-format-list-numbered" dynamic class="text-2xl" />
            </UButton>
            <UButton @click="editor.chain().focus().toggleBlockquote().run()" class=" border border-primary" size="xs"
                :variant="editor.isActive('blockquote') ? 'solid' : 'ghost'">

                <UIcon name="i-tabler-blockquote" dynamic class="text-2xl" />
            </UButton>
            <UButton @click="createLink" :class="{ 'is-active': editor.isActive('link') }">
                <UIcon name="i-material-symbols-add-link" dynamic class="text-2xl" />
            </UButton>
            <label @change="addImage" :class="{ 'is-active': editor.isActive('image') }"
                class="rounded-md p-2 border border-primary bg-primary text-white " for="image">
                <UIcon name="i-material-symbols-add-photo-alternate-outline" dynamic class="text-2xl" />
                <input type="file" accept=".jpg, .png, .jpeg, .gif" class="hidden" id="image" ref="imageInput" />
            </label>
            <UButton @click="editor.chain().focus().setHorizontalRule().run()">
                <UIcon name="i-carbon-ruler" dynamic class="text-2xl" />
            </UButton>
            <UButton @click="editor.chain().focus().undo().run()" :disabled="!editor.can().chain().focus().undo().run()">
                <UIcon name="i-ic-baseline-undo" dynamic class="text-2xl" />
            </UButton>
            <UButton @click="editor.chain().focus().redo().run()" :disabled="!editor.can().chain().focus().redo().run()">
                <UIcon name="i-ic-baseline-redo" dynamic class="text-2xl" />
            </UButton>
        </div>
        <EditorContent :editor="editor"
            class="min-h-[30rem] max-h-[30rem] overflow-y-auto bg-slate-100 outline-none h-full p-2 tippy" />

    </div>
</template>

<script setup lang="ts">
import { uploadBytes, ref as storageRef, getDownloadURL } from 'firebase/storage'
import { storage } from '~/config/firebase';
import { useEditor, EditorContent } from '@tiptap/vue-3'
import TiptapStarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
const imageInput = ref<HTMLInputElement | null>(null)
const props = defineProps({
    modelValue: {
        type: String,
        default: 'WHat is happening?'
    }
})
const emits = defineEmits(['update:modelValue'])
const editor = useEditor({
    extensions: [TiptapStarterKit.configure({
        heading: {
            HTMLAttributes: {
                class: 'heading'
            },
        },
        bulletList: {
            HTMLAttributes: {
                class: 'list-item'
            }
        },
        orderedList: {
            HTMLAttributes: {
                class: 'list-item'
            }
        }
    }), Link.configure({
        linkOnPaste: true,
        openOnClick: true,
        HTMLAttributes: {
            class: 'link'
        }
    }), Image],
    autofocus: true,
    onUpdate() {
        emits('update:modelValue', editor.value?.getHTML())
    }

});
onMounted(() => {
    editor.value?.commands.setContent(props.modelValue)
})

const createLink = () => {
    // const regex = new RegExp('/https?:\/\/([A-Z]*.)*\/+\-[A-Z]*/gi')
    const regex = new RegExp("https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)")
    const url = String(prompt('URL'))
    // if (url != null && regex.test(url)) {
    editor.value?.chain().focus().setLink({ href: url }).run()
    // } else {
    // alert('Please input a valid url: https://*')
    // }
}

const addImage = () => {
    try {

        if (imageInput.value?.files) {
            const file = imageInput.value?.files[0]
            const fileName = file.name.replaceAll(' ', '_')
            uploadBytes(storageRef(storage, `newsAssets/${fileName}`), file).then(snapshot => {
                getDownloadURL(snapshot.ref).then(url => {
                    editor.value?.chain().focus().setImage({ src: url }).run()
                    editor.value?.commands.createParagraphNear()
                })
            })

        }
    } catch (e) {
        console.error(e)
    }

}
</script>

<style lang="scss">
.tippy {
    .tiptap.ProseMirror-focused {
        border: 1px solid transparent;
        outline: none;

        @apply pb-3;

        &>p {
            @apply mb-3;
        }
    }

    ul {
        @apply list-disc;
    }

    h1.heading {
        @apply text-3xl font-bold
    }

    h2.heading {
        @apply text-xl font-semibold;
    }

    ul {
        @apply mb-4;

        &.list-item li {
            @apply list-disc ms-6;
        }
    }

    ol {
        @apply mb-4;

        &.list-item li {
            @apply list-decimal ms-6;
        }
    }

    blockquote {
        @apply ms-4 border-l-2 border-l-primary py-1 px-2;
    }

    .is-active {
        @apply text-white bg-primary;
    }

    a {
        @apply text-primary underline;
    }
}
</style>