import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button, Badge, Alert } from 'reactstrap'
import Style from './WebGoodsReg.module.scss'
import { getLoginUser } from '~/lib/loginApi'
import { faClock, faBolt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { WebGoodsReg, WebDirectGoodsReg } from '~/components/producer'

import { BlocerySpinner, Spinner, BlockChainSpinner, ModalWithNav, ToastUIEditorViewer, PassPhrase } from '~/components/common'

let bindData = {
    cultivationNm: [],//재배방법
    pesticideYn: null,  //농약유무
    items: [],         //품목
    itemKinds: [],      //품종
    packUnit: null,     //포장단위
    priceSteps: [],      //상품 할인단계
    termsOfDeliveryFees: [],      //배송비 조건 정책
    goodsTypes: []
}

export default class WebGoodsSelection extends Component {
    constructor(props) {
        super(props);
        const { goodsNo } = this.props

        this.state = {
            goodsType : 'directGoods'     // 상품종류:즉시상품이 기본값
        }
    }

    async componentDidMount(){
        const loginUser = await this.setLoginUserInfo();

        const state = Object.assign({}, this.state)
        state.isDidMounted = true
        state.loginUser = loginUser
        // state.bindData = bindData

        this.setState(state)

    }

    setLoginUserInfo = async() => {
        return await getLoginUser();
    }

    // 등록할 상품 유형
    onGoodsPopupClick = (e) => {
        console.log(e)
        if(e === 'reservedGoods') {
            this.setState({ goodsType: 'reservedGoods'})
        } else {
            this.setState({ goodsType: 'directGoods' })
        }
    }

    render() {
        if(!this.state.isDidMounted) return <BlocerySpinner/>

        const { goods } = this.state

        const star = <span className='text-danger'>*</span>

        const termsOfDeliveryFee = bindData.termsOfDeliveryFees.find(terms => terms.value === goods.termsOfDeliveryFee)
        let termsOfDeliveryFeeLabel
        if(termsOfDeliveryFee)
            termsOfDeliveryFeeLabel = termsOfDeliveryFee.label
        return(
            <Fragment>
                {/*{*/}
                    {/*this.props.goodsNo || this.props.goodsNo === 0 ?  null : <div className='f1'>상품등록</div>*/}
                {/*}*/}
                {/*<br/>*/}
                <div className={Style.wrap}>
                    {
                        this.state.chainLoading && <BlockChainSpinner/>
                    }
                    <Container fluid>
                        <Row>
                            <Col className='p-0'>

                                {
                                    this.state.validationCnt > 0 && (
                                        <div className={Style.badge}>
                                            <Badge color="danger" pill>필수{this.state.validationCnt}</Badge>
                                        </div>
                                    )
                                }
                                <Container>
                                    <Row>
                                        <Col className='pt-2'>
                                            <Alert color={'secondary'} className='small'>아래 항목 입력 후 먼저 저장을 해주세요.[임시저장]<br/>
                                                확인(판매개시) 버튼 클릭 시 상품 판매가 시작됩니다<br/>[필수{star}] 항목을 모두 입력해야 노출 가능합니다
                                            </Alert>
                                        </Col>
                                    </Row>

                                    <h6>판매상품의 종류를 선택해 주세요.</h6>
                                    <Row className='border pt-3 mb-3'>
                                        <Col xs={6}>
                                            <Button className={'mb-2'} color={'warning'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'directGoods')}><FontAwesomeIcon icon={faBolt}/> 즉시 상품</Button>
                                            <div className={'small text-center text-secondary f6'}>
                                                <div className={'mb-2'}>
                                                    - 상품이 판매가 되면  <b className={'text-warning'}>즉시 발송하는 상품</b>으로 소비자와 판매가를 입력할 수 있습니다.
                                                </div>
                                                <div>
                                                    - 미리 가공된 상품 등 <b className={'text-warning'}>바로 발송이 가능한 경우</b> 선택해 주세요.
                                                </div>
                                                <br/>
                                            </div>
                                        </Col>
                                        <Col xs={6}>
                                            <Button className={'mb-2'} color={'info'} size={'lg'} block onClick={this.onGoodsPopupClick.bind(this, 'reservedGoods')}><FontAwesomeIcon icon={faClock}/> 예약 상품</Button>
                                            <div className={'small text-center text-secondary f6'}>
                                                <div className={'mb-2'}>
                                                    - 채소 등과 같이 <b className={'text-info'}>재배기간 동안 주문을 받고 수확/출하 후 일괄 발송하는 상품</b>입니다.
                                                </div>
                                                <div>
                                                    - 판매기간 동안 <b className={'text-info'}>단계별 할인가</b>를 적용할 수 있습니다.
                                                </div>
                                            </div>
                                        </Col>

                                    </Row>
                                </Container>
                            </Col>
                        </Row>
                    </Container>

                    <Container>
                        {
                            this.state.goodsType === 'reservedGoods' ? <WebGoodsReg /> : <WebDirectGoodsReg />
                        }
                    </Container>
                </div>

            </Fragment>
        )
    }
}