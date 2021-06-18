import React, { useState, useEffect, Fragment } from 'react'
import ComUtil from '~/util/ComUtil'
import { getDeliveryFee } from '~/util/bzLogic'
import PropTypes from 'prop-types';
import { Button, Alert } from 'reactstrap';
import { addCart } from '~/lib/cartApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'

import {MdShoppingCart} from 'react-icons/md'


import { QtyInputGroup } from '../../common'

import classNames from 'classnames'

import Style from './AddCart.module.scss'

import {useRecoilState} from "recoil";
import {cartCountrState} from "~/recoilState";

// import * as actions  from '~/reducers/CartReducer'

// const Style = {
//     wrap: {
//         minHeight: '200px'
//     },
//     input: {
//         minWidth:100
//     }
// }

const AddCart = (props) => {

    const [count, setCount] = useRecoilState(cartCountrState)

    // const dispatch = useDispatch()

    const [qty, setQty] = useState(props.qty)
    const [remainedCnt, setRemainedCnt] = useState(null)
    const [isAdded, setIsAdded] = useState(false)
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

        props.onChange(qty)
    }

    //장바구니 담기
    const onConfirmClick = async () => {

        const data = {
            goodsNo: props.goodsNo,
            qty: qty,
            checked: true
        }

        await addCart(data)

        setIsAdded(true)



        //dispatch({type: 'ACTION_NAME'}) 을 통해 리듀서로 바로 접근해도 무방하나, 통일된 코드를 위해서 아래의 [액션함수] -> [reducer] 순으로 접근하도록 하였음

        //리덕스 액션 함수 호출
        // props.addCart()
        setCount(count + 1)

    }

    const movePage = () => {
        //팝업 닫기 & 콜백에 페이지이동 URL 요청
        props.onClose('/cartList')
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

    useEffect(() =>{
        let timer = 0
        if(isAdded){
            timer = setTimeout(props.onClose, 2000)
        }

        return () => {
            clearTimeout(timer)
            timer = 0;
        }

    }, [isAdded])

    //배송정책 적용
    const calculateDeliveryFee = (_qty) => {
        setDeliveryFee(getDeliveryFee({qty: _qty, deliveryFee: props.deliveryFee, deliveryQty: props.deliveryQty, termsOfDeliveryFee: props.termsOfDeliveryFee, orderPrice: props.currentPrice*_qty}))
    }

    return(

        (remainedCnt !== null)  && (
            <div className={classNames('p-3', Style.wrap)} >
                {
                    isAdded ? (
                        <Fragment>
                            <div className='d-flex justify-content-center align-items-center'>
                                <i ><MdShoppingCart style={{fontSize: 60}}/></i>
                            </div>
                            <div className='d-flex justify-content-center align-items-center m-3'>
                                장바구니에 추가되었습니다
                            </div>
                            <Button className='p-2 f2' color='info' block onClick={movePage}>구매하러 가기 >>></Button>
                        </Fragment>
                    ) : (

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
                                qty <= remainedCnt ? <Button className='p-2 f2 rounded-0' color='info' block onClick={onConfirmClick}>추가</Button> : <Alert className='mt-3' color='danger'>재고수량 부족(구입가능 수량 : {remainedCnt}개)</Alert>
                            }
                        </Fragment>
                    )
                }
            </div>
        )
    )
}

AddCart.propTypes = {
    goodsNo: PropTypes.number,
    qty: PropTypes.number,
    deliveryFreeQty: PropTypes.number,
    deliveryFee: PropTypes.number,
    onChange: PropTypes.func
}

AddCart.defaultProps = {
    qty: 1,
    deliveryFreeQty: 0,
    deliveryFee: 0,
    onChange: () => null
}

//dispatch 를 통해 반환된 값을 props에 넣음 (직접 dispatch() 를 할 경우 필요없음)
function mapStateToProps(store) {
    return { counter: store.cart.counter }
}

//dispatch 할 함수를 props에 넣음 (직접 dispatch() 를 할 경우 필요없음)
// function mapDispatchToProps(dispatch) {
//     return {
//         addCart: () => dispatch(actions.getCartCount())
//     }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(AddCart)
export default AddCart