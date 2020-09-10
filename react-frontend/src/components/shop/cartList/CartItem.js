import React, {Fragment, useState, useEffect} from 'react'
import PropTypes from 'prop-types'
import { QtyInputGroup } from '../../common'
import { Label } from 'reactstrap';
import { Checkbox } from '@material-ui/core'
import { CloseSharp } from '@material-ui/icons'
import ComUtil from '../../../util/ComUtil'
import { Server } from '../../Properties'

import { Div, Img } from '~/styledComponents/shared'
import Style from './CartList.module.scss'
import {Link} from 'react-router-dom'

const CartItem = (props) => {

    const { producer } = props

    const onQtyChange = (res) => {
        props.onChange({
            type: 'UPDATE_QTY',
            state: {
                producerNo: producer.producerNo,
                goodsNo: props.goodsNo,
                qty: res.value,
            }
        })
    }

    //체크박스 변경
    const onCheckboxChange = (e) => {
        props.onChange({
            type: 'UPDATE_CHECKED',
            state: {
                producerNo: producer.producerNo,
                goodsNo: props.goodsNo,
                checked: e.target.checked,
                qty: props.qty
            }
        })
    }

    //삭제 클릭
    const onDeleteClick = () => {
        props.onChange({
            type: 'DELETE',
            state: {
                producerNo: producer.producerNo,
                goodsNo: props.goodsNo
            }
        })

    }

    const totPrice = props.goodsPrice + props.deliveryFee

    //상품클릭 -> Link로 변경함
    // function onClick(){
    //     props.history.push(`/goods?goodsNo=${props.goodsNo}`)
    // }

    const checkBoxId = 'check_' + props.goodsNo

    const producerWrapDeliver = props.producerWrapDeliver
    const deliveryQty = props.producerWrapLimitPrice
    const deliveryFee = props.producerWrapFee

    return (
        <Fragment>
            {/* 제품 박스 start */}
            <Div bg={'white'} p={15} mb={10} bc={props.checked ? 'green' : 'white'}>
                {/* 제품명 박스 start */}
                {/*<div className='text-secondary mb-2'>{props.farmName}</div>*/}
                <div className='d-flex align-items-center mb-3'>
                    <Checkbox id={checkBoxId} className={Style.mdCheckbox} color={'default'} checked={props.checked} onChange={onCheckboxChange} />
                    <Label for={checkBoxId} className='m-0'>{props.goodsNm} <span className='text-danger f6'>{props.directGoods !== true && ' (예약상품/묶음배송 불가)'}</span></Label>
                    <div className='ml-auto'><span onClick={onDeleteClick}><CloseSharp /></span></div>
                </div>
                {/* 제품명 박스 end */}

                {/* 이미지 & 수량 박스 start */}
                <div className='d-flex align-items-start' >

                    {/* 이미지 */}
                    <div className='d-flex flex-column align-items-center flex-grow-1 flex-shrink-0'>
                        <Link to={`/goods?goodsNo=${props.goodsNo}`}>
                            {/*<img className={Style.goodsImage} src={Server.getThumbnailURL()+props.goodsImages[0].imageUrl} alt={'사진'} />*/}
                            <Div width={78} height={78}><Img src={Server.getThumbnailURL()+props.goodsImages[0].imageUrl} alt={'사진'} /></Div>
                        </Link>

                        <div className='text-secondary small text-center p-1'>
                            {ComUtil.addCommas(props.currentPrice)} 원 ({Math.round(props.discountRate)}%)
                        </div>
                    </div>

                    {/* 수량 & 합계 */}
                    <div className='flex-grow-1 ml-2'>

                        {/* 수량 */}
                        <div className='d-flex justify-content-end align-items-end mb-3'>
                            <QtyInputGroup readOnly onChange={onQtyChange} name={props.goodsNo} value={props.qty}/>
                        </div>

                        <div className='d-flex mb-1 text-dark f6'>
                            <div className='text-right' style={{width:'70px'}}>상품가격</div>
                            <div className='text-right flex-grow-1'>{ComUtil.addCommas(props.goodsPrice)} 원</div>
                        </div>
                        <div className='d-flex mb-1 text-dark f6'>
                            <div className='text-right' style={{width:'70px'}}>배송비</div>
                            <div className='text-right flex-grow-1'>{(producerWrapDeliver && totPrice < deliveryQty) || !producerWrapDeliver ? ComUtil.addCommas(props.deliveryFee) : 0} 원</div>
                        </div>
                        <div className='d-flex font-weight-border'>
                            <div className='text-right' style={{width:'70px'}}>결제금액</div>
                            <div className='text-right flex-grow-1'>{ComUtil.addCommas(totPrice)} 원</div>
                        </div>
                    </div>

                </div>
                {/* 이미지 & 수량 박스 end */}
            </Div>
            {/* 제품 박스 end */}
        </Fragment>
    )
}

CartItem.propTypes = {
    goodsNo: PropTypes.number.isRequired,
    checked: PropTypes.bool,
    goodsPrice: PropTypes.number.isRequired,
    deliveryFee: PropTypes.number.isRequired,
}
CartItem.defaultProps = {
    checked: true,
    goodsPrice: 0,
    deliveryFee: 0,
}


export default CartItem