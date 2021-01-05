import AdminLogin from './AdminLogin'
import {ConsumerList, StoppedConsumer} from './consumerList'
import ProducerList from './producerList'
import ProducerRegRequest from './producerRegRequest'
import ProducerPayout from './producerPayout'
import OrderList from './orderList'
import OrderStats from './orderStats'
import GoodsList from './goodsList'
import SimpleAdmin from './simpleAdmin'
import SetToken from './setToken'
import TokenSwap from './tokenSwap'
import { TokenSwapInList, TokenSwapOutList } from './tokenSwapList'
import AddAdmin from './addAdmin'
import { ConsumerKycList } from './kyc'
import TransportCompanyList from './transportCompanyList'
import TransportCompanyReg from './transportCompanyReg'
import ItemList from './itemList'
import ItemReg from './itemReg'
import NoticeList from './noticeList'
import NoticeReg from './noticeReg'
import {PushNotiList, PushNotiReg} from './pushNotification'
import EventPaymentList from './event'
import B2cHomeSetting from './b2cHomeSetting'
import EventInfoList from './eventList'
import {B2cMdPickList,B2cMdPickReg} from './b2cMdPick'
import {B2cTimeSaleList,B2cTimeSaleReg} from './b2cTimeSale'
import {B2cBlyTimeList,B2cBlyTimeReg} from './b2cBlyTime'
import {B2cSuperRewardList,B2cSuperRewardReg} from './b2cSuperReward'
import ProducerFeeRateList from './producerFeeRate'
import BlctStats from './blctStats'
import BlctToWon from './blctToWon'
import BountyEventHistory from './eventBountyHistory'
import {CouponMasterList, ConsumerCouponList} from './coupon'
import {PaymentAll, PaymentProducer, TempProducerList} from './payment'
import { TokenSiseCorrectionList } from './tokenSiseCorrection'
import {GoodsDetailBannerList,GoodsDetailBannerReg} from './goodsDetailBanner'
import {HomeBannerList,HomeBannerReg} from './homeBanner'
import {GoPaxJoinEventList, GoPaxCardEventList} from './goPaxEvent'

export {
    AdminLogin,
    ConsumerList,
    StoppedConsumer,
    ProducerList,
    ProducerRegRequest,
    ProducerPayout,
    OrderList,
    OrderStats,
    GoodsList,
    SimpleAdmin,
    AddAdmin,
    ConsumerKycList,
    SetToken,
    TokenSwap,
    TokenSwapInList,
    TokenSwapOutList,
    TokenSiseCorrectionList,
    TransportCompanyList,
    TransportCompanyReg,
    ItemList,
    ItemReg,
    NoticeList,
    PushNotiList, PushNotiReg,
    NoticeReg,
    EventPaymentList,
    B2cHomeSetting,
    EventInfoList,
    B2cMdPickList, B2cMdPickReg,
    ProducerFeeRateList,
    BlctStats,
    BlctToWon,
    B2cTimeSaleList,B2cTimeSaleReg,
    B2cBlyTimeList, B2cBlyTimeReg,
    B2cSuperRewardList,B2cSuperRewardReg,
    BountyEventHistory,
    CouponMasterList,
    ConsumerCouponList,
    PaymentAll, PaymentProducer, TempProducerList,
    GoodsDetailBannerList, GoodsDetailBannerReg,
    HomeBannerList, HomeBannerReg,
    GoPaxJoinEventList, GoPaxCardEventList
}