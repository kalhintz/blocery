import axios from 'axios'
import { Server } from "../components/Properties";

// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllConsumers = () => axios(Server.getRestAPIHost() + '/allConsumers', { method: "get", withCredentials: true, credentials: 'same-origin' })

//준회원 수(giftReceiver 수)
export const getSemiConsumerCount = () => axios(Server.getRestAPIHost() + '/semiConsumerCount', { method: "get", withCredentials: true, credentials: 'same-origin' })


// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllProducers = () => axios(Server.getRestAPIHost() + '/allProducers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 자료 조회
export const getAllProducerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allProducerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 check 자료 조회
export const getProducerPaymentCheck = (producerNo, year, month) => axios(Server.getRestAPIHost() + '/admin/producerPaymentCheck', { method: "get", params: {producerNo: producerNo, year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 정산시 체크 메모리스트 조회
export const getPaymentCheckMemoList = (producerNoDotMonth) => axios(Server.getRestAPIHost() + '/admin/getPaymentCheckMemoList', { method: "get", params: {producerNoDotMonth: producerNoDotMonth}, withCredentials: true, credentials: 'same-origin' })

// 정산 메모 삭제
export const delPaymentMemo = (memoData) => axios(Server.getRestAPIHost() + '/admin/delPaymentMemo', { method: "delete", data: memoData, withCredentials: true, credentials: 'same-origin' })

// 생산자별 정산 주문내역 조회
export const getPaymentProducer = (producerNo, year, month) => axios(Server.getRestAPIHost() + '/admin/paymentProducer', { method: "get", params: {producerNo: producerNo, year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setProducerPayoutStatus = (year, month) =>
    axios(Server.getRestAPIHost() + '/admin/orderDetail/producerPayoutStatus', {
        method: "patch",
        params: {year: year, month: month},
        withCredentials: true, credentials: 'same-origin'
    })

export const transferTempProducerBlctToEzfarm = (year, month) => axios(Server.getRestAPIHost() + '/admin/transferTempProducerBlctToEzfarm',
    {method: "post", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin'})

// 모든 주문번호 가져오기
export const getAllOrderDetailList = ({year}) => axios(Server.getRestAPIHost() + '/allOrderDetailList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })

export const getAllOrderStats = (startDate, endDate, gubun) => axios(Server.getRestAPIHost() + '/allOrderStats', { method: "get", params: {startDate:startDate, endDate:endDate, gubun: gubun}, withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsSaleList = () => axios(Server.getRestAPIHost() + '/allGoodsSaleList', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getAllGoodsNotEvent = () => axios(Server.getRestAPIHost() + '/allGoodsNotEvent', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllGoods = () => axios(Server.getRestAPIHost() + '/allGoods', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 품절상품 조회
export const getSoldOutGoods = () => axios(Server.getRestAPIHost() + '/soldOutGoodsList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 판매 일시중지 상품 조회
export const getPausedGoods = () => axios(Server.getRestAPIHost() + '/pausedGoodsList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 판매종료상품 조회
export const getSaleEndGoods = () => axios(Server.getRestAPIHost() + '/saleEndGoodsList', {method: "get", withCredentials: true, credentials: 'same-origin'})

// email로 account 가져오기
export const getConsumerAccountByEmail = (email) => axios(Server.getRestAPIHost() + '/consumer/email', { method: "get", params: {email: email}, withCredentials: true, credentials: 'same-origin' })

// 비밀번호 reset (abc1234!)
export const resetPassword = (userType, email) => axios(Server.getRestAPIHost() + '/valword', { method: "put", params: {userType:userType, email: email}, withCredentials: true, credentials: 'same-origin' })


//택배사 조회(전체)
export const getTransportCompany = () => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "get", params: {}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 번호)
export const getTransportCompanyByNo = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyNo', { method: "get", params: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사 조회(택배사 코드)
export const getTransportCompanyByCode = (transportCompanyCode) => axios(Server.getRestAPIHost() + '/admin/transportCompany/transportCompanyCode', { method: "get", params: {transportCompanyCode: transportCompanyCode}, withCredentials: true, credentials: 'same-origin' })

//택배사 등록 & 수정
export const addTransportCompany = (transportCompany) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "post", data: transportCompany, withCredentials: true, credentials: 'same-origin' })

//택배사 삭제
export const delTransportCompany = (transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany', { method: "delete", params:{transportCompanyNo: transportCompanyNo}, data: {transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//택배사코드 중복여부 체크
export const getIsDuplicatedTransportCode = (transportCompanyCode, transportCompanyNo) => axios(Server.getRestAPIHost() + '/admin/transportCompany/validate', { method: "get", params: {transportCompanyCode: transportCompanyCode, transportCompanyNo: transportCompanyNo}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(전체)
export const getItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//품목 조회(품목 번호)
export const getItemByItemNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/item/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//품목 등록 & 수정
export const addItem = (item) => axios(Server.getRestAPIHost() + '/admin/item', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//품목 활성 or 비활성
export const updateItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/item', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드 발췌.
export const getNewItemKindCode = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/itemKindCode', { method: "put", withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드로 품명 조회
export const getItemKindByCode = (code) => axios(Server.getRestAPIHost() + '/admin/itemKind', { method: "get", params: {code: code}, withCredentials: true, credentials: 'same-origin' })

// 상품 현재 가격 설정
export const setCurrentPriceOfAllValidGoods = () => axios(Server.getRestAPIHost() + '/admin/goods/batchCurrentPrice', { method: "patch", withCredentials: true, credentials: 'same-origin' })

// 미배송 배치 처리
export const setNotDeliveryOrder = () => axios(Server.getRestAPIHost() + '/admin/batchNotDelivery', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 생산자에게 발송 임박 상품 알림 처리
export const sendWarnShippingStart = () => axios(Server.getRestAPIHost() + '/admin/batchWarnShippingStart', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 미배송발생시 미배송 알림 테스트 (배치테스트)
export const sendNotiDelayShipping = () => axios(Server.getRestAPIHost() + '/admin/batchNotiDelayShipping', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 공지사항 등록
export const regNotice = (notice) => axios(Server.getRestAPIHost() + '/admin/regNotice', { method: "post", data: notice, withCredentials: true, credentials: 'same-origin'})

// 공지사항 조회
export const getNoticeList = (userType) => axios(Server.getRestAPIHost() + '/getNoticeList', { method: "get", params:{userType: userType}, withCredentials: true, credentials: 'same-origin' })

// 공지사항 한건 조회
export const getNoticeByNoticeNo = (noticeNo) => axios(Server.getRestAPIHost() + '/getNotice', { method: "get", params:{noticeNo}, withCredentials: true, credentials: 'same-origin' })

// 공지사항 삭제
export const delNoticeApi = (noticeNo) => axios(Server.getRestAPIHost() + '/admin/delNotice', { method: "delete", params:{noticeNo: noticeNo}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 등록
export const regPushNoti = (pushNoti) => axios(Server.getRestAPIHost() + '/admin/regPushNoti', { method: "post", data: pushNoti, withCredentials: true, credentials: 'same-origin'})

// 푸시알림 조회
export const getPushNotiList = ({year}) => axios(Server.getRestAPIHost() + '/getPushNotiList', { method: "get", params:{year: year}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 한건 조회
export const getPushNotiByPushNotiNo = (pushNotiNo) => axios(Server.getRestAPIHost() + '/getPushNoti', { method: "get", params:{pushNotiNo: pushNotiNo}, withCredentials: true, credentials: 'same-origin' })

// 푸시알림 삭제
export const delPushNoti = (pushNotiNo) => axios(Server.getRestAPIHost() + '/admin/delPushNoti', { method: "delete", params:{pushNotiNo: pushNotiNo}, withCredentials: true, credentials: 'same-origin' })


// 이벤트 지급 목록
export const getB2cEventPaymentList = () => axios(Server.getRestAPIHost() + '/admin/getB2cEventPaymentList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 자동구매확정 배치 처리(B2C)
export const setOrderDetailConfirm = () => axios(Server.getRestAPIHost() + '/admin/batchOrderConfirm', { method: "post", withCredentials: true, credentials: 'same-origin' })


// 생산자의 BLCT구매 정산방법 변경
export const changeProducerPayoutBlct = (producerNo, newPayoutBlct) => axios(Server.getRestAPIHost() + '/changeProducerPayoutBlct', { method: "post", params:{producerNo: producerNo, newPayoutBlct: newPayoutBlct}, withCredentials: true, credentials: 'same-origin' })


// 생산자 수수료 등록 및 수정
export const regProducerFeeRate = (data) => axios(Server.getRestAPIHost() + '/admin/regProducerFeeRate', { method: "post", data:data, withCredentials: true, credentials: 'same-origin' });

// 생산자 수수료 목록
export const getProducerFeeRate = () => axios(Server.getRestAPIHost() + '/admin/getProducerFeeRateList', { method: "get", withCredentials: true, credentials: 'same-origin' });


// 생산자별 개인 수수료 수정
export const saveFeeRateToProducer = (producerNo, producerRateId, rate) => axios(Server.getRestAPIHost() + '/admin/saveFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 개인 수수료 수정 예약.
export const reserveFeeRateToProducer = (producerNo, producerRateId, rate, date) => axios(Server.getRestAPIHost() + '/admin/reserveFeeRateToProducer', { method: "post", params:{producerNo: producerNo, producerRateId: producerRateId, rate: rate, date: date}, withCredentials: true, credentials: 'same-origin' })


export const setPayoutAmountBatch = () => axios(Server.getRestAPIHost() + '/admin/setPayoutAmountBatch', { method: "get", withCredentials: true, credentials: 'same-origin' });

///////B2B_ADD////////////////////////////////////////////////////////////////////////////////////////////////////

//B2B판매중 상팜
export const getAllFoodsSaleList = () => axios(Server.getRestAPIHost() + '/allFoodsSaleList', { method: "get", withCredentials: true, credentials: 'same-origin' })


//B2B 품목 조회(전체)
export const getB2bItems = (onlyEnabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "get", params: {onlyEnabled: onlyEnabled}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 조회(품목 번호)
export const getB2bItemByNo = (itemNo) => axios(Server.getRestAPIHost() + '/admin/b2bItem/itemNo', { method: "get", params: {itemNo: itemNo}, withCredentials: true, credentials: 'same-origin' })

//B2B 품목 등록 & 수정
export const addB2bItem = (item) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "post", data: item, withCredentials: true, credentials: 'same-origin' })

//itemKind(품종)코드 발췌.
export const getNewB2bItemKindCode = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/b2bItemKindCode', { method: "put", withCredentials: true, credentials: 'same-origin' })


//품목 활성 or 비활성
export const updateB2bItemEnabled = (itemNo, enabled) => axios(Server.getRestAPIHost() + '/admin/b2bItem', { method: "put", params:{itemNo: itemNo, enabled: enabled}, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 상태를 db 에 기록
export const setSellerPayoutStatus = (dealSeqList, payoutStatus, totalPayout) =>
    axios(Server.getRestAPIHost() + '/admin/dealDetail/sellerPayoutStatus', {
        method: "patch",
        data: dealSeqList,
        params: {payoutStatus: payoutStatus, totalPayout: totalPayout},
        withCredentials: true, credentials: 'same-origin'
    })

// 업체별 정산 체크정보 저장
export const savePaymentCheck = (data) => axios(Server.getRestAPIHost() + '/admin/savePaymentCheck', {method: "post", data: data, withCredentials: true, credentials: 'same-origin' })

// 생산자별 매출 정산 자료 조회
export const getAllSellerPayoutList = (year, month) => axios(Server.getRestAPIHost() + '/admin/allSellerPayoutList', { method: "get", params: {year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 모든 주문번호 가져오기
export const getAllDealDetailList = () => axios(Server.getRestAPIHost() + '/allDealDetailList', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 상품정보 가져오기
export const getAllFoods = () => axios(Server.getRestAPIHost() + '/allFoods', {method: "get", withCredentials: true, credentials: 'same-origin'})

// 소비자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 소비자별 토큰개수와 eth balance 조회용
export const getAllBuyers = () => axios(Server.getRestAPIHost() + '/allBuyers', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 생산자 모든 회원 번호와 정보(이름, email, account) 가져오기  => 각 생산자별 토큰개수와 eth balance 조회용
export const getAllSellers = () => axios(Server.getRestAPIHost() + '/allSellers', { method: "get", withCredentials: true, credentials: 'same-origin' })

//// b2c 홈 화면 구성
export const getHomeSetting = () => axios(Server.getRestAPIHost() + '/admin/b2cHome', { method: "get", withCredentials: true, credentials: 'same-origin' })// 홈세팅 조회

// 기획전 상품 번호 저장
export const setHomeSetting = (settingNoList) => axios(Server.getRestAPIHost() + '/admin/b2cHome', { method: "post", data: settingNoList, withCredentials: true, credentials: 'same-origin' })// 기획 상품 조회
export const getExGoodsNoList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/exGoodsNo', { method: "get", withCredentials: true, credentials: 'same-origin' })
// best deal 상품 조회
export const getSpecialDealGoodsList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/specialDealGoods', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 오늘의 생산자 상품 조회
export const getTodayProducerList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/todayProducer', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 배너 조회
export const getBannerList = () => axios(Server.getRestAPIHost() + '/admin/b2cHome/banner', { method: "get", withCredentials: true, credentials: 'same-origin' })

//타입에 따른 이벤트 번호조회(type : blyTime, potenTime)
export const getEventNoByType = (type) => axios(Server.getRestAPIHost() + '/admin/b2cHome/eventNo/type', { method: "get", params: {type}, withCredentials: true, credentials: 'same-origin' })

//// 이벤트 정보
// 이벤트 정보 목록
export const getEventInfoList = () => axios(Server.getRestAPIHost() + '/admin/eventInfoList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 이벤트 정보 조회
export const getEventInfo = (eventNo) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "get", params:{eventNo: eventNo}, withCredentials: true, credentials: 'same-origin' })
// 이벤트 저장
export const setEventInfoSave = (event) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "post", data: event, withCredentials: true, credentials: 'same-origin' })
// 이벤트 삭제
export const delEventInfo = (eventNo) => axios(Server.getRestAPIHost() + '/admin/eventInfo', { method: "delete", params:{eventNo: eventNo}, withCredentials: true, credentials: 'same-origin' })

//// b2c 기획전 관리
// 기획전 조회
export const getMdPickList = () => axios(Server.getRestAPIHost() + '/admin/b2cMdPickList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 기획전 정보 조회
export const getMdPick = (mdPickId) => axios(Server.getRestAPIHost() + '/admin/b2cMdPick', { method: "get", params:{mdPickId: mdPickId}, withCredentials: true, credentials: 'same-origin' })
// 기획전 삭제
export const delMdPick = (mdPickId) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickDel', { method: "delete", params:{mdPickId: mdPickId}, withCredentials: true, credentials: 'same-origin' })
// 기획전 홈화면에숨김
export const hideMdPick = (mdPickId, hideFromHome) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickHide', { method: "post", params:{mdPickId: mdPickId, hideFromHome:hideFromHome}, withCredentials: true, credentials: 'same-origin' })
// 기획전 저장
export const setMdPickSave = (mdPick) => axios(Server.getRestAPIHost() + '/admin/b2cMdPickSave', { method: "post", data: mdPick, withCredentials: true, credentials: 'same-origin' })

////b2c 블리타임
// 블리타임 조회 (All)
export const getBlyTimeAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 블리타임 삭제
export const delBlyTime = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 블리타임 등록
export const setBlyTimeRegist = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeRegist', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })
// 블리타임 수정
export const setBlyTimeUpdate = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cBlyTimeUpdate', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })

////b2c 포텐타임
// 포텐타임 조회 (All)
export const getTimeSaleAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 상품 조회 (단건) - 블리타임과 동일하게 controller 호출함.
export const getTimeSaleAdmin = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleAdmin', { method: "get", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 삭제
export const delTimeSale = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 등록
export const setTimeSaleRegist = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleRegist', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })
// 포텐타임 수정
export const setTimeSaleUpdate = (timeSale) => axios(Server.getRestAPIHost() + '/admin/b2cTimeSaleUpdate', { method: "post", data: timeSale, withCredentials: true, credentials: 'same-origin' })

////b2c 수퍼타임
// 수퍼리워드 조회 (All)
export const getSuperRewardAdminList = ({year}) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardAdminList', { method: "get", params: {year:year}, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 삭제
export const delSuperReward = (goodsNo) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardDel', { method: "delete", params:{goodsNo: goodsNo}, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 등록
export const setSuperRewardRegist = (superReward) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardRegist', { method: "post", data: superReward, withCredentials: true, credentials: 'same-origin' })
// 수퍼리워드 수정
export const setSuperRewardUpdate = (superReward) => axios(Server.getRestAPIHost() + '/admin/b2cSuperRewardUpdate', { method: "post", data: superReward, withCredentials: true, credentials: 'same-origin' })

//// admin 계정 관리
// admin 계정 등록
export const addAdmin = (adminData) => axios(Server.getRestAPIHost() + '/admin/addAdmin', { method: "post", data:adminData, withCredentials: true, credentials: 'same-origin' })
// admin List 조회
export const getAdminList = () => axios(Server.getRestAPIHost() + '/admin/getAdminList' , { method:"get", withCredentials: true, credentials: 'same-origin' })
export const getAdmin = (email) => axios(Server.getRestAPIHost() + '/admin/getAdmin' , { method:"get", params: {email: email}, withCredentials: true, credentials: 'same-origin' })

// 소비자 탈퇴 처리
export const setConsumerStop = (data) => axios(Server.getRestAPIHost() + '/admin/setConsumerStop', { method:"put", data: data, withCredentials: true, credentials: 'same-origin' })



export const getAllBlctToWonCachedLog = () => axios(Server.getRestAPIHost() + '/admin/blctToWonCachedLog', { method: "get", withCredentials: true, credentials: 'same-origin' })


// blct 통계페이지 조회용
export const getBlctStats = (startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/getBlctStats', { method: "get", params: {startDate: startDate, endDate: endDate}, withCredentials: true, credentials: 'same-origin' })
export const getMonthlyBlctStats = (startDate, endDate) => axios(Server.getRestAPIHost() + '/admin/getMonthlyBlctStats', { method: "get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 tempProducerBlctManage 조회용
export const getAllTempProducerBlctMonth = (year, month) => axios(Server.getRestAPIHost() + '/admin/getAllTempProducerBlctMonth', { method: "get", params:{year: year, month: month}, withCredentials: true, credentials: 'same-origin' })

// 구매확정 안된 orderSeq 수동 구매확정 (조건체크는 backend에서 함)
export const setOrderDetailConfirmBatchOrderSeq = (orderSeq) => axios(Server.getRestAPIHost() + '/admin/setOrderDetailConfirmBatchOrderSeq', {method: "get", params: {orderSeq: orderSeq}, withCredentials: true, credentials: 'same-origin' })

// blct 정산시 서포터즈 지급 BLCT 합계
export const getAllSupportersBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllSupportersBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 블리타임 리워드 BLCT 합계
export const getAllBlyTimeRewardBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllBlyTimeRewardBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 이벤트적립금 BLCT 합계
export const getAllEventRewardBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllEventRewardBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// blct 정산시 쿠폰지급 BLCT 합계
export const getAllCouponBlct = () => axios(Server.getRestAPIHost() + '/admin/getAllCouponBlct' , { method:"get", withCredentials: true, credentials: 'same-origin' })

// 입점관리 정보 조회
export const getProducerRegRequests = () => axios(Server.getRestAPIHost() + '/getProducerRegRequests', { method: "get", withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 내역 조회
export const getConsumerKycList = ({kycAuth, consumerNo, year}) => axios(Server.getRestAPIHost() + '/admin/consumerKycList', { method: "get", params: {kycAuth: kycAuth, consumerNo: consumerNo, year:year}, withCredentials: true, credentials: 'same-origin' })

//소비자 KYC 인증 처리
export const setConsumerKycAuth = ({consumerNo, kycAuth, kycReason}) => axios(Server.getRestAPIHost() + '/admin/consumerKycAuth', { method: "post", params: {consumerNo: consumerNo, kycAuth: kycAuth, kycReason: kycReason}, withCredentials: true, credentials: 'same-origin' })

// 모든 소비자 토큰총합 조회
export const getAllConsumerToken = () => axios(Server.getRestAPIHost() + '/admin/getAllConsumerToken', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 모든 생산자 토큰총합 조회
export const getAllProducerToken = () => axios(Server.getRestAPIHost() + '/admin/getAllProducerToken', { method: "get", withCredentials: true, credentials: 'same-origin' })

// 예약상품 중 blct결제한 리스트
export const getReservedOrderByBlctPaid = () => axios(Server.getRestAPIHost() + '/admin/getReservedOrderByBlctPaid', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 배너 등록
export const setGoodsBannerSave = (goodsBannerList) => axios(Server.getRestAPIHost() + '/admin/goodsBannerSave', { method: "post", data: goodsBannerList, withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 리스트 조회
export const getGoodsBannerList = () => axios(Server.getRestAPIHost() + '/admin/goodsBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 상품상세 공지 정보 조회
export const getGoodsBanner = (goodsBannerId) => axios(Server.getRestAPIHost() + '/admin/goodsBanner', { method: "get", params:{goodsBannerId: goodsBannerId}, withCredentials: true, credentials: 'same-origin' })
//
export const delGoodsBanner = (goodsBannerId) => axios(Server.getRestAPIHost() + '/admin/goodsBannerDel', { method: "delete", params:{goodsBannerId: goodsBannerId}, withCredentials: true, credentials: 'same-origin' })

// 쿠폰 발급 내역 목록
export const getCouponMasterList = () => axios(Server.getRestAPIHost() + '/admin/couponMasterList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 정보 (단건)
export const getCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "get", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 등록 및 수정
export const saveCouponMaster = (data) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "post", data: data, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 삭제
export const deleteCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMaster', { method: "delete", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 쿠폰 발급 내역 종료(삭제플래그처리)
export const endedCouponMaster = ({masterNo}) => axios(Server.getRestAPIHost() + '/admin/couponMasterEnded', { method: "delete", params: {masterNo: masterNo}, withCredentials: true, credentials: 'same-origin' })
// 스페셜 쿠폰 발급
export const addSpecialCouponConsumer = (masterNo,consumerNo) => axios(Server.getRestAPIHost() + '/admin/specialCoupon', {method: "post", params:{masterNo:masterNo,consumerNo: consumerNo}, withCredentials: true, credentials: 'same-origin' })

// 소비자 쿠폰발급내역
export const getConsumerCouponList = (startDate, endDate, gubun) => axios(Server.getRestAPIHost() + '/admin/getConsumerCouponList', { method: "get", params: {startDate:startDate, endDate:endDate, gubun: gubun}, withCredentials: true, credentials: 'same-origin' })

// 홈 공지 배너 등록
export const setHomeBannerSave = (homeBanner) => axios(Server.getRestAPIHost() + '/admin/homeBannerSave', { method: "post", data: homeBanner, withCredentials: true, credentials: 'same-origin'})
// 홈 공지 배너 리스트 조회
export const getHomeBannerList = () => axios(Server.getRestAPIHost() + '/admin/homeBannerList', { method: "get", withCredentials: true, credentials: 'same-origin' })
// 홈 공지 배너 정보 조회
export const getHomeBanner = (homeBannerId) => axios(Server.getRestAPIHost() + '/admin/homeBanner', { method: "get", params:{homeBannerId}, withCredentials: true, credentials: 'same-origin' })

export const delHomeBanner = (homeBannerId) => axios(Server.getRestAPIHost() + '/admin/homeBannerDel', { method: "delete", params:{homeBannerId: homeBannerId}, withCredentials: true, credentials: 'same-origin' })

export const getAllTempProducer = () => axios(Server.getRestAPIHost() + "/admin/getAllTempProducer", { method: "get", withCredentials: true, credentials: 'same-origin' })

//고팍스 가입 이벤트 목록
export const getGoPaxJoinEvent = () => axios(Server.getRestAPIHost() + "/admin/getGoPaxJoinEvent", { method: "get", withCredentials: true, credentials: 'same-origin' })

//고팍스 카드 이벤트 목록
export const getGoPaxCardEvent = () => axios(Server.getRestAPIHost() + "/admin/getGoPaxCardEvent", { method: "get", withCredentials: true, credentials: 'same-origin' })


