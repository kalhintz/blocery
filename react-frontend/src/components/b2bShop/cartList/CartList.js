import React, { useState, Fragment } from 'react'

import ComUtil from '~/util/ComUtil'
import { Webview } from '~/lib/webviewApi'
import { checkFoodsRemainedCntBySellerList } from '~/util/bzLogic'

import {getB2bLoginUserType, getB2bLoginUser} from '~/lib/b2bLoginApi'
import { getJoinedCart, deleteCart, updateCart, addCartToBuy } from '~/lib/b2bCartApi'
import { getFoodsByFoodsNo } from '~/lib/b2bFoodsApi'
import { getDeliveryFee } from '~/util/bzLogic'

import { ToastContainer, toast } from 'react-toastify'                              //토스트
import { B2bShopXButtonNav, B2bLoginLinkCard, BlocerySpinner } from '~/components/common'
import HeaderBox from './HeaderBox'
import CartHeader from './CartHeader'
import ExpiredFoodsItem from './ExpiredFoodsItem'
import SellerItem from './SellerItem'
import { Button } from 'reactstrap';

import { TERMS_OF_DELIVERYFEE } from '~/lib/bloceryConst'



// const cartToDeal = {
//     buyerNo: 1,
//     dealGroup: {
//         totalCurrentPrice: 1,                              //총 상품가격
//         totalDeliveryFee: 1,                               //총 배송비
//         totalDiscountFee: 1,                               //총 할인비
//         totalOrderPrice: 1,                                //총 주문 결제 금액
//         orderGoodsNm: '셀러1[카드결제]',                                  //묶음 배송명.  대표상품외 몇개. 이런식으로 저장
//     },
//     dealDetail: [
//         {
//             sellerNo: 1,                                       //생산자번호
//             buyerNo: 1,                                        //소비자번호
//             deliveryMethod: '',                                //"direct" or "taekbae"
//             dealDetailName: '수박kg 외 4건',                              //묶음 배송명.  대표상품외 몇개. 이런식으로 저장
//             farmName: '',
//             orderImg: '',                                       //상품대표이미지
//             deliveryFee: 1,                                    //묶음주문 총 배송비
//             discountFee: 1,                                    //할인금액 (배송비할인등)
//             orderPrice: 1,                                     //묶음 주문 총 가격 (= 상품가격 * 주문개수 + 배송비 - 할인금액)
//             currentPrice: 1,                                    //상품가격(현재할인된가격)
//             payMethod: '',                                   //card or waesang
//             foodsDealList: [{orderCnt:1, },{},{},{},{},{},{},{},{},],
//         },
//     ]
// }

const Style = {
    sticky: {
        position: '-webkit-sticky',
        position: 'sticky',
        top: 0,
        zIndex: 1
    }
}

class CartList extends React.Component {
    constructor(props){
        super(props)
        this.state = {
            isCheckedAll: true,
            tabId: '1',
            directDeliverySellerList: [],   //직배송 판매자 리스트
            taekbaeDeliverySellerList: [],  //택배배송 판매자 리스트
            expiredFoodsList: [],          //판매종료, 품절상품
            sellerFoodsTotCount: 0,
            loginUserType: undefined
        }
    }

    async componentDidMount(){
        const {data:loginUserType} = await getB2bLoginUserType();
        this.setState({loginUserType})
        if(loginUserType !== 'buyer'){
            return
        }
        await this.searchDirection()
    }

    onHeaderClick = (tabId) => {
        this.setState({
            tabId
        }, ()=>this.searchDirection())
    }

    searchDirection = async () => {

        const sellerList = await this.searchSellerList()

        const { directDeliverySellerList, taekbaeDeliverySellerList, expiredFoodsList } = this.filterData(sellerList)

        //배송비계산 적용
        this.calculateFoodsBySellerList(directDeliverySellerList)
        this.calculateFoodsBySellerList(taekbaeDeliverySellerList)

        //재고체크
        await checkFoodsRemainedCntBySellerList(directDeliverySellerList, 'foodsList')
        await checkFoodsRemainedCntBySellerList(taekbaeDeliverySellerList, 'foodsList')

        console.log({ expiredFoodsList })

        let sellerFoodsTotCount = 0

        directDeliverySellerList.map(seller => sellerFoodsTotCount += seller.foodsList.length)
        taekbaeDeliverySellerList.map(seller => sellerFoodsTotCount += seller.foodsList.length)

        // const cartList = data.map(cart => {
        //     cart.checked = true
        //     return cart
        // }) //최초 전체 체크 되어있도록 함

        this.setState({
            directDeliverySellerList,   //직배송 셀러 리스트
            taekbaeDeliverySellerList,  //택배송 셀러 리스트
            expiredFoodsList,           //판매불가 상품들
            sellerFoodsTotCount         //전체 상품 카운트
        })
    }

