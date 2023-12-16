<template>
  <div class="wangEditor-container full-screen-container">
    <Toolbar
      style="border-bottom: 1px solid #ccc"
      :editor="editor"
      :default-config="toolbarConfig"
      :mode="mode"
    />
    <Editor
      v-model="html"
      style="height: 500px; overflow-y: hidden;"
      :default-config="editorConfig"
      :mode="mode"
      @onCreated="onCreated"
      @onChange="onChange"
    />
  </div>
</template>
<style src="@wangeditor/editor/dist/css/style.css"></style>
<script>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'



export default {
  name: 'WangEditor',
  components: { Editor, Toolbar },
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      editor: null,
      html: this.value,
      toolbarConfig: {
        // 去掉不要的工具
        excludeKeys: [
          'emotion',
          'group-video'
        ]
      },
      editorConfig: {
        placeholder: '请输入内容...',
        autoFocus: false,
        MENU_CONF: { // 菜单配置
          uploadImage: {
            // 自定义上传图片
            customUpload: this.uploadImg
          }
        }
      },
      mode: 'default' // or 'simple'
    }
  },
  watch: {
    value(val) {
      this.html = val
    }
  },
  beforeDestroy() {
    const editor = this.editor
    if (editor == null) return
    editor.destroy() // 组件销毁时，及时销毁编辑器
  },
  methods: {
    onCreated(editor) {
      this.editor = Object.seal(editor) // 一定要用 Object.seal() ，否则会报错
    },

    onChange(editor) {
      this.$emit('input', editor.getHtml())
    },

    /**
     * 上传图片
     * @param {File} file 选择的文件
     * @param {Funciont} insertFn 插入到编辑器的方法
     */
    // uploadImg(file, insertFn) {
    //   var data = { key: 'file', value: file }
    //   uploadFileAndData('post', '/admin/merchant/uploadImg', data).then(response => {
    //     insertFn(response.data)
    //   }).catch(err => {
    //     this.$vmsg.error(err)
    //   })
    // }
  }
}
</script>
<style lang="scss" scoped>
.wangEditor-container {
  border: 1px solid #c0c4cc;
}
</style>
<style>
.full-screen-container {
  z-index: 100; /* 如有需要，可以自定义 z-index */
}
</style>
