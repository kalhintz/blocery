import React, { useState, useEffect, Fragment } from 'react';
import { getNoticeList } from '~/lib/adminApi';
import { getLoginUserType } from '~/lib/loginApi';
import { ShopXButtonNav, Hr, HeaderTitle } from '~/components/common'
import ComUtil from '~/util/ComUtil';
import { setMissionClear } from "~/lib/eventApi"

const NoticeList = (props) => {

    const [noticeList, setNoticeList] = useState(undefined);
    const [isVisible, setIsVisible] = useState(false);
    const [tIndex, setIndex] = useState(null);

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
        setMissionClear(14).then( (response) => console.log('notificationList SET:missionEvent14:' + response.data )); //기본배송지를 저장
    }

    const toggle = (index) => {
        setIsVisible(!isVisible);
        setIndex(index);
    }

    return (
        <Fragment>
            <ShopXButtonNav underline history={props.history} back>공지사항</ShopXButtonNav>
            <div className='mt-4 mb-4'>
                {
                    (noticeList && noticeList.length != 0) ?
                        noticeList.map(({noticeNo, regDate, title, content}, index) => {
                        return (
                            <div>
                                <div className='flex-grow-1 f6 ml-4 mr-4 mt-3'>{ComUtil.utcToString(regDate)}</div>
                                <div className='d-flex text-secondary f3 ml-4 mr-4 mb-2' onClick={toggle.bind(this, index)}><b>{title}</b></div>
                                {
                                    (isVisible && tIndex === index) && (
                                        <div className='bg-light d-flex pl-4 pr-4 pt-3 pb-3'>
                                            <div className='text-dark' style={{whiteSpace:'pre-line'}}>{content}</div>
                                        </div>
                                    )
                                }
                                <hr className='p-0 m-0'/>
                            </div>
                        )}
                     )
                        :
                        <div className='w-100 h-100 d-flex justify-content-center align-items-center p-5 text-dark'>{(noticeList===undefined)?'':'공지사항이 없습니다.'}</div>
                }
            </div>

        </Fragment>
    )
}

export default NoticeList