import React, {Fragment, useState} from 'react'
import PropTypes from 'prop-types'
import { CloseSharp } from '@material-ui/icons'
import ComUtil from '../../../util/ComUtil'
import { Server } from '../../Properties'
import Style from './CartList.module.scss'

const InvalidCartItem = (props) => {

    //삭제 클릭
    const onDeleteClick = () => {
        props.onChange({
            type: 'DELETE',
            state: {
                goodsNo: props.goodsNo
            }
        })

    }

    const totPrice = props.goodsPrice + props.deliveryFee

    //상품클릭
    function onClick(){
        props.history.push(`/goods?goodsNo=${props.goodsNo}`)
    }


    return (
        <Fragment>
            {/* 제품 박스 start */}
            <div className='bg-white p-3 mb-2'>
                {/* 제품명 박스 start */}
                <div className='d-flex align-items-center mb-3'>
                    <span  onClick={onClick.bind(this)} >{props.goodsNm}</span>
                    <div className='flex-grow-1 text-right'><span onClick={onDeleteClick}><CloseSharp /></span></div>
                </div>
                {/* 제품명 박스 end */}

                {/* 이미지 & 수량 박스 start */}
                <div className='d-flex align-items-center' onClick={onClick.bind(this)} >

                    {/* 이미지 */}
                    <div className='d-flex flex-column align-items-center flex-grow-1 flex-shrink-0'>
                        {/*<img className={Style.goodsImage} src={'data:image/jpeg;base64,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'} />*/}
                        <img className={Style.goodsImage} src={Server.getThumbnailURL()+props.goodsImages[0].imageUrl} />
                        <div className='text-secondary small text-center p-1'>
                            {ComUtil.addCommas(props.currentPrice)} 원 ({Math.round(props.discountRate)}%)
                        </div>
                    </div>

                    <div className='flex-grow-1 ml-2'>
                        <div className='d-flex mb-1 text-dark f6'>
                            <div className='text-right' style={{width:'70px'}}>상품가</div>
                            <div className='text-right flex-grow-1'>{ComUtil.addCommas(props.goodsPrice)} 원</div>
                        </div>
                        <div className='text-center'>
                            {
                                props.remainedCnt <= 0 ? <b>품절</b> : <b>판매종료</b>
                            }
                        </div>
                        {/*<div className='d-flex mb-1 text-dark f6'>*/}
                            {/*<div className='text-right' style={{width:'70px'}}>배송비</div>*/}
                            {/*<div className='text-right flex-grow-1'>+ {ComUtil.addCommas(props.deliveryFee)} 원</div>*/}
                        {/*</div>*/}
                        {/*<div className='d-flex font-weight-border'>*/}
                            {/*<div className='text-right' style={{width:'70px'}}>합계</div>*/}
                            {/*<div className='text-right flex-grow-1'>{ComUtil.addCommas(totPrice)} 원</div>*/}
                        {/*</div>*/}
                    </div>

                </div>
                {/* 이미지 & 수량 박스 end */}
            </div>
            {/* 제품 박스 end */}
        </Fragment>
    )
}

InvalidCartItem.propTypes = {
    goodsNo: PropTypes.number.isRequired,
    checked: PropTypes.bool,
    goodsPrice: PropTypes.number.isRequired,
    deliveryFee: PropTypes.number.isRequired,
}
InvalidCartItem.defaultProps = {
    checked: true,
    goodsPrice: 0,
    deliveryFee: 0,
}


export default InvalidCartItem