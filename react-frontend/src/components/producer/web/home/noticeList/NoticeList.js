import React, { useState, useEffect } from 'react'
import { List } from '../components/List'
import ComUtil from '~/util/ComUtil'
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap'

import Notice from '~/components/admin/notice'

import { getNoticeList } from '~/lib/adminApi'

function NoticeList(props) {

    const [data, setData] = useState([])
    const [isOpen, setIsOpen] = useState(false)
    const [noticeNo, setNoticeNo] = useState(null)

    useEffect(() => {
        search()
    }, [])

    async function search() {
        const {status, data} = await getNoticeList('producer')



        if (status === 200) {

            let items = []

            // ComUtil.sortNumber(data, 'orderNo', true)

            if(data.length <= 5)
                items = data
            else
                items = data.slice(0,5)

            items = items.map(item => {
                return {
                    ...item,
                    imageUrl: '',
                    regDate: ComUtil.utcToString(item.regDate, 'YY.MM.DD HH:MM'),
                    userType: '관리자'
                }
            })

            console.log({items})

            setData(items)
        }
    }

    function onHeaderRightSectionClick(){
        props.history.push('/producer/web/home/noticeList')
    }

    function onClick(param){
        console.log(param)
        setNoticeNo(param.noticeNo)
        toggle()
    }

    function toggle(){
        setIsOpen(!isOpen)
    }

    return(
        <>
        <List header={'공지사항'}
              headerRightSection={'more >'}
              onHeaderRightSectionClick={onHeaderRightSectionClick}
              data={data}
              titleKey={'title'}
              subTitleKey={'regDate'}
              badgeTextKey={'userType'}
              onImgClick={onClick}
              onTitleClick={onClick}
              onBadgeClick={onClick}
        />

        <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
            <ModalHeader toggle={toggle}>공지사항</ModalHeader>
            <ModalBody>
                <Notice noticeNo={noticeNo} />
            </ModalBody>
        </Modal>
        </>
    )
}
export default NoticeList