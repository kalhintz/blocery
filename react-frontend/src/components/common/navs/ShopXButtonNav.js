import React from 'react'
import {withRouter} from 'react-router-dom'
import PropTypes from 'prop-types'
import { Webview } from '~/lib/webviewApi'
import { XButton, CartLink } from '~/components/common'
import styled, {css} from 'styled-components'
import {Div, Flex} from '~/styledComponents/shared'

import {color} from '~/styledComponents/Properties'

// const NavContainer = (props) =>
//     <Flex fontSize={20} position={'relative'} justifyContent={'center'} height={'56px'}>
//         {props.children}
//     </Flex>

//네이게이션 껍데기
const NavContainer = styled(Flex)`
    justify-content: center;
    height: 56px;
    font-size: 20px;
    position: relative;
    background-color: ${color.white};
    ${props => props.underline && css`
        border-bottom: 1px solid ${color.light};        
    `};
    
    ${props => props.fixed && css`
      position: -webkit-sticky; /* Safari */
      position: sticky;
      top: 0;
      z-index: 40; 
    `};
`;

//뒤로가기 버튼 위치
const BackArrowLayer = styled(Div)`
    position: absolute;
    top: 50%;
    left: 16px;
    transform: translateY(-50%);
    cursor: pointer;
`;


//장바구니 아이콘 위치
const CartLayer = styled(Div)`
    position: absolute;
    top: 50%;
    right: 16px;
    transform: translateY(-50%);
`;

const ShopXButtonNav = (props) => {

    const {history, children, home, close, backClose, backCloseToMypageOrderList, backToMypage, back, historyBack, forceBackUrl, isVisibleCart, isVisibleXButton,
        underline, fixed
    } = props

    /**
     * 현재 4가지 props 존재
     * 1. backClose (추천)
     *    왼쪽상단에 <- 표시.  누르면 팜업close.
     *
     * 2. home
     *    왼쪽상단에 X 표시.  누르면 팝업닫으면서 홈으로 이동.
     *
     * 3. back [유일하게 팝업이 아닐때도 사용가능] - (팝업안에서 페이지가 이동 되었을 때도 사용)
     *    왼쪽상단에 <- 표시  누르면 진짜로 back.(팜업 안에서 이동하는 것임)
     *
     * 4. close
     *    왼쪽상단에 X표시. 누르면 팝업close.
     *
     */
    const onHomeClick = () => {
        Webview.closePopupAndMovePage('/home/1');
    }

    //팝업close시 mypage 주문목록으로 강제 이동. (그냥 closePopup하면 폰앱에서는 orderList가 mypage로 바뀌는 현상이 존재해서 새로이 만듦)
    const onCloseToMypageOrderList = () => {
        Webview.closePopupAndMovePage('/mypage/orderList');
    }

    const onCloseClick = () => {
        Webview.closePopup(false);
    }

    const onHistoryBackClick = () => {
        history.goBack();
    }

    const onBackClick = () => {
        // // 뒤로가기(<-) 이지만 강제로 페이지로 이동 해야 할 경우
        // if(forceBackUrl){
        //     //window.location = forceBackUrl
        //     history.push(forceBackUrl)
        // }
        // else
        if(history.action === 'PUSH') history.goBack(); //팝업 안에서 이동.
        else window.location = '/home/1'    //페이지가 window.location 을 통해 들어왔을 경우 history의 goBack() 할 수가 없어 메인 페이지로 이동하게 함
    }

    const onBackToMypage = () => {
        history.push('/mypage')
    }

    function getXButton() {

        if (backCloseToMypageOrderList) {
            return <XButton back onClick={onCloseToMypageOrderList}/>
        } else if(backClose){
            return <XButton back onClick={onCloseClick}/>
        } else if(home){
            return <XButton close onClick={onHomeClick}/>
        } else if(close){
            return <XButton close onClick={onCloseClick}/>
        } else if(backToMypage) {
            return <XButton back onClick={onBackToMypage} />
        } else if(historyBack) {
            return <XButton back onClick={onHistoryBackClick} />
        } else{
            return <XButton back onClick={onBackClick}/>
        }
    }

    return(
        <NavContainer underline={underline} fixed={fixed}>
            {
                //home(버튼은 close와 동일), close, back 처리.
                isVisibleXButton && <BackArrowLayer>{getXButton()}</BackArrowLayer>
                // backClose ?  <XButton back onClick={onCloseClick}/> :
                //     (home ? <XButton close onClick={onHomeClick}/> : (close ? <XButton close onClick={onCloseClick}/> : <XButton back onClick={onBackClick}/>) )
            }
            {children}
            {/* 카트 아이콘 표시여부 */}
            {
                isVisibleCart && (
                    <CartLayer>
                        <CartLink/>
                    </CartLayer>
                )
            }
        </NavContainer>
    )

    // return(
    //     <div className={
    //         classNames(
    //             Style.wrap,
    //             props.fixed && Style.fixed,
    //             underline && Style.underline
    //         )}>
    //         {
    //             //home(버튼은 close와 동일), close, back 처리.
    //             isVisibleXButton && getXButton()
    //             // backClose ?  <XButton back onClick={onCloseClick}/> :
    //             //     (home ? <XButton close onClick={onHomeClick}/> : (close ? <XButton close onClick={onCloseClick}/> : <XButton back onClick={onBackClick}/>) )
    //         }
    //         <div className={Style.name}>{children}</div>
    //
    //         {/* 카트 아이콘 표시여부 */}
    //         {
    //             isVisibleCart && (
    //                 <div className={Style.cart}>
    //                     <CartLink/>
    //                 </div>
    //             )
    //         }
    //     </div>
    // )
}

ShopXButtonNav.propTypes = {
    close: PropTypes.bool,
    forceBackUrl: PropTypes.string,
    fixed: PropTypes.bool,
    isVisibleCart: PropTypes.bool,
    isVisibleXButton: PropTypes.bool
}
ShopXButtonNav.defaultProps = {
    close: false,
    fixed: false,
    isVisibleCart: false,
    isVisibleXButton: true
}


export default withRouter(ShopXButtonNav)