import React, { useState, useEffect } from 'react';
import { Container, Input, Row, Col, Label, Button } from 'reactstrap'
import Textarea from 'react-textarea-autosize'
import { regNotice } from '~/lib/adminApi'

const NoticeReg = (props) => { // props에 수정할 공지사항 key를 넘겨서 db 조회해서 보여줘야함

    const [noticeNo, setNoticeNo] = useState(props.noticeNo || null)
    const [title, setTitle] = useState(props.title || '')
    const [content, setContent] = useState(props.content || '')
    const [userType, setUserType] = useState(props.userType || 'consumer')

    useEffect(() => {
        // props에 key가 있으면 db 조회해서 보여주기.

    }, []);

    const onSaveNotice= async () => {
        let notice = {
            title: title,
            content: content,
            userType: userType,
        }

        const { status, data } = await regNotice(notice);
        if(data) {
            alert('공지사항을 등록하였습니다.')
        } else {
            alert('공지사항 등록에 실패하였습니다.')
        }
    }

    const onSelectUserType = (e) => {
        setUserType(e.target.selectedOptions[0].value);
    }

    const onChangeTitle = (e) => {
        setTitle(e.target.value);
    }

    const onChangeContent = (e) => {
        setContent(e.target.value);
    }

    return(
        <Container>
            <br/>
            <Row>
                <Col xs={'5'}> 공지사항 대상 </Col>
                <Col xs={'7'}>
                    <Input type='select' name='select' id='userType' onChange={onSelectUserType}>
                        <option name='radio_consumer' value='consumer'>소비자</option>
                        <option name='radio_producer' value='producer'>생산자</option>
                        <option name='radio_buyer' value='buyer'>식자재 구매자</option>
                        <option name='radio_seller' value='seller'>식자재 판매자</option>
                    </Input>
                </Col>
            </Row>
            <br/>
            <hr/>
            <br/>
            <Label className={'text-secondary'}><b>공지사항 제목</b></Label>
            <Input type='text' value={title} onChange={onChangeTitle}/>

            <br/>
            <Label className={'text-secondary'}><b>공지사항 내용</b></Label>
            <Textarea
                style={{width: '100%', minHeight: 100, borderRadius: 1, border: '1px solid rgba(0,0,0,.125)'}}
                className={'border'}
                rows={5}
                onChange={onChangeContent}
                value={content}
                placeholder='공지사항 내용을 작성해주세요'
            />

            <br/><br/>
            <div className={'text-right'}>
                <Button className={'rounded-2 '} style={{width:"100px"}} onClick={onSaveNotice} >등 록</Button>
            </div>
        </Container>
    )
}

export default NoticeReg