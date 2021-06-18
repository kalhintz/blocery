import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button, Progress, Collapse } from 'reactstrap'
import Header from '~/components/shop/header'
import { Webview } from '~/lib/webviewApi'
import { getLoginUser } from "~/lib/loginApi"
import { getMissionEventList, confirmMissionEvent } from "~/lib/eventApi"
import { Link } from 'react-router-dom'
import { LoginLinkCard, BlockChainSpinner } from '~/components/common'
import { ToastContainer, toast } from 'react-toastify'                              //토스트

import {FaSmile, FaStamp} from 'react-icons/fa'


import {Spring} from 'react-spring/renderprops'

const eventCount = 5
const missionName = [
    '0 빈값',
    '회원가입 후 로그인을 하세요',
    '상품을 장바구니에 담아보세요',
    '생산자를 단골로 등록하세요',
    '예약상품을 확인하세요',
    '상품에 문의글을 남겨보세요',
    '생산일지를 확인하세요',
    '내 지갑주소를 복사하세요',
    '정보관리에서 기본배송지를 저장하세요',
    '이용안내 내용을 확인하세요',
    '위 1~9 모두 달성하세요',

    '예약상품 확인 후 장바구니에 담아보세요.',
    '상품에 문의글을 남겨보세요.',
    '생산자(판매자)를 단골로 등록하세요.',
    '공지사항을 확인해 주세요.',
    '위 11~14번 미션을 모두 달성하세요'];

const hints = [
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',
    '',

    '예약상품을 확인하고 장바구니 버튼을 눌러 담아주세요.',
    '현재 판매중인 상품에 [문의하기]를 해주세요.(3개 이상)',
    '상품 상세화면의 생산자명을 누른 후 단골로 등록해 주세요(3개 이상)',
    '마이페이지의 공지사항을 확인하세요.',
    '11번~14번 미션 달성 시 자동으로 완료됩니다.'];



export default class MissionEvent extends Component {

    //missionNo 1~10까지 해당 text
    // missionName = [
    //     '0 빈값',
    //     '회원가입 후 로그인을 하세요',
    //     '상품을 장바구니에 담아보세요',
    //     '생산자를 단골로 등록하세요',
    //     '예약상품을 확인하세요',
    //     '상품에 문의글을 남겨보세요',
    //     '생산일지를 확인하세요',
    //     '내 지갑주소를 복사하세요',
    //     '정보관리에서 기본배송지를 저장하세요',
    //     '이용안내 내용을 확인하세요',
    //     '위 1~9 모두 달성하세요',
    //
    //     '예약상품(마감임박 상품) 확인 후 장바구니에 담아보세요.',
    //     '상품에 문의글을 남겨보세요.(3개 이상/기존 문의글 포함)',
    //     '생산자(판매자)를 단골로 등록하세요.(총 3개 이상/기존 단골 포함)',
    //     '공지사항을 확인해 주세요.',
    //     '위 11~14번 미션을 모두 달성하세요'];

    constructor(props){
        super(props)

        this.state = {

            loginUser:'',       //not Logined
            completeCount: 0,   //달성개수 - 계산
            progressCount: 0,
            missionList: null,  //{missionNo,  status:0-대기, 1-확인, 2-완료,  blct}
            isLoading: false,

            isOpen: false,

        }
    }

    getCompleteCount = (missionList) => {
        return missionList.filter((mission, index) => index >= 10 && mission.status === 2).length
    }

    async componentDidMount() {

        const loginUser = await getLoginUser();

        //console.log('B2C Event-componentDidMount - ', loginUser);

        if(!loginUser || loginUser.userType !== 'consumer') {
            console.log('B2C Event-componentDidMount - consumer notLogined');
            return;
        }

        const {data:missionList} = await getMissionEventList();

        let completeCount = 0;
        if (missionList) {
            completeCount = this.getCompleteCount(missionList)
        }

        //console.log('missionList', missionList, typeof missionList);
        //console.log({missionList});
        //console.log('completeCount', completeCount);

        // if (missionList && missionList.length != 0) {
        //     completeCount = missionList.reduce((partial_sum, a) => partial_sum + (a.status == 2)?1:0, 0);  //status가 2일때만 합산
        // }

        this.setProgress(completeCount)

        this.setState({
            loginUser: loginUser,
            // completeCount: completeCount,
            missionList: missionList
        })

    }

