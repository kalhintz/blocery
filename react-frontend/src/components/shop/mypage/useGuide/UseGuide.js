import React, { Component, Fragment } from 'react'
import { Container, Button, Card, CardText, CardBody, CardTitle, Row, Col } from 'reactstrap'
import { ShopXButtonNav } from '~/components/common'

import { faClock, faBolt, faCoins, faShoppingCart, faBoxOpen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { setMissionClear } from "~/lib/eventApi"

export default class UseGuide extends Component {
    constructor(props){
        super(props);
        this.state = {

        }
    }

    componentDidMount() {
        window.scrollTo(0,0)
        setMissionClear(9).then( (response) => console.log('UserGuide:missionEvent9:' + response.data )); //이용안내 출력..
    }
    // 1:1문의 이동
    moveToConsumerCenter = () => {
        this.props.history.push('/mypage/consumerCenter')
    }

    render(){
        return (
            <Fragment>
                <ShopXButtonNav history={this.props.history} fixed historyBack>이용안내</ShopXButtonNav>
                <Container className={'pt-3 pb-3'}>
                    <Row>
                        <Col xs={12} sm={12} md={6} className='p-0'>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faClock} size={'lg'} />예약상품</span></CardTitle>
                                    <CardText>
                                        마켓블리는 미리 구매하면 할인 받는 예약상품을 판매하고 있습니다.<br/>
                                        예약상품을 구매하면 판매자가 설정한 배송기간에 상품을 받아보실 수 있습니다.<br/>
                                        예약상품 구매 시 추가적립금 혜택을 받으실 수 있으니 많은 구매 바랍니다  :)
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faBolt} size={'lg'} />즉시상품</span></CardTitle>
                                    <CardText>
                                        마켓블리는 예약상품 뿐만 아니라 일반 쇼핑몰에서 판매하는 즉시상품도 제공하고 있습니다.<br/>
                                        즉시상품을 구매하면 바로 상품을 받아보실 수 있습니다.
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faShoppingCart} size={'lg'} />주문/결제</span></CardTitle>
                                    <CardText>
                                        마켓블리는 블록체인 기반 농식품 거래 서비스로 신용카드 결제와 BLCT 암호화폐 결제를 선택할 수 있습니다.<br/>
                                        구매 및 후기 작성에 따라 BLCT를 적립금으로 받으실 수 있습니다.
                                    </CardText>
                                </Card>
                            </Col>
                        </Col>
                        <Col sm={12} md={6} className='p-0'>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faCoins} size={'lg'} />배송/지연 보상제도</span></CardTitle>
                                    <CardText>
                                        예약상품은 상품 상세에 기입된 예상배송기간 안에 배송이 시작됩니다.<br/>
                                        마켓블리는 예상배송기간 안에 상품이 발송되지 않으면 보상받을 수 있는 지연보상제도를 운영하고 있습니다.<br/>
                                        배송지연 및 자연재해 등으로 배송하지 못할 경우가 발생하면 자동적으로 보상금이 지급되오니 안심하고 구매하세요!
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faBoxOpen} size={'lg'} />취소/교환/환불</span></CardTitle>
                                    <CardText>
                                        마켓블리는 생산자와의 신뢰거래로 당일 주문 취소를 제외하고 이후 주문 취소 시 취소 수수료가 발생할 수 있습니다.<br/>
                                        단, 즉시 상품은 취소수수료가 발생하지 않습니다.
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <div>* 추가적인 문의사항이 있으시면 </div>
                                <div>
                                    <Button color='link' size='sm' onClick={this.moveToConsumerCenter}>1:1문의 ></Button>
                                </div>

                            </Col>
                        </Col>
                    </Row>
                </Container>

            </Fragment>
        )
    }

}