import React, { Fragment, useState, useEffect } from 'react'
import ComUtil from '~/util/ComUtil'
import { HeaderTitle, NoSearchResultBox, ModalWithNav } from '~/components/common'
import { Container, Row, Col, Button } from 'reactstrap'
import { Webview } from "~/lib/webviewApi";
import { getB2bLoginUserType } from '~/lib/b2bLoginApi'
import Textarea from 'react-textarea-autosize'
import { addFoodsQnA } from '~/lib/b2bShopApi'
import { Server } from '~/components/Properties'

const FoodsQueModalButton = ({children, foods, onClose = () => null, ...rest}) => {

    const [isOpen, setIsOpen] = useState(false)
    const [goodsQue, setGoodsQue] = useState('')
    const [isSaving, setIsSaving] = useState(false);

    async function onPopupOpenClick(e) {
        e.preventDefault();

        //유저 로그인 체크
        const { data: userType } = await getB2bLoginUserType()
        if(userType !== 'buyer'){
            Webview.openPopup('/b2b/login')
            return
        }
        toggle()
    }

    function toggle() {
        setIsOpen(!isOpen)
    }

    async function onSaveClick() {

        if(!goodsQue || goodsQue.length <= 0){
            alert('문의내용을 작성해 주세요')
            return
        }

        const data = {
            foodsQnaNo: null,
            foodsNo: foods.foodsNo,
            goodsName: null,
            consumerNo: null,
            consumerEmail: null,
            consumerName: null,
            goodsQue: goodsQue,
            goodsQueDate: null,
            producerNo: null,
            producerName: null,
            farmName: null,
            goodsAns: null,
            goodsAnsDate: null,
            goodsQnaStat: null,
        }
        //1. db 저장
        if(!isSaving) {
            setIsSaving(!isSaving);
            await addFoodsQnA(data)
        }

        setGoodsQue('')

        //팝업 닫기
        toggle()

        //부모 콜백
        onClose()
    }

    function onFoodsQnAChange(e) {
        const {value} = e.target
        setGoodsQue(value)
    }

    //const imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCHJc0oSlnUtVsUtNyXqJSWbtmUP6fNunZ0DojOqGCmCusMbQl'

    return(
        <Fragment>
            <u><a href={'#'} className={'text-info'} {...rest} onClick={onPopupOpenClick}>{children}</a></u>
            <ModalWithNav show={isOpen} title={'상품문의'} onClose={toggle} noPadding>
                <div>
                    {/*<hr className={'m-0'}/>*/}
                    <div className={'d-flex m-3'}>
                        <div className={'text-center mr-2'} style={{width: 70, height: 70}}>
                            <img src={Server.getThumbnailURL() + foods.goodsImages[0].imageUrl }  className={'w-100 h-100'} />
                        </div>
                        <div>
                            {foods.goodsNm}
                        </div>
                    </div>

                    {/*<hr className={'m-0'}/>*/}
                    <div className={'m-3'}>
                        <Textarea
                            style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                            className={'border'}
                            rows={3}
                            maxRows={3}
                            onChange={onFoodsQnAChange}
                            placeholder='상품에 대해 문의해 주세요'
                            value={goodsQue}
                        />
                    </div>
                    <div className={'m-3'}>
                        <Button className={'rounded-0'} block onClick={onSaveClick} >확인</Button>
                    </div>
                </div>
            </ModalWithNav>

        </Fragment>

    )
}
export default FoodsQueModalButton