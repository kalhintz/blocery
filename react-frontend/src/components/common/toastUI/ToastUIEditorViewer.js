import React from 'react';
import '@toast-ui/editor/dist/toastui-editor-viewer.css';
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer';
import Css from './ToastUIEditorViewer.module.scss'
import DOMPurify from 'dompurify';
// Step 1: Define the user plugin function
//``` youtbe
//GveTAk727mM
//```
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

export default class ToastUIEditorViewer extends React.Component {
    rootEl = React.createRef();

    viewerInst = null;

    getRootElement() {
        return this.rootEl.current;
    }

    getInstance() {
        return this.viewerInst;
    }

    bindEventHandlers(props, prevProps) {
        Object.keys(this.props)
            .filter((key) => /on[A-Z][a-zA-Z]+/.test(key))
            .forEach((key) => {
                const eventName = key[2].toLowerCase() + key.slice(3);
                // For <Viewer onFocus={condition ? onFocus1 : onFocus2} />
                if(prevProps && prevProps[key] !== props[key]) {
                    this.viewerInst.off(eventName);
                }
                this.viewerInst.on(eventName, props[key]);
            });
    }

    componentDidMount() {
        this.viewerInst = new Viewer({
            el: this.rootEl.current,
            ...this.props,
            customHTMLSanitizer: (html) => {
                const config = { ADD_TAGS: ["iframe"]};
                return DOMPurify.sanitize(html,config);
            },
            plugins: [
                [
                    videoPlugin,
                    {
                        list: {
                            youku: 'http://player.youku.com/embed/',
                            bilibili: 'http://player.bilibili.com/player.html?aid=',
                            qq: 'https://v.qq.com/txp/iframe/player.html?vid=',
                            youtube: 'https://www.youtube.com/embed/',
                        },
                    },
                ],
            ],
        });

        this.bindEventHandlers(this.props);
    }

    shouldComponentUpdate(nextProps) {
        const currentValue = this.props.initialValue;
        const nextValue = nextProps.initialValue;

        if (currentValue !== nextValue) {
            this.getInstance().setValue(nextValue);
        }

        this.bindEventHandlers(nextProps, this.props);

        return false;
    }

    render() {
        return <div className={Css.wrap} ref={this.rootEl} />;
    }
}