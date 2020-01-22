import React, { Fragment, useState, useEffect } from 'react'
import { ViewButton } from '~/components/common/buttons'
import { SlideItemHeaderImage, SlideItemContent } from '~/components/common/slides'
import { ViewModule, ViewStream, ViewModuleOutlined} from '@material-ui/icons'

import { getOperStatDealSalesAmtBySellerNo } from '~/lib/b2bSellerApi'
import { BlocerySpinner, HeaderTitle } from '~/components/common'

import { Doc } from '~/components/Properties'
import ComUtil from '~/util/ComUtil'



const DealSalesDeal = (props) => {

    const [loading, setLoading] = useState(false)
    const [toDayAmt, setToDayAmt] = useState(0)
    const [yesterDayAmt, setYesterDayAmt] = useState(0)
    const [weekAmt, setWeekAmt] = useState(0)
    const [monthAmt, setMonthAmt] = useState(0)

    useEffect(() => {
        search()
    }, [])

    async function search() {

        setLoading(true);

        // 매출 (오늘, 어제, 주간, 월간)
        const { status, data } = await getOperStatDealSalesAmtBySellerNo();

        if(status === 200) {
            setToDayAmt(data.totalToDateAmt);
            setYesterDayAmt(data.totalYesterDateAmt);
            setWeekAmt(data.totalWeekDateAmt);
            setMonthAmt(data.totalMonthDateAmt);
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
                    <div className='text-center f6 font-weight-light'>매출</div>
                    <div className='text-center f1 font-weight-bold'>{ComUtil.toCurrency(toDayAmt)}</div>
                </div>
                <div className='f7 p-2 bg-light'>
                    <div className='d-flex'>
                        <span>어제</span><span className='ml-auto'>{ComUtil.toCurrency(yesterDayAmt)}</span>
                    </div>
                    <div className='d-flex'>
                        <span>주간</span><span className='ml-auto'>{ComUtil.toCurrency(weekAmt)}</span>
                    </div>
                    <div className='d-flex'>
                        <span>월간</span><span className='ml-auto'>{ComUtil.toCurrency(monthAmt)}</span>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}
export default DealSalesDeal