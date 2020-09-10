import React, { Component, Fragment } from 'react';

import { getBuyer, getDealDetailListByBuyerNo, getDealDetailListByBuyerNoWithPayMethod } from '~/lib/b2bShopApi'

import { getB2bLoginUser } from "~/lib/b2bLoginApi"

import ComUtil from '../../../util/ComUtil'
import { Webview } from '~/lib/webviewApi'
import classNames from 'classnames' //여러개의 css 를 bind 하여 사용할 수 있게함

import { B2bShopXButtonNav } from '../../common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트
import 'react-toastify/dist/ReactToastify.css'
import mypageStyle from './MyPage.module.scss'
import Select from 'react-select'

export default class WaesangHistory extends Component {
    constructor(props){
        super(props)

        this.state = {
            nonePaidWaesang: 0,
            loginUser:'',
            waesangList: null,

            optionList: [
                { value: 'all', label: '전체' },
                { value: 'ready', label: '미입금내역만 보기' },
                { value: 'paid', label: '입금완료만 보기' }
            ],
            selectedOption:'all'  // all or ready or paid
        }
    }

    async componentDidMount() {

        //const { data } = await this.refreshCallback(); //로그인 정보 가져오기

        const params = new URLSearchParams(this.props.location.search);
        const buyerNo = params.get('buyerNo');

        const { data : allDeals } = await getDealDetailListByBuyerNoWithPayMethod(buyerNo, 'waesang'); // 외상만 가져오게 변경
        //test용 const { data : allDeals } = await getDealDetailListByBuyerNo(buyerNo); //전체 LIST. => test용

        console.log('allDeals', allDeals);

        //미지급 외상금 합 구하기
        let sumWaesang = 0;
          //미지급 array
        const dealsUnpaid = allDeals.filter((dealDetail) => dealDetail.payStatus === 'ready');
        console.log('dealsUnpaid', dealsUnpaid);
          //미지급 array 합
        if(dealsUnpaid.length != 0) {
            sumWaesang = dealsUnpaid.reduce((partial_sum, a) => partial_sum + a.orderPrice, 0);
        }



        if(allDeals.length != 0) {
            this.setState({
                waesangList: allDeals,
                allDeals: allDeals,
                nonePaidWaesang: ComUtil.addCommas(sumWaesang)
            })
        }

        console.log('waesangHistory-componentDidMount:', this.state.loginUser); //, this.state.loginUser.account);

    }

    //Select박스.  전체, 미지급만 조회, 지급만 조회
    onChangeSelect = (data) => {
        let selectedOption = data.value;
        console.log(selectedOption  + ' selected');

        //List 변경
        this.setState({
            selectedOption: selectedOption,
            waesangList: (selectedOption === 'all') ? this.state.allDeals :  //전체List
                (selectedOption === 'paid') ? this.state.allDeals.filter((d) => d.payStatus === 'paid') ://입금List
                                              this.state.allDeals.filter((d) => d.payStatus === 'ready') //미입금 List
        });

    }


    // 주문 상세 팝업.
    popupDealDetail = (dealSeq) => {
        this.props.history.push(`/b2b/mypage/dealDetail?dealSeq=${dealSeq}`)
        // Webview.openPopup(`/b2b/mypage/dealDetail?dealSeq=${dealSeq}`, true)
    }

    // refreshCallback = async() => {
    //     let loginUser;
    //
    //     loginUser = await getBuyer();
    //
    //     this.setState({
    //         loginUser: (loginUser) ? loginUser.data : '',
    //         //account: loginUser.data.account
    //     })
    //
    //     return loginUser
    // }


