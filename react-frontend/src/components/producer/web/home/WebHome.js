import React, { Component } from 'react';
import Css from './WebHome.module.scss'
import classNames from 'classnames'
import ComUtil from '~/util/ComUtil'
import {
    getOperStatOrderCntByProducerNo,
    getOperStatOrderCancelCntByProducerNo,
    getOperStatOrderSalesAmtByProducerNo,
    getOperStatGoodsQnaCntByProducerNo,
    getOperStatGoodsReviewCntByProducerNo,
    getOperStatRegularShopCntByProducerNo,
    getOrderStatOrderPaidCntByProducerNo,
    getOrderStatShippingCntByProducerNo,
    getOrderStatDeliveryCompCntByProducerNo,
    getOrderStatOrderConfirmOkCntByProducerNo
} from '~/lib/producerApi'

import { getLoginAdminUser, getLoginProducerUser, tempAdminProducerLogin } from '~/lib/loginApi'

import OrderSaleTransitionChart from './charts/OrderSaleTransition'
import OrderList from './orderList'
import { NoticeList } from './noticeList'
import Menu from './menu'

const WhiteInfoCard = ({title='', subTitle='', onClick= ()=>null}) => {
    return (
        <a className={'w-100 m-2 p-3 bg-white rounded-sm shadow-sm cursor-pointer text-center'} onClick={onClick}>
            <h1 className={'text-info font-weight-light'}>{title}</h1>
            <div className="text-center text-secondary f7">{subTitle}</div>
        </a>
    )
}
const InfoCard = ({title='', subTitle='', onClick= ()=>null}) => {
    return (
        <a className={'w-100 m-2 p-3 bg-info rounded-sm shadow-sm cursor-pointer text-center'} onClick={onClick}>
            <h1 className={'text-white font-weight-light'}>{title}</h1>
            <div className="text-center text-light f7">{subTitle}</div>
        </a>
    )
}

const PrimaryCard = ({title='', subTitle='', onClick= ()=>null}) => {
    return (
        <a className={'w-100 m-2 p-3 bg-primary rounded-sm shadow-sm cursor-pointer text-center'} onClick={onClick}>
            <h1 className={'text-white font-weight-light'}>{title}</h1>
            <div className="text-center text-light f7">{subTitle}</div>
        </a>
    )
}

const WhiteBlackCard = ({title='', subTitle='', onClick= ()=>null}) => {
    return(
        <a className={'w-100 m-2 p-3 bg-white rounded-sm shadow-sm cursor-pointer text-center'} onClick={onClick}>
            <h1 className={'text-dark font-weight-light'}>{title}</h1>
            <div className="text-center text-muted f7">{subTitle}</div>
        </a>
    )
}

const GrayCard = ({title='', subTitle='', onClick= ()=>null}) => {
    return(
        <div className={'m-2 p-3 bg-light rounded-sm shadow-sm cursor-pointer text-center'} onClick={onClick}>
            <h1 className={'text-info font-weight-light'}>{title}</h1>
            <div className="text-center text-secondary f7">{subTitle}</div>
        </div>
    )
}

export default class WebHome extends Component {
    constructor(props) {
        super(props);

        this.state = {
            todayOrderCount: null,                  //오늘 주문건수
            yesterdayOrderCount: null,              //어제 주문건수
            weeklyOrderCount: null,                 //주간 주문건수
            monthlyOrderCount: null,                //월간 주문건수

            todayOrderCancelCount: null,            //오늘 주문취소건수
            yesterdayOrderCancelCount: null,        //어제 주문취소건수
            weeklyOrderCancelCount: null,           //주간 주문취소건수
            monthlyOrderCancelCount: null,          //월간 주문취소건수

            todaySalesAmount: null,                 //오늘 매출
            yesterdaySalesAmount: null,             //어제 매출
            weeklySalesAmount: null,                //주간 매출
            monthlySalesAmount: null,               //월간 매출

            todayQnACount: null,                    //오늘 상품문의건수
            yesterdayQnACount: null,                //어제 상품문의건수
            weeklyQnACount: null,                   //주간 상품문의건수
            monthlyQnACount: null,                  //월간 상품문의건수

            todayReviewCount: null,                  //오늘 후기건수
            yesterdayReviewCount: null,              //어제 후기건수
            weeklyReviewCount: null,                 //주간 후기건수
            monthlyReviewCount: null,                //월간 후기건수

            todayFollowerCount: null,                //오늘 단골고객수
            yesterdayFollowerCount: null,            //어제 단골고객수
            weeklyFollowerCount: null,               //주간 단골고객수
            monthlyFollowerCount: null,              //월간 단골고객수
            totalFollowerCount: null,                //전체 단골고객수

            monthlyCustomerPaidCount: null,          //월간 고객결제건수
            monthlyShippingCount: null,              //월간 배송중건수
            monthlyShippedCount: null,               //월간 배송완료건수
            monthlyConfirmOkCount: null,             //월간 구매확정건수
        }
    }