    searchSellerList = async () => {

        const { tabId } = this.state
        let sellerList = []

        //카드결제 상품
        if(tabId === '1') {
            const { status, data } = await getJoinedCart({})                    //카드결제상품(전체상품을 의미)
            sellerList = data
        }
        //외상거래 상품(외상도 되는상품임)
        else{
            const { status, data } = await getJoinedCart({waesangDeal: true}) //외상거래가능 상품(전체상품중 외상거래가능 판매자 상품을 의미)
            sellerList = data
        }
        console.log({sellerList})
        return sellerList
    }

    // filterData = ({data, type}) => {
    //     if(type === 'directDelivery')
    //         data.filter(item => item.directDelivery === true )
    //     else if(type === 'taekbaeDelivery')
    //         data.filter(item => item.taekbaeDelivery === true )
    // }

    filterData = (data) => {
        const directDeliverySellerList = data.filter(item => item.directDelivery === true )
        const taekbaeDeliverySellerList = data.filter(item => item.taekbaeDelivery === true )



        //재고수량이 없거나, 판매기한이 지나거나 판매중지된 상품을 분리하고 리턴함
        const a = this.separateExpiredFoodsListFromSellerList(directDeliverySellerList)
        const b = this.separateExpiredFoodsListFromSellerList(taekbaeDeliverySellerList)
        const expiredFoodsList = [].concat(a, b)

        return{
            directDeliverySellerList,
            taekbaeDeliverySellerList,
            expiredFoodsList
        }
    }

    //SellerList 에서 재고수량이 없거나, 판매기한이 지나거나 판매중지된 상품을 expiredFoodsList로 옮긴다
    separateExpiredFoodsListFromSellerList(sellerList){
        const expiredFoodsList = []
        sellerList.map(seller => {
            const foodsList = seller.foodsList.filter(foods => foods.remainedCnt <= 0 || ComUtil.utcToTimestamp(foods.saleEnd) <= ComUtil.utcToTimestamp(new Date()) || foods.saleStopped);
            foodsList.map(foods => {
                const idx = seller.foodsList.indexOf(foods);
                const expiredFoods = seller.foodsList.splice(idx,1)[0]
                console.log({expiredFoods})
                expiredFoodsList.push(expiredFoods)
            })
        })
        return expiredFoodsList
    }


    setTotalCount = () => {

        // let sellerFoodsTotCount = 0
        // this.state.directDeliverySellerList.map(seller => sellerFoodsTotCount += seller.foodsList.length)
        // this.state.taekbaeDeliverySellerList.map(seller => sellerFoodsTotCount += seller.foodsList.length)



    }




    getFoodsList = async (cartList) => {

        const result = cartList.map(async (cart) => await getFoodsByFoodsNo(cart.foodsNo))
        const response = await Promise.all(result)

        const foodsList = response.map( ({data:foods}) => {
            //TODO: 생산자 상품등록에서 무료배송비조건(deliveryFreeQty)을 넣으면 아래 구문 삭제
            //foods.deliveryFee = 2500
            //foods.deliveryFreeQty = 4

            return foods
        })

        //장바구니에 상품정보 바인딩 및 배송정책 적용
        cartList.map(cart => this.calculateFoods(cart, foodsList))

        // 판매종료, 품절상품 따로 expiredGoodsList 만들어서 UI 아래부분에 넣어주기
        const expiredGoodsList = foodsList.filter(foods => foods.remainedCnt <= 0 || ComUtil.utcToTimestamp(foods.saleEnd) <= ComUtil.utcToTimestamp(new Date()) || foods.saleStopped);

        const validCartList = cartList.filter(cart => {
            const expiredGoods = expiredGoodsList.find(foods => foods.foodsNo === cart.foodsNo)
            if(!expiredGoods)
            {
                const foods = foodsList.find(foods => foods.foodsNo === cart.foodsNo)
                return foods;
            } else {
                cart.checked = false;  // 유효하지 않은 상품은 선택 안한 것으로 DB를 업데이트하여 구매페이지에서 조회 안되도록 하기 위함
            }
        })

        this.setState({cartList, foodsList, expiredGoodsList, validCartList})

        cartList.map(async (cart) => {
            await updateCart(cart);
        });
    }

    checkOrUnCheckAll(name, data, checked){
        const sellerList = [].concat(data)
        sellerList.map(seller => {
            seller.checked = checked
            seller.foodsList.map(foods => foods.checked = checked)
        })

        this.setState({
            [name]: sellerList
        })

        // return sellerList
    }

