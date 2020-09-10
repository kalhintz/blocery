import ComUtil from '../util/ComUtil'
import axios from 'axios'
import { Server } from "../components/Properties";

/* 향후 환전관련 추가예정 */

export const BLCT_TO_WON = () => axios(Server.getRestAPIHost() + '/ont/blctToWon', { method: "get", withCredentials: true, credentials: 'same-origin' }); //won

//시간과 함께 BLCT_TO_WON 가져오기:
// @return {
//     double blctToWon;
//     LocalDateTime time;
// }
export const blctToWonWithTime = () => axios(Server.getRestAPIHost() + '/ont/blctToWonWithTime', { method: "get", withCredentials: true, credentials: 'same-origin' }); //won

export const CREDIT_COMMISSION = 0.035;   // 신용카드 수수료 3.5% (3.102% + 부가세 10%)
export const ORDER_DEPOSIT = 0.1;           // 주문시 미배송보증금인데 현재는 개수비례로 하고있어서 사용 안함
export const ORDER_BLOCERY_ONLY_FEE = 0.01;      // blocery fee
export const ORDER_CONSUMER_REWARD = 0.0048;  // 소비자 구매보상 0.48%
export const ORDER_PRODUCER_REWARD = 0.0002;  // 생산자 판매보상 0.02%

export const GOODS_TOTAL_DEPOSIT_RATE = 0.1;  // 생산자 물품등록시 전체 보증금 비율

export const CANCEL_FEE_13TO5 = 3; //배송시작일 14~10일전 취소수수료 단위%
export const CANCEL_FEE_4TO3 = 5;  //배송시작일 9~6일전
export const CANCEL_FEE_2TO1 = 7;  //배송시작일 5~2일전
export const CANCEL_FEE_MAX = 10;   //배송시작일 1일전~배송시작일 이후 MAX 취소수수료 단위%

//서버에서 가져온 BLCT를 첫화면에서 쿠키에 저장하고, 쿠키값을 리턴. : 정확한 BLCT값이 아니므로 홈이나 목록에서만 사용
//결제등에서 정확한 값을 쓰려면 exchangeWon2BLCT 필요.
export const exchangeWon2BLCTHome = (won) => {
    let blctToWon = sessionStorage.getItem('blctToWon');
    // console.log('getBlctCookie:' + blctToWon);
    if (!blctToWon) {
        blctToWon = 40.0; //default 40원
    }
    //console.log('getBlct:' + blctToWon);
    return ComUtil.roundDown(won/blctToWon, 0);
}

////B2B_ADDED//////////////////
export const B2B_DEAL_BLOCERY_ONLY_FEE = 0.00;      // blocery fee

/**
 * param 원
 * returns BLCT
 */
export const exchangeWon2BLCT = async (won) =>  {
    let {data:blctToWon} = await BLCT_TO_WON();
    return ComUtil.roundDown(won/blctToWon, 2);          //BLCT 소수점 2자리까지로 잘라서 버리기
}

export const exchangeWon2BLCTComma = async (won) =>  {
    const wonToBlct = await exchangeWon2BLCT(won)
    return ComUtil.addCommas(wonToBlct);     //toLocaleString
}

export const exchangeBLCT2Won = async (blct) =>  {
    let {data:blctToWon} = await BLCT_TO_WON();
    return ComUtil.roundDown(blct * blctToWon, 0); //BLCT 원화로 변환 (원단위 미만 버림)
}

//BLCT 적립금
export const exchangeWon2BLCTPoint = (won) =>  {
    won = won * 0.0048
    let blctToWon = sessionStorage.getItem('blctToWon');
    // console.log({
    //     getBlctCookie:blctToWon,
    //     won: won
    // });

    if (!blctToWon) {
        blctToWon = 40.0; //default 40원
    }
    // blctToWon = blctToWon * 0.0048

    //return (won/blctToWon).toFixed(2);
    return ComUtil.roundDown(won/blctToWon, 2);
}

//BlyTime 진행중일 때 적립금
export const exchangeWon2BlctBlyTime = (won, reward) => {
    won = won * reward * 0.01
    let blctToWon = sessionStorage.getItem('blctToWon');

    if (!blctToWon) {
        blctToWon = 40.0; //default 40원
    }

    return ComUtil.roundDown(won/blctToWon, 2);
}

