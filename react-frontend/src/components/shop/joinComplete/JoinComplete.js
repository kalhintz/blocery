import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';

import Style from '../buy/Buy.module.scss'
import { ShopXButtonNav } from '../../common'
import ComUtil from '../../../util/ComUtil'
import { Webview } from "../../../lib/webviewApi";

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { autoLoginCheckAndTry } from '~/lib/loginApi'

export default class JoinComplete extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // 공통
            name: '',
            email: '',
            // 생산자만
            farmName: '',
            coRegistrationNo: ''
        }
    }

    componentDidMount() {
        this.notify('블록체인 계정이 생성되었습니다.', toast.success)
        const param = ComUtil.getParams(this.props)
        console.log(param)
        this.setState({
            name: param.name,
            email: param.email,
            farmName: param.farmName,
            coRegistrationNo: param.coRegistrationNo
        })
        autoLoginCheckAndTry(true); //처음 가입시 자동로그인 추가.
    }

    // 확인 클릭시 팝업 닫힘
    onConfirmClick = () => {
        Webview.closePopupAndMovePage('/home/1');
    }

    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 10000
        })
    }

    render() {
        console.log(this.state.farmName)
        return (
            <Fragment>
                <ShopXButtonNav home>회원가입 완료</ShopXButtonNav>
                <Container>
                    {/* 회원가입 완료 메세지 */}
                    <Row>
                        <Col xs={'12'} className={'lead text-center pt-4 pb-4'}> 회원가입이 <span className={'text-info'}>완료</span> 되었습니다.<br/>감사합니다. </Col>
                    </Row>
                    <hr/>
                    <Row>
                        <Col xs={'1'}/>
                        <Col xs={'4'} className={Style.textSmallL}> 이름 </Col>
                        <Col xs={'7'} className={Style.textBoldS}> {this.state.name} </Col>
                    </Row>
                    <br/>
                    <Row>
                        <Col xs={'1'}/>
                        <Col xs={'4'} className={Style.textSmallL}> 이메일 </Col>
                        <Col xs={'7'} className={Style.textBoldS}> {this.state.email} </Col>
                    </Row>
                    {
                        this.state.farmName === undefined || this.state.farmName == '' ?
                            ''
                            :
                            <span>
                                <Row>
                                    <Col xs={'1'}/>
                                    <Col xs={'4'} className={Style.textSmallL}> 업체명 </Col>
                                    <Col xs={'7'} className={Style.textBoldS}> {this.state.farmName} </Col>
                                </Row>
                                <br/>
                                <Row>
                                    <Col xs={'1'}/>
                                    <Col xs={'4'} className={Style.textSmallL}> 사업자등록번호 </Col>
                                    <Col xs={'7'} className={Style.textBoldS}> {this.state.coRegistrationNo} </Col>
                                </Row>
                            </span>
                    }
                    <hr/>
                    <Row>
                        <Col className={'text-dark text-center pt-4 pb-4'}>정보의 확인 및 수정은<br/> 마이페이지에서 가능합니다.</Col>
                    </Row>
                    <Row>
                        <Col>
                            <Button color='info' block onClick={this.onConfirmClick}> 확인 </Button>
                        </Col>
                    </Row>
                </Container>

                <ToastContainer/>
            </Fragment>
        )
    }

}