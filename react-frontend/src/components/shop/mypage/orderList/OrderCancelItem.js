import React, {Fragment} from 'react'
import ComUtil from '~/util/ComUtil'
import TextStyle from '~/styles/Text.module.scss'
import classnames from 'classnames'
import Style from './OrderDetail.module.scss'
import { Server } from '~/components/Properties'
import {Div, Flex} from '~/styledComponents/shared'

const OrderCancelItem = (props) => {

    const orderDetail = props.orderDetail

    return (
        <Fragment>
            <div className={Style.wrap}>
                {/*<section className={Style.sectionDate}>*/}
                    {/*<div>{ComUtil.utcToString(orderDetail.orderDate)}</div>*/}
                    {/*{*/}
                        {/*(orderDetail.payStatus === 'cancelled') ? <div className="text-right">취소완료</div> :*/}
                            {/*(orderDetail.consumerOkDate) ? <div className="text-right">구매확정</div> :*/}
                                {/*<div>*/}
                                    {/*{*/}
                                        {/*(orderDetail.trackingNumber) &&*/}
                                            {/*<div className="text-right">배송중</div>*/}
                                            {/*// :*/}
                                            {/*// (orderDetail.expectShippingStart) ?*/}
                                            {/*//     <div className="text-right">{ComUtil.utcToString(orderDetail.expectShippingStart, "MM.DD")}*/}
                                            {/*//         ~ {ComUtil.utcToString(orderDetail.expectShippingEnd, "MM.DD")} 발송예정*/}
                                            {/*//     </div>*/}
                                            {/*//     :*/}
                                            {/*//     <div className="text-right">발송예정</div>*/}
                                    {/*}*/}
                                {/*</div>*/}
                    {/*}*/}
                {/*</section>*/}
                <Flex p={16}>
                    {/*<section className={classnames('p-16',Style.sectionContent)}>*/}
                        <Div flexBasis={'8em'} flexShrink={0} mr={10}>
                            <img style={{width:'100%', height:'100%', objectFit:'cover'}}
                                 src={Server.getThumbnailURL() + orderDetail.orderImg} alt={'사진'}/>
                        </Div>
                        <div style={{flexDirection:'column', flexGrow: 1, justifyContent:'center'}}>
                            {/*<div className={'d-flex'}>*/}
                                {/*<div>{orderDetail.itemName}</div>*/}
                                {/*<div className={'ml-2 mr-2'}>/</div>*/}
                                {/*<div>{orderDetail.farmName}</div>*/}
                            {/*</div>*/}
                            <Div>{orderDetail.goodsNm} {orderDetail.packAmount}{orderDetail.packUnit}</Div>
                                {/*{ (orderDetail.payMethod === 'blct' ) &&*/}
                                {/*<small>*/}
                                                            {/*<span*/}
                                                                {/*className={'text-danger'}>{ComUtil.addCommas(orderDetail.orderPrice)}</span>원*/}
                                    {/*(<span*/}
                                    {/*className={'text-danger'}>{ComUtil.addCommas(orderDetail.blctToken)}</span>BLY)*/}
                                {/*</small>*/}
                                {/*}*/}
                                {/*{ (orderDetail.payMethod === 'card' || orderDetail.payMethod === 'cardBlct') &&*/}
                                {/*<small>*/}
                                                            {/*<span*/}
                                                                {/*className={'text-danger'}>{ComUtil.addCommas(orderDetail.orderPrice)}</span>원*/}
                                {/*</small>*/}
                                {/*}*/}
                                {/*<div className='ml-2 mr-2'>|</div>*/}
                            <Div><small>수량 : {orderDetail.orderCnt}개</small></Div>
                        </div>

                    {/*</section>*/}
                </Flex>
            </div>


        </Fragment>
    )
}

export default OrderCancelItem