import React, { Fragment, useState, useEffect } from 'react'
import { ViewButton } from '~/components/common/buttons'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { ViewModule, ViewStream, ViewModuleOutlined} from '@material-ui/icons'

import { getOperStatDealCancelCntBySellerNo } from '~/lib/b2bSellerApi'
import { BlocerySpinner, HeaderTitle } from '~/components/common'

import { Doc } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'



const DealCancelDeal = (props) => {

    const [loading, setLoading] = useState(false)
    const [toDayCount, setToDayCount] = useState(0)
    const [yesterDayCount, setYesterDayCount] = useState(0)
    const [weekCount, setWeekCount] = useState(0)
    const [monthCount, setMonthCount] = useState(0)

    useEffect(() => {
        search()
    }, [])

    async function search() {

        setLoading(true);

        // 취소건수 (오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatDealCancelCntBySellerNo();

        if(status === 200) {
            setToDayCount(data.totalToDateCnt);
            setYesterDayCount(data.totalYesterDateCnt);
            setWeekCount(data.totalWeekDateCnt);
            setMonthCount(data.totalMonthDateCnt);
        }

        setLoading(false);
    }

    return (
        <Fragment>
            {
                loading && <BlocerySpinner/>
            }
            <div className='mr-1'>
                <div className='p-2 bg-secondary text-white'>
                    <div className='text-center f6 font-weight-light'>취소건수</div>
                    <div className='text-center f1 font-weight-bold'>{toDayCount}</div>
                </div>
                <div className='f7 p-2 bg-light'>
                    <div className='d-flex'>
                        <span>어제</span><span className='ml-auto'>{yesterDayCount}</span>
                    </div>
                    <div className='d-flex'>
                        <span>주간</span><span className='ml-auto'>{weekCount}</span>
                    </div>
                    <div className='d-flex'>
                        <span>월간</span><span className='ml-auto'>{monthCount}</span>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
export default DealCancelDeal