import React, { Fragment, Component } from 'react';
import { Button, Input, FormGroup, Label,  Row, Col, Container } from 'reactstrap'
import { updateItemEnabled, getItemByItemNo, addItem, getItems, getNewItemKindCode } from '~/lib/adminApi'
import { ModalConfirm } from '~/components/common'

class ItemReg extends Component {
    constructor(props) {
        super(props);

        const isUpdate = this.props.itemNo ? true : false


        this.state = {
            item: {
                itemNo: isUpdate ? this.props.itemNo : 0,
                itemKinds: [],
                itemName: '',
                enabled: null
            },
            newKinds: [], //임시저장용
            errors: {
                itemName:  isUpdate ? '' : '필수입력 입니다',
            }

        }
    }

    async componentDidMount(){
        await this.search()

        if (this.itemNo !== 0) { //update
            this.setState({
                newKinds: this.state.itemKinds
            })
        } else { //신규
            this.itemName.focus();
        }
    }
    search = async() => {
        //수정 일 경우만 조회
        const { itemNo } = this.state.item
        console.log('itemNo:', itemNo)
        if(itemNo !== 0){
            const { status, data } = await getItemByItemNo(itemNo)
            console.log('getItemByItemNo', data)
            this.setState({
                item: data,
                itemKinds: data.itemKinds
            })
        }

    }

    onItemChange = async(e) => {

        e.preventDefault();
        const { name, value} = e.target


        let item = Object.assign({}, this.state.item)
        let errors = this.state.errors

        item[name] = value

        switch (name) {
            case 'itemName':
                errors.itemName =
                    value.length <= 0
                        ? '필수입니다'
                        : '';
                break;
            default:
                break;
        }

        this.setState({
            item,
            errors
        })

    }

    onKindChange = async(e) => {
        e.preventDefault();

        console.log(e.target.name); // name1, name2 가들어옴.

        let kinds = Object.assign([], this.state.newKinds);
        let kindIdx = e.target.name.substring(4);

        kinds[kindIdx].name = e.target.value;

        this.setState({
            newKinds: kinds
        })
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

    onAddClick = async () => {
        let kinds = Object.assign([], this.state.newKinds);

        let {data:newCode} = await getNewItemKindCode();
        kinds.push({
           code:newCode,
           name:''
        });

        this.setState({
            newKinds: kinds
        })

    }

    //저장
    onSaveClick = async () => {

        //밸리데이션 체크
        if(!this.validateForm()){
            return
        }

        let storingItem = Object.assign({}, this.state.item);
        storingItem.itemKinds = [];
        this.state.newKinds.map(oneKind => {
            if (oneKind.name)       //공백이 아닐때만 복사
                storingItem.itemKinds.push(oneKind);
        })
        console.log('onSaveClick2-1', storingItem);



        //중복 체크 - 기존 item들 가져와서 비교
        const { data:serverItems } = await getItems(false);
        let duplicateItem = serverItems.filter(data => (data.itemName === storingItem.itemName));
        console.log('dupItemNo:', duplicateItem.itemNo, storingItem.itemNo);
         //신규시 : ItemNo = 0
        if (storingItem.itemNo == 0) {
            if( duplicateItem.length > 0) {
                alert('이미 존재하는 품목명 입니다. ');
                return;
            }
        } else { //수정시
            if( duplicateItem.length > 0 && duplicateItem[0].itemNo !== storingItem.itemNo ) {
                alert('이미 존재하는 품목명으로는 수정할 수 없습니다. ');
                return;
            }
        }

        //저장
        const { status, data } = await addItem(storingItem)

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

    //비활성 or 복구
    onChangeEnabledClick = async(response) => {
        if(!response)
            return

        const { itemNo, enabled } = this.state.item
        await updateItemEnabled(itemNo, !enabled)
        this.props.onClose(true)
    }

    render() {
        const { item, errors, newKinds } = this.state
        return(

            <Fragment>
            <Container>
                <Row>
                    <Col xs={'12'}>
                        <FormGroup>
                            <Label><h6>품목명<span className='text-danger'>*</span></h6></Label>
                            <Input
                                name='itemName'
                                innerRef={input => this.itemName = input}
                                onChange={this.onItemChange}
                                value={item.itemName}
                                valid={this.state.errors.itemName.length <= 0} invalid={!this.state.errors.itemName.length <= 0}
                                placeholder='품목명'
                            />
                            <span className='text-danger'>{errors.itemName}</span>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={'1'}>
                            {/*<div className='d-flex'>*/}
                                <Label><h6>품종들</h6></Label>
                    </Col>
                    <Col xs={'3'}>
                                <Button block color={'info'} size={'sm'} onClick={this.onAddClick}>품종 추가</Button>
                            {/*</div>*/}
                    </Col>
                </Row>
                <Row>
                    { newKinds && newKinds.length && newKinds.map( (oneKind,idx) => {

                        return (
                            <Fragment>
                                <Col xs={'2'}>
                                    <Input readOnly={'true'}
                                        name= {'code'+ idx}
                                        value={oneKind.code}
                                        placeholder='품종코드(자동생성)'
                                    />
                                </Col>
                                <Col xs={'10'}>
                                    <Input
                                        name={'name'+ idx}
                                        onChange={this.onKindChange}
                                        value={oneKind.name}
                                        placeholder='품종명(A/B/C)입력, 미입력시 저장되지 않음.'
                                    />

                                    <span className='text-danger'>{errors.itemKinds}</span>
                                </Col>
                            </Fragment>
                        )
                    }) }
                </Row>
                <Row>
                    <Col> <br/> </Col>
                </Row>
                <Row>
                    <Col xs={'12'}>
                        <div className='d-flex'>
                            <div className='flex-grow-1 p-1'><Button block color={'info'} size={'sm'} onClick={this.onSaveClick}>저장</Button></div>
                            {
                                item.enabled !== null && (
                                    <div className='flex-grow-1 p-1'>
                                        <ModalConfirm title={item.enabled ? '미사용' : '사용'} content={(item.enabled ? '미사용' : '사용') + '하시겠습니까?'} onClick={this.onChangeEnabledClick}>
                                            <Button block color={item.enabled ? 'danger' : 'success'} size={'sm'} >{item.enabled ? '품목 미사용' : '품목 사용'}</Button>
                                        </ModalConfirm>
                                    </div>
                                )
                            }
                        </div>
                    </Col>
                </Row>

            </Container>
            </Fragment>
        );
    }
}

export default ItemReg