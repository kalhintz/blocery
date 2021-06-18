import React, {useState, useEffect, useRef} from 'react'
import { getUsableCouponList, getPotenCouponMaster } from "~/lib/shopApi"
import Select from "react-select";
import ComUtil from "~/util/ComUtil";
import { BLCT_TO_WON } from "~/lib/exchangeApi"
import {Div, Span} from "~/styledComponents/shared/Layouts";
import styled from 'styled-components'
import {calcBlyToWon} from "~/lib/exchangeApi";
import {withRouter, Redirect} from 'react-router-dom'

const StyledSelect = styled(Select)`        
    & > div {
        min-height: 60px;
    }
`
const Coupon = ({goods, blctToWon, onChange, goodsBlyAmount, totalBlyAmount, history}) => {
    const [usableCoupons, setUsableCoupons] = useState()
    const [selectedValue, setSelectedCoupon] = useState(0)

    const {goodsNo, inTimeSalePeriod} = goods

    useEffect(() => {
        getUsableCoupon()
    }, [])

    //couponNo 가 바뀔경우 강제로 state 업데이트
    // useEffect(() => {
    //     if (couponNo) {
    //         const coupon = usableCoupons.find(item => item.value === couponNo)
    //         setSelectedCoupon(coupon)
    //     }
    // }, [couponNo]);

    // const reset = () => {
    //     const coupon = usableCoupons.find(item => item.value === 0)
    //     setSelectedCoupon(coupon)
    // }


    // 사용가능한 쿠폰 리스트 조회
    const getUsableCoupon = async () => {
        const {data} = await getUsableCouponList();
        let potenCoupon = null;

        console.log({goods})

        if (inTimeSalePeriod) {
            const {data: couponMaster} = await getPotenCouponMaster(goodsNo)

            //포텐타임의 할인율 만큼 bly 지원 (지원 bly * 구매수량)
            let blyAmount = (goods.currentPrice * (couponMaster.potenCouponDiscount / 100)) * goods.orderCnt
            blyAmount = blyAmount / blctToWon //환율 계산

            potenCoupon = {
                value: -1,// -1는 포텐타임 쿠폰이라는 의미
                blyAmount: blyAmount,
                minOrderBlyAmount: 0,
                label: (
                    <Div>
                        <Div>
                            <Span bold>
                                {couponMaster.couponTitle}
                            </Span>
                        </Div>
                        <Div fontSize={12}>
                            {`상시판매가 기준 ${ComUtil.roundDown(couponMaster.potenCouponDiscount,0)}% 할인`}
                        </Div>
                    </Div>
                )
            }
        }


        if (data) {
            const couponList = data.map(item => ({
                value: item.couponNo,
                label: (
                    item.prodGoodsProducerNo ? (
                        <Div>
                            <Div>
                                <Span bold>
                                    {item.couponTitle}
                                </Span>
                            </Div>
                            <Div fontSize={12}>
                                마이페이지 > 쿠폰 에서 사용가능
                            </Div>
                        </Div>
                    ) : (
                        <Div>
                            <Div>
                                <Span bold>
                                    {`${item.couponTitle} ${item.couponBlyAmount}BLY`}
                                </Span>
                            </Div>
                            <Div fontSize={12}>
                                주문금액 {item.minOrderBlyAmount}BLY 이상 사용가능
                            </Div>
                        </Div>
                    )
                ),
                blyAmount: item.couponBlyAmount,
                minOrderBlyAmount: item.minOrderBlyAmount,
                isDisabled: (item.minOrderBlyAmount > totalBlyAmount || item.couponBlyAmount > totalBlyAmount) || item.prodGoodsProducerNo,
                prodGoodsProducerNo: item.prodGoodsProducerNo
            }));
            console.log({potenCoupon})
            if(potenCoupon) {
                couponList.unshift(potenCoupon)
            }
            couponList.unshift({value:0, label:"사용안함", blyAmount:0})
            setUsableCoupons(couponList);

            setSelectedCoupon(-1)
        }

    }

    useEffect(() => {
        console.log({usableCoupons})

        if (usableCoupons) {
            const coupon = usableCoupons.find(c => c.value === selectedValue)

            //무료쿠폰 상품 일 경우
            if (coupon && coupon.prodGoodsProducerNo) {
                alert('무료쿠폰은 마이페이지 > 쿠폰함에서 사용할 수 있습니다.')
                setSelectedCoupon(0)

                // if(alert('무료쿠폰 사용 페이지로 이동 하시겠습니까?')) {
                //     history.push({
                //         pathname: `/couponGoodsList`,
                //         state: {
                //             couponNo: coupon.value
                //         }
                //     })
                //     return
                // }else {
                //     //취소 했을 경우 사용안함으로 되돌리기
                //     setSelectedCoupon(0)
                // }
            }

            //부모에 바뀐 값 전달
            //if(coupon && coupon.length > 0) {
                onChange(coupon)
            //}
        }
    }, [selectedValue])

    const onChangeCoupon = (data) => {
        setSelectedCoupon(data.value)
    }

    if (!usableCoupons) return null

    if (usableCoupons.length === 1) return <Div textAlign={'center'}>사용가능한 쿠폰이 없습니다.</Div>

    return (
        <StyledSelect
            name={'selectCoupon'}
            defaultValue={{ label: "사용안함", value: 0 }}
            options={usableCoupons}
            value={usableCoupons.find(item => item.value === selectedValue)}
            onChange={onChangeCoupon}
        />
    );
};

export default withRouter(Coupon);
