import React, { useState, useEffect } from 'react'
import { getNoticeByNoticeNo } from '~/lib/adminApi'
import { NoticeTemplate } from '~/components/common/templates'
const Notice = (props) => {

    const [notice, setNotice] = useState()

    useEffect(() => {
        getNotice()
    }, [])

    async function getNotice(){
        const { status, data } = await getNoticeByNoticeNo(props.noticeNo)
        if(status === 200){
            setNotice(data)
        }
        console.log(data)
    }

    if(!notice) return 'loading...'

    return (
        <NoticeTemplate {...notice}/>
    )
}
export default Notice