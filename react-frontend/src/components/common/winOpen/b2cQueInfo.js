import React, { Component, Fragment } from 'react'
import { Container, Button, Row, Col, Card, CardTitle, CardText, Input, Label } from 'reactstrap'
import { regProducer } from '~/lib/producerApi'
import { ShopXButtonNav, RadioButtons } from '~/components/common'
import { Server } from '~/components/Properties'
import axios from 'axios'


let bindCategory = [
    { value: '신선식품', label:'신선식품' },
    { value: '가공식품', label:'가공식품' },
    { value: '99', label:'기타' }
]

class b2cQueInfo extends Component{
    constructor(props){
        super(props);
        this.state = {
            goodsInfo: '',
            category: '',
            farmName: '',
            address: '',
            coRegistrationNo: '',
            charger: '',
            chargerPhone: '',
            chargerEmail: '',
            checkbox: false
        }
        this.inputCategory = React.createRef()
    }

    componentDidMount() {
        window.scrollTo(0,0);
    }

    onCategoryChange = (e) => {
        // 기타
        if(e.target.value === '99') {
            this.setState({ category: '' })
        } else {
            this.setState({ category: e.target.value })
        }

    }

    onChangeCheck = () => {
        this.setState(prevState => ({
            checkbox: !prevState.checkbox
        }));
    }

    isEtcCategory = () => {
        const categories = bindCategory.filter(item => item.value !== '99')
        const category = categories.find(item => item.value === this.state.category)

        if(category) {
            return false
        }

        return true
    }

    onChangeCategoryInput = (e) => {
        this.setState({
            category: e.target.value
        })
    }

    handleChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    checkVerify = () => {
        const state = Object.assign({}, this.state)
        if(state.goodsInfo == '' || state.farmName == '' || state.address == '' || state.coRegistrationNo == ''
            || state.charger == '' || state.chargerPhone == '' || state.chargerEmail == '' || state.category == '') {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }
        if(!state.checkbox) {
            alert('개인정보 수집/이용 동의는 필수사항입니다.')
            return false;
        }

        return true;
    }

    onClickSubmit = async () => {
        const state = Object.assign({}, this.state)
        if(state.goodsInfo == '' || state.farmName == '' || state.address == '' || state.coRegistrationNo == ''
            || state.charger == '' || state.chargerPhone == '' || state.chargerEmail == '' || state.category == '') {
            alert('필수항목 정보를 정확하게 입력해주세요.')
            return false;
        }
        if(!state.checkbox) {
            alert('개인정보 수집/이용 동의는 필수사항입니다.')
            return false;
        }

        const { status, data } = await regProducer(state)

        console.log(status, data)

        if(status === 200){
            this.sendEmail()
            alert('입점 문의서 제출을 완료했습니다.');
            this.props.history.goBack();
        }
    }

