import React, { useState } from 'react'
import { Nav, NavItem, NavLink, Row, Label, Container } from 'reactstrap'
import CalculateStatus from './CalculateStatus'
import CalculateHistory from './CalculateHistory'

import classnames from 'classnames'

const CalculateTab = (props) => {
    const [tab, setTab] = useState('calculateStatus');

    function toggle(tabTitle) {
        setTab(tabTitle)
    }

    return(
        <div>
            <div className='p-2 d-flex'>
                <div>
                    <Label size="sm"> * 이번 달 정산현황 및 정산이 완료된 내역을 확인할 수 있습니다.</Label>
                    <Label size="sm"> * 정산대상은 1달간(1일~말일) 구매확정 된 주문으로 발행한 매출로 해당 매출에서 판매수수료(5%)가 제외된 금액이 지급됩니다.(지급일 : 매달 마지막 날 기준 5영업일 후)</Label>
                    <Label size="sm"> * 정산내역 탭에서는 그 동안 지급받은 정산 내역을 확인할 수 있습니다.</Label>
                </div>
            </div>
            <Nav tabs>
                <NavItem>
                    <NavLink className={classnames({active: tab === 'calculateStatus'})} onClick={()=>(toggle('calculateStatus'))}>
                        <h6>정산현황</h6>
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink className={classnames({active: tab === 'calculateHistory'})} onClick={()=>(toggle('calculateHistory'))}>
                        <h6>정산내역</h6>
                    </NavLink>
                </NavItem>
            </Nav>
            {
                tab === 'calculateStatus' && <div><CalculateStatus/></div>
            }
            {
                tab === 'calculateHistory' && <div><CalculateHistory/></div>
            }

        </div>
    )
}

export default CalculateTab