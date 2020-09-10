import React from 'react'
import Css from './Footer.module.scss'
import { Webview } from "~/lib/webviewApi";
import { Link } from 'react-router-dom'

const Footer = () => {
    function queOpen() {
        //window.open('https://forms.gle/Scz2RBwSEP4HJi5L6');
        Webview.winOpenPopup('/b2b/b2bQueInfo');
    }

    return(

        <div className={Css.wrap}>
            <div>
                <div><Link to={'/b2b/mypage/useGuide'} className={'text-dark'}>이용안내</Link></div>
                <div><Link to={'/b2b/mypage/buyerCenter'} className={'text-dark'}>고객센터</Link></div>
                <div><Link to={'/b2b/mypage/termsOfUse'} className={'text-dark'}>이용약관</Link></div>
                <div><Link to={'/b2b/mypage/privacyPolicy'} className={'text-dark'}>개인정보처리방침</Link></div>
            </div>
            {/*<div>*/}
                {/*© Blocery. powered by ONTology*/}
            {/*</div>*/}
            <ul>
                <li>위탁사업자</li><li>Farm & Consume, Ltd.</li>
                <li>Director</li><li>Jin Gyomoon</li>
                <li>Address</li><li>10 Anson Road #23-14F International Plaza
                Singapore Registration No. 201830855C</li>
                <li>운영사업자</li><li>(주)이지팜</li>
                <li>대표이사</li><li>김영국</li>
                <li>사업자등록번호</li><li>124-81-73259</li>
                <li>통신판매업신고번호</li><li>2006-경기안양-117</li>
                <li>개인정보보호책임자</li><li>김용</li>
                <li>주소</li><li>경기도 안양시 동안구 동편로20번길 9</li>
                <li>호스팅제공</li><li>Amazon WebServices, Inc</li>
                <li>생산자 입점문의</li><li><a style={{'cursor': 'pointer'}} onClick={queOpen}><u>입점 문의하기</u></a></li>
                <li>제휴문의</li><li>info@blocery.io</li>
                <li>고객센터</li><li>031-421-3414</li>
                <li>팩스</li><li>031-421-3422</li>
            </ul>
        </div>
    )
}
export default Footer
