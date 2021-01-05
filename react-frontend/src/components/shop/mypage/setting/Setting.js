import React, { Component, Fragment } from 'react'
import { Button, Modal, ModalBody, ModalFooter } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common/index'
import Switch from "react-switch";

import { getConsumer, updateConsumerInfo } from '~/lib/shopApi'
import { getServerVersion } from "~/lib/commonApi";

import {FaAngleRight} from 'react-icons/fa'

export default class Setting extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isChecked: false,
            modal: false,
            loginUser: '',
            version: ''
        }
    }

    async componentDidMount() {
        const loginUser = await getConsumer()
        const {data:serverVersion} = await getServerVersion();

        const originVersion = serverVersion.serverVersion;
        const version = originVersion.substring(0, originVersion.length-9);

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            isChecked: loginUser.data.receivePush,
            version: version
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
        this.props.history.push(`/mypage/termsOfUse`, true)
    }

    // 개인정보취급방침
    getPrivacyPolicy = () => {
        this.props.history.push('/mypage/privacyPolicy', true)
    }

    // 알림설정이 false->true 변경한 경우
    changeTrue = async () => {
        let data = {};

        data.consumerNo = this.state.loginUser.consumerNo;
        data.phone = this.state.loginUser.phone;
        data.name = this.state.loginUser.name;
        data.receivePush = true;

        const modified = await updateConsumerInfo(data)

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

        data.consumerNo = this.state.loginUser.consumerNo;
        data.phone = this.state.loginUser.phone;
        data.name = this.state.loginUser.name;
        data.receivePush = false;

        const modified = await updateConsumerInfo(data)

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
                <ShopXButtonNav underline
                                // history={this.props.history}
                                // forceBackUrl={'/mypage'}
                    historyBack
                >설정</ShopXButtonNav>
                <div className='p-3 font-weight-bold'>알림</div>
                <hr className='p-0 m-0'/>
                <div className='d-flex p-3'>
                    <div className='flex-grow-1 mt-2'>알림설정</div>
                    {/*<div className={'text-right d-flex text-danger'}>*/}
                    <div>
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
                        <FaAngleRight />
                    </div>
                </div>
                <hr className='p-0 m-0'/>
                <div className='d-flex p-3' onClick={this.getPrivacyPolicy}>
                    <div className='flex-grow-1'>개인정보처리방침</div>
                    <div className={'text-right d-flex'}>
                        <FaAngleRight />
                    </div>
                </div>
                <hr className='p-0 m-0'/>
                <div className='d-flex p-3'>
                    <div className='flex-grow-1'>버전정보</div>
                    <div className={'text-right d-flex'}>{this.state.version}</div>
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