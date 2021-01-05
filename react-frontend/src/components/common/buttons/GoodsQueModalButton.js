import React, { Fragment, useState } from 'react'
import { ModalWithNav } from '~/components/common'
import { Webview } from "~/lib/webviewApi";
import { getLoginUserType } from '~/lib/loginApi'
import Textarea from 'react-textarea-autosize'
import { addGoodsQnA } from '~/lib/shopApi'
import { Server } from '~/components/Properties'

import {Div, Button} from '~/styledComponents/shared'

const GoodsQueModalButton = ({children, goods, onClose = () => null}) => {

    const [isOpen, setIsOpen] = useState(false)
    const [goodsQue, setGoodsQue] = useState('')
    // const [isSaving, setIsSaving] = useState(false);

    async function onPopupOpenClick(e) {
        e.preventDefault();

        //유저 로그인 체크
        const { data: userType } = await getLoginUserType()
        if(userType !== 'consumer'){
            Webview.openPopup('/login')
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
            goodsQnaNo: null,
            goodsNo: goods.goodsNo,
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
        // if(!isSaving) {
        //     setIsSaving(!isSaving);
        console.log('add')
        await addGoodsQnA(data)
        console.log('end')
        // }

        setGoodsQue('')

        //팝업 닫기
        toggle()

        //부모 콜백
        onClose()
    }

    function onGoodsQnAChange(e) {
        const {value} = e.target
        setGoodsQue(value)
    }

    //const imageUrl = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTCHJc0oSlnUtVsUtNyXqJSWbtmUP6fNunZ0DojOqGCmCusMbQl'

    return(
        <Fragment>
            <a href={'#'} className={'text-info'} onClick={onPopupOpenClick}>{children}</a>
            <ModalWithNav show={isOpen} title={'상품문의'} onClose={toggle} noPadding>
                <Div p={10}>
                    {/*<hr className={'m-0'}/>*/}
                    <div className={'d-flex mb-3'}>
                        <div className={'text-center mr-2'} style={{width: 70, height: 70}}>
                            <img src={Server.getThumbnailURL() + goods.goodsImages[0].imageUrl }  className={'w-100 h-100'} alt={'사진'} />
                        </div>
                        <div>
                            {goods.goodsNm}
                        </div>
                    </div>

                    {/*<hr className={'m-0'}/>*/}
                    <div className={'mb-3'}>
                        <Textarea
                            style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                            className={'border'}
                            rows={3}
                            maxRows={3}
                            onChange={onGoodsQnAChange}
                            placeholder='상품에 대해 문의해 주세요'
                            value={goodsQue}
                        />
                    </div>
                    <div>
                        <Button rounded={3} py={8} block onClick={onSaveClick} bg={'green'} fg={'white'} >확인</Button>
                    </div>
                </Div>
            </ModalWithNav>

        </Fragment>

    )
}
export default GoodsQueModalButton