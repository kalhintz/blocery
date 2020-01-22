import React, { Fragment, Component } from 'react';
import { Col, Button, Form, FormGroup, Label, Input, Container, InputGroup, Table, Badge, Row, Fade, Modal, ModalBody, ModalFooter, ModalHeader } from 'reactstrap'
import { Server } from '../../../Properties';
import { getConsumerByConsumerNo, updateConsumerInfo } from "../../../../lib/shopApi";
import ComUtil from "../../../../util/ComUtil"

import axios from 'axios'
import { ShopXButtonNav } from '../../../common/index'

import { faUserAlt, faEnvelope, faMobileAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { smsSend, smsConfirm } from '~/lib/smsApi'

const style = {
    cell: {
        padding: 0,
        margin: 0
    }
}
export default class ModifyConsumerInfo extends Component {

    constructor(props){
        super(props)
        this.state = {
            consumerNo: 0,
            email: '',
            valword: '',
            name: '',
            //nickname: '',
            phone: '',
            addr: '',
            addrDetail: '',
            zipNo: '',
            modal: false,            // 주소검색 팝업 모달
            totalCount: '',
            results: [],
            updateAddress: false,

            fadeSmsCheck: false,
            smsCheckOk: false, //전번 변경시 true가 되어야 통과
        }
    }

    componentDidMount() {
        const params = new URLSearchParams(this.props.location.search)
        const consumerNo = params.get('consumerNo')

        this.search(consumerNo);
    }

    search = async (consumerNo) => {
        const consumerInfo = await getConsumerByConsumerNo(consumerNo)

        this.setState({
            consumerNo: consumerNo,
            email: consumerInfo.data.email,
            valword: consumerInfo.data.valword,
            name: consumerInfo.data.name,
            //nickname: consumerInfo.data.nickname,
            phone: consumerInfo.data.phone,
            zipNo: consumerInfo.data.zipNo,
            addr: consumerInfo.data.addr,
            addrDetail: consumerInfo.data.addrDetail,
        })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 저장버튼 클릭
    onModifyClick = async () => {
        let data = {};
        data.consumerNo = this.state.consumerNo;
        data.name = this.state.name;
        //data.nickname = this.state.nickname;
        data.phone = this.state.phone;
        data.addr = this.state.addr;
        data.addrDetail = this.state.addrDetail;
        data.zipNo = this.state.zipNo;

        data.oldPhone = this.state.oldPhone;//인증을 위해 추가.

        if (data.oldPhone !== data.phone) {
            console.log('폰번호 변경됨.') //인증 필요..

            if (!this.state.smsCheckOk) {
                alert('휴대전화 본인인증을 수행해 주세요')
                return false;
            }

        }

        const modified = await updateConsumerInfo(data)

        if(modified.data === 1) {
            alert('회원정보 수정이 완료되었습니다.')
            this.props.history.push('/myPage');
        } else {
            alert('회원정보 수정 실패. 다시 시도해주세요.')
            return false;
        }

    }

    // 전화번호 정규식 체크
    checkPhoneRegex = (e) => {
        const phone = ComUtil.phoneRegexChange(e.target.value)
        this.setState({ phone: phone })
    }


    onSmsSend = () => {
        if (!this.state.phone || this.state.phone.length < 11){
            alert('휴대폰 번호를 확인해 주세요')
        }
        else {
            smsSend('consumer', this.state.phone);
            alert(this.state.phone + ' 번호로 인증번호를 전송 중입니다.')
        }
    }

    // * @return 200 - 확인 OK  (확인성공시 db)
    //           100 - 확인 실패
    //           400 - 확인 3번연속 실패 -삭제 되었으니 다시 인증해 주세요
    onSmsConfirm = async () => {

        let {data:confirmCode} = await smsConfirm(this.state.phone, this.state.code);

        if (confirmCode == 200) { //같으면 성공. state: false
            alert(' 인증코드 확인완료')
            this.setState({
                fadeSmsCheck: false,
                smsCheckOk: true
            });
        } else if (confirmCode == 100) {
            alert(' 인증코드가 일치하지 않습니다. 다시 확인해 주세요')
            this.setState({
                fadeSmsCheck: true
            });
        }
        else if (confirmCode == 400) {
            alert(' 인증코드가 만료되었습니다. 인증번호 받기를 다시 해주세요')
            this.setState({
                code:'',
                fadeSmsCheck: true
            });
        }
    }

    onWithdraw = () => {
        alert('info@blocery.io로 탈퇴 신청을 해주세요.')
    }

    render() {
        return (
            <Fragment>
                <ShopXButtonNav history={this.props.history} historyBack>개인정보 수정</ShopXButtonNav>
                <Container fluid>
                    <p></p>
                    <div>
                        <Label>기본정보</Label>
                        <div className={'d-flex'}>
                            <div className={'d-flex justify-content-center align-items-center'}><FontAwesomeIcon className={'mr-2'} icon={faEnvelope} /></div>
                            <Input name="email" value={this.state.email} placeholder="아이디(이메일)" disabled />
                        </div>
                        <br/>
                        <div className={'d-flex'}>
                            <div className={'d-flex justify-content-center align-items-center'}><FontAwesomeIcon className={'mr-2'} icon={faUserAlt} /></div>
                            <Input name="name" placeholder="이름" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        <br/>
                        <div className={'d-flex'}>
                            <div className={'d-flex justify-content-center align-items-center'}><FontAwesomeIcon className={'mr-2'} icon={faMobileAlt} /></div>
                            <Input name="phone" value={this.state.phone} placeholder="전화번호 입력('-'제외)" onChange={this.handleChange} onBlur={this.checkPhoneRegex}></Input>
                            <Button outline size={'sm'} style={{width:'180px'}} onClick={this.onSmsSend} >인증번호 받기</Button>
                        </div>
                        <br/>
                        <div className={'d-flex'}>
                            <div className={'d-flex justify-content-center align-items-center'}><FontAwesomeIcon className={'mr-2'} icon={faMobileAlt} /></div>
                            <Input name="code" value={this.state.code} placeholder="인증번호 입력" onChange={this.handleChange} />
                            <Button outline size={'sm'} style={{width:'180px'}}  onClick={this.onSmsConfirm} >인증번호 확인</Button>
                        </div>
                        {
                            this.state.fadeSmsCheck && <Fade in className={'text-danger'}>휴대전화 본인인증이 일치하지 않습니다.</Fade>
                        }
                    </div>
                    <br/>
                    <hr />
                    <div className={'text-right text-secondary'} onClick={this.onWithdraw}>
                        탈퇴 신청 >
                    </div>
                    <br />
                    <Button block color={'info'} onClick={this.onModifyClick}>확인</Button>
                </Container>
            </Fragment>
        )
    }
}