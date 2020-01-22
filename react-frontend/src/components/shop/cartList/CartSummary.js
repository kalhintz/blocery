import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import ComUtil from '../../../util/ComUtil'
import { Button } from 'reactstrap'
import Style from './CartList.module.scss'
import classNames from 'classnames'
//결제내역 컨텐츠
const CartSummary = (props) => {
    const onPayClick = () => {
        props.onClick()
    }
    const totPrice = ComUtil.toNum(props.sumGoodsPrice) + ComUtil.toNum(props.sumDeliveryFee)
    return (
        <Fragment>
            <div className='bg-white p-4 font-weight-normal'>
                <div className='d-flex p-1 text-dark'>
                    <div className='text-left'>총 상품금액</div>
                    <div className='flex-grow-1 text-right'>{ComUtil.addCommas(props.sumGoodsPrice)} 원</div>
                </div>
                <div className='d-flex p-1 text-dark'>
                    <div className='text-left'>총 배송비</div>
                    <div className='flex-grow-1 text-right'>+ {ComUtil.addCommas(props.sumDeliveryFee)} 원</div>
                </div>
                <hr/>
                <div className='d-flex p-1 f2 font-weight-bold'>
                    <div className='text-left'>총 결제 예상 금액</div>
                    <div className='flex-grow-1 text-right'>{ComUtil.addCommas(totPrice)} 원</div>
                </div>
            </div>

        </Fragment>
    )
}
CartSummary.propTypes = {
    checkedCount: PropTypes.number.isRequired,
    sumGoodsPrice: PropTypes.number.isRequired,
    sumDeliveryFee: PropTypes.number.isRequired,
}
CartSummary.defaultProps = {
    checkedCount: 0,
    sumGoodsPrice: 0,
    sumDeliveryFee: 0
}
export default CartSummary