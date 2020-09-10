import React, { useState, useEffect} from 'react'
import { getGoodsQnaListByProducerNo } from '~/lib/producerApi'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { Link } from 'react-router-dom'
import GoodsQnaAnswer from "~/components/producer/web/goodsQna/WebGoodsQnaAnswer";

const limitedCount = 10

const QnAList = (props) => {
    const [data, setData] = useState()
    const [count, setCount] = useState()
    const [goodsQnaNo, setGoodsQnaNo] = useState()
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        getList()
    }, [])

    async function getList(){
        const { status, data } = await getGoodsQnaListByProducerNo()



        //답변 미완료인것만
        let items = data.filter(item => item.goodsQnaStat !== 'success')

        setCount(items.length)

        //최신 작성일 정렬
        ComUtil.sortNumber(items, 'goodsQnaNo', true)

        console.log({qnaList: items})

        if(items.length > limitedCount)
            items = items.slice(0,limitedCount)

        setData(items)
    }

    function onGoodsClick(goodsNo){
        alert('준비중 입니다'+goodsNo)
    }

    function onGoodsQnAClick(goodsQnaNo){
        setGoodsQnaNo(goodsQnaNo)
        toggle()
    }

    function toggle(){
        setIsOpen(!isOpen)
    }

    async function onAnswerPopupClose(params){
        await getList()
        toggle()
    }

    if(!data) return null
    return(

        <>
        <div className={'d-flex align-items-center mb-3'}>
            <div className={'text-dark'}>
                답변이 필요한 문의
            </div>
            <div className={'ml-auto bg-danger small rounded-lg text-white d-flex align-items-center pl-2 pr-2'}>
                {ComUtil.addCommas(count)}
            </div>
        </div>

        {
            data.map((item, index) =>
                <div key={'qnA_'+index} >
                    <div className={'f6 text-secondary cursor-pointe cursor-pointer'} onClick={onGoodsClick.bind(this, item.goodsNo)}>{item.goodsName}</div>
                    <a className={'f5 text-dark cursor-pointer'} onClick={onGoodsQnAClick.bind(this, item.goodsQnaNo)}>{item.goodsQue}</a>
                    <div className={'f7 text-muted mb-3'}>{ComUtil.timeFromNow(item.goodsQueDate)}</div>
                </div>
            )
        }
        {
            data.length <= 0 && <div className={'text-center f5 text-muted mb-3'}>상품문의가 없습니다</div>
        }
        <div className={'text-center'}>
            <Link to={'/producer/web/goods/goodsQnaList'} className={'btn btn-info btn-sm'}>전체보기</Link>
        </div>

        <Modal isOpen={isOpen} toggle={toggle} className={''} centered>
            <ModalHeader toggle={toggle}>상품문의</ModalHeader>
            <ModalBody className={'p-0'}>
                <GoodsQnaAnswer goodsQnaNo={goodsQnaNo} onClose={onAnswerPopupClose} />
            </ModalBody>
        </Modal>

        </>
    )
}
export default QnAList