    onClickTokenHistory = () => {
        //Webview.openPopup('/tokenHistory');
        this.props.history.push(`/tokenHistory?account=${this.state.loginUser.account}`)
    }

    onConfirm = async (missionNo, blct) => {
        // spinner start /////////////

        this.setState({isLoading: true})

        const {data:result} = await confirmMissionEvent(missionNo);
        const {data:missionList} = await getMissionEventList();

        this.setState({isLoading: false})

        this.notify(<div className='d-flex align-items-center'><FaStamp className={'ml-3 mr-3'}/>{blct} BLCT 적립이 완료 되었습니다!</div>, toast.success);

        //   result: 200 성공
        //           100 실패
        //           400 이벤트 종료
        if (result === 400 )  alert('이벤트가 종료되었습니다');
        if (result === 200 )  {
            const  completeCount = this.getCompleteCount(missionList)

            this.setProgress(completeCount)

            this.setState({
                missionList: missionList,
                //completeCount: completeCount
            })
        }
    }

    intervalId = null

    setProgress = (completeCount) => {

        if (completeCount == 0)
            return false;

        let progressCount = this.state.progressCount;

        this.intervalId = setInterval(() => {
            if(progressCount <= completeCount){
                //console.log('interval=====')
                progressCount += 1
                this.setState({completeCount: completeCount, progressCount: progressCount})
                if(progressCount === completeCount)
                    clearInterval(this.intervalId)
            }
        }, 1000)

        // let count = this.state.completeCount;
        //
        // const intervalId = setInterval(() => {
        //     if(count <= completeCount){
        //         count += 1
        //         this.setState({completeCount: count})
        //         if(count === completeCount)
        //             clearInterval(intervalId)
        //     }
        // }, 1000)
    }

    componentWillUnmount(){
        clearInterval(this.intervalId)
    }

    onLoginClick = () => {
        Webview.openPopup('/login')
    }

    notify = (msg, toastFunc) => {
        toastFunc(msg, {
            position: toast.POSITION.TOP_CENTER
        })
    }

