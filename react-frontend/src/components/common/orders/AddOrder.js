import React, { useState, useEffect, Fragment } from 'react'
import ComUtil from '~/util/ComUtil'
import { getDeliveryFee } from '~/util/bzLogic'
import PropTypes from 'prop-types';
import { Button, Alert } from 'reactstrap'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { QtyInputGroup } from '~/components/common'
import classNames from 'classnames'
import Style from './AddOrder.module.scss'

const AddOrder = (props) => {

    const [qty, setQty] = useState(props.qty)
    const [remainedCnt, setRemainedCnt] = useState(null)
    const [deliveryFee, setDeliveryFee] = useState(0)

    //수량 input change
    const onQtyChange = ({value}) => {
        changeQty(ComUtil.toNum(value))
    }

    //수량 변경
    const changeQty = async(qty) => {
        setRemainedCnt(await getRemainedCnt())
        setQty(qty)

        calculateDeliveryFee(qty)
    }

    //구매 클릭
    const onConfirmClick = async () => {
        const data = {
            goodsNo: props.goodsNo,
            qty: qty,
            // checked: true
        }
        props.onClick(data)
    }

    //재고수량 가지고 오기
    const getRemainedCnt = async () => {
        const { data: goods } = await getGoodsByGoodsNo(props.goodsNo)
        return goods.remainedCnt
    }

    //didMount
    useEffect(() => {

        //배송정책 (금액)적용
        calculateDeliveryFee(qty)

        //재고수량 set
        getRemainedCnt().then(remainedCnt => {
            setRemainedCnt(remainedCnt)
        })
    }, []);

    //배송정책 적용
    const calculateDeliveryFee = (_qty) => {
        setDeliveryFee(getDeliveryFee({qty: _qty, deliveryFee: props.deliveryFee, deliveryQty: props.deliveryQty, termsOfDeliveryFee: props.termsOfDeliveryFee, orderPrice: props.currentPrice*_qty}))
    }

    return(
        <div className={classNames('p-3', Style.wrap)} >
            {

                <Fragment>
                    <h6>{props.goodsNm}</h6>
                    <div className='d-flex'>
                        <div style={{width:'50%'}}>
                            <QtyInputGroup onChange={onQtyChange} value={qty} placeholder="수량 입력" />
                        </div>
                        <div className='ml-auto d-flex align-items-center justify-content-end'>
                            {ComUtil.addCommas(props.currentPrice)}원
                        </div>
                    </div>
                    <hr className='p-0'/>
                    <div className='d-flex justify-content-end font-weight-normal mb-2'>
                        <div>상품 금액 :</div>
                        <div className={classNames('text-right', Style.input)}>{ComUtil.toCurrency(props.currentPrice * qty)} 원</div>
                    </div>
                    <div className='d-flex justify-content-end font-weight-normal mb-2'>
                        <div>배송비 :</div>
                        <div className={classNames('text-right', Style.input)}>+ {ComUtil.addCommas(deliveryFee)} 원</div>
                    </div>
                    <div className='d-flex justify-content-end font-weight-bold mb-2'>
                        <div>총 상품 금액 :</div>
                        <div className={classNames('text-right', Style.input)}>{ComUtil.toCurrency((props.currentPrice * qty)+deliveryFee)} 원</div>

                    </div>
                    {
                        qty <= remainedCnt ? <Button className='p-2 f2' color='info' block onClick={onConfirmClick}>구매</Button> : <Alert className='mt-3' color='danger'>재고수량 부족(구입가능 수량 : {remainedCnt}개)</Alert>
                    }
                </Fragment>

            }
        </div>
    )
}

AddOrder.propTypes = {
    goodsNo: PropTypes.number,
    qty: PropTypes.number,
    deliveryFreeQty: PropTypes.number,
    deliveryFee: PropTypes.number,
    onChange: PropTypes.func
}

AddOrder.defaultProps = {
    qty: 1,
    deliveryFreeQty: 0,
    deliveryFee: 0,
    onChange: () => null
}

export default AddOrder