import React from 'react'
import { Div } from '~/styledComponents/shared'

import CouponCard from '~/components/common/cards/CouponCard'

const ExpiredCouponList = ({data: expiredCoupons}) => {

    if (!expiredCoupons) return null

    return (
        <Div p={20}>
            <Div>
                {
                    expiredCoupons.map((item, index) => <CouponCard key={'coupon'+index} coupon={item} isExpired={true} />)
                }
            </Div>
            <Div mt={30}>
                <Div mb={10}><b>* 쿠폰 유의사항</b></Div>
                <Div fontSize={12} lineHeight={22}>
                    - 쿠폰사용, 기간만료 등 사용이 불가능한 쿠폰은 최근 3개월간 정보가 제공됩니다.<br/>
                    - 쿠폰에 대해 궁금하신 내용은 cs@blocery.io 로 문의해 주시면 안내드리도록 하겠습니다.
                </Div>
            </Div>
        </Div>
    )

}
export default ExpiredCouponList