import React, { useState, Fragment } from 'react'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import { ShopXButtonNav, BlocerySpinner, LoginLinkCard } from '../../common'
import Css from './CartList.module.scss'
import CartHeader from './CartHeader'
import CartItem from './CartItem'
import InvalidCartItem from './InvalidCartItem'
import CartSummary from './CartSummary'
import ComUtil from '~/util/ComUtil'

import { Webview } from '../../../lib/webviewApi'

import {getLoginUserType} from '../../../lib/loginApi'

import { getCart, deleteCart, updateCart } from '../../../lib/cartApi'
import { getGoodsByGoodsNo } from '../../../lib/goodsApi'

import { getDeliveryFee } from '../../../util/bzLogic'
import {Button } from 'reactstrap'
class CartList extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isCheckedAll: true,
            cartList: undefined,
            goodsList: [],
            expiredGoodsList: [],
            validCartList: [],
            loginUserType: undefined,
        }
    }

    async componentDidMount(){

        const {data:loginUserType} = await getLoginUserType();
        console.log({loginUserType})
        this.setState({loginUserType})
        if(loginUserType !== 'consumer'){
            return
        }

        await this.search()
    }

    search = async () => {

        const { status, data } = await getCart()

        if(status != 200){
            return false
        }

        const cartList = data.map(cart => {
            cart.checked = true
            return cart
        }) //최초 전체 체크 되어있도록 함

        await this.getGoodsList(cartList)
        // console.log(data)
    }


    getGoodsList = async (cartList) => {

        const result = cartList.map(async (cart) => await getGoodsByGoodsNo(cart.goodsNo))
        const response = await Promise.all(result)

        const goodsList = response.map( ({data:goods}) => {
            //TODO: 생산자 상품등록에서 무료배송비조건(deliveryFreeQty)을 넣으면 아래 구문 삭제
            //goods.deliveryFee = 2500
            //goods.deliveryFreeQty = 4

            return goods
        })

        //장바구니에 상품정보 바인딩 및 배송정책 적용
        cartList.map(cart => this.calculateCart(cart, goodsList))

        // 판매종료, 품절상품 따로 expiredGoodsList 만들어서 UI 아래부분에 넣어주기
        const expiredGoodsList = goodsList.filter(goods => goods.remainedCnt <= 0 || ComUtil.utcToTimestamp(goods.saleEnd) <= ComUtil.utcToTimestamp(new Date()) || goods.saleStopped);

        const validCartList = cartList.filter(cart => {
            const expiredGoods = expiredGoodsList.find(goods => goods.goodsNo === cart.goodsNo)
            if(!expiredGoods)
            {
                const goods = goodsList.find(goods => goods.goodsNo === cart.goodsNo)
                return goods;
            } else {
                cart.checked = false;  // 유효하지 않은 상품은 선택 안한 것으로 DB를 업데이트하여 구매페이지에서 조회 안되도록 하기 위함
            }
        })

        this.setState({cartList, goodsList, expiredGoodsList, validCartList})

        cartList.map(async (cart) => {
            await updateCart(cart);
        });
    }


    onCartHeadChange = async ({type, state}) => {
        switch(type){
            case 'CHECKED_ALL' :
                const cartList = Object.assign([], this.state.cartList)
                const validCartList = Object.assign([], this.state.validCartList)
                const { checked } = state
                cartList.map(cart => {
                    const validGoods = validCartList.find(goods => goods.goodsNo === cart.goodsNo);
                    if(validGoods) {
                        cart.checked = checked
                    }
                })
                this.setState({cartList})
                break
            case 'DELETE_ITEMS' :

                if(!this.requestDeleteConfirm()) return
                const remainedCartList = this.state.cartList.filter((cart) => !cart.checked)
                const remainedValidCartList = this.state.validCartList.filter((cart) => !cart.checked)
                const checkedCartList = this.state.cartList.filter((cart) => cart.checked)
                const result = checkedCartList.map(async(cart)=>await deleteCart(cart.goodsNo))
                await Promise.all(result)

                this.setState({cartList: remainedCartList})
                this.setState({validCartList: remainedValidCartList})

                // await this.search()
                break
        }
    }

    //장바구니에 상품정보 바인딩 및 배송정책 적용
    calculateCart = (cart, goodsList) => {

        const goods = goodsList.find(goods => goods.goodsNo === cart.goodsNo)

        //배송비 정책 적용
        cart.deliveryFee = getDeliveryFee({qty: cart.qty, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee})

        //합계 적용
        cart.goodsPrice = cart.qty * goods.currentPrice      //상품가 : 수량 * 현재가
        cart.totPrice = cart.goodsPrice + cart.deliveryFee   //합계 : 상품가 + 배송비
    }

    onCartItemChange = async ({type, state}) => {

        const cartList = Object.assign([], this.state.cartList)
        const cart = cartList.find(item => item.goodsNo === state.goodsNo)



        switch (type){
            case 'UPDATE_QTY' :

                const { data: goods } = await getGoodsByGoodsNo(state.goodsNo)

                //재고수량 체크
                if(state.qty > goods.remainedCnt){
                    cart.qty = goods.remainedCnt
                    this.notify('재고수량이 부족합니다', toast.warn)
                }else{
                    cart.qty = state.qty
                }

                //장바구니에 상품정보 바인딩 및 배송정책 적용
                this.calculateCart(cart, this.state.goodsList)

                //장바구니 db 업데이트
                updateCart(cart)

                this.setState({
                    cartList
                })
                break

            case 'UPDATE_CHECKED' :
                cart.checked = state.checked

                this.setState({
                    cartList,
                })
                break

            case 'DELETE' :

                if(!this.requestDeleteConfirm()) return

                const remainedCartList = this.state.cartList.filter((item) => item.goodsNo !== state.goodsNo)
                const remainedValidCartList = this.state.validCartList.filter((item) => item.goodsNo !== state.goodsNo)

                await deleteCart(state.goodsNo)

                this.setState({
                    cartList: remainedCartList,
                    validCartList: remainedValidCartList
                })
                break
        }
    }

    requestDeleteConfirm = () => {
        return window.confirm('선택한 상품을 삭제 하시겠습니까?')
    }

    getCheckedItems = () => {
        return this.state.validCartList.filter(cart => cart.checked)
    }

    getPayableInfo = (cartList) => {
        let sumGoodsPrice = 0
        let sumDeliveryFee = 0
        cartList.map((cart) => {
            sumGoodsPrice = sumGoodsPrice + cart.goodsPrice       //총 상품금액
            sumDeliveryFee = sumDeliveryFee + cart.deliveryFee              //총 배송비
        })

        return {sumGoodsPrice, sumDeliveryFee}
    }

    onPayClick = async () => {

        const {data:loginUserType} = await getLoginUserType();

        // 상품상세에서 구매버튼 클릭시 체크하도록 이동.
        if (loginUserType === 'consumer') { //미 로그인 시 로그인 창으로 이동.

            //장바구니 db 업데이트
            const checkedItems = this.state.validCartList;
            const result = checkedItems.map(async (cart) => {
                await updateCart(cart);
            });

            Promise.all(result).then(response => {
                //구매로 이동팝업
                Webview.openPopup('/cartBuy', true);
            });
        }
        else {
            Webview.openPopup('/login',  false); //로그인으로 이동팝업
        }
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    onLoginClick = () => {
        Webview.openPopup('/login')
    }

    render(){

        if(this.state.loginUserType === undefined) return <BlocerySpinner />
        if(this.state.loginUserType !== 'consumer') return (
            <Fragment>
                <ShopXButtonNav back history={this.props.history}>장바구니</ShopXButtonNav>
                <div className='p-4'>
                    <LoginLinkCard onClick={this.onLoginClick} />
                </div>
            </Fragment>
        )

        const checkedItems = this.getCheckedItems()
        const checkedCount = checkedItems.length
        const { sumGoodsPrice, sumDeliveryFee } = this.getPayableInfo(checkedItems)

        return(
            <Fragment>
                <ShopXButtonNav back history={this.props.history}>장바구니</ShopXButtonNav>
                <div className={Css.wrap}>

                    {/* 장바구니에 담긴 내역 없을때 */}
                    {
                        this.state.cartList != undefined && this.state.cartList.length <= 0 &&(
                            <div className='bg-white d-flex justify-content-center align-items-center mb-3' style={{minHeight: 150}}>
                                장바구니에 담긴 상품이 없습니다.
                            </div>
                        )
                    }

                    {
                        this.state.cartList != undefined && this.state.cartList.length > 0 && (
                            <Fragment>
                                {/* 전체선택 */}
                                <div className={Css.sticky}>
                                    <CartHeader onChange={this.onCartHeadChange} checkedCount={checkedCount} totCount={this.state.validCartList.length}/>
                                </div>
                                {/* 리스트 */}
                                {
                                    this.state.validCartList.map((cart, index) => {
                                        const goods = this.state.goodsList.find(goods => goods.goodsNo === cart.goodsNo)
                                        return (
                                            <CartItem
                                                history={this.props.history}
                                                key={'validCartItem'+index}
                                                {...goods}
                                                qty={cart.qty}
                                                checked={cart.checked}
                                                deliveryFee={cart.deliveryFee}
                                                goodsPrice={cart.goodsPrice}
                                                onChange={this.onCartItemChange}/>
                                        )
                                    })
                                }

                                <div className='mb-2'>
                                    <CartSummary
                                        sumGoodsPrice={sumGoodsPrice}
                                        sumDeliveryFee={sumDeliveryFee}
                                        checkedCount={checkedCount}
                                        onClick={this.onPayClick}
                                    />
                                </div>

                                <Button className={'p-3 font-weight-bold rounded-0 mb-2'}
                                        block
                                        size={'lg'}
                                        disabled={ComUtil.toNum(sumGoodsPrice) + ComUtil.toNum(sumDeliveryFee) <= 0 ? true : false}
                                        color='info'
                                        onClick={this.onPayClick}
                                >주문하기 ({ComUtil.addCommas(checkedCount)}개)</Button>

                                {
                                    this.state.cartList.map((cart, index) => {
                                        const expiredGoods = this.state.expiredGoodsList.find(expiredGoods => expiredGoods.goodsNo === cart.goodsNo)
                                        if(!expiredGoods) return;
                                        return (
                                            <InvalidCartItem
                                                history={this.props.history}
                                                key={'cartItem'+index}
                                                {...expiredGoods}
                                                qty={cart.qty}
                                                checked={cart.checked}
                                                deliveryFee={cart.deliveryFee}
                                                goodsPrice={cart.goodsPrice}
                                                onChange={this.onCartItemChange}/>
                                        )
                                    })
                                }
                            </Fragment>
                        )
                    }
                </div>


                <ToastContainer/>
            </Fragment>
        )
    }
}

CartList.propTypes = {
}

CartList.defaultProps = {
}

export default CartList
