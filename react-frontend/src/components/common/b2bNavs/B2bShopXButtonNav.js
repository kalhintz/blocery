import React from 'react'
import Style from './B2bShopXButtonNav.module.scss'
import PropTypes from 'prop-types'
import { Webview } from '~/lib/webviewApi'
import { B2bXButton } from '~/components/common/buttons'
import { CartLink } from '~/components/common/b2bCart'
import classNames from 'classnames'
import { Link } from 'react-router-dom'


const ShopXButtonNav = (props) => {

    const {history, children, home, close, backClose, backCloseToMypageOrderList, backToMypage, back, historyBack, forceBackUrl, isVisibleCart, isVisibleXButton } = props

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
        Webview.closePopupAndMovePage('/b2b/home/1');
    }

    //팝업close시 mypage 주문목록으로 강제 이동. (그냥 closePopup하면 폰앱에서는 orderList가 mypage로 바뀌는 현상이 존재해서 새로이 만듦)
    const onCloseToMypageDealList = () => {
        Webview.closePopupAndMovePage('/b2b/mypage/dealList');
    }

    const onCloseClick = () => {
        Webview.closePopup();
    }

    const onHistoryBackClick = () => {
        history.goBack();
    }

    const onBackClick = () => {
        // 뒤로가기(<-) 이지만 강제로 페이지로 이동 해야 할 경우
        if(forceBackUrl){
            //window.location = forceBackUrl
            history.push(forceBackUrl)
        }
        else if(history.action === 'PUSH') history.goBack(); //팝업 안에서 이동.
        else window.location = '/b2b/home/1'    //페이지가 window.location 을 통해 들어왔을 경우 history의 goBack() 할 수가 없어 메인 페이지로 이동하게 함
    }

    const onBackToMypage = () => {
        history.push('/b2b/mypage')
    }

    // <Link> 를 활용한 것 : 충분한 테스트 후 적용하면될듯
    // function getXButton() {
    //
    //     let xButton = null
    //
    //     if (backCloseToMypageOrderList) {
    //         xButton = <XButton back onClick={!forceBackUrl && onCloseToMypageDealList}/>
    //     }
    //     else if(backClose){
    //         xButton = <XButton back onClick={!forceBackUrl && onCloseClick}/>
    //     }else if(home){
    //         xButton = <XButton close onClick={!forceBackUrl && onHomeClick}/>
    //     }
    //     else if(close){
    //         xButton = <XButton close onClick={!forceBackUrl && onCloseClick}/>
    //     }
    //     else if(backToMypage) {
    //         xButton = <XButton back onClick={!forceBackUrl && onBackToMypage} />
    //     }else{
    //         xButton = <XButton back onClick={!forceBackUrl && onBackClick}/>
    //     }
    //
    //     if(forceBackUrl){
    //         xButton = <Link to={forceBackUrl} className={'position-absolute d-flex align-items-center'}><XButton/></Link>
    //     }
    //
    //     return xButton
    // }

    function getXButton() {

        if (backCloseToMypageOrderList) {
            return <B2bXButton back onClick={onCloseToMypageDealList}/>
        } else if(backClose){
            return <B2bXButton back onClick={onCloseClick}/>
        } else if(home){
            return <B2bXButton close onClick={onHomeClick}/>
        } else if(close){
            return <B2bXButton close onClick={onCloseClick}/>
        } else if(backToMypage) {
            return <B2bXButton back onClick={onBackToMypage} />
        } else if(historyBack) {
            return <B2bXButton back onClick={onHistoryBackClick} />
        } else{
            return <B2bXButton back onClick={onBackClick}/>
        }
    }

    return(
        <div className={classNames(Style.wrap, props.fixed && Style.fixed)}>
            {
                //home(버튼은 close와 동일), close, back 처리.
                isVisibleXButton && getXButton()
                // backClose ?  <XButton back onClick={onCloseClick}/> :
                //     (home ? <XButton close onClick={onHomeClick}/> : (close ? <XButton close onClick={onCloseClick}/> : <XButton back onClick={onBackClick}/>) )
            }
            <div className={Style.name}>{children}</div>

            {/* 카트 아이콘 표시여부 */}
            {
                isVisibleCart && (
                    <div className={Style.cart}>
                        <CartLink/>
                    </div>
                )
            }
        </div>
    )
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


export default ShopXButtonNav