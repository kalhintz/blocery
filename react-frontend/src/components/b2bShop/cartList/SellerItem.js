import React, { Fragment } from 'react'
import FoodsItem from './FoodsItem'
import ComUtil from '~/util/ComUtil'
import { Checkbox } from '@material-ui/core'
import { Container, Row, Col, InputGroup, InputGroupAddon, InputGroupText, Input, Button, Label } from 'reactstrap';
import { Hr } from '~/components/common'
const SellerItem = (props) => {
    const { seller, onSellerChange, history, onFoodsChange, totalCurrentPrice, totalDeliveryFee, totalDiscountFee, totalOrderPrice} = props

    const name = seller.directDelivery ? 'directDeliverySellerList' : 'taekbaeDeliverySellerList'

    return(
        <Fragment key={'sellerItem_'+seller.sellerNo}>
            {
                seller.foodsList.length > 0 && (
                    <div className='d-flex align-items-center p-3 bg-light'>
                        <Checkbox id={'seller_'+seller.sellerNo} name={name} className={'p-0'} color={'default'} checked={seller.checked} onChange={onSellerChange.bind(this, seller.sellerNo)} />
                        <Label for={'seller_'+seller.sellerNo} className='m-0'>{seller.farmName}</Label>
                    </div>
                )
            }
            <hr className='m-0'/>
            {
                seller.foodsList.map((foods, index) => (
                    <Fragment key={'sellerFoods'+index}>
                        <FoodsItem
                            history={history}
                            {...foods}
                            qty={foods.qty}
                            checked={foods.checked}
                            name={name}
                            goodsPrice={foods.goodsPrice}   //foods db 에는 없으며, 택배비 + 상품가격 용도로 사용될 변수
                            onChange={onFoodsChange}/>
                        <hr className='m-0'/>
                    </Fragment>
                ))
            }
            <div className='bg-light f6'>
                <div className='text-center p-2 pl-3 pr-3'><span className='font-weight-normal'>배송비</span>(<span className='text-primary'>{ComUtil.addCommas(seller.freeDeliveryAmount)}</span> 이상 무료)</div>
                <hr className='m-0'/>

                <div className='d-flex justify-content-between p-3'>
                    <div className=''>
                        <div className='f6'>상품금액</div>
                        <div className='font-weight-normal f5'>{ComUtil.addCommas(totalCurrentPrice)} 원</div>
                    </div>
                    <div className=''>
                        <div className='f6'>배송비</div>
                        <div className='font-weight-normal f5'>{ComUtil.addCommas(totalDeliveryFee)} 원</div>
                    </div>
                    <div className=''>
                        <div className='f6'>할인금액</div>
                        <div className='font-weight-normal f5'> - {ComUtil.addCommas(totalDiscountFee)} 원</div>
                    </div>
                    <div className=''>
                        <div className='f6'>주문금액</div>
                        <div className='font-weight-normal f5'>{ComUtil.addCommas(totalOrderPrice)} 원</div>
                    </div>
                </div>
            </div>
            <hr className='m-0'/>
            <Hr/>
        </Fragment>
    )
}
export default SellerItem