    async deleteItems(){
        if(!this.requestDeleteConfirm()) return

        const { directDeliverySellerList, taekbaeDeliverySellerList } = Object.assign({}, this.state)

        //db에서 삭제될 상품번호 리스트
        const delDirectFoodsList = this.deleteItem(directDeliverySellerList)
        const delTaekbaeFoodsList = this.deleteItem(taekbaeDeliverySellerList)

        await this.deleteItemsFromDb(delDirectFoodsList)
        await this.deleteItemsFromDb(delTaekbaeFoodsList)

        this.setState({
            directDeliverySellerList,
            taekbaeDeliverySellerList
        })
    }

    async deleteItemsFromDb(foodsList){
        const result = foodsList.map(async (foods) => {
            await deleteCart(foods.foodsNo)
        })

        await Promise.all(result)
    }

    deleteItem(sellerList){
        //db에서 삭제될 상품번호 리스트
        let delFoodsList = []
        sellerList.map(seller => {
            const checkedList = seller.foodsList.filter(foods => foods.checked)
            const unCheckedList = seller.foodsList.filter(foods => !foods.checked)

            delFoodsList = delFoodsList.concat(checkedList)
            seller.foodsList = unCheckedList

        })
        return delFoodsList
    }

    onCartHeadChange = async ({type, state}) => {
        switch(type){
            case 'CHECKED_ALL' :
                const checked = state.checked

                this.checkOrUnCheckAll('directDeliverySellerList', this.state.directDeliverySellerList, checked)
                this.checkOrUnCheckAll('taekbaeDeliverySellerList', this.state.taekbaeDeliverySellerList, checked)

                // const directDeliverySellerList = this.checkOrUnCheckAll(this.state.directDeliverySellerList, checked)
                // const taekbaeDeliverySellerList = this.checkOrUnCheckAll(this.state.taekbaeDeliverySellerList, checked)
                //
                // console.log(directDeliverySellerList)
                //
                // this.setState({directDeliverySellerList, taekbaeDeliverySellerList})
                break
            case 'DELETE_ITEMS' :

                this.deleteItems()
                /*
                                const seller222 = [
                                    {
                                        sellerNo: 1,
                                        foodsList: [
                                            {},
                                            {}
                                        ]
                                    },
                                    {
                                        sellerNo: 2,
                                        foodsList: [
                                            {},
                                            {}
                                        ]
                                    },
                                ]

                                const foodsList222 = [
                                    [
                                        {},
                                        {}
                                    ],
                                    [
                                        {},
                                        {}
                                    ]
                                ]
                                */

                //
                // const remainedCartList = this.state.cartList.filter((cart) => !cart.checked)
                // const remainedValidCartList = this.state.validCartList.filter((cart) => !cart.checked)
                // const checkedCartList = this.state.cartList.filter((cart) => cart.checked)
                // const result = checkedCartList.map(async(cart)=>await deleteCart(cart.foodsNo))
                // await Promise.all(result)
                //
                // this.setState({cartList: remainedCartList})
                // this.setState({validCartList: remainedValidCartList})

                // await this.search()
                break
        }
    }



    //상품에 바인딩 및 배송정책 적용
    calculateFoods = (foods, seller) => {

        // const foods = foodsList.find(foods => foods.foodsNo === cart.foodsNo)

        // console.log('calculateCart============1', {
        //     qty: foods.qty, deliveryFee: foods.deliveryFee, deliveryQty: foods.deliveryQty, termsOfDeliveryFee: foods.termsOfDeliveryFee,
        //     currentPrice: foods.currentPrice
        // })

        foods.calculatedDeliveryFee = foods.deliveryFee

        //택배 일 경우 배송비 정책 적용
        if(seller.taekbaeDelivery){
            foods.calculatedDeliveryFee = getDeliveryFee({qty: foods.qty, deliveryFee: foods.deliveryFee, deliveryQty: foods.deliveryQty, termsOfDeliveryFee: foods.termsOfDeliveryFee})
            // foods.deliveryFee = getDeliveryFee({qty: foods.qty, deliveryFee: foods.deliveryFee, deliveryQty: foods.deliveryQty, termsOfDeliveryFee: foods.termsOfDeliveryFee})
        }else{
            //직배송 일 경우 배송비는 0(모든 상품의 합계가 판매자가 설정한 무료배송금액보다 클 경우에만 배송비를 한번만 책정하기 위함)
            foods.calculatedDeliveryFee = 0
            foods.deliveryFee = 0
        }

        //합계 적용
        foods.goodsPrice = foods.qty * foods.currentPrice       //상품가 : 수량 * 현재가
        foods.totPrice = foods.goodsPrice + foods.deliveryFee   //합계 : 상품가 + 배송비

        // console.log('calculateCart=============2',foods.goodsPrice)
    }

