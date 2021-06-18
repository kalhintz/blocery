import React, { useState, useEffect, Fragment } from 'react';
import { getNoticeList } from '~/lib/adminApi';
import { getLoginUserType } from '~/lib/loginApi';
import { ShopXButtonNav } from '~/components/common'
import ComUtil from '~/util/ComUtil';
import { setMissionClear } from "~/lib/eventApi"
import Collapse from 'reactstrap/lib/Collapse'
import {Div} from '~/styledComponents/shared/Layouts'


const NoticeList = (props) => {

    const [noticeList, setNoticeList] = useState(undefined);
    const [isVisible, setIsVisible] = useState(false);
    const [tIndex, setIndex] = useState(null);
    const [nIndex, setNIndex] = useState([])

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        const {data: userType} = await getLoginUserType();
        // let {data: notices} = await getNoticeList(userType);
        let {data: notices} = await getNoticeList((userType) ? userType : 'consumer');

        notices = ComUtil.sortDate(notices, 'regDate', true);

        setNoticeList(notices);

        //20200217 - 미션이벤트 2차:
        console.log('missionClear 14')
        //setMissionClear(14).then( (response) => console.log('notificationList SET:missionEvent14:' + response.data )); //기본배송지를 저장
    }

    const toggle = (index) => {
        setIsVisible(!isVisible);
        setIndex(index);

        const ioIndex = nIndex.indexOf(index)

        const arrIndex = Object.assign([], nIndex)

        if (ioIndex === -1) {
            arrIndex.push(index)
            setNIndex(arrIndex)
        }else{
            arrIndex.splice(ioIndex, 1)
            setNIndex(arrIndex)
        }
    }

    return (
        <Fragment>
            <ShopXButtonNav underline historyBack>공지사항</ShopXButtonNav>
            <Div>
                {
                    (noticeList && noticeList.length != 0) ?
                        noticeList.map(({noticeNo, regDate, title, content}, index) => {
                        return (
                            <Div key={`notice_${index}`}>
                                <Div cursor onClick={toggle.bind(this, index)} p={16}>
                                    <Div fontSize={12} fg={'secondary'}>{ComUtil.utcToString(regDate)}</Div>
                                    <Div fontSize={15} fg={'blak'}>{title}</Div>
                                </Div>

                                <Collapse isOpen={nIndex.indexOf(index) !== -1}>
                                    <Div bg={'background'} p={16}>
                                        <Div fg={'black'} lineHeight={25} style={{whiteSpace:'pre-line'}}>{content}</Div>
                                    </Div>
                                </Collapse>
                                <hr className='p-0 m-0'/>
                            </Div>
                        )}
                     )
                        :
                        <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>{(noticeList===undefined)?'':'공지사항이 없습니다.'}</div>
                }
            </Div>

        </Fragment>
    )
}

export default NoticeList