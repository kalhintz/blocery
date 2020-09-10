import React, {Fragment, useState} from 'react'
import PropTypes from 'prop-types'
import ComUtil from '~/util/ComUtil'
import TextStyle from '~/styles/Text.module.scss'
import classnames from 'classnames'
import Style from './OrderDetail.module.scss'
import { Server } from '~/components/Properties'

const OrderCancelItem = (props) => {

    const orderDetail = props.orderDetail

    return (
        <Fragment>
            <div className={Style.wrap}>
                <section className={Style.sectionDate}>
                    <div>{ComUtil.utcToString(orderDetail.orderDate)}</div>
                    {
                        (orderDetail.payStatus === 'cancelled') ? <div className="text-right">취소완료</div> :
                            (orderDetail.consumerOkDate) ? <div className="text-right">구매확정</div> :
                                <div>
                                    {
                                        (orderDetail.trackingNumber) ?
                                            <div className="text-right">배송중</div>
                                            :
                                            (orderDetail.expectShippingStart) ?
                                                <div className="text-right">{ComUtil.utcToString(orderDetail.expectShippingStart, "MM.DD")}
                                                    ~ {ComUtil.utcToString(orderDetail.expectShippingEnd, "MM.DD")} 발송예정
                                                </div>
                                                :
                                                <div className="text-right">발송예정</div>
                                    }
                                </div>
                    }
                </section>
                <section className={Style.sectionContent}>
                    <div className={Style.img}>
                        <img className={Style.goodsImg}
                             src={Server.getThumbnailURL() + orderDetail.orderImg} alt={'사진'}/>
                    </div>
                    <div className={Style.content}>
                        <div className={'d-flex'}>
                            <div>{orderDetail.itemName}</div>
                            <div className={'ml-2 mr-2'}>/</div>
                            <div>{orderDetail.farmName}</div>
                        </div>
                        <div
                            className={TextStyle.textMedium}>{orderDetail.goodsNm} {orderDetail.packAmount}{orderDetail.packUnit}</div>
                        <div className={classnames('d-flex', TextStyle.textMedium)}>
                            { (orderDetail.payMethod === 'blct' ) &&
                            <small>
                                                        <span
                                                            className={'text-danger'}>{ComUtil.addCommas(orderDetail.orderPrice)}</span>원
                                (<span
                                className={'text-danger'}>{ComUtil.addCommas(orderDetail.blctToken)}</span>BLY)
                            </small>
                            }
                            { (orderDetail.payMethod === 'card' || orderDetail.payMethod === 'cardBlct') &&
                            <small>
                                                        <span
                                                            className={'text-danger'}>{ComUtil.addCommas(orderDetail.orderPrice)}</span>원
                            </small>
                            }
                            <div className='ml-2 mr-2'>|</div>
                            <small>
                                <div>수량 : {orderDetail.orderCnt}개</div>
                            </small>
                        </div>
                    </div>
                </section>
            </div>


        </Fragment>
    )
}

export default OrderCancelItem