    //판매자의 모든 상품에 바인딩 및 배송정책 적용
    calculateFoodsBySellerList(sellerList){
        //상품별 배송정책 적용
        sellerList.map(seller => {
            seller.foodsList.map(foods => this.calculateFoods(foods, seller))
        })
    }

    onDirectFoodsChange = async() => {
        const sellerList = [].concat(this.state.directDeliverySellerList)

    }

    onFoodsChange = async ({type, state}) => {

        const name = state.name

        const sellerList = Object.assign([], this.state[name])
        const seller = sellerList.find(seller => seller.sellerNo === state.sellerNo)
        const foodsList = seller.foodsList
        const foods = foodsList.find(foods => foods.foodsNo === state.foodsNo)

        switch (type){
            case 'UPDATE_QTY' :

                const { data } = await getFoodsByFoodsNo(state.foodsNo)

                //재고수량 체크
                if(state.qty > data.remainedCnt){
                    foods.qty = data.remainedCnt
                    this.notify('재고수량이 부족합니다', toast.warn)
                }else{
                    foods.qty = state.qty
                }

                //택배송 판매자만 배송비 계산해서 적용함
                this.calculateFoods(foods, seller)


                //장바구니 db 업데이트
                await updateCart({
                    sellerNo: state.sellerNo,
                    foodsNo: state.foodsNo,
                    qty: foods.qty,
                    checked: foods.checked
                })

                this.setState({
                    [name]: sellerList
                })
                break

            case 'UPDATE_CHECKED' :

                //상품 체크
                foods.checked = state.checked

                //판매자 체크
                const foodsListLength = foodsList.length
                const checkedFoodsLength = foodsList.filter(item => item.checked === true).length

                if(foodsListLength === checkedFoodsLength){
                    seller.checked = true
                }else{
                    seller.checked = false
                }

                // await updateCart({
                //     sellerNo: state.sellerNo,
                //     foodsNo: state.foodsNo,
                //     qty: foods.qty,
                //     checked: state.checked
                // })

                this.setState({
                    [name]: sellerList
                })

                // this.setState({
                //     sellerList,
                // })
                break

            case 'DELETE' :

                if(!this.requestDeleteConfirm()) return

                // const remainedCartList = foodsList.filter((item) => item.foodsNo !== state.foodsNo)
                // const remainedValidCartList = this.state.validCartList.filter((item) => item.foodsNo !== state.foodsNo)

                await deleteCart(state.foodsNo)

                const remainedFoodsList = foodsList.filter(item => item.foodsNo != state.foodsNo)

                //상품이 모두 삭제 되었다면
                if(remainedFoodsList.length <= 0){
                    sellerList.map((item, index) => {
                        if(item.sellerNo === state.sellerNo){
                            sellerList.splice(index, 1)
                        }
                    })
                }else{
                    seller.foodsList = remainedFoodsList
                }
                this.setState({
                    [name]: sellerList,
                    sellerFoodsTotCount: this.state.sellerFoodsTotCount -1  //전체 상품 카운트 감소
                })
                break
            case 'DELETE_EXPIRED_FOODS' :

        }
    }

    onExpiredFoodsChange = async ({type, state}) => {
        switch (type){
            case 'DELETE_EXPIRED_FOODS' :
                await deleteCart(state.foodsNo)
                const expiredFoodsList = Object.assign([], this.state.expiredFoodsList).filter(item => item.foodsNo != state.foodsNo)
                this.setState({
                    expiredFoodsList
                })
                break
        }

    }

    onSellerChange = (sellerNo, e) => {
        const name = e.target.name
        const checked = e.target.checked
        const sellerList = [].concat(this.state[name])
        const seller =  sellerList.find(item => item.sellerNo === sellerNo)
        //판매자 체크
        seller.checked = e.target.checked

        //상품 체크
        seller.foodsList.map(item => item.checked = checked)

        this.setState({
            sellerList
        })
    }

    requestDeleteConfirm = () => {
        return window.confirm('선택한 상품을 삭제 하시겠습니까?')
    }

    getCheckedFoodsCount = () => {

        let totalCount = 0;
        const sellerList = (this.state.directDeliverySellerList.concat(this.state.taekbaeDeliverySellerList))
        let foodsList = []
        sellerList.map(seller => foodsList = foodsList.concat(seller.foodsList))

        totalCount = foodsList.filter(foods => foods.checked).length

        return totalCount
    }

    getCheckedFoodsListBySeller(seller){
        return seller.foodsList.filter(foods => foods.checked)
    }

    getAllFoodsList(sellerList){
        let foodsList = []
        sellerList.map(seller => foodsList = foodsList.concat(seller.foodsList.filter(foods => foods.checked)))
        return foodsList
    }

