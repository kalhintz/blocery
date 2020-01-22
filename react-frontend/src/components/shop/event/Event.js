import React, { Component, Fragment } from 'react'
import { Container, Row, Col, Button, Progress, Badge } from 'reactstrap'
import { Header } from '~/components/shop/header'
import { Webview } from '~/lib/webviewApi'
import { getLoginUser } from "~/lib/loginApi"
import { getMissionEventList, confirmMissionEvent } from "~/lib/eventApi"
import { Link } from 'react-router-dom'
import { LoginLinkCard, BlockChainSpinner } from '~/components/common'
import { faSmile } from "@fortawesome/free-regular-svg-icons";
import { faCheck, faStamp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { ToastContainer, toast } from 'react-toastify'                              //토스트

export default class Event extends Component {

    //missionNo 1~10까지 해당 text
    missionName = ['0 빈값', '회원가입 후 로그인을 하세요', '상품을 장바구니에 담아보세요', '생산자를 단골로 등록하세요', '예약상품을 확인하세요', '상품에 문의글을 남겨보세요',
        '생산일지를 확인하세요', '내 지갑주소를 복사하세요', '정보관리에서 기본배송지를 저장하세요', '이용안내 내용을 확인하세요', '위 1~9 모두 달성하세요'];

    constructor(props){
        super(props)

        this.state = {

            loginUser:'',       //not Logined
            completeCount: 0,   //달성개수 - 계산
            progressCount: 0,
            missionList: null,  //{missionNo,  status:0-대기, 1-확인, 2-완료,  blct}
            isLoading: false
        }
    }

    getCompleteCount = (missionList) => {
        return missionList.filter(mission => mission.status === 2).length
    }

    async componentDidMount() {

        const loginUser = await getLoginUser();

        console.log('B2C Event-componentDidMount - ', loginUser);

        if(!loginUser || loginUser.userType !== 'consumer') {
            console.log('B2C Event-componentDidMount - consumer notLogined');
            return;
        }

        const {data:missionList} = await getMissionEventList();

        let completeCount = 0;
        if (missionList) {
            completeCount = this.getCompleteCount(missionList)
        }

        console.log('missionList', missionList);
        console.log('completeCount', completeCount);

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

        this.notify(<div className='d-flex align-items-center'><FontAwesomeIcon size={'2x'} icon={faStamp} className={'ml-3 mr-3'}/>{blct} BLCT 적립이 완료 되었습니다!</div>, toast.success);

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
                console.log('interval=====')
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
                                <div className='f2 mb-2 font-weight-bolder text-dark'> 미션 이벤트 소개</div>
                                <div className='f5 text-secondary mb-3'>
                                    <p className=''>총 10개의 미션을 달성하고 보상 받으세요!<br/>
                                        마켓블리 App으로 쉽게 이용할 수 있는 총 10개의 미션을 확인 후 해당 미션을 달성해 보세요.
                                        <br/>기분좋은 보상이 여러분을 기다리고 있습니다.
                                    </p>
                                    <div className='text-dark'>기간 : 2019.12.30 ~ 2020.01.31</div>
                                    <div className='text-dark'>보상 : App에서 실제 사용가능한 토큰(BLCT), 총 250BLCT로 상품구매 가능</div>
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
                                        <LoginLinkCard onClick={this.onLoginClick}/>
                                        <div className='small text-center text-secondary'>로그인 후 미션 참여가 가능합니다</div>
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
                                            <Progress color={'info'} max="100" striped={this.state.progressCount !== this.state.completeCount} animated={this.state.progressCount !== this.state.completeCount} value={this.state.progressCount*100/10} >{this.state.progressCount*100/10} %</Progress>
                                        </div>
                                    )
                                }

                            <hr/>
                            {
                                (!this.state.loginUser || (this.state.loginUser && !this.state.missionList)) && (
                                    this.missionName.map((name, index) => {
                                        if(index === 0) return null
                                        return(
                                            <div key={'mission'+index}>
                                                <div className='d-flex pl-4 pr-4 align-items-center'>
                                                    <div className='f5 mr-3'>
                                                        <div>{index} {name}</div>
                                                    </div>
                                                </div>
                                                <hr/>
                                            </div>
                                        )
                                    })
                                )
                            }
                            {
                                (this.state.loginUser && this.state.missionList) && (
                                    this.state.missionList.map( ({missionNo, status, blct}, index) => {
                                        return(
                                            <div key={'mission'+index}>
                                                <div className='d-flex pl-4 pr-4 align-items-center'>

                                                    <div className='f5 mr-3'>
                                                        <div>{missionNo} {this.missionName[missionNo]}</div>
                                                        {
                                                            status === 2 && <div className='small text-secondary'><FontAwesomeIcon icon={faCheck} className={'mr-2 text-info'}/>{blct} BLCT 보상 완료</div>
                                                        }
                                                    </div>
                                                    <div className={'ml-auto rounded-0 flex-shrink-0 text-center'}>
                                                        {
                                                            // status === 0 && <span className="text-secondary">대기</span>
                                                        }
                                                        {
                                                            status === 1 && <Button className={'rounded-0'} color={'info'} size={'sm'} onClick={this.onConfirm.bind(this, missionNo, blct)} >받기</Button>
                                                        }
                                                        {
                                                           status === 2 && <FontAwesomeIcon icon={faSmile} className={'text-info'} size={'2x'} />
                                                        }
                                                    </div>
                                                </div>
                                                <hr/>
                                            </div>
                                        )
                                    })
                                )
                            }

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
