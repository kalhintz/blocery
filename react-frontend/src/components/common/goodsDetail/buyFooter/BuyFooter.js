import React, { Fragment, Component, useState, useEffect } from 'react'
//import './GoodsDetail.scss'
import Css from './BuyFooter.module.scss'
import ComUtil from '~/util/ComUtil'

import classNames from 'classnames'
import { Webview } from '~/lib/webviewApi'
import {Collapse} from 'reactstrap'

import moment from 'moment'

import { FarmDiaryCard, HrGoodsPriceCard, TimeText, ModalAlert, ModalWithNav, AddCart, AddOrder, IconStarGroup, ToastUIEditorViewer, SlideItemHeaderImage, SlideItemContent,
    QtyInputGroup
} from '~/components/common'
import { Server } from '~/components/Properties'


import "react-image-gallery/styles/css/image-gallery.css"

import {Icon} from '~/components/common/icons'

import { IoMdHeart, IoMdHeartEmpty } from "react-icons/io";
import { useSelector, useDispatch, connect } from 'react-redux'
import * as actions  from '~/reducers/CartReducer'
import { addCart } from '~/lib/cartApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getDeliveryFee } from '~/util/bzLogic'
import {getZzim, deleteZzim, addZzim, getConsumer} from '~/lib/shopApi'
import {getLoginUserType} from '~/lib/loginApi'
import { ToastContainer, toast } from 'react-toastify'                              //토스트