    //체크된 상품리스트 반환
    // getCheckedFoodsList(sellerList){
    //     let foodsList = []
    //     sellerList.map(seller => foodsList = foodsList.concat(seller.foodsList.filter(foods => foods.checked)))
    //     return foodsList
    // }

    getPayableInfoBySeller = (seller) => {

        const freeDeliveryAmount = seller.freeDeliveryAmount

        const foodsList = this.getCheckedFoodsListBySeller(seller)
        let totalCurrentPrice = 0        //상품금액
        let totalDeliveryFee = 0       //배송비
        let sellerEachGroupDeliveryFee = 0    //몇개당 배송비

        let totalDiscountFee = 0     //할인금액
        let totalOrderPrice = 0        //주문금액



        foodsList.map(foods => {
            totalCurrentPrice += foods.currentPrice * foods.qty
            //몇개당 배송비
            if(foods.termsOfDeliveryFee === TERMS_OF_DELIVERYFEE.EACH_GROUP_COUNT)
                sellerEachGroupDeliveryFee += foods.calculatedDeliveryFee

            totalDeliveryFee += foods.calculatedDeliveryFee
        })

        //할인금액(판매자가 설정한 금액보다 상품가격이 클 경우 배송비무료)
        if(totalCurrentPrice >= freeDeliveryAmount){
            totalDiscountFee = (totalDeliveryFee - sellerEachGroupDeliveryFee)
        }

        //직배송 판매자일 경우
        if(seller.directDelivery){

            //상품금액이 0원보다 클 경우 판매자가 설정한 직배송비를 넣는다
            totalDeliveryFee = totalCurrentPrice > 0 ? seller.directDeliveryFee : 0

            //판매자가 설정한 직배송 무료배송금액보다 상품가가 클 경우 할인금액을 배송금액과 같이 한다
            if(totalCurrentPrice >= seller.freeDeliveryAmount){
                totalDiscountFee = seller.directDeliveryFee
            }
        }

        //주문금액
        totalOrderPrice = totalCurrentPrice + totalDeliveryFee - totalDiscountFee


        return { totalCurrentPrice, totalDeliveryFee, totalDiscountFee, totalOrderPrice }


        // let sumGoodsPrice = 0
        // let sumDeliveryFee = 0
        // cartList.map((cart) => {
        //     sumGoodsPrice = sumGoodsPrice + cart.goodsPrice       //총 상품금액
        //     sumDeliveryFee = sumDeliveryFee + cart.deliveryFee              //총 배송비
        // })
        //
        // return {sumGoodsPrice, sumDeliveryFee}
    }

    getPayableInfoBySellerList(sellerList){
        let totalCurrentPrice = 0        //상품금액
        let totalDeliveryFee = 0       //배송비
        let totalDiscountFee = 0     //할인금액
        let totalOrderPrice = 0        //주문금액

        sellerList.map(seller => {
            const payableInfo = this.getPayableInfoBySeller(seller)
            totalCurrentPrice += payableInfo.totalCurrentPrice
            totalDeliveryFee += payableInfo.totalDeliveryFee
            totalDiscountFee += payableInfo.totalDiscountFee
            totalOrderPrice += payableInfo.totalOrderPrice
        })
        return { totalCurrentPrice, totalDeliveryFee, totalDiscountFee, totalOrderPrice }
    }

    getTotPayableInfo(){
        const directPayableInfo = this.getPayableInfoBySellerList(this.state.directDeliverySellerList)
        const taekbaePayableInfo = this.getPayableInfoBySellerList(this.state.taekbaeDeliverySellerList)
        return{
            totalCurrentPrice: directPayableInfo.totalCurrentPrice + taekbaePayableInfo.totalCurrentPrice,         //상품금액
            totalDeliveryFee: directPayableInfo.totalDeliveryFee + taekbaePayableInfo.totalDeliveryFee,      //배송비
            totalDiscountFee: directPayableInfo.totalDiscountFee + taekbaePayableInfo.totalDiscountFee,//할인금액
            totalOrderPrice: directPayableInfo.totalOrderPrice + taekbaePayableInfo.totalOrderPrice,         //주문금액
        }

    }

    onPayClick = async () => {

        const {data:loginUserType} = await getB2bLoginUserType();

        // 상품상세에서 구매버튼 클릭시 체크하도록 이동.
        if (loginUserType === 'buyer') { //미 로그인 시 로그인 창으로 이동.

            //장바구니 db 업데이트
            const checkedItems = this.state.validCartList;
            const result = checkedItems.map(async (cart) => {
                await updateCart(cart);
            });

            Promise.all(result).then(response => {
                //구매로 이동팝업
                Webview.openPopup('/b2b/cartBuy', true);
            });
        }
        else {
            Webview.openPopup('/b2b/login',  true); //로그인으로 이동팝업
        }
    }

