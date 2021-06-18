import React, { Component, Fragment } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';

import Style from '../buy/Buy.module.scss'
import { ShopXButtonNav } from '../../common'
import ComUtil from '../../../util/ComUtil'
import { Webview } from "~/lib/webviewApi";
import { Div, Flex, Span } from '~/styledComponents/shared'

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import { autoLoginCheckAndTry } from '~/lib/loginApi'
import { getUsableCouponList } from '~/lib/shopApi'

import { FaTicketAlt } from 'react-icons/fa'

export default class JoinComplete extends Component {
    constructor(props) {
        super(props)
        this.state = {
            // 공통
            name: '',
            email: '',
            // 생산자만
            farmName: '',
            coRegistrationNo: '',
            issuedCoupon: {},        // 발급된 쿠폰 정보
            issuedCouponExtraCount: 0
        }
    }

    componentDidMount() {
        this.notify('블록체인 계정이 생성되었습니다.', toast.success)
        const param = ComUtil.getParams(this.props)
        //console.log(param)
        this.setState({
            name: param.name,
            email: param.email,
            farmName: param.farmName,
            coRegistrationNo: param.coRegistrationNo
        })
        this.issuedCoupon();
        autoLoginCheckAndTry(true); //처음 가입시 자동로그인 추가.
    }

    // 회원가입 후 발급된 쿠폰 확인
    issuedCoupon = async () => {
        const {data: res} = await getUsableCouponList();
        this.setState({
            issuedCoupon: res[0],
            issuedCouponExtraCount: res.length-1  //외 1건 추가.(코박 AAAAA용 스페셜쿠폰 추가)
        })
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

        return (
            <Fragment>
                <ShopXButtonNav isVisibleXButton underline >회원가입 완료</ShopXButtonNav>
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
                    {
                        this.state.email && <Row>
                            <Col xs={'1'}/>
                            <Col xs={'4'} className={Style.textSmallL}> 이메일 </Col>
                            <Col xs={'7'} className={Style.textBoldS}> {this.state.email} </Col>
                        </Row>
                    }
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

                    {
                        this.state.issuedCoupon &&
                            <Div textAlign={'center'} my={20}>
                                <hr/>
                                <Div fontSize={18} my={10}><u>{this.state.issuedCoupon.couponTitle} {(this.state.issuedCouponExtraCount>0)? '외 1건':''}</u> 쿠폰 발급 완료</Div>
                                <Div relative>
                                    {/*<Div absolute center fg={'white'}>{this.state.issuedCoupon.couponBlyAmount} BLY</Div>*/}
                                    {
                                        this.state.issuedCoupon.couponBlyAmount === 0 ?
                                            <Div absolute center fg={'white'}>무료쿠폰</Div> :
                                            <Div absolute center fg={'white'}>{this.state.issuedCoupon.couponBlyAmount} BLY</Div>
                                    }
                                    <Div>
                                        <FaTicketAlt className={'ml-auto text-secondary'} size={130}/>
                                    </Div>
                                </Div>
                                <Div>신규 회원가입 축하 기념 쿠폰이 발급되었습니다.</Div>
                                <Div>해당 쿠폰은 상품 구매시 사용할 수 있습니다.</Div>
                                <Div>마이페이지의 쿠폰 메뉴에서 확인해 주세요!</Div>
                            </Div>
                    }

                    <Div mt={20} mb={50}>
                        <Button color='info' block onClick={this.onConfirmClick}> 확인 </Button>
                    </Div>

                </Container>

                <ToastContainer/>
            </Fragment>
        )
    }

}