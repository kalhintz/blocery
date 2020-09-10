import React, { Fragment, useState, useEffect, useRef } from 'react';
import { Button, Input, FormGroup, Label, Row, Col, Container } from 'reactstrap'
import { getB2bItemByNo, getNewB2bItemKindCode, getB2bItems, addB2bItem, updateB2bItemEnabled } from "~/lib/adminApi";
import { getLoginAdminUser } from '~/lib/loginApi';
import { ModalConfirm } from '~/components/common';

const B2bItemReg = (props) => {

    console.log('props : ', props);
    const isUpdate = props.itemNo ? true : false;
    
    const [itemNo, setItemNo] = useState(isUpdate ? props.itemNo : 0);
    const [itemKinds, setItemKinds] = useState([]);
    const [itemName, setItemName] = useState('');
    const [enabled, setEnabled] = useState(true);


    const [newKinds, setNewKinds] = useState([]);
    const [errorItemName, setErrorItemName] = useState(isUpdate ? '' : '필수입력 입니다');

    const refInput = useRef(null);

    useEffect(() => {
        async function checkLogin() {
            let user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            } else {
                await search();
            }
        }

        checkLogin();

    }, [])

    const search = async() => {
        if(itemNo !== 0) {
            const { status, data } = await getB2bItemByNo(itemNo);

            console.log('status: ', status);
            console.log('data: ', data);

            setItemNo(data.itemNo);
            setItemKinds(data.itemKinds);
            setItemName(data.itemName);
            setEnabled(data.enabled);
            setNewKinds(data.itemKinds);
            // setItem(data);
        }
    }

    const onItemChange = async(e) => {
        e.preventDefault();
        const { name, value } = e.target;

        console.log('name : ', name, ', value : ', value);

        let changeErrorItemName = '';

        switch(name) {
            case 'itemName' :
                changeErrorItemName = value.length <= 0 ? '필수입니다' : '';
                break;
            default:
                break;
        }
        setItemName(value);

        setErrorItemName(changeErrorItemName);
    }

    const onKindChange = async(e) => {
        e.preventDefault();

        let kindIdx = e.target.name.substring(4);

        let kinds = Object.assign([], newKinds);
        kinds[kindIdx].name = e.target.value;

        setNewKinds(kinds);
    }

    const validateForm = () => {
        let valid = true;
        if(errorItemName.length > 0) (valid = false);
        return valid;
    }

    const onAddClick = async() => {
        console.log('onAddClick newKinds: ', newKinds);

        let {data : newCode} = await getNewB2bItemKindCode();
        setNewKinds(newKinds.concat({
            code: newCode,
            name: ''
        }));

        console.log('newKinds: ', newKinds);
    }

    const onSaveClick = async() => {
        if(!validateForm()) {
            return
        }

        // let storingItem = Object.assign({}, item);
        let storingItemKinds = [];
        let storingItemName = refInput.current.value;

        newKinds.map(oneKind => {
            if(oneKind.name)
                storingItemKinds.push(oneKind);
        })

        console.log('onSaveClick item  :', storingItemName);

        // 중복체크 - 기존 item을 가져와서 비교
        const { data:serverItems } = await getB2bItems(false);
        let duplicateItem = serverItems.filter(data => (data.itemName === storingItemName));
        console.log('dupItemNo:', duplicateItem.itemNo, itemNo);

        // 신규시 ItemNo = 0
        if(itemNo === 0) {
            if(duplicateItem.length > 0) {
                alert('이미 존재하는 품목명입니다. ');
                return;
            }
        } else {
            if(duplicateItem.length > 0 && duplicateItem[0].itemNo !== itemNo) {
                alert('이미 존재하는 품목명으로는 수정할 수 없습니다.');
                return;
            }
        }

        // 저장
        let saveData = {
            itemNo: itemNo,
            itemKinds: storingItemKinds,
            itemName: storingItemName,
            enabled: enabled
        }

        const { status, data } = await addB2bItem(saveData);
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
        props.onClose(true)
    }

    const onChangeEnabledClick = async(response) => {
        if(!response)
            return

        console.log('itemNo: ', itemNo, ', enabled : ', !enabled);

        await updateB2bItemEnabled(itemNo, !enabled);
        props.onClose(true)
    }

    return (
        <Fragment>
            <Container>
                <Row>
                    <Col xs={'12'}>
                        <FormGroup>
                            <Label><h6>품목명<span className='text-danger'>*</span></h6></Label>
                            <Input
                                name='itemName'
                                innerRef={refInput}
                                onChange={onItemChange}
                                value={itemName}
                                valid={errorItemName.length <= 0} invalid={!errorItemName.length <= 0}
                                placeholder='품목명'
                            />
                            <span className='text-danger'>{errorItemName}</span>
                        </FormGroup>
                    </Col>
                </Row>
                <Row>
                    <Col xs={'1'}>
                        {/*<div className='d-flex'>*/}
                        <Label><h6>품종들</h6></Label>
                    </Col>
                    <Col xs={'3'}>
                        <Button block color={'info'} size={'sm'} onClick={onAddClick}>품종 추가</Button>
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
                                        onChange={onKindChange}
                                        value={oneKind.name}
                                        placeholder='품종명(A/B/C)입력, 미입력시 저장되지 않음.'
                                    />
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
                            <div className='flex-grow-1 p-1'><Button block color={'info'} size={'sm'} onClick={onSaveClick}>저장</Button></div>
                            {
                                enabled !== null && (
                                    <div className='flex-grow-1 p-1'>
                                        <ModalConfirm title={enabled ? '미사용' : '사용'} content={(enabled ? '미사용' : '사용') + '하시겠습니까?'} onClick={onChangeEnabledClick}>
                                            <Button block color={enabled ? 'danger' : 'success'} size={'sm'} >{enabled ? '품목 미사용' : '품목 사용'}</Button>
                                        </ModalConfirm>
                                    </div>
                                )
                            }
                        </div>
                    </Col>
                </Row>

            </Container>
        </Fragment>
    )
}

export default B2bItemReg