const BuyFooter = (props) => {
    const {goods} = props

    //구매하기 펼치기 여부
    const [isOpen, setisOpen] = useState(false)

    //구매수량
    const [orderQty, setOrderQty] = useState(1)

    const [remainedCnt, setRemainedCnt] = useState(null)
    const [deliveryFee, setDeliveryFee] = useState(0)
    const [isZzim, setIsZzim] = useState()
    const [scale, setScale] = useState(false)
    const [finishedSaleGoods, setFinishedSaleGoods] = useState()
    // const [consumerNo, setConsumerNo] = useState()

    //didMount
    useEffect(() => {

        //배송정책 (금액)적용
        calculateDeliveryFee(orderQty)

        async function fetch(){
            //재고수량 set
            const remainedCnt = await getRemainedCnt()
            setRemainedCnt(remainedCnt)

            //판매종료여부
            if(isFinishGoods()){
                setFinishedSaleGoods(true)
            }
        }

        fetch()


        setZzim()



    }, []);

    async function setZzim(){
        const consumerNo = await getConsumerNo()
        if(consumerNo){
            const {data} = await getZzim(consumerNo, props.goods.goodsNo)

            if(data)
                setIsZzim(true)
            else
                setIsZzim(false)
        }else{
            setIsZzim(false)
        }
    }

    async function onZzimClick(){
        if(await isOkay()){
            const consumerNo = await getConsumerNo()
            if(isZzim){
                await deleteZzim(consumerNo, props.goods.goodsNo)
                setScale(false)
            }else{
                const params = {
                    consumerDotGoods: null,
                    consumerNo: consumerNo,
                    goodsNo: props.goods.goodsNo,
                    regDate: null
                }
                await addZzim(params)
                setScale(true)
                setTimeout(()=>setScale(false), 300)

            }
            setZzim()
        }
    }



    async function getConsumerNo(){
        const {data} = await getConsumer()
        if(data){
            return data.consumerNo
        }
        return null
    }

    // async function setZzim(){
    //     if(await isOkay()){
    //         getZzim()
    //     }
    // }
    //

    //수량 input change
    const onQtyChange = ({value}) => {
        changeQty(ComUtil.toNum(value))
    }

    //수량 변경
    const changeQty = async(qty) => {
        setRemainedCnt(await getRemainedCnt())
        setOrderQty(qty)

        calculateDeliveryFee(qty)

        // props.onChange(qty)
    }

    const checkRemainedCnt = () => {
        return (remainedCnt >= orderQty);
    }

    //재고수량 가지고 오기
    const getRemainedCnt = async () => {
        const { data: goods } = await getGoodsByGoodsNo(props.goods.goodsNo)
        return goods.remainedCnt
    }
    //배송정책 적용
    const calculateDeliveryFee = (_qty) => {
        setDeliveryFee(getDeliveryFee({qty: _qty, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*_qty}))
    }

    function isOpenToggle(){
        setisOpen(!isOpen)
    }

    function isOpenToggle(){
        setisOpen(!isOpen)
    }

    //즉시구매 클릭
    const onBuyClick = () => {
        //수량이 열려있지 않은 경우
        if(!isOpen){
            isOpenToggle()
        }
        else if(!checkRemainedCnt()){
            alert("최대로 구매 가능한 수량은 " + remainedCnt + "개 입니다.")
        }
        else{
            props.onClick({
                qty: orderQty,
                gift: false
            })
        }
        // if(await isOkay()){
        //     setOrderModal(true) //구매하기 모달
        // }
    }



    //장바구니 담기
    const onAddCartClick = async () => {

        if(!(await isOkay())){
            return;
        }  else if(!checkRemainedCnt()){
            alert("최대로 구매 가능한 수량은 " + remainedCnt + "개 입니다.")
            return;
        }

        const data = {
            goodsNo: goods.goodsNo,
            qty: orderQty,
            producerNo: goods.producerNo,
            checked: true
        }

        await addCart(data)


        //dispatch({type: 'ACTION_NAME'}) 을 통해 리듀서로 바로 접근해도 무방하나, 통일된 코드를 위해서 아래의 [액션함수] -> [reducer] 순으로 접근하도록 하였음

        //리덕스 액션 함수 호출
        props.addCart()

        notify('장바구니에 담았습니다', toast.success)
    }

    // 선물하기
    const onGiftClick = async () => {
        if(!isOpen){
            isOpenToggle()
        }
        else if(!checkRemainedCnt()){
            alert("최대로 구매 가능한 수량은 " + remainedCnt + "개 입니다.")
        }
        else{
            props.onClick({
                qty: orderQty,
                gift: true
            })
        }
    }

    // 선물하기(여러명)
    const onGiftMultiClick = async () => {
        if(!isOpen){
            isOpenToggle()
        }
        else if(!checkRemainedCnt()){
            alert("최대로 구매 가능한 수량은 " + remainedCnt + "개 입니다.")
        }
        else{
            props.onClick({
                qty: orderQty,
                multiGift: true
            })
        }
    }


    //구매가능여부 (로그인 및 소비자 인지 체크)
    async function isOkay() {
        if (!(await isUserTypeOf('consumer'))) {
            alert('소비자 로그인 후 이용 가능 합니다')
            Webview.openPopup('/login',  true); //로그인으로 이동팝업
            return false
        }
        return true
    }

    //userType 체크
    const isUserTypeOf = async (userType) => {
        //로그인 check
        const {data:loginUserType} = await getLoginUserType();
        return loginUserType === userType ? true : false
    }

    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 10000
        })
    }

    function isFinishGoods(){
        // let finishedSaleGoods = false
        const isFinishGoods = isFinishedDate(ComUtil.utcToTimestamp(goods.saleEnd));
        if(isFinishGoods || goods.saleStopped || goods.salePaused) {
            return true
            //setFinishedSaleGoods(true)
        }
        return false
    }

    function isFinishedDate(monentDate) {
        const now = ComUtil.utcToTimestamp(moment());
        return (monentDate < now);
    }


    function getFooterButtons(){
        // const buttons = []
        // if(finishedSaleGoods){
        //     buttons.puah(<div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}}><b>판매종료</b></div>)
        // }else if(goods.remainedCnt <= 0){
        //     buttons.puah(<div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}}><b>품절</b></div>)
        // }else{
        //       if(isOpen){
        //           buttons.puah(<div className={classNames(Css.btn, Css.btnWhite)} style={{width: '50%'}} onClick={onAddCartClick}>장바구니 담기</div>)
        //       }else{
        //
        //       }
        // }
        //
    }



    return(

        <Fragment>
            <div style={{background: 'white', height: isOpen ? 400 : 100}}></div>
            <div className={classNames(Css.footer, 'dom_bottom')}>
                <div className={Css.handle}
                     onClick={isOpenToggle}>
                    <Icon name={'handle'} style={{width: '100%', height: '100%'}}/>
                    <Icon className={Css.arrowIcon} name={isOpen ? 'arrowDownGray' : 'arrowUpGray'}/>
                </div>
                <Collapse isOpen={isOpen}>

                    <div className={Css.payableBox}>
                        <div>
                            <div className={Css.item}>
                                <img src={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl}/>
                                <SlideItemContent style={{flexGrow: 1, marginLeft: 16}} {...goods}/>
                            </div>
                            <div className={Css.item}>
                                <QtyInputGroup value={orderQty} onChange={onQtyChange}/>
                            </div>
                        </div>
                        <hr className={Css.lineLight}/>
                        <div className={Css.summaryBox}>
                            <div className={Css.text}>
                                <div>상품금액</div>
                                <div className={Css.black}>{ComUtil.toCurrency(goods.currentPrice * orderQty)} 원</div>
                            </div>
                            <div className={Css.text}>
                                <div>배송비</div>
                                <div className={Css.black}>{ComUtil.addCommas(deliveryFee)}원</div>
                            </div>
                            <div className={Css.text}>
                                <div>상품금액</div>
                                <div className={classNames(Css.black, Css.big)}>{ComUtil.toCurrency((goods.currentPrice * orderQty)+deliveryFee)} 원</div>
                            </div>
                        </div>
                    </div>

                </Collapse>

                {
                    (finishedSaleGoods || goods.remainedCnt <= 0) ?  (
                            <div className={classNames(Css.btn, Css.btnGreen, Css.disabled)} style={{flexGrow:1}}><b>{finishedSaleGoods ? '판매종료' : '품절'}</b></div>
                        )
                        :
                        (
                            [
                                isOpen ?
                                    [ComUtil.isPcWeb() ?
                                        <div className={Css.btnGroup}>
                                            <div className={classNames(Css.btn, Css.btnWhite)} style={{width: '25%'}} onClick={onAddCartClick}>장바구니 담기</div>
                                            <div className={classNames(Css.btn, Css.btnYellow)} style={{width: '25%'}} onClick={onGiftClick}>선물하기(한명)</div>
                                            <div className={classNames(Css.btn, Css.btnYellow)} style={{width: '25%'}} onClick={onGiftMultiClick}>선물하기(여러명)</div>
                                            <div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}} onClick={onBuyClick}><b>구매하기</b></div>
                                        </div>
                                        :
                                        <div className={Css.btnGroup}>
                                            <div className={classNames(Css.btn, Css.btnWhite)} style={{width: '33%'}} onClick={onAddCartClick}>장바구니 담기</div>
                                            <div className={classNames(Css.btn, Css.btnYellow)} style={{width: '33%'}} onClick={onGiftClick}>선물하기</div>
                                            <div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}} onClick={onBuyClick}><b>구매하기</b></div>
                                        </div>
                                    ]
                                    :
                                    <div className={Css.btnGroup}>
                                        <div className={classNames(Css.btn, Css.btnWhite)} onClick={onZzimClick}>
                                            {/*<IoMdHeartEmpty style={{fontSize: 22}}/>*/}
                                            {
                                                isZzim ? <IoMdHeart className={scale && Css.scale} style={{fontSize: 22, color: '#ff6060'}}/> :
                                                    <IoMdHeartEmpty style={{fontSize: 22}}/>
                                            }
                                        </div>
                                        <div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}} onClick={onBuyClick}><b>구매하기</b></div>
                                    </div>
                            ]
                        )
                }


                    {/*{*/}
                    {/*goods.remainedCnt > 0 ? (*/}
                    {/*finishedSaleGoods ? (*/}

                    {/*<div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}}><b>판매종료</b></div>*/}

                    {/*) : (*/}

                    {/*isOpen ?*/}
                    {/*<div className={classNames(Css.btn, Css.btnWhite)} style={{width: '50%'}} onClick={onAddCartClick}>장바구니 담기</div> :*/}
                    {/*<div className={classNames(Css.btn, Css.btnWhite)} onClick={onZzimClick}>*/}
                    {/*/!*<IoMdHeartEmpty style={{fontSize: 22}}/>*!/*/}
                    {/*{*/}
                    {/*isZzim ? <IoMdHeart className={scale && Css.scale} style={{fontSize: 22, color: '#ff6060'}}/> :*/}
                    {/*<IoMdHeartEmpty style={{fontSize: 22}}/>*/}
                    {/*}*/}
                    {/*</div>*/}



                    {/*)*/}
                    {/*) : (*/}

                    {/*<div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}} onClick={onBuyClick}><b>구매하기</b></div>*/}
                    {/*)*/}
                    {/*}*/}

                    {/*{*/}
                    {/*isOpen ?*/}
                    {/*<div className={classNames(Css.btn, Css.btnWhite)} style={{width: '50%'}} onClick={onAddCartClick}>장바구니 담기</div> :*/}
                    {/*<div className={classNames(Css.btn, Css.btnWhite)} onClick={onZzimClick}>*/}
                    {/*/!*<IoMdHeartEmpty style={{fontSize: 22}}/>*!/*/}
                    {/*{*/}
                    {/*isZzim ? <IoMdHeart className={scale && Css.scale} style={{fontSize: 22, color: '#ff6060'}}/> :*/}
                    {/*<IoMdHeartEmpty style={{fontSize: 22}}/>*/}
                    {/*}*/}
                    {/*</div>*/}
                    {/*}*/}
                    {/*<div className={classNames(Css.btn, Css.btnGreen)} style={{flexGrow:1}} onClick={onBuyClick}><b>구매하기</b></div>*/}

            </div>
            <ToastContainer/>

        </Fragment>


    )
}

//dispatch 를 통해 반환된 값을 props에 넣음 (직접 dispatch() 를 할 경우 필요없음)
function mapStateToProps(store) {
    return { counter: store.cart.counter }
}

//dispatch 할 함수를 props에 넣음 (직접 dispatch() 를 할 경우 필요없음)
function mapDispatchToProps(dispatch) {
    return {
        addCart: () => dispatch(actions.getCartCount())
    }
}


export default connect(mapStateToProps, mapDispatchToProps)(BuyFooter)