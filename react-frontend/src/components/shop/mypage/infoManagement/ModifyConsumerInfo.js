import React, { Fragment, Component } from 'react';
import { Button, Label, Input, Container } from 'reactstrap'
import {getConsumer, updateName} from "~/lib/shopApi";
import ComUtil from "~/util/ComUtil"
import { ShopXButtonNav } from '~/components/common/index'
import {FaUserAlt, FaEnvelope, FaMobileAlt} from 'react-icons/fa'

export default class ModifyConsumerInfo extends Component {

    constructor(props){
        super(props)
        this.state = {
            consumerNo: 0,
            email: '',
            valword: '',
            name: '',
            //nickname: '',
            phone: '',
            addr: '',
            addrDetail: '',
            zipNo: '',
            modal: false,            // 주소검색 팝업 모달
            totalCount: '',
            results: [],
            updateAddress: false,

            fadeSmsCheck: false,
            smsCheckOk: false, //전번 변경시 true가 되어야 통과
            // receivePush: false
        }
    }

    async componentDidMount() {
        let loginUser = await getConsumer();
        if(!loginUser || !loginUser.data){
            this.props.history.replace('/mypage');
            return;
        }
        this.search();
    }

    search = async () => {
        const {data:consumerInfo} = await getConsumer();

        this.setState({
            consumerNo: consumerInfo.consumerNo,
            email: consumerInfo.email,
            valword: consumerInfo.valword,
            name: consumerInfo.name,
            //nickname: consumerInfo.nickname,
            phone: consumerInfo.phone,
            // zipNo: consumerInfo.zipNo,
            // addr: consumerInfo.addr,
            // addrDetail: consumerInfo.addrDetail,
            // receivePush: consumerInfo.data.receivePush
        })
    }

    // element값 변경시
    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    // 저장버튼 클릭
    onModifyClick = async () => {

        let p_consumerName = this.state.name;
        if(p_consumerName.length == 0){
            alert('이름을 입력해주세요!')
            return false;
        }
        const modified = await updateName(p_consumerName)
        if(modified.data === 1) {
            alert('회원정보 수정이 완료되었습니다.')
            this.props.history.push('/myPage');
        } else {
            alert('회원정보 수정 실패. 다시 시도해주세요.')
            return false;
        }

    }

    // 전화번호 정규식 체크
    checkPhoneRegex = (e) => {
        const phone = ComUtil.phoneRegexChange(e.target.value)
        this.setState({ phone: phone })
    }


    onWithdraw = () => {
        // alert('cs@blocery.io로 탈퇴 신청을 해주세요.')
        this.props.history.push('/applySecession')
    }

    render() {
        return (
            <Fragment>
                <ShopXButtonNav underline historyBack>개인정보 수정</ShopXButtonNav>
                <Container fluid>
                    <p></p>
                    <div>
                        <Label>기본정보</Label>
                        <div className={'d-flex'}>
                            <div className={'d-flex justify-content-center align-items-center'}><FaUserAlt className={'mr-2'} /></div>
                            <Input name="name" placeholder="이름" value={this.state.name} onChange={this.handleChange} />
                        </div>
                        {
                            this.state.email &&
                            <>
                            <br/>
                            <div className={'d-flex'}>
                                <div className={'d-flex justify-content-center align-items-center'}><FaEnvelope className={'mr-2'} /></div>
                                {/*<Input name="email" value={this.state.email} placeholder="아이디(이메일)" disabled />*/}
                                {this.state.email}
                            </div>
                            </>
                        }
                        {
                            this.state.phone &&
                            <>
                            <br/>
                            <div className={'d-flex'}>
                                <div className={'d-flex justify-content-center align-items-center'}><FaMobileAlt className={'mr-2'} /></div>
                                {/*<Input name="phone" value={this.state.phone} placeholder="전화번호" disabled />*/}
                                {this.state.phone}
                            </div>
                            </>
                        }
                    </div>
                    <br/>
                    <div className={'text-center'}>
                        <FaEnvelope/> 이메일 및 <FaMobileAlt/> 전화번호 변경시 cs@blocery.io 로 요청 바랍니다.
                    </div>
                    <hr />
                    <div className={'text-right text-secondary'} onClick={this.onWithdraw}>
                        탈퇴 신청 >
                    </div>
                    <br />
                    <Button block color={'info'} onClick={this.onModifyClick}>확인</Button>
                </Container>
            </Fragment>
        )
    }
}