    //react-toastify usage: this.notify('메세지', toast.success/warn/error);
    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    render() {


        const data = this.state.waesangList
        return (
            <Fragment>
                <B2bShopXButtonNav historyBack history={this.props.history}>외상거래내역</B2bShopXButtonNav>
                <div className='m-3'>
                    <div className='p-3'>
                        <div className='text-center lead'>
                            <span className=''> 미입금 외상금 : </span>
                            <span className='font-weight-bold text-danger'> {this.state.nonePaidWaesang} 원 </span>
                        </div>
                        <div className='text-center f6 mt-2' style={{color:'gray'}} >판매자 입금이 확인되면 실시간으로 차감됩니다.</div>
                    </div>
                </div>
                <div className={'m-3'}>
                    <Select name="filterSelect"
                            options={this.state.optionList}
                            value={ this.state.optionList.find(item => item.value === this.state.selectedOption)}
                            onChange={this.onChangeSelect}/>
                </div>

                {
                    data?
                        data.map(({dealSeq, orderPrice, orderDate, goodsNm, farmName, payStatus, waesangPayTo})=>{
                            return (
                                <div key={'deal_'+dealSeq}
                                     className={'cursor-pointer'}
                                     onClick={this.popupDealDetail.bind(this, dealSeq)}
                                >
                                    <hr className={'m-0'}/>

                                    <div className={'d-flex align-items-center m-3'}>
                                        <div>
                                            <div>
                                                {farmName}
                                            </div>
                                            <div className={'small'}>
                                                {ComUtil.utcToString(orderDate, 'YYYY.MM.DD HH:mm')}
                                            </div>
                                        </div>
                                        <div className={'ml-auto align-items-center d-flex'}>
                                            <div className={'font-weight-bolder'}>{ComUtil.addCommas(orderPrice)} 원</div>
                                            <div className={'ml-2'}>
                                                <div className={'text-center f6 border bg-light p-2'}>
                                                    <div>
                                                        {payStatus == 'paid' && '입금완료'}
                                                        {payStatus == 'ready' && '미입금'}
                                                        {payStatus == 'cancelled' && '취소'}
                                                    </div>
                                                    {payStatus == 'ready' && <div className={'small'}>~{ComUtil.utcToString(waesangPayTo, 'YYYY.MM.DD')}</div>}
                                                </div>

                                            </div>
                                        </div>
                                    </div>


                                    {/*<div className={'d-flex'}>*/}

                                        {/*/!*</div>*!/*/}
                                        {/*<div className={''}>*/}
                                            {/*<div className={'d-flex'}>*/}
                                                {/*<div style={{minWidth: 180}} className='font-weight-bold'>{farmName}</div>*/}
                                                {/*<div className='font-weight-bold'>{ComUtil.addCommas(orderPrice)}원</div>*/}
                                            {/*</div>*/}


                                            {/*<div style={{color:'gray'}}>{goodsNm}</div>*/}
                                            {/*<div style={{color:'gray', fontSize:'9pt'}}>{ComUtil.utcToString(orderDate, 'YYYY.MM.DD HH:mm')}</div>*/}
                                        {/*</div>*/}
                                        {/*{*/}
                                            {/*<div style={{minWidth: 80, fontSize:'10pt'}} className={classNames(mypageStyle.centerAlign, 'text-center font-weight-bold f2')}>*/}
                                                {/*{*/}
                                                    {/*payStatus == 'paid' ? (<div className='f6 border bg-light justify-content-center align-items-center d-inline-block'> 입금완료 </div>)*/}
                                                        {/*: ''*/}
                                                {/*}*/}
                                                {/*{*/}
                                                    {/*payStatus == 'ready' ?  //test -> 배포시에는 ready로 바꿔야함*/}
                                                         {/*(<div> <div className='text-primary f6 border bg-light justify-content-center align-items-center d-inline-block'> 미입금 </div>*/}
                                                            {/*<div style={{color:'gray', fontSize:'8pt'}}>(~{ComUtil.utcToString(waesangPayTo, 'YYYY.MM.DD')})</div> </div>) : ''*/}
                                                {/*}*/}
                                                {/*{*/}
                                                    {/*payStatus == 'cancelled' ? (<div className='f6 border bg-light justify-content-center align-items-center d-inline-block'> 취소 </div>)*/}
                                                        {/*: ''*/}
                                                {/*}*/}
                                            {/*</div>*/}
                                        {/*}*/}
                                    {/*</div>*/}
                                </div>
                            )
                        })
                        :
                        <div>
                            <hr className='m-0'/>
                            <br/>
                            <div className={'text-center'}>외상 거래내역이 없습니다</div>
                        </div>
                }
                <ToastContainer/>

            </Fragment>
        )
    }


}