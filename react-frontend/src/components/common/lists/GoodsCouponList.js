import React, {useEffect, useState} from 'react';
import {getGoodsCouponMasters, getGoodsRewardCouponList} from '~/lib/shopApi'
import GoodsCouponCard from '../cards/GoodsCouponCard'
import {Div, Flex} from '~/styledComponents/shared'
import useFetch from "~/hooks/useFetch";

const GoodsCouponList = ({goodsNo}) => {

    const {data:coupons, loading } = useFetch(getGoodsRewardCouponList, goodsNo)
    console.log(coupons)

    if (loading) return null

    return(
        <Flex flexDirection={'column'} alignItems={'center'} py={20}>
            {
                coupons.map((coupon, index) =>
                    <Div mb={10} key={`coupon${index}`}>
                        <GoodsCouponCard
                            title={coupon.couponTitle}
                            couponBly={coupon.couponBlyAmount}
                            fixedWon={coupon.fixedWon}
                            minOrderBly={coupon.minOrderBlyAmount}
                        />
                    </Div>
                )
            }
            {
                (coupons.length > 0) &&
                <Div textAlign={'center'} mt={10} fontSize={12} fg={'secondary'}>구매확정시 적립완료되며 누적하여 한 번에 사용 가능합니다.</Div>
            }
        </Flex>
    )
}

export default GoodsCouponList;
