import React, { Fragment } from 'react'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import { ShopXButtonNav, BlocerySpinner, LoginLinkCard } from '../../common'
import Css from './CartList.module.scss'
import CartHeader from './CartHeader'
import CartGroup from './CartGroup'
import InvalidCartItem from './InvalidCartItem'
import CartSummary from './CartSummary'
import ComUtil from '~/util/ComUtil'

import { groupBy } from 'lodash'
import { Webview } from '~/lib/webviewApi'

import {getLoginUserType} from '~/lib/loginApi'

import { getCart, deleteCart, updateCart } from '~/lib/cartApi'
import { getGoodsByGoodsNo } from '~/lib/goodsApi'
import { getProducerByProducerNo } from '~/lib/producerApi'

import { getDeliveryFee } from '~/util/bzLogic'
import {Button } from 'reactstrap'
import {BodyFullHeight} from '~/components/common/layouts'
import { Div } from '~/styledComponents/shared/Layouts';

class CartList extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            // isCheckedAll: true,
            // cartList: undefined,
            // goodsList: [],
            expiredGoodsList: [],
            // validCartList: [],
            // producerInfoList: [],
            // groupByProducer: {},
            loginUserType: undefined,
            // groupCartList: [],


            isLoading: true,
            totCount: 0,
            checkedCount: 0,
            cartGoodsGroupList: undefined
        }
    }

    getCartList = async () => {
        const {data} = await getCart()
        return data
    }

    getCartGoodsList = async (cartList) => {

        const promises = cartList.map(cart => getGoodsByGoodsNo(cart.goodsNo))

        const resList = await Promise.all(promises)

        return resList.map((res, index )=> {
            const goods = res.data
            const cart = cartList[index]
            const cartGoods = {...goods, ...cart}

            const deliveryFee = getDeliveryFee({qty: cart.qty, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*cart.qty})

            //원래의 배송비 기억용
            cartGoods.orgDeliveryFee = deliveryFee

            //cart 전용 변수
            cartGoods.deliveryFee = deliveryFee
            cartGoods.goodsPrice = cartGoods.currentPrice * cartGoods.qty
            cartGoods.totPrice = cartGoods.goodsPrice + cartGoods.deliveryFee   //합계 : 상품가 + 배송비
            return cartGoods
         })
    }

    getCartGoodsGroupList = async (cartGoodsGroupObj) => {

        //생산자 리스트 조회
        const promises = Object.keys(cartGoodsGroupObj).map(producerNo => getProducerByProducerNo(producerNo))
        const resList = await Promise.all(promises)
        const producerList = resList.map(res => res.data)

        return producerList.map(producer => {
            const cartGoodsList = cartGoodsGroupObj[producer.producerNo]
            const summary = this.getSummary(cartGoodsList, producer)
            return {
                producerNo: producer.producerNo,    //빠른 검색을 위해 추가
                producer: producer,
                cartGoodsList: cartGoodsList,
                summary: summary
            }
        })
    }

    //그룹별 배송비 및 결제금액 계산
    getSummary = (cartGoodsList, producer) => {
        let sumDirectGoodsPrice = 0,        //즉시상품가격 합계(주의! 묶음배송 상품은 즉시상품만 해당 됩니다)
            sumReservationGoodsPrice = 0,   //예약상품가격 합계
            sumGoodsPrice = 0,              //전체상품가격 합계

            sumDirectDeliveryFee = 0,       //즉시상품 배송비 합계
            sumReservationDeliveryFee = 0,  //예약상품 배송비 합계
            sumDeliveryFee = 0,             //전체 배송비 합계

            // sumDiscountDeliveryFee = 0,     //묶음배송할인
            result = 0;                     //결제금


        //체크된것만 걸러냄
        const remainedCartGoodsList = cartGoodsList.filter(cartGoods => cartGoods.checked === true)

        let directGoodsCount = 0

        remainedCartGoodsList.map(cartGoods => {

            const goodsPrice = cartGoods.currentPrice * cartGoods.qty

            sumGoodsPrice += goodsPrice                             //상품가격 합계
            sumDeliveryFee += cartGoods.deliveryFee                 //전체 배송비 합계(할인적용되지 않은 원본)

            if(cartGoods.directGoods){
                sumDirectGoodsPrice += goodsPrice                   //즉시상품가격 합계
                sumDirectDeliveryFee += cartGoods.deliveryFee       //즉시상품 배송비 합계

                directGoodsCount += 1

                //묶음배송 생산자이고 두번째 즉시상품부터는 증가된 배송비 도로 감소시킴
                if(producer.producerWrapDeliver && directGoodsCount > 1){
                    // sumDiscountDeliveryFee += cartGoods.deliveryFee
                    sumDirectDeliveryFee -= cartGoods.deliveryFee
                }
            }else{
                sumReservationGoodsPrice += goodsPrice              //예약상품가격 합계
                sumReservationDeliveryFee += cartGoods.deliveryFee  //예약상품 배송비 합계
            }
        })

        if(remainedCartGoodsList.length > 0){

            //묶음 배송 생산자일 경우
            if(producer.producerWrapDeliver){
                const { producerWrapLimitPrice, producerWrapFee } = producer

                if(sumDirectGoodsPrice >= producerWrapLimitPrice){
                    //즉시구매 상품이 생산자가 설정한 금액보다 많으면 무료
                    // sumDiscountDeliveryFee = sumDirectDeliveryFee
                    sumDirectDeliveryFee = 0

                }else{
                    if(sumDirectDeliveryFee > 0){
                        //작으면 생산자가 설정한 배송비 적용
                        sumDirectDeliveryFee = producerWrapFee
                    }
                }
            }
            //
            // //묶음배송할인
            // // sumDiscountDeliveryFee = sumDeliveryFee - (sumDirectDeliveryFee + sumReservationDeliveryFee)
            //
            //결제금액 = 상품가 합계 + 배송비 합계 - 묶음배송할인
            result = sumGoodsPrice + sumDirectDeliveryFee + sumReservationDeliveryFee
        }else{
            sumDirectGoodsPrice = 0        //즉시상품가격 합계(주의! 묶음배송 상품은 즉시상품만 해당 됩니다)
            sumReservationGoodsPrice = 0   //예약상품가격 합계
            sumGoodsPrice = 0              //전체상품가격 합계

            sumDirectDeliveryFee = 0       //즉시상품 배송비 합계
            sumReservationDeliveryFee = 0  //예약상품 배송비 합계
            sumDeliveryFee = 0             //전체 배송비 합계

            // sumDiscountDeliveryFee = 0     //묶음배송할인
            result = 0                     //결제금
        }

        return {
            sumDirectGoodsPrice,
            sumReservationGoodsPrice,
            sumGoodsPrice,

            sumDirectDeliveryFee,
            sumReservationDeliveryFee,
            sumDeliveryFee,

            // sumDiscountDeliveryFee,

            result
        }
    }

    getFilteredCartGoodsList = (cartGoodsList) => {
        const validCartList = []        //판매중인 상품
        const expiredGoodsList = []     //판매종료 상품

        cartGoodsList.map(cartGoods => {
            if(cartGoods.remainedCnt <= 0 || ComUtil.utcToTimestamp(cartGoods.saleEnd) <= ComUtil.utcToTimestamp(new Date()) || cartGoods.saleStopped)
                expiredGoodsList.push(cartGoods)
            else
                validCartList.push(cartGoods)
        })

        return {
            validCartList,
            expiredGoodsList
        }
    }

    getCheckedCount = (cartGoodsList) => {
        return cartGoodsList.filter(cartGoods => cartGoods.checked === true).length
    }

    searchCartGoodsGroupList = async () => {
        //장바구니 리스트
        const cartList = await this.getCartList()
        //장바구니 리스트 + 상품리스트 + 배송비계산 추가
        const cartGoodsList = await this.getCartGoodsList(cartList)



        const {
            validCartList,      //판매중 상품 리스트
            expiredGoodsList    //판매완료 상품 리스트
        } = this.getFilteredCartGoodsList(cartGoodsList)

        //체크된 카운트
        const checkedCount = this.getCheckedCount(validCartList)

        console.log({validCartList,      //판매중 상품 리스트
            expiredGoodsList    })
        
        //생산자별 그룹 오브젝트
        const cartGoodsGroupObj = groupBy(validCartList, 'producerNo')

        //생산자별 그룹 리스트
        const cartGoodsGroupList = await this.getCartGoodsGroupList(cartGoodsGroupObj)

        console.log({
            "step1: cartList": cartList,
            "step2: cartGoodsList": cartGoodsList,
            "step3: 필터링(판매중/판매완료)": {validCartList, expiredGoodsList},
            "step3: cartGoodsGroupObj": cartGoodsGroupObj,
            "step4: cartGoodsGroupList": cartGoodsGroupList})

        //전체 카운트 디폴트 세팅
        const totCount = validCartList.length

        console.log(totCount, checkedCount)

        this.setState({
            cartGoodsGroupList,
            expiredGoodsList,
            totCount: totCount,
            checkedCount: checkedCount
        })

    }


    async componentDidMount(){

        const {data:loginUserType} = await getLoginUserType();

        if(loginUserType === 'consumer'){
            await this.searchCartGoodsGroupList()
        }

        this.setState({loginUserType: loginUserType, isLoading: false})
        // this.setState({loginUserType})


    }

    onCartHeadChange = async ({type, state}) => {

        const cartGoodsGroupList = Object.assign([], this.state.cartGoodsGroupList)

        if(type === "CHECKED_ALL"){
            const { checked } = state


            let promises = []

            const consumerNo = this.state.loginUserType.uniqueNo

            cartGoodsGroupList
                .map(cartGoodsGroup => {
                    //체크상태 변경
                    cartGoodsGroup.cartGoodsList.map(cartGoods => {

                        cartGoods.checked = checked

                        const cart = {
                            consumerNo: consumerNo,
                            goodsNo: cartGoods.goodsNo,
                            producerNo: cartGoods.producerNo,
                            qty: cartGoods.qty,
                            checked: checked
                        }
                        promises.push(updateCart(cart))

                    })
                    cartGoodsGroup.summary = this.getSummary(cartGoodsGroup.cartGoodsList, cartGoodsGroup.producer)
                })


            //db 업데이트
            if(promises)
                await Promise.all(promises)

            const checkedCount = checked ? this.state.totCount : 0

            this.setState({
                cartGoodsGroupList,
                checkedCount: checkedCount
            })

            // const cartList = Object.assign([], this.state.cartList)
            // const validCartList = Object.assign([], this.state.validCartList)
            //
            // cartList.map(cart => {
            //     const validGoods = validCartList.find(goods => goods.goodsNo === cart.goodsNo);
            //     if(validGoods) {
            //         cart.checked = checked
            //     }
            // })
            // this.setState({cartList})
        }else if(type === "DELETE_ITEMS"){
            if(!this.requestDeleteConfirm()) return

            let goodsNoList = []

            cartGoodsGroupList.map(cartGoodsGroup => {
                const { cartGoodsList } = cartGoodsGroup
                cartGoodsList.map(cartGoods => {
                    if(cartGoods.checked){
                        goodsNoList.push(cartGoods.goodsNo)
                    }
                })
            })



            //db 삭제
            const promises = goodsNoList.map(goodsNo => deleteCart(goodsNo))
            await Promise.all(promises)


            //db 조회
            await this.searchCartGoodsGroupList()
        }

    }

    //장바구니에 상품정보 바인딩 및 배송정책 적용
    calculateCart = (cartGoods, goods) => {
        // const goods = goodsList.find(goods => goods.goodsNo === cartGoods.goodsNo)

        const deliveryFee = getDeliveryFee({qty: cartGoods.qty, deliveryFee: goods.deliveryFee, deliveryQty: goods.deliveryQty, termsOfDeliveryFee: goods.termsOfDeliveryFee, orderPrice: goods.currentPrice*cartGoods.qty})

        //배송비 정책 적용
        cartGoods.deliveryFee = deliveryFee

        //합계 적용
        cartGoods.goodsPrice = cartGoods.qty * goods.currentPrice           //상품가 : 수량 * 현재가
        cartGoods.totPrice = cartGoods.goodsPrice + cartGoods.deliveryFee   //합계 : 상품가 + 배송비

        //즉시상품 여부
        cartGoods.directGoods = goods.directGoods
    }

    onCartItemChange = async ({type, state}) => {
        const cartGoodsGroupList = Object.assign([], this.state.cartGoodsGroupList)
        const cartGoodsGroup = cartGoodsGroupList.find(g => g.producerNo === state.producerNo)
        const { producer, cartGoodsList, summary } = cartGoodsGroup
        const cartGoods = cartGoodsList.find(cartGoods => cartGoods.goodsNo === state.goodsNo)

        switch (type){
            case 'UPDATE_QTY' :

                const { data: goods } = await getGoodsByGoodsNo(state.goodsNo)

                //재고수량 체크
                if(state.qty > goods.remainedCnt){
                    cartGoods.qty = goods.remainedCnt
                    this.notify('재고수량이 부족합니다', toast.warn)
                }else{
                    cartGoods.qty = state.qty
                }

                //장바구니에 상품정보 바인딩 및 배송정책 적용
                this.calculateCart(cartGoods,  goods)

                //장바구니 db 업데이트
                updateCart(cartGoods)

                //합계 갱신
                cartGoodsGroup.summary = this.getSummary(cartGoodsList, producer)
                break

            case 'UPDATE_CHECKED' :

                const { checked, producerNo, goodsNo } = state
                const cart = {
                    consumerNo: this.state.loginUserType.uniqueNo,
                    goodsNo: goodsNo,
                    producerNo: producerNo,
                    qty: state.qty,
                    checked: checked
                }

                //db update
                await updateCart(cart)

                //체크상태 변경
                cartGoods.checked = checked

                //합계 갱신
                cartGoodsGroup.summary = this.getSummary(cartGoodsList, producer)

                const checkedCount = checked ? this.state.checkedCount +1 : this.state.checkedCount -1

                this.setState({checkedCount})


                break

            case 'DELETE' :

                if(!this.requestDeleteConfirm()) return

                await deleteCart(state.goodsNo)

                const remainedCartGoodsList = cartGoodsList.filter(cartGoods => cartGoods.goodsNo != state.goodsNo)

                //해당 생산자의 상품이 없다면 생산자 삭제
                if(remainedCartGoodsList.length <= 0){
                    const index = cartGoodsGroupList.findIndex(cartGoodsGroup => cartGoodsGroup.producerNo  == state.producerNo)
                    cartGoodsGroupList.splice(index, 1)
                }else{
                    cartGoodsGroup.cartGoodsList = remainedCartGoodsList
                    //합계 갱신
                    cartGoodsGroup.summary = this.getSummary(cartGoodsGroup.cartGoodsList, producer)
                }

                this.setState({totCount: this.state.totCount -1, checkedCount: this.state.checkedCount -1})

                break
        }

        this.setState({cartGoodsGroupList})
    }

    onExpiredCartGoodsItemChange = async ({type, state}) => {
        if(type === "DELETE"){
            const { goodsNo } = state
            
            //db 삭제
            await deleteCart(goodsNo)

            //db 조회
            this.searchCartGoodsGroupList()
        }
    }

    requestDeleteConfirm = () => {
        return window.confirm('선택한 상품을 삭제 하시겠습니까?')
    }

    // getCheckedItems = () => {
    //     return this.state.validCartList.filter(cart => cart.checked)
    // }


    checkValidation = () => {

        console.log(this.state.cartGoodsGroupList)
        const cartGoodsGroupList = this.state.cartGoodsGroupList

        let superRewardGoods = []

        cartGoodsGroupList.map(({cartGoodsList}) => {
            const ary = cartGoodsList.filter(cartGoods => cartGoods.superReward && cartGoods.inSuperRewardPeriod && cartGoods.qty > 1)
            superRewardGoods = superRewardGoods.concat(ary)
        })

        if (superRewardGoods.length > 0) {
            alert(`[${superRewardGoods[0].goodsNm}] 슈퍼리워드 상품은 하나만 구입 가능합니다`);

            return false
        }

        return true

    }

    onPayClick = async () => {

        if (!this.checkValidation()) {
            return
        }

        const {data:loginUserType} = await getLoginUserType();

        // 상품상세에서 구매버튼 클릭시 체크하도록 이동.
        if (loginUserType === 'consumer') { //미 로그인 시 로그인 창으로 이동.

            //구매로 이동팝업
            Webview.openPopup('/cartBuy', true);

            // //장바구니 db 업데이트
            // const checkedItems = this.state.validCartList;
            //
            // const result = checkedItems.map(async (cart) => {
            //     await updateCart(cart);
            // });
            //
            // Promise.all(result).then(response => {
            //     //구매로 이동팝업
            //     Webview.openPopup('/cartBuy', true);
            // });
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


    getTotPriceInfo = () => {
        let totGoodsPrice = 0,
            totDirectDeliveryFee = 0,
            totReservationDeliveryFee = 0;

        this.state.cartGoodsGroupList.map(cartGoodsGroup => {
            const { sumGoodsPrice, sumDirectDeliveryFee, sumReservationDeliveryFee } = cartGoodsGroup.summary
            totGoodsPrice += sumGoodsPrice
            totDirectDeliveryFee += sumDirectDeliveryFee
            totReservationDeliveryFee += sumReservationDeliveryFee
        })

        return {
            totGoodsPrice,
            totDirectDeliveryFee,
            totReservationDeliveryFee
        }
    }



    render(){
        if(this.state.isLoading) return <BlocerySpinner />
        if(this.state.loginUserType !== 'consumer') return (
            <Fragment>
                <ShopXButtonNav underline historyBack>장바구니</ShopXButtonNav>
                <BodyFullHeight nav bottomTabbar>
                    <LoginLinkCard icon description={'로그인 후 장바구니 서비스를 이용 하실 수 있습니다'} onClick={this.onLoginClick} />
                </BodyFullHeight>
            </Fragment>
        )

        // const checkedItems = this.getCheckedItems()
        const { totCount, checkedCount } = this.state
        
        //전체 계산금액
        const { totGoodsPrice, totDirectDeliveryFee, totReservationDeliveryFee } = this.getTotPriceInfo()

        return(
            <Fragment>
                <ShopXButtonNav underline historyBack>장바구니</ShopXButtonNav>
                <BodyFullHeight nav bottomTabbar>
                    <div className={Css.wrap}>

                        {/* 장바구니에 담긴 내역 없을때 */}
                        {
                            this.state.cartGoodsGroupList.length <= 0 &&(
                                <div className='bg-white d-flex justify-content-center align-items-center mb-3' style={{minHeight: 150}}>
                                    장바구니에 담긴 상품이 없습니다.
                                </div>
                            )
                        }

                        {
                            this.state.cartGoodsGroupList.length > 0 && (
                                <Fragment>
                                    {/* 택 */}
                                    <div className={Css.sticky}>
                                        <CartHeader onChange={this.onCartHeadChange} checkedCount={checkedCount} totCount={totCount}/>
                                    </div>
                                    {/* 생산자별 리스트 */}

                                    {
                                        this.state.cartGoodsGroupList.map((cartGoodsGroup, index) =>{
                                            const { producer, cartGoodsList, summary } = cartGoodsGroup
                                            return(
                                                <Div key={'groupByProducer'+index} mb={5}>
                                                    <Div bg={'dark'} fg={'white'} fontSize={15} p={7.5} pl={15}>{producer.farmName}</Div>
                                                    <CartGroup
                                                        history={this.props.history}
                                                        producer={producer}                 // 생산자 정보
                                                        cartList={cartGoodsList}      // cart에 담긴 상품 정보
                                                        summary={summary}
                                                        onChange={this.onCartItemChange}
                                                    />
                                                </Div>
                                            )
                                        })
                                    }
                                    <div className='mb-2'>
                                        <CartSummary
                                            totGoodsPrice={totGoodsPrice}
                                            totDirectDeliveryFee={totDirectDeliveryFee}
                                            totReservationDeliveryFee={totReservationDeliveryFee}
                                            // onClick={this.onPayClick}
                                        />
                                    </div>

                                    <Button className={'p-3 font-weight-bold rounded-0 mb-2'}
                                            block
                                            size={'lg'}
                                            disabled={checkedCount <= 0 ? true : false}
                                            color='info'
                                            onClick={this.onPayClick}
                                    >주문하기 ({ComUtil.addCommas(checkedCount)}개)</Button>

                                    {/*{*/}
                                        {/*this.state.expiredGoodsList.map((cartGoods, index) =>*/}
                                            {/*<InvalidCartItem*/}
                                                {/*history={this.props.history}*/}
                                                {/*key={'cartItem'+index}*/}
                                                {/*{...cartGoods}*/}
                                                {/*qty={cartGoods.qty}*/}
                                                {/*checked={cartGoods.checked}*/}
                                                {/*deliveryFee={cartGoods.deliveryFee}*/}
                                                {/*goodsPrice={cartGoods.goodsPrice}*/}
                                                {/*onChange={this.onExpiredCartGoodsItemChange}/>*/}
                                        {/*)*/}
                                    {/*}*/}
                                </Fragment>
                            )
                        }
                        {
                            this.state.expiredGoodsList.map((cartGoods, index) =>
                                <InvalidCartItem
                                    history={this.props.history}
                                    key={'cartItem'+index}
                                    {...cartGoods}
                                    qty={cartGoods.qty}
                                    checked={cartGoods.checked}
                                    deliveryFee={cartGoods.deliveryFee}
                                    goodsPrice={cartGoods.goodsPrice}
                                    onChange={this.onExpiredCartGoodsItemChange}/>
                            )
                        }
                    </div>


                    <ToastContainer/>
                </BodyFullHeight>
            </Fragment>
        )

    }
}

CartList.propTypes = {
}

CartList.defaultProps = {
}

export default CartList
