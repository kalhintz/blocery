import React, { useState, useEffect, useRef } from 'react'
import { ShopXButtonNav, StarButton, SingleImageUploader } from '../../common'
import { Input, Button } from 'reactstrap'
import Textarea from 'react-textarea-autosize'
import { ToastContainer, toast } from 'react-toastify'     //토스트
import { Webview } from '../../../lib/webviewApi'
import { addGoodsReview, updGoodsReview, getGoodsReviewByOrderSeq } from '../../../lib/shopApi'
import { getGoodsByGoodsNo } from '../../../lib/goodsApi'
import { getLoginUser } from '../../../lib/loginApi'
import ComUtil from '../../../util/ComUtil'
import { Server } from '../../Properties'

import PropTypes from 'prop-types'

function GoodsReview(props){

    const params = ComUtil.getParams(props)
    const inputEl = useRef(null)

    const action = params.action
    const orderSeq = params.orderSeq
    const goodsNo = params.goodsNo

    const [score, setScore] = useState(params.score)
    const [goodsNm, setGoodsNm] = useState()
    const [goodsImageUrl, setGoodsImageUrl] = useState()
    const [consumerNo, setConsumerNo] = useState()

    const [goodsReviewContent, setGoodsReviewContent] = useState()
    const [goodsReviewImages, setGoodsReviewImages] = useState([])

    const onGoodsReviewImageChange = (images) => {
        setGoodsReviewImages(images)
    }
    const onGoodsReviewContentChange = (e) => {
        setGoodsReviewContent(e.target.value)
    }

    const onStarClick = ({score}) => {
        setScore(score)
    }
    const notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_RIGHT
            //className: ''     //클래스를 넣어도 됩니다
        })
    }
    const save = async () => {
        const state = {
            orderSeq,
            goodsNo,
            consumerNo,
            score,
            goodsReviewContent,
            goodsReviewImages
        }

        if(!state.score || state.score <= 0){
            notify('별점을 선택해 주세요', toast.error)
            return
        }
        else if(!state.goodsReviewContent || state.goodsReviewContent.length <= 0) {
            notify('후기를 작성해 주세요', toast.error)
            inputEl.current.focus()
            return
        }

        // props.addGoodsReviewItem(payload)

        let status;
        let data;
        if(action === 'I'){
            const response = await addGoodsReview(state)
            status = response.status
            data = response.data
        }
        else if(action === 'U'){
            const response = await updGoodsReview(state)
            status = response.status
            data = response.data
        }

        if(status !== 200){
            alert('다시 시도해 주세요')
            return
        }

        Webview.closePopup() //작성목록 으로
    }

    useEffect(() => {
        inputEl.current.focus()

        async function getAllDataFromDB (){

            //사용자 조회
            const consumer = await getLoginUser()
            setConsumerNo(consumer.uniqueNo)

            //상품조회
            const {status, data: goods} = await getGoodsByGoodsNo(goodsNo)
            setGoodsNm(goods.goodsNm)
            setGoodsImageUrl(Server.getThumbnailURL() + goods.goodsImages[0].imageUrl)

            //수정 일 경우
            if(action === 'U'){
                //리뷰 조회
                const {data: goodsReview} = await getGoodsReviewByOrderSeq(orderSeq)

                console.log('Update', goodsReview)
                setScore(goodsReview.score)
                setGoodsReviewContent(goodsReview.goodsReviewContent)
                setGoodsReviewImages(goodsReview.goodsReviewImages)
            }
        }

        getAllDataFromDB()
    }, [])

    return(
        <div>
            <ShopXButtonNav close>상품후기작성</ShopXButtonNav>
            <div className='p-3'>
                <div className='d-flex mb-2'>
                    <div className='mr-2'><img style={{borderRadius: '100%', width: 50, height: 50}} src={goodsImageUrl} alt={'상품후기 사진'}/></div>
                    <div className='d-flex flex-column flex-grow-1 justify-content-between p-1'>
                        <div className='font-weight-bold'>{goodsNm}</div>
                        <div className='small text-secondary'>공개적으로 게시</div>
                    </div>
                </div>
                <div className='d-flex justify-content-center mb-2'>
                    {
                        [2,4,6,8,10].map((_score, index) => {
                            return <div key={`star_${index}`} className='p-1 m-2'><StarButton score={_score} active={_score <= score} onClick={onStarClick}/></div>
                        })
                    }
                </div>
                <div className='mb-4'>
                    {/*<Input innerRef={inputEl} style={{borderRadius: 0, border: 0, borderBottom: '2px solid'}} className='border-info' placeholder='받은 상품이 어떠셨나요? 후기를 자세히 공유해 주세요.'/>*/}

                    <Textarea style={{width: '100%', minHeight: 90, borderRadius: 0, border: 0, borderBottom: '2px solid'}}
                              className={'border-info'}
                              onChange={onGoodsReviewContentChange}
                              inputRef={inputEl}
                              value={goodsReviewContent}
                              placeholder='받은 상품이 어떠셨나요? 후기를 자세히 공유해 주세요.'/>
                </div>
                <div className='mb-4'>
                    <SingleImageUploader images={goodsReviewImages} defaultCount={5} isShownMainText={false} onChange={onGoodsReviewImageChange} />
                </div>
                <div>
                    <Button block color={'info'} onClick={save}>게시</Button>
                </div>
            </div>
            <ToastContainer/>
        </div>
    )
}

GoodsReview.propTypes = {
    action: PropTypes.string.isRequired,
    orderSeq: PropTypes.number.isRequired,
    goodsNo: PropTypes.number.isRequired,
    score: PropTypes.string
}
GoodsReview.defaultProps = {
    score: 1
}

export default GoodsReview