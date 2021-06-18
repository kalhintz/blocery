import axiosSecure from "~/lib/axiosSecure";
import axios from 'axios'
import { Server } from "../components/Properties";

/* token test용 */
export const sendManagerBlyToUser = (receiverAddr, amount) => axios(Server.getRestAPIHost() + '/swap/sendManagerBlyToUser', { method: "post", params: {receiverAddr: receiverAddr, amount: amount}, withCredentials:true, credentials: 'same-origin' })
export const sendUserBlytToManager = (userAddress, pk, amount) => axios(Server.getRestAPIHost() + '/swap/sendUserBlytToManager', { method: "post", params: {userAddress: userAddress, pk: pk, amount: amount}, withCredentials:true, credentials: 'same-origin' })
export const getEthBalance = (account) => axios(Server.getRestAPIHost() + '/swap/getEthBalance', { method: "post", params: {account: account}, withCredentials:true, credentials: 'same-origin' })
export const sendEth = (account) => axios(Server.getRestAPIHost() + '/swap/sendEth', { method: "post", params: {account: account}, withCredentials:true, credentials: 'same-origin' })



/* 소비자 로그인으로 api 호출시 consumerNo는 모두 다 생략 가능!! */
export const getBlyBalanceByAccount = (ownerAccount) => axios(Server.getRestAPIHost() + '/swap/getBlyBalanceByAccount', { method:"get", params: {ownerAccount}, withCredentials:true, credentials: 'same-origin' })

//OLD 방식 제거 // consumerNo에 할당된 임시계좌 중 가장 최근 것으로 소비자의 bly 잔액 조회
// export const getBlyBalanceByConsumerNo = (consumerNo) => (consumerNo) ? axios(Server.getRestAPIHost() + '/swap/getBlyBalanceByConsumerNo', { method:"get", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })
//                                                                         :axios(Server.getRestAPIHost() + '/swap/getBlyBalanceByConsumerNo', { method:"get", params: {consumerNo: 0}, withCredentials: true, credentials: 'same-origin' })

//OLD
// export const allocateSwapAccount = (consumerNo) => (consumerNo) ? axios(Server.getRestAPIHost() + '/swap/allocateSwapAccount', { method: "post", params: {consumerNo}, withCredentials: true, credentials: 'same-origin' })
//                                                                    : axios(Server.getRestAPIHost() + '/swap/allocateSwapAccount', { method: "post", params: {consumerNo: 0}, withCredentials: true, credentials: 'same-origin' })

//new Swap
export const newAllocateSwapAccount = () =>  axios(Server.getRestAPIHost() + '/swap/newAllocateSwapBlyAccount', { method: "post", withCredentials: true, credentials: 'same-origin' })

//OLD입금 차단.
// export const swapBlyToBlct = (blyAmount, consumerNo) => (consumerNo) ? axios(Server.getRestAPIHost() + '/swap/swapBlyToBlct', { method: "post", params: {consumerNo, blyAmount}, withCredentials: true, credentials: 'same-origin' })
//                                                                       : axios(Server.getRestAPIHost() + '/swap/swapBlyToBlct', { method: "post", params: {consumerNo: 0, blyAmount}, withCredentials: true, credentials: 'same-origin' })


//OLD출금 이제 미사용.
// export const swapBlctToBly = (blctAmount, extErcAccount, memo) => axios(Server.getRestAPIHost() + '/swap/swapBlctToBly', { method: "post", params: {blctAmount, extErcAccount, memo },withCredentials: true, credentials: 'same-origin' })

// 소비자: 신규 출금요청 -
export const swapBlctToBlyRequest = (blctAmount, extErcAccount, memo) => axiosSecure(Server.getRestAPIHost() + '/swap/swapBlctToBlyRequest', { method: "post", params: {blctAmount, extErcAccount, memo },withCredentials: true, credentials: 'same-origin' })

// 소비자: 입금화면 확인 시간 체크
export const depositLastCheckDay = () => axios(Server.getRestAPIHost() + '/swap/depositLastCheckDay', { method: "get", withCredentials: true, credentials: 'same-origin'})

