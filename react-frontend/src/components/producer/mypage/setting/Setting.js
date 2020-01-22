import React, { Component, Fragment } from 'react'
import { Modal, ModalBody, ModalFooter, Button } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common/index'
import Switch from 'react-switch'

import { getProducer, updateProducerPush } from '~/lib/producerApi'

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Webview } from "~/lib/webviewApi";

export default class Setting extends Component {
    constructor(props){
        super(props)
        this.state={
            isChecked: false,
            modal: false,
            loginUser: ''
        }
    }

    async componentDidMount() {
        const loginUser = await getProducer()

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            isChecked: loginUser.data.receivePush
        })
    }

    handleChange = () => {
        this.setState({
            isChecked: !this.state.isChecked
        })

        this.modalChange();
    }

    modalChange = () => {
        if(this.state.isChecked) {
            this.setState({
                modal: true
            })
        } else {
            this.changeTrue();
        }
    }

    // 알림설정 false->true 변경한 경우
    changeTrue = async () => {
        let data = {};
        data.producerNo = this.state.loginUser.producerNo;
        data.name = this.state.loginUser.name;
        data.receivePush = true;

        const modified = await updateProducerPush(data)

        if(modified.data === 1) {
            this.setState({ modal: false })
            alert('알림 설정 수신 동의 처리완료되었습니다.')
        } else {
            alert('수신 동의 실패. 다시 시도해주세요.');
            return false;
        }
    }

    // 알림 유지 클릭시 모달닫고 설정true 유지
    stayNoti = () => {
        this.setState(prevState => ({
            modal: !prevState.modal,
            isChecked: true
        }));
    }

    // 알림 해제 클릭시 receivePush=false 로 변경
    cancelNoti = async () => {
        let data = {};

        data.producerNo = this.state.loginUser.producerNo;
        data.name = this.state.loginUser.name;
        data.receivePush = false;

        const modified = await updateProducerPush(data)

        if(modified.data === 1) {
            this.setState({ modal: false })
            alert('알림 설정 수신 동의가 해제되었습니다. 마이페이지에서 재설정하실 수 있습니다.')
        } else {
            alert('수신 동의 해제 실패. 다시 시도해주세요.');
            return false;
        }
    }

    render() {
        return(
            <Fragment>
                <ShopXButtonNav history={this.props.history}>설정</ShopXButtonNav>
                <br/>
                <div className='p-2 font-weight-bold'>알림</div>
                <hr className='p-0 m-0'/>
                <div className='d-flex'>
                    <div className='flex-grow-1 p-2'>알림설정</div>
                    {/*<div className={'text-right d-flex text-danger'}>*/}
                    <div className='mt-2'>
                        {/*<div className='p-2'>ON</div>*/}
                        {/*<div className='p-2'><FontAwesomeIcon icon={faAngleRight} /></div>*/}
                        <Switch checked={this.state.isChecked} onChange={this.handleChange}></Switch>
                    </div>
                </div>
                <hr className='p-0 m-0'/>
                <br/>

                <div className='p-2 font-weight-bold'>정보</div>
                <hr className='p-0 m-0'/>
                {/*<div className='d-flex' onClick={this.getTerms}>*/}
                    {/*<div className='flex-grow-1 p-2'>이용약관</div>*/}
                    {/*<div className={'text-right d-flex p-2'}>*/}
                        {/*<FontAwesomeIcon icon={faAngleRight} />*/}
                    {/*</div>*/}
                {/*</div>*/}
                {/*<hr className='p-0 m-0'/>*/}
                <div className='d-flex'>
                    <div className='flex-grow-1 p-2'>버전정보</div>
                    <div className={'text-right d-flex p-2'}>Beta</div>
                </div>
                <hr className='p-0 m-0'/>

                <Modal isOpen={this.state.modal} centered>
                    <ModalBody className='text-center'>알림 수신 동의 해제 시 <br/> 주요 소식 및 혜택을 받아 보실 수 없습니다.<br/><br/>
                        <span className='text-secondary text-center'>알림 받기를 유지하시겠습니까?</span>
                    </ModalBody>
                    <ModalFooter>
                        <Button block outline size='sm' color='info' className='m-1' onClick={this.stayNoti}>알림 유지</Button>
                        <Button block outline size='sm' color='secondary' className='m-1' onClick={this.cancelNoti}>알림 해제</Button>
                    </ModalFooter>
                </Modal>
            </Fragment>

        )
    }
}