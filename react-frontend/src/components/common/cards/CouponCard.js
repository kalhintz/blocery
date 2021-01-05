import React from 'react';
import {Div, Span, Flex} from "~/styledComponents/shared";
import {CardText, CardTitle} from "reactstrap";
import ComUtil from "~/util/ComUtil";
import {calcBlyToWon} from '~/lib/exchangeApi'
const CouponCard = ({coupon, isUnused}) => {
    const {available, usedFlag} = coupon
    const startDay = coupon.useStartDay.toString()
    const useStartDay = startDay.substr(0,4) + '.' + startDay.substr(4,2) + '.' + startDay.substr(6,2)
    const endDay = coupon.useEndDay.toString()
    const useEndDay = endDay.substr(0,4) + '.' + endDay.substr(4,2) + '.' + endDay.substr(6,2)
    return (
        <Div mb={10} p={20} bc={'light'} bg={'white'} rounded={2}>
            {
                isUnused ? (
                    available ?
                        <Div fontSize={12} fg={'green'}>사용가능</Div> :
                        <Div fontSize={12} fg={'danger'}>[지급예정] 상품 구매확정 후 사용가능</Div>
                ) : (
                    usedFlag ?
                        <Div fontSize={12} fg={'darkBlack'}>쿠폰사용</Div> :
                        <Div fontSize={12} fg={'darkBlack'}>기간만료</Div>
                )
            }

            <Div fg={isUnused ? available ? 'black' : 'dark' : 'dark'}>
                <Div fontSize={20} my={15}><b>{coupon.couponTitle}</b></Div>
                <Div fontSize={15}>{useStartDay} ~ {useEndDay}</Div>
                <Div fontSize={15} mb={15}>{coupon.minOrderBlyAmount !== 0 ? ComUtil.addCommas(coupon.minOrderBlyAmount) + 'BLY 이상 상품구매시 사용가능' : '제한없음'}</Div>
                <Flex fontSize={20}><b>{ComUtil.addCommas(coupon.couponBlyAmount)} BLY</b>
                    <Span ml={10} fg={'dark'} fontSize={15}>/ {ComUtil.addCommas(calcBlyToWon(coupon.couponBlyAmount))}원</Span>
                </Flex>
            </Div>
        </Div>
    );
};

export default CouponCard;
