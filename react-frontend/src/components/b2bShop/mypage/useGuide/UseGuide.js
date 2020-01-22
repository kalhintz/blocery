import React, { Component, Fragment } from 'react'
import { Container, Button, Card, CardText, CardBody, CardTitle, Row, Col } from 'reactstrap'
import { B2bShopXButtonNav } from '~/components/common'

import { faHandshake, faShippingFast, faTruck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class UseGuide extends Component {
    constructor(props){
        super(props);
        this.state = {
        }
    }

    componentDidMount() {
        window.scrollTo(0,0)
    }

    // 1:1문의 이동
    moveToBuyerCenter = () => {
        this.props.history.push('/b2b/mypage/buyerCenter');
    }

    render(){
        return (
            <Fragment>
                <B2bShopXButtonNav history={this.props.history} fixed historyBack>이용안내</B2bShopXButtonNav>
                <Container className={'pt-3 pb-3'}>
                    <Row>
                        <Col xs={12} sm={12} md={6} className='p-0'>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faShippingFast} size={'lg'} />직배송</span></CardTitle>
                                    <CardText>
                                        나이스푸드는 식자재 전문쇼핑몰로 식당과 식자재업체를 직접 연결하여 업체가 설정한 지역 식당에서 주문 시 직배송이 가능합니다.<br/><br/>
                                        상품 주문 시 배송되는 지역인지를 체크하여 구매해 주시기 바랍니다 :)
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faTruck} size={'lg'} />택배배송</span></CardTitle>
                                    <CardText>
                                        나이스푸드는 상품에 따라 전국으로 배송 가능한 택배 배송을 제공합니다.<br/><br/>
                                        직배송과 유사하게 구매 금액 또는 구매 수량에 따라 무료로 배송 받으실 수 있으니 많은 구매 바랍니다 :)
                                    </CardText>
                                </Card>
                            </Col>
                        </Col>
                        <Col sm={12} md={6} className='p-0'>
                            <Col sm={12} className={'mb-3'}>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'><FontAwesomeIcon className='mr-2' icon={faHandshake} size={'lg'} />외상거래</span></CardTitle>
                                    <CardText>
                                        나이스푸드는 온라인 식자재몰 최초로 외상거래 기능을 제공합니다.<br/>
                                        업체가 설정한 외상 거래 유무에 따라 외상구매가 가능합니다.<br/>
                                        외상 조건 확인 후 편하게 구매하세요!<br/><br/>
                                        구매하신 상품에 이상이 있거나 궁금한 사항이 있으시면 언제든 1:1문의 게시판에 문의해주세요.<br/>
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <div>* 상세한 이용안내가 필요하시다면 </div>
                                <div>
                                    <Button color='link' size='sm' onClick={this.moveToBuyerCenter}>자주하는 질문 ></Button>
                                </div>

                            </Col>
                            <Col sm={12} className={'mb-3'}>
                                <div>* 추가적인 문의사항이 있으시면 </div>
                                <div>
                                    <Button color='link' size='sm' onClick={this.moveToBuyerCenter}>1:1문의 ></Button>
                                </div>
                            </Col>
                        </Col>
                    </Row>
                </Container>

            </Fragment>
        )
    }

}