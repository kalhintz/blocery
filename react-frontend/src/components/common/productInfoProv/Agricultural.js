import React, { Component } from 'react'
import { Row, Col, Label, Input, Button } from 'reactstrap';
import { goodsTypeInfo } from '~/components/Properties'

export default class Agricultural extends Component {
    constructor(props){
        super(props);
        this.state = {
            infoValues: [{title:'', content:'', checked:false}]
        }
    }

    componentDidMount() {
        const infoValues = goodsTypeInfo[this.props.code].map((item, index) => {

            const content = this.props.infoValues[index] ? this.props.infoValues[index].content : ''
            const checked = this.props.infoValues[index] ? this.props.infoValues[index].checked : false

            return {
                title: item.title,
                content: content,
                checked: checked
            }

        })
        //console.log(infoValues)
        this.setState({ infoValues })
    }

    handleChange = (index, e) => {
        const infoValues = Object.assign([], this.state.infoValues)
        infoValues[index].content = e.target.value
        this.setState({infoValues})
    }

    // 체크되어 있으면 '상품정보 참조'
    refDetail = (index, e) => {
        const checked = e.target.checked

        const data = Object.assign([], this.state.infoValues)

        data[index].checked = checked
        data[index].content = '상품정보 참조'

        this.setState({ infoValues: data })
    }

    // 저장 클릭
    onClickSave = () => {
        const data = Object.assign([], this.state.infoValues)
        this.props.onClose([
            ...data
        ])
    }

    render() {
        return (
                <div>
                    <div className='p-3'>
                        <div className='text-secondary f6 mb-2 mt-2'>'상품정보 참조'체크 시 해당 내용을 상품 상세설명에 이미지텍스트로 꼭 입력해 주시기 바랍니다.</div>
                        {
                            this.state.infoValues.map(({title, content, checked}, index) => {
                                return (
                                    <div key={index}>
                                        <Row className='mb-1 align-items-center'>
                                            <Col xs="4" className='f5'>{title}</Col>
                                            <Col xs="7"><Input value={content} disabled={checked} onChange={this.handleChange.bind(this, index)}/></Col>
                                            <Col xs="1">
                                                <Input id={`check_${index}`} type='checkbox' checked={checked} onChange={this.refDetail.bind(this, index)}/>
                                                <label for={`check_${index}`} className='f7'>상품정보 참조</label>
                                            </Col>
                                        </Row>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <hr className='p-0 m-0'/>
                    <div className='d-flex justify-content-center align-items-center m-2'>
                        <Button color='info' size='md' onClick={this.onClickSave}>설정</Button>
                    </div>
                </div>


        )
    }
}