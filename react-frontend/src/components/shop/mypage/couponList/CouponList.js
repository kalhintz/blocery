import React, { Fragment, useState, useEffect, lazy, Suspense} from 'react'
import { Div } from '~/styledComponents/shared'
import HeaderBox from '~/components/shop/goodsReviewList/HeaderBox'

import { ShopXButtonNav, Sticky } from '~/components/common'
// import UnusedCouponList from './UnusedCouponList'
// import ExpiredCouponList from './ExpiredCouponList'
import { getUnusedCouponList, getExpriedCouponList } from '~/lib/shopApi'

const UnusedCouponList = lazy(() => import('./UnusedCouponList'))
const ExpiredCouponList = lazy(() => import('./ExpiredCouponList'))


const CouponList = (props) => {

    const [ tabId, setTabId ] = useState('1')     // 화면 렌더시 사용가능한쿠폰목록
    const [usableCouponList, setUsableCouponList] = useState()
    const [expiredCouponList, setExpiredCouponList] = useState()

    // 탭이동
    const onHeaderClick = (selectedTabId) => {
        setTabId(selectedTabId)
    }

    useEffect(() => {
        window.scrollTo(0,0)
    }, [])

    useEffect(() => {
        if (tabId === '1') {
            searchUnusedCoupon()
        }else{
            searchExpiredCoupon()
        }

    }, [tabId]);



    async function searchUnusedCoupon() {
        const {data: usableCoupons} = await getUnusedCouponList();
        setUsableCouponList(usableCoupons)
    }

    async function searchExpiredCoupon() {
        const {data: expiredCoupons} = await getExpriedCouponList();
        setExpiredCouponList(expiredCoupons)
    }



    return (
        <Fragment>
            <Sticky>
                <ShopXButtonNav fixed history={props.history} historyBack>쿠폰</ShopXButtonNav>
                <div className='d-flex bg-white cursor-pointer' style={{boxShadow: '1px 1px 2px gray'}}>
                    <HeaderBox text={`사용가능${(usableCouponList && usableCouponList.length) > 0 ? '('+usableCouponList.length+'장)' : ''}`} tabId={tabId} active={tabId === '1'} onClick={onHeaderClick.bind(this, '1')}/>
                    <HeaderBox text={`사용불가`} tabId={tabId} active={tabId === '2'} onClick={onHeaderClick.bind(this, '2')}/>
                </div>
            </Sticky>
            <Div bg={'background'} minHeight={'calc(100vmax - 96px - 54px)'}>
                <Suspense fallback={null}>
                    {
                        tabId === '1' ?
                            <UnusedCouponList data={usableCouponList} /> :
                            <ExpiredCouponList data={expiredCouponList} />
                    }
                </Suspense>
            </Div>
        </Fragment>

    )
}
export default CouponList