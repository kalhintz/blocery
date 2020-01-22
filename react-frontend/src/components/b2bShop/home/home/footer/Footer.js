import React from 'react'
import Style from './Footer.module.scss'
import { Webview } from "~/lib/webviewApi";
import { Link } from 'react-router-dom'

const Footer = () => {
    function queOpen() {
        //window.open('https://forms.gle/Scz2RBwSEP4HJi5L6');
        Webview.winOpenPopup('/b2b/b2bQueInfo');
    }
    return (
        <div className={Style.wrap}>
            <ul>
                <li>
                    <Link to={'/b2b/mypage/useGuide'} className={'text-dark'}>이용안내</Link>
                </li>
                <li>
                    <Link to={'/b2b/mypage/buyerCenter'} className={'text-dark'}>고객센터</Link>
                </li>
                <li>
                    <Link to={'/b2b/mypage/termsOfUse'} className={'text-dark'}>이용약관</Link>
                </li>
                <li>
                    <Link to={'/b2b/mypage/privacyPolicy'} className={'text-dark'}>개인정보처리방침</Link>
                </li>
            </ul>
            <hr className='m-0'/>
            <div className={Style.content}>
                <div className='f7 d-flex'>
                    <div>© Blocery. powered by </div>&nbsp;<div className='font-weight-bold'> ONTology</div>
                </div>
                <br/>
                <p className='f7'>
                    위탁사업자 : Farm & Consume, Ltd.<br/>
                    Director : Jin Gyomoon<br/>
                    Address : 10 Anson Road #23-14F International Plaza Singapore
                    Registration No. 201830855C<br/>
                </p>
                <div className='d-flex'>운영사업자 : <div className='f6 font-weight-bold'> (주)이지팜</div></div>
                <p className='f7'>
                    대표이사 : 김영국<br/>
                    사업자등록번호 : 124-81-73259<br/>
                    통신판매업신고번호 : 2006-경기안양-117<br/>
                    개인정보보호책임자 : 김용<br/>
                    주소 : 경기도 안양시 동안구 동편로20번길 9<br/>
                    호스팅제공 : Amazon WebServices, Inc<br/>
                    판매자 입점문의 : <a style={{'cursor': 'pointer'}} onClick={queOpen}><u>입점 문의하기</u></a> <br/>
                    제휴문의 : info@blocery.io<br/>
                    고객센터 : 031-421-3414<br/>
                    팩스 : 031-421-3422<br/>
                </p>
            </div>
        </div>
    );
}
export default Footer
