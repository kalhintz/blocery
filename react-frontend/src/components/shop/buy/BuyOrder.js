import React, { useEffect, useState } from 'react'
import ComUtil from '../../../util/ComUtil'
import { exchangeWon2BLCTComma } from "~/lib/exchangeApi"
import { Div, Span, Flex, Right } from '~/styledComponents/shared'
import { SingleDatePicker } from 'react-dates';
import moment from 'moment'
import styled from 'styled-components'
import {color} from "~/styledComponents/Properties";

import {PayInfoRow} from './BuyStyle'

//https://html.spec.whatwg.org/multipage/media.html#event-media-loadedmetadata

const DateWrapper = styled(Div)`
    
    padding: 2px;
    border: 1px solid ${color.danger};
    border-radius: 6px;
    
    input {
        color: ${color.danger};
        font-size: 12px;
        font-weight: 500;
        text-align: center;
        padding: 0;
    }
`;

const BuyOrder = (props) => {

    //초기 변수 세팅
    const {order, plusDeliveryFee, hopeDeliveryDateChange } = props;

    const [wonToBlct, setWonToBlct] = useState(0);

    const [dateFocus, setDateFocus] = useState(false)

    const [date, setDate] = useState(null)


    useEffect (() => {
        async function fetchData() {
            const _wonToBlct = await exchangeWon2BLCTComma(order.orderPrice);
            setWonToBlct(_wonToBlct);
        }

        fetchData();

    }, [])

    //희망배송일 지정
    const onDateChange = (date) => {
        // console.log(date.endOf('day'))
        // setDate(date.endOf('day'))
        hopeDeliveryDateChange({
            goodsNo: order.goodsNo,
            hopeDeliveryDate: date.endOf('day')
        })
    }


    const renderUntilCalendarInfo = () => {
        return <Div
            // bg={'green'} fg={'white'}
            px={10} py={10} fontSize={13} textAlign={'center'}
            bc={'light'}
            bt={0}
            br={0}
            bl={0}
        >
            {`${ComUtil.utcToString(order.expectShippingStart)} ~ ${ComUtil.utcToString(order.expectShippingEnd)} 중 선택`}
        </Div>
    }

    return(

        <div>
            <Div
                p={16}
                bc={'light'}
                bt={0}
                bl={0}
                br={0}
            >
                <Flex
                    mb={16}
                >
                    <Div flexShrink={0} width={74} height={74} mr={12}><img style={{width: '100%', height: '100%'}} src={props.imageUrl} alt="상품사진"/></Div>
                    <div>
                        <Div fontSize={14} lineHeight={19} mb={5}>{order.goodsNm}</Div>
                        <Div fontSize={12} fg={'adjust'} lineHeight={14}>구매수량 : {ComUtil.addCommas(order.orderCnt)}건</Div>
                        {
                            !order.directGoods && <Div fontSize={12} fg={'danger'}>예약상품(묶음배송불가)</Div>
                        }
                    </div>
                </Flex>
                <Div>
                    <PayInfoRow
                        fontSize={12}
                        lineHeight={20}
                        my={10}
                    >
                        <Div fg={'adjust'}>배송기간</Div>
                        <Right textAlign={'right'}>
                            {
                                order.hopeDeliveryFlag ? `희망 수령일에 맞게 배송 예정`:
                                    order.directGoods ? `구매 후 3일 이내 발송` : `${ComUtil.utcToString(order.expectShippingStart)} ~ ${ComUtil.utcToString(order.expectShippingEnd)}`
                            }
                        </Right>

                    </PayInfoRow>
                    {
                        (order.hopeDeliveryFlag) && (
                            <Div my={10}>
                                <PayInfoRow
                                    fontSize={12}
                                    lineHeight={20}
                                >
                                    <Div fg={'black'}>희망 수령일<Span fg={'danger'}>*</Span></Div>
                                    <DateWrapper>
                                        {/*<Button bg={'green'} fg={'white'} rounded={3} px={5} py={2} onClick={hopeDeliveryDateClick}>직접지정</Button>*/}
                                        <SingleDatePicker
                                            placeholder="날짜선택"
                                            date={order.hopeDeliveryDate ? moment(order.hopeDeliveryDate) : null}
                                            // date={date}
                                            onDateChange={onDateChange}
                                            focused={dateFocus} // PropTypes.bool
                                            onFocusChange={({ focused }) => setDateFocus(focused)} // PropTypes.func.isRequired
                                            id={"stepPriceDate_"+order.goodsNo} // PropTypes.string.isRequired,
                                            numberOfMonths={1}
                                            withPortal
                                            small
                                            readOnly
                                            calendarInfoPosition="top"
                                            enableOutsideDays
                                            // orientation="vertical"
                                            //배송시작일의 달을 기본으로 선택 되도록
                                            initialVisibleMonth={()=> order.hopeDeliveryDate ? order.hopeDeliveryDate : moment(order.expectShippingStart)}
                                            // daySize={45}
                                            verticalHeight={700}
                                            noBorder
                                            //달력아래 커스텀 라벨
                                            renderCalendarInfo={renderUntilCalendarInfo}
                                            // orientation="vertical"
                                            //일자 블록처리
                                            isDayBlocked={(date)=>{

                                                if (date.isBefore(moment(order.expectShippingStart)) || date.isAfter(moment(order.expectShippingEnd))) {
                                                    return true
                                                }

                                                // //앞의 단계보다 작은 일자는 블록처리하여 선택할 수 없도록 함
                                                // let priceStepItem = null
                                                // switch (stepNo){
                                                //     case 2 :
                                                //         //checkDate =  goods.priceSteps[0].until || null
                                                //
                                                //         priceStepItem = goods.priceSteps.find(priceStep => priceStep.stepNo === 1)
                                                //
                                                //         if(priceStepItem && priceStepItem.until){
                                                //             return date.isSameOrBefore(moment(priceStepItem.until))
                                                //         }
                                                //         return false
                                                //     case 3 :
                                                //         //3단계에서는 2단계 일자우선, 없을경우 1단계 일자, 없을경우 null 처리
                                                //         priceStepItem = goods.priceSteps.find(priceStep => priceStep.stepNo === 2) || goods.priceSteps.find(priceStep => priceStep.stepNo === 1) || null
                                                //
                                                //         if(priceStepItem && priceStepItem.until){
                                                //             return date.isSameOrBefore(moment(priceStepItem.until))
                                                //         }
                                                //         return false
                                                // }
                                            }}


                                            //일자 렌더링
                                            // ** renderDayContents={this.renderUntilDayContents}
                                        />
                                    </DateWrapper>
                                </PayInfoRow>
                                <Div fg={'secondary'} mt={5} fontSize={12}>실제 수령일은 상황에 따라 차이가 있을 수 있습니다.</Div>
                            </Div>
                        )
                    }

                    <PayInfoRow
                        fontSize={12}
                        lineHeight={20}
                        my={10}
                    >
                        <div fg={'adjust'}>상품가격</div>
                        <div>{ComUtil.addCommas(order.currentPrice * order.orderCnt)}원</div>
                    </PayInfoRow>
                    <PayInfoRow
                        fontSize={12}
                        lineHeight={20}
                        my={10}
                    >
                        <div>배송비</div>
                        <div>+ {ComUtil.addCommas(order.deliveryFee)}원</div>
                    </PayInfoRow>
                    {
                        plusDeliveryFee &&
                        <PayInfoRow
                        >
                            <div></div>
                            <Div fg={'danger'}>(제주도 추가 배송비 포함된 금액)</Div>
                        </PayInfoRow>
                    }
                    {/*<div className={Css.row}>*/}
                    {/*<div>추가 배송비</div>*/}
                    {/*<div>+ {plusDeliveryFee ? '3,000' : '0'}원</div>*/}
                    {/*</div>*/}
                    <PayInfoRow>
                        <div>결제금액</div>
                        <div>{ComUtil.addCommas((order.currentPrice * order.orderCnt) + order.deliveryFee)}원</div>
                    </PayInfoRow>
                    {/*<div className={Css.row}>*/}
                    {/*<div>합계</div>*/}
                    {/*<div>{ComUtil.addCommas(orderPrice + order.deliveryFee)}원</div>*/}
                    {/*</div>*/}
                </Div>
                {/*<div className={Css.lightLine}></div>*/}
                {/*<div>*/}
                {/*<div className={Css.row}>*/}
                {/*<div>결제금액</div>*/}
                {/*<div>*/}
                {/*<b className={Css.xl}>{ComUtil.addCommas(order.orderPrice)} 원</b><br/>*/}
                {/*</div>*/}
                {/*</div>*/}
                {/*<div className={classNames(Css.xs, Css.textRight, Css.textGray)}>*/}
                {/*<b><Icon name={'blocery'}/> {wonToBlct} BLCT</b>*/}
                {/*</div>*/}
                {/*</div>*/}
            </Div>
        </div>



    )

    // return (
    //     <Fragment>
    //         <Container>
    //             <hr/>
    //             {
    //                 order.chk_remainedCnt_msg ? <Alert color={'danger'}>{order.chk_remainedCnt_msg}</Alert> : null
    //             }
    //             {
    //                 order.chk_saleEnd_msg ? <Alert color={'danger'}>{order.chk_saleEnd_msg}</Alert> : null
    //             }
    //             <Row>
    //                 <Col xs={4} style={{paddingRight: 0}}>
    //                     <img className={Style.img} src={props.goodsImage} alt={'상품사진'}/>
    //                 </Col>
    //                 <Col xs={8}>
    //                     {/*<small>{this.state.goods.itemName} </small><br/>*/}
    //                     {order.goodsNm} {order.packAmount + ' ' + order.packUnit}<br/>
    //                     <Row>
    //                         <Col><span className={Style.textSmall}>구매수량</span> : {ComUtil.addCommas(order.orderCnt)} 건 </Col>
    //                     </Row>
    //                     <Row>
    //                         <Col><span className={Style.textSmall}></span></Col>
    //                     </Row>
    //                 </Col>
    //             </Row>
    //             {
    //                 order.directGoods?
    //                     <Row>
    //                         <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
    //                         <Col xs={'8'} className={Style.textRs}>구매 후 3일 이내 발송</Col>
    //                     </Row>
    //                     :
    //                     <Row>
    //                         <Col xs={'4'} className={Style.textSmall}>배송기간</Col>
    //                         <Col xs={'8'} className={Style.textRs}>
    //                             {ComUtil.utcToString(order.expectShippingStart)} ~&nbsp;
    //                             {ComUtil.utcToString(order.expectShippingEnd)}
    //                         </Col>
    //                     </Row>
    //             }
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}>상품가격</Col>
    //                 <Col xs={'7'} className={Style.textRs}>
    //                     {ComUtil.addCommas(order.currentPrice * order.orderCnt)} 원 ({Math.floor(Math.round((order.consumerPrice - order.currentPrice) * 100 / order.consumerPrice))}%)
    //                 </Col>
    //             </Row>
    //             {/*
    //             <Row>
    //                 <Col xs={'8'} className={Style.textSmall}> 예약 할인 가격 </Col>
    //                 <Col xs={'4'} className={Style.textRs}>
    //                     -{ComUtil.addCommas((consumerPrice * orderCnt) - (currentPrice * orderCnt))} 원
    //                 </Col>
    //             </Row>*/}
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}>배송비</Col>
    //                 <Col xs={'7'} className={Style.textRs}> +{ComUtil.addCommas(order.deliveryFee)} 원 </Col>
    //             </Row>
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}>결제금액</Col>
    //                 <Col xs={'7'} className={Style.textRs}>{ComUtil.addCommas(order.orderPrice)} 원</Col>
    //             </Row>
    //             <Row>
    //                 <Col xs={'5'} className={Style.textSmall}></Col>
    //                 <Col xs={'7'} className={(Style.textRs)}><small>{wonToBlct} BLCT</small></Col>
    //             </Row>
    //         </Container>
    //
    //     </Fragment>
    // )
}
export default BuyOrder

