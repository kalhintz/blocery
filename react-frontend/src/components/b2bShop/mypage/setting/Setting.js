import React, { Component, Fragment } from 'react'
import { Container, Button, Row, Col, Label, Input, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { B2bShopXButtonNav, ModalConfirm } from '~/components/common/index'
import Switch from "react-switch";

import { getBuyer, updateBuyerInfo } from '~/lib/b2bShopApi'

import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Webview } from "~/lib/webviewApi";

export default class Setting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isChecked: false,
            modal: false,
            loginUser: ''
        }
    }

    async componentDidMount() {
        const loginUser = await getBuyer()

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

    // 이용약관
    getTerms = () => {
        this.props.history.push(`/b2b/mypage/termsOfUse`, true)
    }

    // 개인정보취급방침
    getPrivacyPolicy = () => {
        this.props.history.push('/b2b/mypage/privacyPolicy', true)
    }

    // 알림설정이 false->true 변경한 경우
    changeTrue = async () => {
        let data = {};

        data.buyerNo = this.state.loginUser.buyerNo;
        data.phone = this.state.loginUser.phone;
        data.name = this.state.loginUser.name;
        data.receivePush = true;

        const modified = await updateBuyerInfo(data)

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

        data.buyerNo = this.state.loginUser.buyerNo;
        data.phone = this.state.loginUser.phone;
        data.name = this.state.loginUser.name;
        data.receivePush = false;

        const modified = await updateBuyerInfo(data)

        if(modified.data === 1) {
            this.setState({ modal: false })
            alert('알림 설정 수신 동의가 해제되었습니다. 마이페이지에서 재설정하실 수 있습니다.')
        } else {
            alert('수신 동의 해제 실패. 다시 시도해주세요.');
            return false;
        }
    }

    render() {
        return (
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} forceBackUrl={'/b2b/mypage'}>설정</B2bShopXButtonNav>
                <br/>
                <div className='p-3 font-weight-bold'>알림</div>
                <hr className='p-0 m-0'/>
                <div className='d-flex p-3'>
                    <div className='flex-grow-1 mt-2'>알림설정</div>
                    {/*<div className={'text-right d-flex text-danger'}>*/}
                    <div className='mt-2'>
                        <Switch checked={this.state.isChecked} onChange={this.handleChange}></Switch>
                    </div>
                </div>
                <hr className='p-0 m-0'/>
                <br/>

                <div className='p-3 font-weight-bold'>정보</div>
                <hr className='p-0 m-0'/>
                <div className='d-flex p-3' onClick={this.getTerms}>
                    <div className='flex-grow-1'>이용약관</div>
                    <div className={'text-right d-flex'}>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </div>
                </div>
                <hr className='p-0 m-0'/>
                <div className='d-flex p-3' onClick={this.getPrivacyPolicy}>
                    <div className='flex-grow-1'>개인정보처리방침</div>
                    <div className={'text-right d-flex'}>
                        <FontAwesomeIcon icon={faAngleRight} />
                    </div>
                </div>
                <hr className='p-0 m-0'/>
                <div className='d-flex p-3'>
                    <div className='flex-grow-1'>버전정보</div>
                    <div className={'text-right d-flex'}>Beta</div>
                </div>
                <hr className='p-0 m-0'/>

                <Modal isOpen={this.state.modal} centered>
                    <ModalBody className='text-center'>알림 수신 동의 해제 시 <br/> 주요 소식 및 혜택을 받아 보실 수 없습니다.<br/><br/>
                        <span className='text-secondary text-center'>알림 받기를 유지하시겠습니까?</span>
                    </ModalBody>
                    <ModalFooter>
                        <Button block outline size='sm' color='primary' className='m-1' onClick={this.stayNoti}>알림 유지</Button>
                        <Button block outline size='sm' color='secondary' className='m-1' onClick={this.cancelNoti}>알림 해제</Button>
                    </ModalFooter>
                </Modal>

            </Fragment>

        )
    }


}