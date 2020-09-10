import React, { Component, Fragment } from 'react'
import { Label } from 'reactstrap'
import {ShopXButtonNav} from '~/components/common'
import { Div, Span, Img, Flex, Right, Hr, Sticky, Fixed, Button, Link } from '~/styledComponents/shared'
import { Checkbox } from '@material-ui/core'

import KycSingleImageUploader from '~/components/common/ImageUploader/KycSingleImageUploader'

import { Webview } from '~/lib/webviewApi'
import { regConsumerKyc, getConsumerKyc } from '~/lib/shopApi'
import { getLoginUserType } from '~/lib/loginApi'
import { getConsumer } from '~/lib/shopApi'
import { BlocerySpinner } from '~/components/common'
import styled, {keyframes} from 'styled-components'
import {getValue} from '~/styledComponents/Util'
import {color, hoverColor} from "~/styledComponents/Properties";
import {ScrollDummy, scrollIntoView} from '~/components/common/scrollDummy/ScrollDummy'

let validatedObj = {};


const btnScaleUp = keyframes`
    0% {}
    100% {transform: scale(1.05);}
`

const Body = styled.div`
    bg={'backgroundDark'} p={16}
    background: ${color.backgroundDark};
    padding: ${getValue(16)};
    
    & > div:last-child {
        margin: 0;
    }
`;

const Card = styled(Div)`
    background: ${color.white};
    border-radius: ${getValue(6)};
    margin-bottom: ${getValue(16)};
    padding: ${getValue(25)} ${getValue(16)};
`;

const Heading = styled(Div)`
    color: ${color.darkBlack};
    margin-bottom: ${getValue(10)};
    font-size: ${getValue(16)};
    font-weight: 500;
`;

const Desc = styled(Div)`
    color: ${color.dark};
    font-size ${getValue(13)};
    margin-bottom: ${getValue(10)};
`;

const Buttons = styled(Div)`
    & > button:last-child {
        margin: 0;
    }
`;

const CustomButton = styled(Button)`
    padding: ${getValue(12)} ${getValue(15)};
    margin-bottom: ${getValue(8)};
    margin: 
    text-align: left;
    border: 1px solid ${color.light};
    color: ${color.dark};
    width: 100%;
    border-radius: 2px;
    font-size: ${getValue(15)};
    font-weight: 500;
   
    
    ${props => props.active && `
        background-color: ${color.danger};
        color: ${color.white};
        
        
    `};
    
    &:active {
        background-color: ${hoverColor.danger};
        color: ${color.white};
        
        animation: ${btnScaleUp} 0.2s;
        animation-timing-function: ease-in-out; 
    }
    
    
   
`;

const CheckBoxFlex = styled(Flex)`
    
    align-items: flex-start;
    
    & > span:first-child {
        padding: 0;
        margin-right: ${getValue(8)};
    }
`;


