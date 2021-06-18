import React, {useState, useEffect} from 'react'

import ComUtil from '~/util/ComUtil'
import { getHomeBannerList } from '~/lib/shopApi'

import { Server } from '~/components/Properties'
import {Link, Div, Button, Flex, Fixed, Img} from '~/styledComponents/shared'
import styled, {keyframes} from 'styled-components'
import {AiOutlineClose} from 'react-icons/ai'
import {RiDownloadLine} from 'react-icons/ri'

import {withRouter} from 'react-router-dom'
import appIcon20 from '~/images/appIcon/app-icon-20-pt-x-20-pt@3x.png'
import {Webview} from "~/lib/webviewApi";

export default withRouter(function B2cBottombar(props){
    const [isOpen, setIsOpen] = useState(false)
    // const [banner, setBanner] = useState([]);
    const [appUrl, setAppUrl] = useState('');

    const {pathname} = props.history.location

    useEffect(() => {
        if(['/home/1','/'].indexOf(pathname) > -1) {
            getHomeBanner();
        }
    }, [pathname]);

    // 모바일웹일때만 홈배너공지 팝업(안드로이드, ios 각각 다른 url)
    const getHomeBanner = async () => {
        const today = ComUtil.utcToString(new Date())
        if(!localStorage.getItem('appUrlOpen') || localStorage.getItem('today') !== today || !localStorage.getItem('today')) {
            if(ComUtil.isMobileWeb()) {
                if(ComUtil.isMobileWebIos()){
                    setAppUrl('https://apps.apple.com/kr/app/%EB%A7%88%EC%BC%93%EB%B8%94%EB%A6%AC/id1471609293')
                } else {
                    setAppUrl('https://play.google.com/store/apps/details?id=com.blocery&hl=ko')
                }
                setTimeout(() => {
                    setIsOpen(true)

                    ComUtil.noScrollBody()
                }, 1500)
            }
        }
    }

    const onlyToday = async () => {
        ComUtil.scrollBody();
        setIsOpen(false)

        localStorage.setItem('appUrlOpen', true)
    }

    // const getHomeBanner = async() => {
    //     const today = ComUtil.utcToString(new Date())
    //     if(!localStorage.getItem('today') || localStorage.getItem('today') !== today){
    //
    //         console.log(today, localStorage.getItem('today'))
    //
    //         const {data:res} = await getHomeBannerList();
    //         if(res.length > 0) {
    //             setBanner(res[0])
    //
    //             setTimeout(() => {
    //                 setIsOpen(true)
    //                 localStorage.setItem("today", today)
    //                 ComUtil.noScrollBody()
    //             }, 1500)
    //         }
    //     }
    // }

    const toggleBottom = () => {
        ComUtil.scrollBody();
        setIsOpen(false)
    }

    const moveToStore = () => {
        window.location.assign(appUrl);
    }

    const moveToJoin = () => {
        Webview.openPopup('/login',  true);
    }

    if(!isOpen) return null

    return(
        <>
            <Flex fixed top={0} bottom={0} left={0} right={0} zIndex={21} justifyContent={'center'} style={{backgroundColor: 'rgba(0,0,0, 0.8)'}}>
                <Div absolute top={20} right={20} zIndex={1} onClick={toggleBottom} cursor>
                    <AiOutlineClose color={'white'} size={30} />
                </Div>
                <div onClick={(e)=>{
                    e.stopPropagation()
                    e.preventDefault()
                    return
                }}>

                    <Div textAlign='center'>
                        <Div><Img src={appIcon20} alt={'사진'} rounded={10} width={70} height={70}/> &nbsp;</Div>
                        <Div my={20} bold fg='white' fontSize='20px'>
                            <Div>앱에서는 타임세일, 슈퍼리워드 등</Div>
                            <Div>다양한 소식을 알림으로 빠르게</Div>
                            <Div>받아볼 수 있어요!</Div>
                        </Div>
                        <Button bc='secondary' fg='black' px='30px' py='15px' rounded='50px' onClick={moveToStore}>
                            <Div>편리한 앱으로 보기<RiDownloadLine/></Div>
                        </Button><br/>
                        <Div mt={30} fg={'white'} onClick={onlyToday} cursor><u>오늘은 모바일 웹으로 볼게요.</u></Div>
                        {
                            !localStorage.getItem('userType') &&
                            <Button mt={30} fg='white' bc='white' px='20px' py='15px' rounded='50px' onClick={moveToJoin} style={{backgroundColor: 'rgba(0,0,0,0)'}}>
                                <Div>바로 회원가입 하기</Div>
                            </Button>
                        }
                    </Div>


                </div>
            </Flex>
        </>
    )
})