//admin OLD입금 list용 - new입금 에선 미사용.
export const swapBlyToBlctByAccount = (consumerNo, account, blyAmount) => axios(Server.getRestAPIHost() + '/swap/swapBlyToBlctByAccount', { method: "post", params: {consumerNo, account, blyAmount}, withCredentials: true, credentials: 'same-origin' })

// blctToBly swap 수동 전송 후 DB update
export const updateSwapBlctToBlySuccess = (swapBlctToBlyNo, txHash) => axios(Server.getRestAPIHost() + '/swap/updateSwapBlctToBlySuccess', { method: "post", params: {swapBlctToBlyNo, txHash}, withCredentials: true, credentials: 'same-origin' })

// blct 출금 기간에 따른 조회
export const getBlctToBlyList = ({startDate, endDate, adminOkStatus}) => axios(Server.getRestAPIHost() + '/swap/getBlctToBlyList', { method: "get", params: {startDate:startDate, endDate:endDate, adminOkStatus:adminOkStatus}, withCredentials: true, credentials: 'same-origin'})
// blct 출금 기간에 따른 조회 (출금합계용)
export const getTotalSwapBlctToBlyByGigan = ({startDate, endDate, adminOkStatus}) => axios(Server.getRestAPIHost() + '/swap/getTotalSwapBlctToBlyByGigan', { method: "get", params: {startDate:startDate, endDate:endDate, adminOkStatus:adminOkStatus}, withCredentials: true, credentials: 'same-origin' })

// blct 입금 전체내역 조회
export const getBlyToBlctList = (showEthGasFee) => axios(Server.getRestAPIHost() + '/swap/getBlyToBlctList', { method: "get", params: {showEthGasFee: (showEthGasFee)? showEthGasFee : false}, withCredentials: true, credentials: 'same-origin'})

// new 토큰입금 내역 조회
export const getNewBlyToBlctList = (showEthGasFee) => axios(Server.getRestAPIHost() + '/swap/getNewBlyToBlctList', { method: "get", params: {showEthGasFee: (showEthGasFee)? showEthGasFee : false},withCredentials: true, credentials: 'same-origin'})

// new 토큰입금 총합
export const getTotalNewSwapBlctIn = () => axios(Server.getRestAPIHost() + '/swap/getTotalNewSwapBlctIn', { method: "get", withCredentials: true, credentials: 'same-origin' })

// new BLY잔액포함 전체내역 조회
export const getNewBlyToBlctListBalance = () => axios(Server.getRestAPIHost() + '/swap/getNewBlyToBlctListBalance', { method: "get", withCredentials: true, credentials: 'same-origin'})

// blct 입금 잔액포함 전체내역 조회
export const getBlyToBlctListWithBalance = () => axios(Server.getRestAPIHost() + '/swap/getBlyToBlctListWithBalance', { method: "get", withCredentials: true, credentials: 'same-origin'})

// admin
export const sendErcBlyToManager = (swapBlyDepositNo) => axios(Server.getRestAPIHost() + '/swap/adminDepositErcSendButton', { method: "post", params: {swapBlyDepositNo},withCredentials: true, credentials: 'same-origin' })

// bly, eth 잔액 조회
export const getEthBlyBalance = (ercAccount) => axios(Server.getRestAPIHost() + '/swap/getEthBlyBalance', { method: "post", params: {ercAccount},withCredentials: true, credentials: 'same-origin' })
export const adminWeiRetrieval = (ercAccount) => axios(Server.getRestAPIHost() + '/admin/newSwapErcAccountWeiRetrieval', { method: "post", params: {ercAccount},withCredentials: true, credentials: 'same-origin' })

