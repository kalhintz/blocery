import React, {useState, useEffect} from 'react'
import { Container, Row, Col } from 'reactstrap'

import { getB2bLoginUserType } from '~/lib/b2bLoginApi'
import { getSeller } from '~/lib/b2bSellerApi'
import { Webview } from '~/lib/webviewApi'

import DealDeal from './operStat/DealDeal';               //오늘 운영 현황 주문건수(건수)
import DealCancelDeal from './operStat/DealCancelDeal';   //오늘 운영 현황 취소건수(건수)
import DealSalesDeal from './operStat/DealSalesDeal';     //오늘 운영 현황 매출(금액)
import FoodsQnaCnt from './operStat/FoodsQnaCnt';           //오늘 운영 현황 상품문의(건수)
import FoodsReviewCnt from './operStat/FoodsReviewCnt';     //오늘 운영 현황 상품후기(건수)
import WaesangDealCnt from './operStat/WaesangDealCnt';     //오늘 운영 현황 외상거래(건수)

import DealPaid from './dealStat/DealPaid';                  //주문 현황 최근1개월기준 결제완료(건수)
import DealShipping from './dealStat/DealShipping';          //주문 현황 최근1개월기준 배송중(건수)
import DealDeliveryComp from './dealStat/DealDeliveryComp';  //주문 현황 최근1개월기준 배송완료(건수)
import DealConfirmOk from './dealStat/DealConfirmOk';        //주문 현황 최근1개월기준 구매확정(건수)

import DealSaleTransition from './transition/DealSaleTransition'; // 주문매출 추이

import { autoLoginCheckAndTry } from "~/lib/b2bLoginApi";

const Home = (props) => {

    //자동 로그인 체크 & 수행.
    autoLoginCheckAndTry();

    useEffect(() => {
        setLoginCheck();

    }, []);

    async function setLoginCheck(){
        //로그인 체크
        const {data: userType} = await getB2bLoginUserType();
        //console.log('userType',userType)
        if(userType == 'buyer') {
            //소비자용 mypage로 자동이동.
            Webview.movePage('/b2b/');
        } else if (userType == 'seller') {
            let loginUser = await getSeller();
            if(!loginUser){
                Webview.openPopup('/b2b/login?userType=seller', true); // 판매자 로그인 으로 이동팝업
            }
        } else {
            Webview.openPopup('/b2b/login?userType=seller', true); // 판매자 로그인 으로 이동팝업
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
                                    <DealDeal />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 취소건수 */}
                                    <DealCancelDeal />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 매출 */}
                                    <DealSalesDeal />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 상품문의 건수 */}
                                    <FoodsQnaCnt />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 상품후기 건수 */}
                                    <FoodsReviewCnt />
                                </Col>
                                <Col xs={4} xl={2} className='p-0 mb-1'>
                                    {/* 외상거래 건수 */}
                                    <WaesangDealCnt />
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
                                    <DealPaid />
                                </Col>
                                <Col xs={6} lg={6} xl={6} className='p-0'>
                                    {/* 배송중 건수 */}
                                    <DealShipping />
                                </Col>
                            </Row>
                            <Row>
                                <Col xs={6} lg={6} xl={6} className='p-0'>
                                    {/* 배송완료 건수 */}
                                    <DealDeliveryComp />
                                </Col>
                                <Col xs={6} lg={6} xl={6} className='p-0'>
                                    {/* 구메확정 건수 */}
                                    <DealConfirmOk />
                                </Col>
                            </Row>
                        </Container>
                    </div>

                    {/* 주문/매출 추이 */}
                    <div className='mb-3'>
                        <DealSaleTransition />
                    </div>

                </div>
            </div>
        </div>

    )
}
export default Home