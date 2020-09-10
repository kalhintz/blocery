import React, {useState, useEffect} from 'react'
import { Container, Row, Col } from 'reactstrap'
//import Background from '~/images/producer/landscape.jpg'

import { getLoginUserType } from '~/lib/loginApi'
import { getProducer } from '~/lib/producerApi'
import { Webview } from '~/lib/webviewApi'

import OrderDeal from './operStat/OrderDeal';               //오늘 운영 현황 주문건수(건수)
import OrderCancelDeal from './operStat/OrderCancelDeal';   //오늘 운영 현황 취소건수(건수)
import OrderSalesDeal from './operStat/OrderSalesDeal';     //오늘 운영 현황 매출(금액)
import GoodsQnaCnt from './operStat/GoodsQnaCnt';           //오늘 운영 현황 상품문의(건수)
import GoodsReviewCnt from './operStat/GoodsReviewCnt';     //오늘 운영 현황 상품후기(건수)
import RegularShopCnt from './operStat/RegularShopCnt';     //오늘 운영 현황 단골회원(건수)

import OrderPaid from './orderStat/OrderPaid';                  //주문 현황 최근1개월기준 결제완료(건수)
import OrderShipping from './orderStat/OrderShipping';          //주문 현황 최근1개월기준 배송중(건수)
import OrderDeliveryComp from './orderStat/OrderDeliveryComp';  //주문 현황 최근1개월기준 배송완료(건수)
import OrderConfirmOk from './orderStat/OrderConfirmOk';        //주문 현황 최근1개월기준 구매확정(건수)

import OrderSaleTransition from './transition/OrderSaleTransition'; // 주문매출 추이
import ComUtil from '~/util/ComUtil'
import { autoLoginCheckAndTry } from "~/lib/loginApi";

const Home = (props) => {

    //자동 로그인 체크 & 수행.
    autoLoginCheckAndTry();

    useEffect(() => {
        setLoginCheck();

    }, []);

    async function setLoginCheck(){
        //로그인 체크
        const {data: userType} = await getLoginUserType();
        //console.log('userType',userType)
        if(userType == 'consumer') {
            //소비자용 메인페이지로 자동이동.
            Webview.movePage('/home/1');
        } else if (userType == 'producer') {
            let loginUser = await getProducer();
            if(!loginUser){
                Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
            }

            //producer 로그인 성공.
            //19.12.30
            // if (ComUtil.isPcWeb()) { //웹접속일때, 생산자 웹전용 컨솔로 연결..
            //     console.log('=======producer Login - WEB ');
            //
            //     let url = window.location.toString();
            //     if ( url.indexOf('/producer/web') < 0 )
            //         window.location  = '/producer/web';   //producer/web 으로 이동..
            // }

        } else {
            Webview.openPopup('/login?userType=producer', true); // 생산자 로그인 으로 이동팝업
        }
    }

    return(
        <div style={{
            //backgroundImage: `url(${Background})`,
            height: '100vh',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            backgroundSize: 'cover'
        }}>
            <div style={{
                height: '100%',
                width: '100%',
                backgroundColor: 'rgba(255, 255, 255, 0.6)'
            }}>
                <div className='ml-2 mt-2 mr-1 p-1'>

                    {/* 오늘 운영 현황 */}
                    <div className='mb-3'>
                        <h6 className='text-dark'>오늘 운영 현황</h6>
                        <Container fluid>
                            <Row>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 주문건수 */}
                                    <OrderDeal />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 취소건수 */}
                                    <OrderCancelDeal />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 매출 */}
                                    <OrderSalesDeal />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 상품문의 건수 */}
                                    <GoodsQnaCnt />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 상품후기 건수 */}
                                    <GoodsReviewCnt />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 단골회원 건수 */}
                                    <RegularShopCnt />
                                </Col>
                            </Row>
                        </Container>
                    </div>

                    {/* 주문현황 */}
                    <div className='mb-3'>
                        <h6 className='text-dark'>주문 현황 <span className='small text-secondary'>최근 1개월 기준</span></h6>
                        <Container fluid>
                            <Row>
                                <Col xs={6} lg={6} xl={6} className='p-0'>
                                    {/* 결제완료 건수 */}
                                    <OrderPaid />
                                </Col>
                                <Col xs={6} lg={6} xl={6} className='p-0'>
                                    {/* 배송중 건수 */}
                                    <OrderShipping />
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} lg={6} xl={6} className='p-0'>
                                    {/* 배송완료 건수 */}
                                    <OrderDeliveryComp />
                                </Col>
                                <Col xs={6} lg={6} xl={6} className='p-0'>
                                    {/* 구메확정 건수 */}
                                    <OrderConfirmOk />
                                </Col>
                            </Row>
                        </Container>
                    </div>

                    {/* 주문/매출 추이 */}
                    <div className='mb-3'>
                        <OrderSaleTransition />
                    </div>

                </div>
            </div>
        </div>

    )
}
export default Home