// 미사용:20210125  blct 출금 성공한 것만 전체내역 조회
// export const getBlctToBlyPaidList = () => axios(Server.getRestAPIHost() + '/swap/getBlctToBlyPaidList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// 미사용:20210125 blct 입금 성공한 것만 전체내역 조회
//export const getBlyToBlctPayedList = () => axios(Server.getRestAPIHost() + '/swap/getBlyToBlctPayedList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// 로그인한 소비자의 blct 출금 전체내역 조회
export const getConsumerBlctToBlyList = () => axios(Server.getRestAPIHost() + '/swap/getConsumerBlctToBlyList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// 로그인한 소비자의 blct 입금 전체내역 조회
export const getConsumerBlyToBlctList = () => axios(Server.getRestAPIHost() + '/swap/getConsumerBlyToBlctList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// 로그인한 소비자의 새로운 입금리스트 전체내역 조회
export const getNewSwapBlyDepositList = () => axios(Server.getRestAPIHost() + '/swap/getNewSwapBlyDepositList', { method: "get", withCredentials: true, credentials: 'same-origin'})

// 이더 가스비 Gwei
export const getEthGasPrice = () => axios(Server.getRestAPIHost() + '/ethGasGwei', { method: "get",  withCredentials: true, credentials: 'same-origin' })

// blct 통계용 swap 합계 금액
export const getTotalSwapBlctToBly = () => axios(Server.getRestAPIHost() + '/swap/getTotalSwapBlctToBly', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getSwapTempProducerBlctToBly = () => axios(Server.getRestAPIHost() + '/swap/getSwapTempProducerBlctToBly', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getTotalSwapBlctIn = () => axios(Server.getRestAPIHost() + '/swap/getTotalSwapBlctIn', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getSwapManagerBlyBalance = () => axios(Server.getRestAPIHost() + '/swap/getSwapManagerBlyBalance', { method: "get", withCredentials: true, credentials: 'same-origin' })
export const getSwapManagerEthBalance = () => axios(Server.getRestAPIHost() + '/swap/getSwapManagerEthBalance', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getTodayAmountBlctToBly = () => axios(Server.getRestAPIHost() + '/swap/getTodayAmountBlctToBly', { method: "post", withCredentials: true, credentials: 'same-origin' })
export const getTodayWithdrawCount = () => axios(Server.getRestAPIHost() + '/swap/getTodayWithdrawCount', { method: "get", withCredentials: true, credentials: 'same-origin' })

//OLD방식 제거
//export const getAlreayDepositBly = () => axios(Server.getRestAPIHost() + '/swap/getAlreayDepositBly', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const copyErcAccountToErcHistory = () => axios(Server.getRestAPIHost() + '/swap/copyErcAccountToErcHistory', { method: "post", withCredentials: true, credentials: 'same-origin' })

// 생산자 계좌 출금처리
export const withdrawProducerToken = (producerNo, extErcAccount) => axios(Server.getRestAPIHost() + '/swap/withdrawProducerToken', { method: "post", params: {producerNo, extErcAccount}, withCredentials: true, credentials: 'same-origin' })

// 소비자의 출금신청 한건 조회
export const getSwapBlctToBlyById = (swapBlctToBlyNo) => axios(Server.getRestAPIHost() + '/swap/swapBlctToBlyById', { method: "post", data: {swapBlctToBlyNo}, withCredentials: true, credentials: 'same-origin'})

//출금 승인이 성공할지 안할지 에러코드 리턴
/*
    0 : 관리자 로그인 안되어있는 경우
    -101: 탈퇴한 회원,
    -102: 어뷰저,음
    -103: 해킹시도(어뷰저),
    -104: 19세 미만 출금 시도,
    -1: 잔액부족
*/
export const withdrawSecurityCheck = ({consumerNo, extErcAccount, blctAmount}) => axios(Server.getRestAPIHost() + '/swap/withdrawSecurityCheck', { method: "post", params: {consumerNo, extErcAccount, blctAmount}, withCredentials: true, credentials: 'same-origin'})

export const updateBlyDepositFinished = (swapBlyDepositNo) => axios(Server.getRestAPIHost() + '/swap/updateBlyDepositFinished', { method: "post", params: {swapBlyDepositNo}, withCredentials: true, credentials: 'same-origin'})