    //react-toastify
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }

    // //장바구니 수량 db의 재고수량과 비교하여 틀릴경우 remainedCnt를 업데이트한다
    // checkFoodsRemainedCntBySellerList = async (sellerList) => {
    //     let errorFoodsList = []
    //     const result = sellerList.map(async seller => {
    //         const sellerResult = seller.foodsList.map( async foods => {
    //             const { data: dbFoods } = await getFoodsByFoodsNo(foods.foodsNo)
    //
    //             //장바구니 수량이 재고보다 많으면 에러
    //             if(foods.qty > ComUtil.toNum(dbFoods.remainedCnt)){
    //                 foods.remainedCnt = ComUtil.toNum(dbFoods.remainedCnt)  //db에 있는 값을 기준으로 업데이트함
    //                 errorFoodsList.push(foods)
    //             }
    //         })
    //         await Promise.all(sellerResult)
    //     })
    //     await Promise.all(result)
    //     return errorFoodsList
    // }




    onSaveClick = async () => {

        const userInfo = await getB2bLoginUser()
        let buyerNo = -1;
        if(userInfo.userType === 'buyer')
            buyerNo = userInfo.uniqueNo

        const { tabId, directDeliverySellerList, taekbaeDeliverySellerList } = Object.assign({}, this.state)

        // //재고수량 부족한지 체크 promise 객체
        const proCheck1 = checkFoodsRemainedCntBySellerList(directDeliverySellerList, 'foodsList')
        const proCheck2 = checkFoodsRemainedCntBySellerList(taekbaeDeliverySellerList, 'foodsList')
        //
        // //병렬체크
        const result = await Promise.all([proCheck1, proCheck2]).then(res => res[0])

        if(result.length > 0){
            alert('재고수량이 부족한 상품이 있습니다. 수량 조정후 재시도 해주세요')
            this.setState({
                directDeliverySellerList,
                taekbaeDeliverySellerList
            })
            return
        }

        const payMethod =  tabId === '1' ? 'card' : 'waesang'

        // console.log({tabId, directDeliverySellerList, taekbaeDeliverySellerList })

        //카드 + 외상 농가 모두 합치기
        const allSellerList = directDeliverySellerList.concat(taekbaeDeliverySellerList)

        const sellerList = []

        //체크된 상품과 판매자를 sellerList에 담기
        allSellerList.map(seller => {
            const _seller = Object.assign({}, seller)
            const foodsList = seller.foodsList.filter(foods => foods.checked)
            if(foodsList.length > 0){
                _seller.foodsList = foodsList
                sellerList.push(_seller)
            }
        })

        let totalCurrentPrice = 0       //총 상품가격
        let totalDeliveryFee = 0        //총 배송비
        let totalDiscountFee = 0        //총 할인비
        let totalOrderPrice = 0         //총 주문 결제 금액


        let orderGoodsNm = ''
        let orderGoodsCount = 0

        //공통적용
        const dealDetailList = sellerList.map(seller => {

            const _seller = Object.assign({}, seller)
            _seller.buyerNo = buyerNo
            _seller.deliveryMethod = seller.directDelivery ? 'direct' : 'taekbae'

            const goodsNm = seller.foodsList[0].goodsNm
            _seller.dealDetailName = seller.foodsList.length === 1 ? goodsNm : `${goodsNm} 외 ${seller.foodsList.length-1} 건`
            _seller.orderImg = seller.foodsList[0].goodsImages.length > 0 ? seller.foodsList[0].goodsImages[0].imageUrl : ''
            _seller.payMethod = payMethod        //card or waesang

            //판매자별 집계
            const pi = this.getPayableInfoBySeller(seller)
            _seller.currentPrice = pi.totalCurrentPrice                //묶음주문 총 상품가격
            _seller.deliveryFee = pi.totalDeliveryFee                  //묶음주문 총 배송비
            _seller.discountFee = pi.totalDiscountFee                  //할인금액 (배송비할인등)
            _seller.orderPrice = pi.totalOrderPrice                    //묶음 주문 총 가격 (= 상품가격 * 주문개수 + 배송비 - 할인금액)

            const foodsList = _seller.foodsList.map(foods => {
                const _foods = Object.assign({}, foods)
                _foods.orderCnt = _foods.qty            //수량
                _foods.orderPrice = _foods.totPrice     //합계 : 상품단가 * 수량
                return _foods
            })

            //foodsDealList 넣기
            _seller.foodsDealList = Object.assign([],foodsList)
            delete _seller.foodsList

            totalCurrentPrice += pi.totalCurrentPrice
            totalDeliveryFee += pi.totalDeliveryFee
            totalDiscountFee += pi.totalDiscountFee
            totalOrderPrice += pi.totalOrderPrice

            if(!orderGoodsNm){
                orderGoodsNm = goodsNm
            }
            orderGoodsCount += seller.foodsList.length

            return _seller
        })

        orderGoodsNm = orderGoodsCount === 1 ? orderGoodsNm : `${orderGoodsNm} 외 ${orderGoodsCount-1} 건`

        const cartToBuy = {
            buyerNo: buyerNo,
            dealGroup: {
                totalCurrentPrice: totalCurrentPrice,                   //총 상품가격
                totalDeliveryFee: totalDeliveryFee,                     //총 배송비
                totalDiscountFee: totalDiscountFee,                     //총 할인비
                totalOrderPrice: totalOrderPrice,                       //총 주문 결제 금액
                //orderGoodsNm: dealDetailList[0].farmName + tabId === '1' ? '[카드결제]' : '[외상거래]',                          //묶음 배송명.  대표상품외 몇개. 이런식으로 저장
                orderGoodsNm: orderGoodsNm,
                payMethod: payMethod
            },
            dealDetailList: dealDetailList
        }

        await addCartToBuy(cartToBuy)

        const params = {
            pathname: '/b2b/cartToBuy',
            search: '',
            state: {
                payMethod: payMethod,
                cartToBuy: cartToBuy,
            }
        }

        // this.props.history.push(`/b2b/cartToBuy?payMethod=${payMethod}`);
        // this.props.history.push(params)
        Webview.openPopup('/b2b/cartToBuy', true);
    }

    onLoginClick = () => {
        Webview.openPopup('/b2b/login')
    }


    render(){

        if(this.state.loginUserType === undefined) return <BlocerySpinner />
        if(this.state.loginUserType !== 'buyer') return (
            <Fragment>
                <B2bShopXButtonNav back history={this.props.history}>장바구니</B2bShopXButtonNav>
                <div className='p-4'>
                    <B2bLoginLinkCard onClick={this.onLoginClick} />
                </div>
            </Fragment>
        )

        // const checkedSellerFoodsCount = this.
        const checkedFoodsCount = this.getCheckedFoodsCount()
        // const totCount = this.state.directDeliverySellerList.length + this.state.taekbaeDeliverySellerList.length


        // const totalCurrentPrice =
        // totalDeliveryFee
        // totalDiscountFee
        // totalOrderPrice
        //
        // sumFoodsPrice
        // sumDeliveryFee
        // sumDiscountPrice


        const totalPayableInfo = this.getTotPayableInfo()

        // console.log('render', this.state.expiredFoodsList)


        return(
            <Fragment>
                <B2bShopXButtonNav back history={this.props.history}>장바구니</B2bShopXButtonNav>
                <div className='d-flex bg-white' style={{boxShadow: '1px 1px 2px gray'}}>
                    <HeaderBox text={`카드결제 상품`} tabId={'1'} active={this.state.tabId === '1'} onClick={this.onHeaderClick.bind(this, '1')}/>
                    <HeaderBox text={`외상거래 상품`} tabId={'2'} active={this.state.tabId === '2'} onClick={this.onHeaderClick.bind(this, '2')}/>
                </div>


                {/*<div className='f7 p-2'>*/}
                {/*{*/}
                {/*this.state.tabId === '1' && <Fragment><b>카드결제로 주문</b>하는 상품입니다.</Fragment>*/}
                {/*}*/}
                {/*</div>*/}


                <div className='mb-5'>


                    {/* 장바구니에 담긴 내역 없을때 */}
                    {
                        (this.state.directDeliverySellerList.length <= 0 && this.state.taekbaeDeliverySellerList.length <= 0) && (
                            <div className='bg-white d-flex justify-content-center align-items-center mb-3' style={{minHeight: 150}}>
                                장바구니에 담긴 상품이 없습니다.
                            </div>
                        )
                    }

                    {
                        (this.state.directDeliverySellerList.length > 0 || this.state.taekbaeDeliverySellerList.length > 0) && (
                            <Fragment>
                                {/* 전체선택 */}
                                <div className='p-3'>
                                    <CartHeader onChange={this.onCartHeadChange} checkedCount={checkedFoodsCount} totCount={this.state.sellerFoodsTotCount}/>
                                </div>

                                {
                                    this.state.directDeliverySellerList.length > 0 && <div className='pl-3 pt-1 pb-1 bg-primary text-white' style={Style.sticky} >직배송</div>
                                }

                                {
                                    this.state.directDeliverySellerList.map(seller => {
                                        const payableInfo = this.getPayableInfoBySeller(seller)
                                        return <SellerItem key={'cart_direct_seller_'+seller.sellerNo}
                                                           seller={seller}
                                                           history={this.props.history}
                                                           onFoodsChange={this.onFoodsChange}
                                                           onSellerChange={this.onSellerChange}
                                                           totalCurrentPrice={payableInfo.totalCurrentPrice}
                                                           totalDeliveryFee={payableInfo.totalDeliveryFee}
                                                           totalDiscountFee={payableInfo.totalDiscountFee}
                                                           totalOrderPrice={payableInfo.totalOrderPrice} />
                                    })
                                }


                                {
                                    this.state.taekbaeDeliverySellerList.length > 0 && <div className='pl-3 pt-1 pb-1 bg-primary text-white' style={Style.sticky}>택배송</div>
                                }
                                {
                                    this.state.taekbaeDeliverySellerList.map(seller => {

                                        const payableInfo = this.getPayableInfoBySeller(seller)
                                        return <SellerItem key={'taekbae_seller_'+seller.sellerNo}
                                                           seller={seller}
                                                           history={this.props.history}
                                                           onFoodsChange={this.onFoodsChange}
                                                           onSellerChange={this.onSellerChange}
                                                           totalCurrentPrice={payableInfo.totalCurrentPrice}
                                                           totalDeliveryFee={payableInfo.totalDeliveryFee}
                                                           totalDiscountFee={payableInfo.totalDiscountFee}
                                                           totalOrderPrice={payableInfo.totalOrderPrice} />
                                    })
                                }


                                {/*<Hr/>*/}
                                {/* 전체합계 */}
                                {/*<Zigzag />*/}
                                <div className='pl-3 pt-3 pb-0 font-weight-normal'>전체합계</div>
                                <div className='p-3'>
                                    <TotalBox name={'상품수'} value={`${ComUtil.addCommas(checkedFoodsCount)} 개`} />
                                    <TotalBox name={'상품금액'} value={`${ComUtil.addCommas(totalPayableInfo.totalCurrentPrice)} 원`} />
                                    <TotalBox name={'배송비'} value={`${ComUtil.addCommas(totalPayableInfo.totalDeliveryFee)} 원`} />
                                    <TotalBox name={'할인금액'} value={`-${ComUtil.addCommas(totalPayableInfo.totalDiscountFee)} 원`} />
                                    <hr/>
                                    <TotalSumBox name={'총금액'} value={`${ComUtil.addCommas(totalPayableInfo.totalOrderPrice)} 원`} />
                                </div>
                                {/*<Zigzag />*/}



                                {/*<div className='d-flex mt-3'>*/}
                                {/*<Button block color={'primary'} className='rounded-0'>외상거래 주문하기(2)</Button>*/}
                                {/*</div>*/}
                                {
                                    this.state.expiredFoodsList.length > 0 && <div className='pl-3 pt-1 pb-1 bg-secondary text-white' style={Style.sticky} >구입불가상품</div>
                                }
                                {
                                    this.state.expiredFoodsList.map((foods) => (
                                            <Fragment key={'cart_expired_foods_'+foods.foodsNo}>
                                                <ExpiredFoodsItem
                                                    history={this.props.history}
                                                    {...foods}
                                                    qty={foods.qty}
                                                    checked={foods.checked}
                                                    goodsPrice={foods.currentPrice}   //foods db 에는 없으며, 택배비 + 상품가격 용도로 사용될 변수
                                                    onChange={this.onExpiredFoodsChange}
                                                />
                                                <hr className='m-0'/>
                                            </Fragment>
                                        )

                                    )
                                }
                            </Fragment>
                        )
                    }
                </div>

                <div className='position-fixed w-100' style={{bottom:0, zIndex:2}}>
                    <hr className='m-0 bg-light'/>
                    <div className={'d-flex p-1 bg-light'} >
                        <div style={{minWidth: 100}}>
                            <Button color={'white'} className='rounded-0'>
                                <small>총금액: {`${ComUtil.addCommas(totalPayableInfo.totalOrderPrice)} 원`}</small>
                            </Button>
                        </div>
                        <div className='flex-grow-1'>
                            <Button color={'primary'} block className='rounded-0' disabled={checkedFoodsCount <= 0} onClick={this.onSaveClick}>{this.state.tabId === '1' ? '카드결제' : '외상거래'} 주문하기({checkedFoodsCount})</Button>
                        </div>
                    </div>
                </div>
                <ToastContainer/>
            </Fragment>
        )
    }
}

function TotalBox(props){
    return(
        <div className='d-flex f4'>
            <div className=''>{props.name}</div>
            <div className='ml-auto'>{props.value}</div>
        </div>
    )
}
function TotalSumBox(props){
    return(
        <div className='d-flex f3 font-weight-bold'>
            <div className=''>{props.name}</div>
            <div className='ml-auto'>{props.value}</div>
        </div>
    )
}


CartList.propTypes = {
}

CartList.defaultProps = {
}

export default CartList