export default class KycDocument extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loginUser: null,
            loginUserType: null,
            btnDisabled: false,
            kycType: '',         // 신분증 종류
            kycImages: [],
            check1: false,
            check2: false,
            check3: false,
            saveData: {
                kycType: '',         // 신분증 종류
                kycImages: []
            },
            loading: false

        }
    }

    async componentDidMount() {
        const loginUserType = await getLoginUserType();
        let loginUser;

        if(loginUserType.data == 'consumer') {
            loginUser = await getConsumer();
        } else if (loginUserType.data == 'producer') {
            //생산자용 mypage로 자동이동.
            Webview.movePage('/producer/mypage');
        }

        this.setState({
            loginUser: (loginUser) ? loginUser.data : '',
            loginUserType: loginUserType.data
        })

        // kyc 인증 신청 여부 확인
        // const { data: result} = await getConsumerKyc();
        // if(result && result.kycAuth === 1) {
        //     Webview.movePage('/kycFinish');
        // }
    }

    onImageChange = (items) => {
        const object = Object.assign({}, this.state);
        object.kycImages = items;

        this.setState(object);

        if (items.length === 2) {
            setTimeout(() => {
                scrollIntoView(this.step3)
            }, 500)
        }
    }

    onIdTypeClick = (type) => {
        this.setState({ kycType: type })

        setTimeout(() => {
            scrollIntoView(this.step2)
        }, 500)

    }

    onCheckBoxChange = (e) => {
        this.setState({
            [e.target.id]: e.target.checked
        })
    }

    //밸리데이션 체크, null 은 밸리데이션 체크를 통과한 것을 의미함
    setValidatedObj = (obj) => {
        validatedObj = {
            kycType: obj.kycType.length > 0 ? null : '신분증 종류 선택은 필수 입니다',
            kycImages: obj.kycImages.length === 2 ? null : '신원 확인 이미지를 모두 업로드 해주세요',
            check1: obj.check1 === true ? null : '확인사항을 모두 체크 해주세요',
            check2: obj.check2 === true ? null : '확인사항을 모두 체크 해주세요',
            check2: obj.check2 === true ? null : '확인사항을 모두 체크 해주세요'
        }
    }

    isValidatedSuccessful = () => {
        let isSuccess = true
        let msg = ''

        Object.keys(validatedObj).some((key) => {
            const _msg = validatedObj[key]
            if(_msg){
                isSuccess = false
                msg = _msg
            }
            return _msg !== null || _msg === undefined || _msg === ''
        })

        return {isSuccess, msg}
    }

    isPassedValidation = () => {
        const state = Object.assign({}, this.state)

        //밸리데이션 체크
        this.setValidatedObj(state)
        //밸리데이션을 통과했는지 여부
        const valid = this.isValidatedSuccessful()

        if(!valid.isSuccess){
            alert(valid.msg)
            return false
        }
        return true
    }

    save = async () => {
        if (!this.isPassedValidation()) return

        const saveData = Object.assign({}, this.state.saveData)
        saveData.kycAuth = 1
        saveData.kycImages = this.state.kycImages
        saveData.kycType = this.state.kycType
        saveData.consumerNo = this.state.loginUser.consumerNo

        this.setState({saveData})

        // 시간이 오래 걸려서 loading 필요할듯
        this.setState({
            loading: true
        })

        const {data: result} = await regConsumerKyc(saveData)

        this.setState({
            loading: false
        })

        if(result === 200) {
            this.props.history.replace('/kycFinish')
            // Webview.movePage('/kycFinish');
        }
    }

    render() {
        const btnDisabled = this.state.kycType.length === 0 || this.state.kycImages.length !== 2 || !this.state.check1 || !this.state.check2 || !this.state.check3
        return (
            <Fragment>
                {
                    this.state.loading && <BlocerySpinner/>
                }
                <ShopXButtonNav underline back historyBack>KYC 신원 확인</ShopXButtonNav>
                <Body>
                    <Card shadow={'sm'}>
                        <Heading>01. 신분증 종류 선택</Heading>
                        <Desc>인증할 신분증 종류 3개 중 1개를 선택해 주세요.</Desc>
                        <Buttons mt={15}>
                            <CustomButton active={this.state.kycType === '주민등록증'} onClick={this.onIdTypeClick.bind(this, '주민등록증')}>주민등록증</CustomButton>
                            <CustomButton active={this.state.kycType === '운전면허증'} onClick={this.onIdTypeClick.bind(this, '운전면허증')}>운전면허증</CustomButton>
                            <CustomButton active={this.state.kycType === '여권'} onClick={this.onIdTypeClick.bind(this, '여권')}>여권</CustomButton>
                        </Buttons>
                    </Card>
                    <ScrollDummy ref={ el => this.step2 = el}/>
                    <Card shadow={'sm'}>
                        <Heading>02. 신원확인 이미지 업로드</Heading>
                        <Desc>1. 신분증 앞면 사진</Desc>
                        <Desc>2.신원 확인용 사진을 업로드 해주세요.</Desc>
                        <KycSingleImageUploader images={this.state.kycImages} onChange={this.onImageChange} />
                    </Card>

                    <ScrollDummy ref={(el) => this.step3 = el} />
                    <Card shadow={'sm'}>
                        <Heading>03. 확인 및 제출</Heading>
                        <Div my={20}>
                            <CheckBoxFlex alignItems={'flex-start'}>
                                <Checkbox id={'check1'} onChange={this.onCheckBoxChange} />
                                <Label for={'check1'}><Span fontSize={13} fg={this.state.check1 ? 'darkBlack' : 'dark'}>신분증의 주민등록번호 뒷자리를 가리셨나요?</Span></Label>
                            </CheckBoxFlex>
                            <CheckBoxFlex>
                                <Checkbox id={'check2'} onChange={this.onCheckBoxChange} />
                                <Label for={'check2'}><Span fontSize={13} fg={this.state.check2 ? 'darkBlack' : 'dark'}>신원확인용 사진은 얼굴, 신분증, 메모가 모두 나오게 촬영하셨나요?</Span></Label>
                            </CheckBoxFlex>
                            <CheckBoxFlex>
                                <Checkbox id={'check3'} onChange={this.onCheckBoxChange} />
                                <Label for={'check3'}><Span fontSize={13} fg={this.state.check3 ? 'darkBlack' : 'dark'}>메모에 '블로서리(또는 마켓블리)'와 '날짜'를 적어 주셨나요?</Span></Label>
                            </CheckBoxFlex>
                        </Div>
                        <Flex justifyContent={'center'}>
                            <Button fontSize={18} bg={'green'} fg={'white'} rounded={2} py={13} width={'70%'} onClick={this.save} disabled={btnDisabled}>서류 제출하기</Button>
                        </Flex>
                    </Card>

                </Body>
            </Fragment>
        )
    }
}
