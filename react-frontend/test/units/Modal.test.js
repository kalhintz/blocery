import React from 'react'
import { create } from 'react-test-renderer'
import { ModalWithNav } from '../../src/components/common/index'
import ComUtil from '../../src/util/ComUtil';


//test 별 구체적으로 나뉨
describe("ModalWithNav event test", () => {
    let isOnLoaded = false;
    let isOnClosed = false;
    let component;
    let instance;
    beforeEach(() => {
        const onLoad = () => {isOnLoaded = true}
        const onClose = () => {isOnClosed = true}
        class Content extends React.Component {
            constructor(props){
                super(props)
            }
            componentDidMount(){
                this.props.onLoad()//모달과 연결되어있는 onLoad 실행
            }
            render(){
                return <div>Modal content</div>
            }
        }
        component = create(<ModalWithNav show onClose={onClose} onLoad={onLoad}><Content/></ModalWithNav>)
        instance = component.getInstance();
    })

    test("onLoad callback when componentDidMount", () => {
        expect(isOnLoaded).toBe(true);        //onLoad 여부
    })
    test("onClose callback when XButton is clicked", () => {
        const event = {stopPropagation: function(){}}
        instance.onCancel(event);
        expect(isOnClosed).toBe(true);       //onClose 여부
    })

    //간단한 나열
    // test("ModalWithNav onClose & onLoad test", () => {
    // class Content extends React.Component {
    //     constructor(props){
    //         super(props)
    //     }
    //     componentDidMount(){
    //         this.props.onLoad()//모달과 연결되어있는 onLoad 실행
    //     }
    //     render(){
    //         return <div>Modal content</div>
    //     }
    // }
    //     let isOnLoaded = false;
    //     let isOnClosed = false;
    //     const onLoad = () => {isOnLoaded = true}
    //     const onClose = () => {isOnClosed = true}
    //     const component = create(<ModalWithNav show onClose={onClose} onLoad={onLoad}><Content/></ModalWithNav>)
    //
    //     expect(isOnLoaded).toBe(true);        //onLoad 여부
    //
    //
    //     const instance = component.getInstance();
    //     const event = {
    //         stopPropagation: function(){}
    //     }
    //     instance.onCancel(event);
    //     expect(isOnClosed).toBe(true);       //onClose 여부
    //
    // })
})

