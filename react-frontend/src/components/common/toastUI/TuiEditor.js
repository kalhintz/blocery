import React, { useState } from 'react'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties'
import DOMPurify from 'dompurify';
import 'codemirror/lib/codemirror.css';
import '@toast-ui/editor/dist/toastui-editor.css';
import 'tui-color-picker/dist/tui-color-picker.css';
import { Editor } from '@toast-ui/react-editor';
import colorSyntax from '@toast-ui/editor-plugin-color-syntax';

const getImageFile = async (file) => {
    return new Promise(async (resolve, reject) => {
        try{

            let compressedFile = file;
            if(file.type !== "image/gif"){
                //압축된 파일
                compressedFile = await ComUtil.getCompressoredFile(file);
            }

            //server 업로드
            const image = await ComUtil.editorUploadFile(compressedFile);

            //console.log({image})

            resolve({
                image: image
            })
        }catch(err){
            console.log(err);
            reject(err);
        }

    })
}

// Step 1: Define the user plugin function
//``` youtbe
//GveTAk727mM
//```
const defaultList = {
    youku: 'http://player.youku.com/embed/',
    bilibili: 'http://player.bilibili.com/player.html?aid=',
    qq: 'https://v.qq.com/txp/iframe/player.html?vid=',
    youtube: 'https://www.youtube.com/embed/',
};
const renderVideo = (wrapperId, sourceId, type, videoMap) => {
    let el = document.querySelector('#' + wrapperId);

    if (type && videoMap[type]) {
        const url = videoMap[type];
        el.innerHTML = `<iframe width="100%" height="315" src="${url}${sourceId}"></iframe>`;
    }
};
const videoPlugin = (editor, options = {}) => {
    const vList = options.list || {};
    const { codeBlockManager } = Object.getPrototypeOf(editor).constructor;
    const videoMap = {
        ...defaultList,
        ...vList,
    };
    Object.keys(videoMap).forEach((type) => {
        codeBlockManager.setReplacer(type, function (sourceId) {
            if (!sourceId) return;
            const wrapperId = type + Math.random().toString(36).substr(2, 10);

            setTimeout(renderVideo.bind(null, wrapperId, sourceId, type, videoMap), 0);
            return `<div id="${wrapperId}"></div>`;
        });
    });
};
class TuiEditor extends React.Component {
    editorRef = React.createRef();
    constructor(props) {
        super(props);
        this.handleChange = this.handleChange.bind(this);
    }

    checkFileSize = (file) => {
        const maxFileSizeMB = this.props.maxFileSizeMB || 10;
        const limitedSize = maxFileSizeMB * 1024;
        const fileSize = file.size / 1024;
        if(fileSize > limitedSize){
            return false;
        }
        return true;
    }

    handleChange = () => {
        if(this.editorRef.current.getInstance()) {
            const value = this.editorRef.current.getInstance().getHtml();
            if(value) {
                this.props.onChange(value);
            }else{
                this.props.onChange("<p></p>");
            }
        }
    }

    onAddImageBlob = async (fileOrBlob, callback) => {

        //파일 사이즈 체크(압축된 파일로)
        const maxFileSizeMB = this.props.maxFileSizeMB || 10;
        const limitedSize = maxFileSizeMB * 1024;
        const fileSize = fileOrBlob.size / 1024;
        if(fileSize > limitedSize){
            alert(`이미지 사이즈가 너무 큽니다(${this.props.maxFileSizeMB || 10}메가 이하로 선택해주세요)`);
            return false;
        }

        //console.log("blob====",fileOrBlob);
        const {image:results} = await getImageFile(fileOrBlob);
        //console.log("imgUrl====",results);

        let v_fileUrlPath = results.fileUrlPath;
        let resfile = Server.getImgTagServerURL() + v_fileUrlPath + results.fileName;

        this.addImgToMd(resfile);
        //callback(resfile);

        return false
    }

    addImgToMd(data) {
        const objEditor = this.editorRef.current.getInstance();
        let editor = objEditor.getCodeMirror();
        let editorHtml = objEditor.getCurrentModeEditor();
        let isMarkdownMode = objEditor.isMarkdownMode();
        //console.log("isMarkdownMode==",isMarkdownMode)
        if (isMarkdownMode) {
            editor.replaceSelection(`![img](${data})`);
            //editor.replaceSelection(`<img src='${data}' alt='img'>`);
        } else {
            let range = editorHtml.getRange();
            let img = document.createElement('img');
            img.src = `${data}`;
            img.alt = "img";
            range.insertNode(img);
        }
    }

    render() {
        return (
            <Editor
                initialValue={this.props.editorHtml||null}
                previewStyle={'vertical'}
                height={this.props.height ? this.props.height:800}
                initialEditType={"wysiwyg"}
                onChange={this.handleChange}
                ref={this.editorRef}
                hooks={{
                      addImageBlobHook: this.onAddImageBlob,
                }}
                toolbarItems={[
                     'heading',
                     'bold',
                     'italic',
                     'strike',
                     'divider',
                     'hr',
                     'quote',
                     'divider',
                     'ul',
                     'ol',
                     'task',
                     'indent',
                     'outdent',
                     'divider',
                     'table',
                     'image',
                     'link',
                     'divider',
                     'code',
                     'codeblock',
                     'divider',
                 ]}
                useCommandShortcut={true}
                usageStatistics={false}
                customHTMLSanitizer={html => {
                    const config = { ADD_TAGS: ["iframe"]};
                    return DOMPurify.sanitize(html,config);
                }}
                plugins={[colorSyntax,videoPlugin]}
                />
        )
    }
}
export default TuiEditor;