    componentDidMount(){
        this.checkLogin()

        this.searchOrderCount()         //주문건수
        this.searchOrderCancelCount()   //취소건수
        this.searchSalesAmount()        //매출
        this.searchQnACount()           //상품문의건수
        this.searchReviewCount()        //상푸후기건수
        this.searchFollowerCount()      //단골고객건수
        this.searchCustomerPaidCount()  //고객결제건수
        this.searchShippingCount()      //월간 배송중건수
        this.searchShippedCount()       //월간 배송완료건수
        this.searchConfirmOkCount()     //월간 구매확정건수
    }

    checkLogin = async () => {
        //ProducerWebContainer.js로 이동.  (항상 로그인 check를 위해 이동.)
        // => AdminProducer 로그인: adminLoginCheck -  tempProducer일 경우, producer자동로그인 수행.-20200330
        let adminUser = await getLoginAdminUser();
        console.log('webHome - checkLogin:', adminUser);
        if (adminUser && adminUser.email === 'tempProducer@ezfarm.co.kr') {
            return; //admin 로그인 성공.
        }

        // //로그인 체크
        const loginUser = await getLoginProducerUser();
        if(!loginUser){
            this.props.history.push('/producer/webLogin')
        }
    }

    //주문건수
    async searchOrderCount(){
        //(오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatOrderCntByProducerNo();
        if(status === 200) {

            const todayOrderCount = data.totalToDateCnt || 0
            const yesterdayOrderCount = data.totalYesterDateCnt || 0
            const weeklyOrderCount = data.totalWeekDateCnt || 0
            const monthlyOrderCount = data.totalMonthDateCnt || 0

            this.setState({
                todayOrderCount,
                yesterdayOrderCount,
                weeklyOrderCount,
                monthlyOrderCount,
            })
        }
    }

    //취소건수
    async searchOrderCancelCount(){
        //(오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatOrderCancelCntByProducerNo();
        if(status === 200) {

            const todayOrderCancelCount = data.totalToDateCnt || 0
            const yesterdayOrderCancelCount = data.totalYesterDateCnt || 0
            const weeklyOrderCancelCount = data.totalWeekDateCnt || 0
            const monthlyOrderCancelCount = data.totalMonthDateCnt || 0

            this.setState({
                todayOrderCancelCount,
                yesterdayOrderCancelCount,
                weeklyOrderCancelCount,
                monthlyOrderCancelCount,
            })
        }
    }

    //매출
    async searchSalesAmount(){
        //(오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatOrderSalesAmtByProducerNo();
        if(status === 200) {

            const todaySalesAmount = data.totalToDateAmt || 0
            const yesterdaySalesAmount = data.totalYesterDateAmt || 0
            const weeklySalesAmount = data.totalWeekDateAmt || 0
            const monthlySalesAmount = data.totalMonthDateAmt || 0

            this.setState({
                todaySalesAmount,
                yesterdaySalesAmount,
                weeklySalesAmount,
                monthlySalesAmount,
            })
        }
    }

    //상품문의건수
    async searchQnACount(){
        //(오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatGoodsQnaCntByProducerNo();
        if(status === 200) {
            const todayQnACount = data.totalToDateCnt || 0
            const yesterdayQnACount = data.totalYesterDateCnt || 0
            const weeklyQnACount = data.totalWeekDateCnt || 0
            const monthlyQnACount = data.totalMonthDateCnt || 0

            this.setState({
                todayQnACount,
                yesterdayQnACount,
                weeklyQnACount,
                monthlyQnACount,
            })
        }
    }

    //상품후기건수
    async searchReviewCount(){
        //(오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatGoodsReviewCntByProducerNo();
        if(status === 200) {

            const todayReviewCount = data.totalToDateCnt || 0
            const yesterdayReviewCount = data.totalYesterDateCnt || 0
            const weeklyReviewCount = data.totalWeekDateCnt || 0
            const monthlyReviewCount = data.totalMonthDateCnt || 0

            this.setState({
                todayReviewCount,
                yesterdayReviewCount,
                weeklyReviewCount,
                monthlyReviewCount,
            })
        }
    }