    render() {

        return (
            <Fragment>
                {
                    this.state.isLoading && <BlockChainSpinner />
                }
                <Header />
                <Container>
                    <Row>
                        <Col xs={12} className={'p-0'}>

                            <div className='m-4'>
                                <div className='f2 mb-2 font-weight-bolder text-dark'>3차 미션 이벤트</div>
                                <div className='f5 text-dark mb-3'>
                                    <p className='mb-2'>총 5개 미션 달성 후 보상 받자!<br/>
                                        회원 여러분의 성원에 힘입어 3차 미션 이벤트를 추가 진행합니다.<br/>
                                        마켓블리 App으로 쉽게 이용할 수 있는 총 5개의 미션을 확인 후 해당 미션을 달성해 보세요.<br/>
                                        기분좋은 보상이 여러분을 기다리고 있습니다.
                                    </p>
                                    <p>
                                        <div className='text-secondary'>기간 : 20.03.04 ~ 20.03.15</div>
                                        <div className='text-secondary'>보상 : App에서 실제 사용 가능한 토큰(BLCT)</div>
                                    </p>
                                </div>

                                {
                                    this.state.loginUser && (
                                        <Link
                                            to={`/tokenHistory?account=${this.state.loginUser.account}`}
                                            className={'text-info'}
                                        ><u>내 토큰 적립내역 확인</u></Link>
                                    )
                                }

                            </div>
                            <hr/>
                            {
                                !this.state.loginUser && (
                                    <div className='m-4'>
                                        <LoginLinkCard icon description={'로그인 후 미션을 달성하여 BLCT를 보상 받으세요!'} onClick={this.onLoginClick}/>
                                    </div>
                                )
                            }


                            {
                                this.state.loginUser && (
                                    <div className='m-4'>
                                        <div className='d-flex mb-1 text-secondary font-weight-normal'>
                                            <div>내 미션현황</div>
                                            <div className='ml-auto'>{this.state.progressCount} 개 달성</div>
                                        </div>
                                        <Progress
                                            color={'info'}
                                            max="100"
                                            striped={this.state.progressCount !== this.state.completeCount}
                                            animated={this.state.progressCount !== this.state.completeCount}
                                            value={this.state.progressCount*100/eventCount}
                                        >
                                            {this.state.progressCount*100/eventCount} %
                                        </Progress>
                                    </div>
                                )
                            }

                            <hr/>



                            {
                                this.state.missionList && (
                                    !this.state.loginUser ? (
                                        missionName.map((name, index) => {
                                            if(index <= 10) return null
                                            return(
                                                <div key={'mission'+index} className='m-4 align-items-center border rounded-lg shadow-sm'>
                                                    <div className={'pt-4 pb-4 pl-3 pr-3'}>
                                                        <div>
                                                            {index} {name}
                                                        </div>
                                                        <small className={'text-muted'}>
                                                            {hints[index]}
                                                        </small>
                                                    </div>
                                                    <hr className={'m-0'}/>
                                                    <div className={'d-flex align-items-center p-3'}>
                                                        <div className={'text-secondary'}>
                                                            미션을 달성하여 보상을 받으세요!
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    ) : (
                                        this.state.missionList.map( ({missionNo, status, blct}, index) => {
                                            if(index < 10) return null
                                            return(

                                                <div key={'mission'+index} className='m-4 align-items-center border rounded-lg cursor-pointer shadow-sm'>
                                                    <div className={'pt-4 pb-4 pl-3 pr-3'}>
                                                        <div>
                                                            {missionNo} {missionName[missionNo]}
                                                        </div>
                                                        <small className={'text-muted'}>
                                                            {hints[missionNo]}
                                                        </small>
                                                    </div>
                                                    <hr className={'m-0'}/>
                                                    <div className={'d-flex align-items-center p-3'}>
                                                        <div className={'text-info'}>
                                                            {
                                                                status === 1 && '달성완료!'
                                                            }
                                                            {
                                                                status === 2 && (
                                                                    <Spring
                                                                        from={{number:0}}
                                                                        to={{number:blct}}
                                                                        config={{
                                                                            duration: 1000,
                                                                            delay: 1000 * (missionNo - 11)
                                                                        }}
                                                                    >
                                                                        {
                                                                            props => <div style={props}>{props.number.toFixed(0)} BLCT 적립완료</div>
                                                                        }
                                                                    </Spring>
                                                                )
                                                            }
                                                        </div>
                                                        {
                                                            status === 0 && <span className={'text-danger'}>미달성</span>
                                                        }
                                                        {
                                                            status === 1 && <Button className={'rounded-sm ml-auto'} color={'info'} size={'sm'} onClick={this.onConfirm.bind(this, missionNo, blct)} >받기</Button>
                                                        }
                                                        {
                                                            status === 2 && <FaSmile className={'ml-auto text-info'} />
                                                        }
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )
                                )
                            }

                            {/*{*/}
                                {/*(!this.state.loginUser || (this.state.loginUser && this.state.missionList)) && (*/}
                                    {/*missionName.map((name, index) => {*/}
                                        {/*if(index <= 10) return null*/}
                                        {/*return(*/}
                                            {/*<div key={'mission'+index} className='m-4 align-items-center border rounded-lg shadow-sm'>*/}
                                                {/*<div className={'pt-4 pb-4 pl-3 pr-3'}>*/}
                                                    {/*<div>*/}
                                                        {/*{index} {name}*/}
                                                    {/*</div>*/}
                                                    {/*<small className={'text-muted'}>*/}
                                                        {/*{hints[index]}*/}
                                                    {/*</small>*/}
                                                {/*</div>*/}
                                                {/*<hr className={'m-0'}/>*/}
                                                {/*<div className={'d-flex align-items-center p-3'}>*/}
                                                    {/*<div className={'text-secondary'}>*/}
                                                        {/*미션을 달성하여 보상을 받으세요!*/}
                                                    {/*</div>*/}
                                                {/*</div>*/}
                                            {/*</div>*/}
                                        {/*)*/}
                                    {/*})*/}
                                {/*)*/}
                            {/*}*/}


                            {/*{*/}
                                {/*(this.state.loginUser && this.state.missionList && this.state.missionList.length > 0) && (*/}
                                    {/*this.state.missionList.map( ({missionNo, status, blct}, index) => {*/}
                                        {/*if(index < 10) return null*/}
                                        {/*return(*/}

                                            {/*<div key={'mission'+index} className='m-4 align-items-center border rounded-lg cursor-pointer shadow-sm'>*/}
                                                {/*<div className={'pt-4 pb-4 pl-3 pr-3'}>*/}
                                                    {/*<div>*/}
                                                        {/*{missionNo} {missionName[missionNo]}*/}
                                                    {/*</div>*/}
                                                    {/*<small className={'text-muted'}>*/}
                                                        {/*{hints[missionNo]}*/}
                                                    {/*</small>*/}
                                                {/*</div>*/}
                                                {/*<hr className={'m-0'}/>*/}
                                                {/*<div className={'d-flex align-items-center p-3'}>*/}
                                                    {/*<div className={'text-info'}>*/}
                                                        {/*{*/}
                                                            {/*status === 1 && '달성완료!'*/}
                                                        {/*}*/}
                                                        {/*{*/}
                                                            {/*status === 2 && (*/}
                                                                {/*<Spring*/}
                                                                    {/*from={{number:0}}*/}
                                                                    {/*to={{number:blct}}*/}
                                                                    {/*config={{*/}
                                                                        {/*duration: 1000,*/}
                                                                        {/*delay: 1000 * (missionNo - 11)*/}
                                                                    {/*}}*/}
                                                                {/*>*/}
                                                                    {/*{*/}
                                                                        {/*props => <div style={props}>{props.number.toFixed(0)} BLCT 적립완료</div>*/}
                                                                    {/*}*/}
                                                                {/*</Spring>*/}
                                                            {/*)*/}
                                                        {/*}*/}
                                                    {/*</div>*/}
                                                    {/*{*/}
                                                        {/*status === 0 && <span className={'text-danger'}>미달성</span>*/}
                                                    {/*}*/}
                                                    {/*{*/}
                                                        {/*status === 1 && <Button className={'rounded-sm ml-auto'} color={'info'} size={'sm'} onClick={this.onConfirm.bind(this, missionNo, blct)} >받기</Button>*/}
                                                    {/*}*/}
                                                    {/*{*/}
                                                        {/*status === 2 && <FontAwesomeIcon icon={faSmile} className={'ml-auto text-info'} size={'2x'} />*/}
                                                    {/*}*/}
                                                {/*</div>*/}
                                            {/*</div>*/}
                                        {/*)*/}
                                    {/*})*/}
                                {/*)*/}
                            {/*}*/}

                            <div className={'p-4'}>
                                <u className={'cursor-pointer'} onClick={()=>{
                                    this.setState({isOpen: !this.state.isOpen})
                                    window.scrollTo(0, 2000)
                                }}>지난 이벤트({this.state.isOpen ? '접기':'펼치기'})</u>
                            </div>
                            <Collapse isOpen={this.state.isOpen}>
                                {
                                    missionName.filter((m,index)=>index < 10).map((name, index) => {
                                        if(index === 0) return null
                                        return(
                                            <div key={'mission'+index}>
                                                <div className='d-flex pl-4 pr-4 align-items-center b-light'>
                                                    <div className='f5 mr-3'>
                                                        <div className={'text-muted'}>{index} {name}</div>
                                                    </div>
                                                </div>
                                                <hr/>
                                            </div>
                                        )
                                    })
                                }
                            </Collapse>

                            {/*<div className='d-flex m-4 align-items-center text-info small'>*/}
                            {/*9번 미션은 시간이 소요될 수 있습니다*/}
                            {/*</div>*/}

                        </Col>
                    </Row>
                </Container>
                <ToastContainer />
            </Fragment>
        )
    }
}