    // 초기화된 비밀번호 메일 전송
    sendEmail = async() => {
        let data = {};

        data.recipient = 'cs@blocery.io';
        data.subject = '마켓블리 입점문의';
        data.content = '마켓블리 생산자 입점문의 신청서가 제출되었습니다. 확인해주세요.';

        await axios(Server.getRestAPIHost() + '/sendmail',
            {
                method: "post",
                data: data,
                withCredentials: true,
                credentials: 'same-origin'
            })
            .then((response) => {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error)
            });
    }

    render(){
        const state = Object.assign({}, this.state)
        return(
            <Fragment>
                <ShopXButtonNav underline history={this.props.history} historyBack>입점문의</ShopXButtonNav>
                {/*<iframe src={"https://docs.google.com/forms/d/e/1FAIpQLSfD3RtDIWFVfy1bu1z51R8NmvA9kyFlTFJpNH3PBMn8RQjA1Q/viewform"}*/}
                        {/*width={'100%'}*/}
                        {/*height="100vh"*/}
                        {/*frameborder="0"*/}
                        {/*marginheight="0" marginwidth="0"*/}
                        {/*style={{height:'100vh', border: '0', overflow: 'hidden'}}></iframe>*/}
                <Container>
                    <Row>
                        <Col className='p-0'>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f2'><span className='d-flex align-items-center'>마켓블리 입점문의</span></CardTitle>
                                    <CardText>
                                        안녕하세요. 마켓블리입니다. <br/>
                                        아래 항목에 정확한 내용을 기입하여 제출하시면 확인 후 답변드리겠습니다.<br/>
                                        감사합니다.<br/>
                                        <span className='text-danger'>* 필수항목</span>
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>입점제안 상품 상세 설명 <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        <Input name='goodsInfo' value={state.goodsInfo} onChange={this.handleChange} placeholder={'내 답변'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>입점제안 상품 카테고리 <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        {
                                            bindCategory.filter(item=>item.value !== '99').map((item, index) => {
                                                const id = `category_${index}`
                                                return (
                                                    <Fragment key={id}>
                                                        <input
                                                            type="radio"
                                                            checked={state.category === item.value ? true : false}
                                                            id={id}
                                                            name="category"
                                                            value={item.value}
                                                            className='mr-1'
                                                            onChange={this.onCategoryChange} />
                                                        <label for={id} className='p-0 m-0 mr-3'>{item.label}</label>
                                                    </Fragment>
                                                )
                                            })
                                        }
                                        <input
                                            type="radio"
                                            checked={this.isEtcCategory()}
                                            className='mr-2'
                                            id="category_2"
                                            name="category"
                                            value={bindCategory[2].value}
                                            onChange={this.onCategoryChange} />
                                        <label for="category_2" className='p-0 m-0 mr-3'>{bindCategory[2].label}</label>
                                        <Input className='mt-2' innerRef={this.inputCategory} value={state.category} onChange={this.onChangeCategoryInput} placeholder={'카테고리 입력'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>업체명 <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        <Input name='farmName' value={state.farmName} onChange={this.handleChange} placeholder={'내 답변'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>업체 주소지 <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        <Input name='address' value={state.address} onChange={this.handleChange} placeholder={'내 답변'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>사업자 번호 (- 기호 포함하여 작성) <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        <Input name='coRegistrationNo' value={state.coRegistrationNo} onChange={this.handleChange} placeholder={'내 답변'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>담당자명 <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        <Input name='charger' value={state.charger} onChange={this.handleChange} placeholder={'내 답변'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>담당자 연락처(전화번호) <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        <Input name='chargerPhone' value={state.chargerPhone} onChange={this.handleChange} placeholder={'내 답변'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>담당자 이메일 <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        <Input name='chargerEmail' value={state.chargerEmail} onChange={this.handleChange} placeholder={'내 답변'} />
                                    </CardText>
                                </Card>
                            </Col>
                            <Col sm={12} className='mb-3'>
                                <Card body>
                                    <CardTitle className='f3'>(필수) 개인정보 수집/이용 동의 <span className='text-danger'>*</span></CardTitle>
                                    <CardText>
                                        *수집목적 : 온라인 쇼핑몰 입점문의 / 수집 항목 : 담당자명, 담당자 연락처, 담당자 이메일 / 보유기간 : 문의 완료 후 90일 이내 개인정보 수집/이용 동의해주셔야 입점문의 처리가 가능합니다. <br/>
                                        <Label check>
                                            <input type='checkbox' checked={this.state.checkbox} onChange={this.onChangeCheck} /> 개인정보 수집/이용에 동의합니다.
                                        </Label>
                                    </CardText>
                                </Card>
                            </Col>
                            <Col className='mb-3'>
                                <Button color='primary' onClick={this.onClickSubmit}>제출</Button>
                            </Col>
                        </Col>
                    </Row>

                </Container>

            </Fragment>
        )
    }
}
export default b2cQueInfo