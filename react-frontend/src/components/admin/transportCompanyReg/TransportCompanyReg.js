import React, { Component } from 'react';
import { Button, Input, FormGroup, Label, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap'
import { addTransportCompany, delTransportCompany, getTransportCompanyByNo, getIsDuplicatedTransportCode } from '~/lib/adminApi'
import { ModalConfirm } from '../../../components/common'
import PropTypes from 'prop-types'

class TransportCompanyReg extends Component {
    constructor(props) {
        super(props);

        const isUpdate = this.props.transportCompanyNo ? true : false

        this.state = {
            transportCompany: {
                transportCompanyNo: isUpdate ? this.props.transportCompanyNo : 0,
                transportCompanyCode: '',
                transportCompanyName: '',
                transportCompanyUrl: '',
            },
            errors: {
                transportCompanyCode: isUpdate ? '' : '필수입력 입니다',
                transportCompanyName:  isUpdate ? '' : '필수입력 입니다',
            }

        }
    }

    async componentDidMount(){
        await this.search()
        this.transportCompanyCode.focus()
    }
    search = async() => {
        //수정 일 경우만 조회
        const { transportCompanyNo } = this.state.transportCompany
        if(transportCompanyNo !== 0){
            const { status, data } = await getTransportCompanyByNo(transportCompanyNo)
            console.log(data)
            this.setState({
                transportCompany: data
            })
        }

    }

    onChange = async(e) => {
        e.preventDefault();
        const { name, value} = e.target

        // let { transportCompany, errors } = Object.assign({}, this.state)

        let transportCompany = this.state.transportCompany
        let errors = this.state.errors

        transportCompany[name] = value

        switch (name) {
            case 'transportCompanyCode':

                //코드 중복체크
                const { transportCompanyCode, transportCompanyNo } = this.state.transportCompany
                const { data: isDuplicated }  = await getIsDuplicatedTransportCode(transportCompanyCode, transportCompanyNo)
                let message = ''
                if(isDuplicated){
                    message = '코드가 중복되었습니다'
                }
                else if(value.length <= 0)
                    message = '필수입니다'

                errors.transportCompanyCode = message

                break;
            case 'transportCompanyName':
                errors.transportCompanyName =
                    value.length <= 0
                        ? '필수입니다'
                        : '';
                break;
            default:
                break;
        }

        this.setState({
            transportCompany,
            errors
        })
        // this.validate(name, value)
    }


    validateForm = () => {
        let valid = true;
        Object.values(this.state.errors).forEach((val) => {
                console.log('val:',val)
                val.length > 0 && (valid = false)
            }
        )
        return valid;
    }

    //저장
    onSaveClick = async () => {

        //밸리데이션 체크
        if(!this.validateForm()){
            return
        }

        //저장
        const { status, data } = await addTransportCompany(this.state.transportCompany)

        console.log('data ::::::::::::::::::::; ',data)

        if(status !== 200){
            alert('저장중 에러가 발생하였습니다. 재시도 바랍니다.')
            return
        }

        if(!data.success){
            alert(data.message)
            return
        }

        //닫기
        this.props.onClose(true)
    }

    //삭제
    onDeleteClick = async(response) => {
        if(!response)
            return

        await delTransportCompany(this.state.transportCompany.transportCompanyNo)
        this.props.onClose(true)
    }

    render() {
        const { transportCompany, errors } = this.state
        return(
            <div className='p-3'>
                <FormGroup>
                    <Label><h6>코드<span className='text-danger'>*</span></h6></Label>
                    <Input
                        innerRef={input => this.transportCompanyCode = input}
                        name='transportCompanyCode'
                        onChange={this.onChange}
                        value={transportCompany.transportCompanyCode}
                        // onBlur={this.onTransportCompanyCodeBlur}
                        onKeyUp={this.onCodeKeyUp}
                        valid={this.state.errors.transportCompanyCode.length <= 0} invalid={!this.state.errors.transportCompanyCode.length <= 0}
                        placeholder='택배사 코드'
                    />
                    <span className='text-danger'>{errors.transportCompanyCode}</span>
                </FormGroup>
                <FormGroup>
                    <Label><h6>명칭<span className='text-danger'>*</span></h6></Label>
                    <Input
                        name='transportCompanyName'
                        onChange={this.onChange}
                        value={transportCompany.transportCompanyName}
                        valid={this.state.errors.transportCompanyName.length <= 0} invalid={!this.state.errors.transportCompanyName.length <= 0}
                        placeholder='택배사 명칭'
                    />
                    <span className='text-danger'>{errors.transportCompanyName}</span>
                </FormGroup>
                <FormGroup>
                    <Label><h6>택배사 배송추적 url</h6></Label>
                    <Input
                        name='transportCompanyUrl'
                        onChange={this.onChange}
                        value={transportCompany.transportCompanyUrl}
                        placeholder='송장번호로 배송추적이 될 링크 url'
                    />
                </FormGroup>
                <div className='d-flex'>
                    <div className='flex-grow-1 p-1'><Button block color={'info'} size={'sm'} onClick={this.onSaveClick}>저장</Button></div>
                    <div className='flex-grow-1 p-1'>
                    <ModalConfirm title={'삭제'} content={'삭제 하시겠습니까?'} onClick={this.onDeleteClick}>
                        <Button block color={'danger'} size={'sm'} >삭제</Button>
                    </ModalConfirm>
                    </div>
                </div>

            </div>
        );
    }
}
//
// TransportCompanyReg.propTypes = {
//
// }
// TransportCompanyReg.defaultProps = {
//
// }
export default TransportCompanyReg