    //단골회원건수
    async searchFollowerCount(){
        //(오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatRegularShopCntByProducerNo();
        if(status === 200) {
            const todayFollowerCount = data.totalToDateCnt || 0
            const yesterdayFollowerCount = data.totalYesterDateCnt || 0
            const weeklyFollowerCount = data.totalWeekDateCnt || 0
            const monthlyFollowerCount = data.totalMonthDateCnt || 0
            const totalFollowerCount = data.totalCnt || 0

            this.setState({
                todayFollowerCount,
                yesterdayFollowerCount,
                weeklyFollowerCount,
                monthlyFollowerCount,
                totalFollowerCount
            })
        }
    }

    //고객 결제완료 건수
    async searchCustomerPaidCount(){
        //(최근1개월기준)
        const { status, data } = await getOrderStatOrderPaidCntByProducerNo();
        if(status === 200) {
            const monthlyCustomerPaidCount = data

            this.setState({
                monthlyCustomerPaidCount
            })
        }
    }

    //배송중 건수
    async searchShippingCount(){
        //(최근1개월기준)
        const { status, data } = await getOrderStatShippingCntByProducerNo();
        if(status === 200) {
            const monthlyShippingCount = data

            this.setState({
                monthlyShippingCount
            })
        }
    }

    //배송완료 건수
    async searchShippedCount(){
        //(최근1개월기준)
        const { status, data } = await getOrderStatDeliveryCompCntByProducerNo();
        if(status === 200) {
            const monthlyShippedCount = data

            this.setState({
                monthlyShippedCount
            })
        }
    }

    //구메확정 건수
    async searchConfirmOkCount(){
        //(최근1개월기준)
        const { status, data } = await getOrderStatOrderConfirmOkCntByProducerNo();
        if(status === 200) {
            const monthlyConfirmOkCount = data

            this.setState({
                monthlyConfirmOkCount
            })
        }
    }

    movePage({type}){
        switch (type){
            case "ORDER_LIST":
                this.props.history.push('/producer/web/order/orderList')
                break
            //기간별판매현황
            case "SALES_LIST":
                this.props.history.push('/producer/web/statistic/giganSalesSttList')
                break
            case "REGULAR_SHOP_LIST":
                this.props.history.push('/producer/web/shop/regularShopList')
                break
        }
    }

    render() {

        const state = this.state

        return(
            <>
            <div className={'d-flex'}>
                <div className={classNames('p-2 flex-grow-1', Css.wrap)}>

                    <div className={'flex-grow-1'}>
                        <div className={'d-flex'}>
                            <div className={'flex-grow-1'}>
                                <div className={'d-flex'}>
                                    <WhiteInfoCard
                                        title={ComUtil.addCommas(state.monthlyOrderCount)}
                                        subTitle={'월간 주문건수'}
                                        onClick={this.movePage.bind(this, {type: 'ORDER_LIST'})} />
                                    <InfoCard
                                        title={ComUtil.addCommas(state.monthlyOrderCancelCount)}
                                        subTitle={'월간 취소건수'}
                                        onClick={null} />
                                </div>
                                <div className={'d-flex'}>
                                    <PrimaryCard
                                        title={ComUtil.addCommas(state.totalFollowerCount)}
                                        subTitle={'단골고객수'}
                                        onClick={this.movePage.bind(this, {type: 'REGULAR_SHOP_LIST'})} />
                                    <WhiteBlackCard
                                        title={'준비중'}
                                        subTitle={'평점'}
                                        onClick={null} />
                                </div>
                                <GrayCard
                                    title={state.monthlySalesAmount && '₩'+ComUtil.addCommas(state.monthlySalesAmount)}
                                    subTitle={'월간 매출'}
                                    onClick={this.movePage.bind(this, {type: 'SALES_LIST'})} />
                            </div>

                            <div className={'m-2 flex-grow-1'} style={{width: 350}}>
                                <div className={'p-3 h-100 bg-white rounded-sm shadow-sm'}>
                                    <h5 className={'text-muted font-weight-light'}>주문/매출 추이</h5>
                                    <div style={{height: 272}}>
                                        <OrderSaleTransitionChart/>
                                    </div>
                                </div>
                            </div>

                        </div>
                        <div>

                            <div className={'d-flex'}>
                                <div className={'flex-grow-1'}>
                                    <NoticeList history={this.props.history}/>
                                </div>
                                <div className={'flex-grow-1'}>

                                    <OrderList history={this.props.history}/>


                                    {/*<List header={'최근주문상품'} data={[1,2,3,4,5]} />*/}
                                </div>
                            </div>



                        </div>




                    </div>
                </div>
                <div className={'flex-shrink-0'} style={{width: 250}}>
                    <Menu/>
                </div>

            </div>


            </>
        )
    }
}