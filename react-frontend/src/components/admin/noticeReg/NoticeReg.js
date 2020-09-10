import React, { useState, useEffect } from 'react';
import { Alert, Container, Input, Row, Col, Label, Button } from 'reactstrap'

import Textarea from 'react-textarea-autosize'
import { regNotice } from '~/lib/adminApi'
import { Checkbox } from '@material-ui/core'
import { SingleDatePicker } from 'react-dates';
import moment from 'moment-timezone'
import Select from 'react-select'
import ComUtil from '~/util/ComUtil'

const NoticeReg = (props) => { // props에 수정할 공지사항 key를 넘겨서 db 조회해서 보여줘야함

    const [noticeNo, setNoticeNo] = useState(props.noticeData.noticeNo || null)
    const [title, setTitle] = useState(props.noticeData.title || '')
    const [content, setContent] = useState(props.noticeData.content || '')
    const [userType, setUserType] = useState(props.noticeData.userType || 'consumer')
    const [sendPush, setSendPush] = useState(props.noticeData.sendPush || false)
    const [reserved, setReserved] = useState(props.noticeData.reserved || false)
    const [reservedDate, setReservedDate] = useState('')
    const [reservedHour, setReservedHour] = useState('00')
    const [reservedMin, setReservedMin] = useState('00')
    const [reservedDateFocused, setReservedDateFocused] = useState(false);

    const state = {
        hourOptions: [
            {value:'00',label:'00'},
            {value:'01',label:'01'}, {value:'02',label:'02'}, {value:'03',label:'03'},
            {value:'04',label:'04'}, {value:'05',label:'05'}, {value:'06',label:'06'},
            {value:'07',label:'07'}, {value:'08',label:'08'}, {value:'09',label:'09'},
            {value:'10',label:'10'}, {value:'11',label:'11'}, {value:'12',label:'12'},
            {value:'13',label:'13'}, {value:'14',label:'14'}, {value:'15',label:'15'},
            {value:'16',label:'16'}, {value:'17',label:'17'}, {value:'18',label:'18'},
            {value:'19',label:'19'}, {value:'20',label:'20'}, {value:'21',label:'21'},
            {value:'22',label:'22'}, {value:'23',label:'23'},

        ],
        minuteOptions: [
            {value:'00',label:'00'},
            {value:'10',label:'10'},
            {value:'20',label:'20'},
            {value:'30',label:'30'},
            {value:'40',label:'40'},
            {value:'50',label:'50'},
        ]
    }

    useEffect(() => {
        // console.log('props : ' , props);

        if(props.noticeData.reservedDateHHmm) {
            let v_reservedDateTime =  moment(props.noticeData.reservedDateHHmm);
            let v_reservedDate = moment(v_reservedDateTime).format('YYYY-MM-DD');
            let v_reservedDateHH = moment(v_reservedDateTime).format('HH');
            let v_reservedDatemm = moment(v_reservedDateTime).format('mm');

            setReservedDate(v_reservedDate);
            setReservedHour(v_reservedDateHH);
            setReservedMin(v_reservedDatemm);
        } else {
            let now = ComUtil.getNow();
            let v_reservedDate = moment(now).format('YYYY-MM-DD');

            setReservedDate(v_reservedDate);
        }
    }, []);

    const onSaveNotice= async () => {

        const v_reservedDate = moment(reservedDate).endOf('day').format('YYYY-MM-DD');
        const reservedDateHHmm = moment(v_reservedDate + 'T' + reservedHour + ':' + reservedMin+':00').format('YYYY-MM-DDTHH:mm:ss');
        const reservedValue = reserved ? 1 : 0;
        const notice = {
            noticeNo: noticeNo,
            title: title,
            content: content,
            userType: userType,
            sendPush: sendPush,
            reserved: reservedValue,
            reservedDateHHmm: reservedDateHHmm
        }

        const { status, data } = await regNotice(notice);
        if(data) {
            alert('공지사항을 등록하였습니다.')
            props.onClose();
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

    const onCheckboxChange = (e) => {

        if(e.target.checked){
            console.log('push')
            setSendPush(true);
        }else{
            console.log('no push')
            setSendPush(false);
        }

    }

    const onSelectReserved = (e) => {
        if(e.target.value === '0') {
            setReserved(false);
        } else {
            setReserved(true);
        }
    }

    //블리타임 일자 달력
    const onCalendarDatesChange = (date) => {
        let v_date = date.endOf('day');
        setReservedDate(v_date);
    }

    const renderStartCalendarInfo = (stepNo) => <Alert className='m-1'>예약 날짜를 선택해 주세요</Alert>;

    const onReserveHHChange = (data) => {
        setReservedHour(data.value);
    }
    const onReserveMMChange = (data) => {
        setReservedMin(data.value);
    }

    return(
        <Container>
            <br/>
            <Row>
                <Col xs={'5'}> 공지사항 대상 </Col>
                <Col xs={'7'}>
                    <Input type='select' name='select' id='userType' onChange={onSelectUserType}>
                        <option name='radio_consumer' value='consumer' selected={ userType === 'consumer' }>소비자</option>
                        <option name='radio_producer' value='producer' selected={ userType === 'producer' }>생산자</option>
                        <option name='radio_buyer' value='buyer' selected={ userType === 'buyer' }>식자재 구매자</option>
                        <option name='radio_seller' value='seller' selected={ userType === 'seller' }>식자재 판매자</option>
                    </Input>
                </Col>
            </Row>
            <br/>
            <hr/>
            <br/>
            <div className="flex">
                <Label className={'text-secondary'}><b>발행시간</b></Label>
                <span className="ml-4">
                    <input checked={!reserved} type="radio" id="now" name="time" onChange={onSelectReserved} value={0} />
                    <label for="now" className='pl-1 mr-3'>즉시</label>
                    <input checked={reserved} type="radio" id="reserve" name="time" onChange={onSelectReserved} value={1} />
                    <label for="reserve" className='pl-1'>예약</label>
                </span>
                {
                    reserved && (
                        <div className="d-flex align-items-center" >
                            <SingleDatePicker

                                placeholder="시작일"
                                date={reservedDate ? moment(reservedDate) : null}
                                onDateChange={onCalendarDatesChange.bind(this)}
                                focused={reservedDateFocused}
                                onFocusChange={({ focused }) => {
                                    setReservedDateFocused(focused)
                                    console.log({focused})
                                }}
                                id={"reservedDate"}
                                numberOfMonths={1}
                                withPortal
                                small
                                readOnly
                                calendarInfoPosition="top"
                                enableOutsideDays
                                // daySize={45}
                                verticalHeight={700}
                                renderCalendarInfo={renderStartCalendarInfo.bind(this)}
                            />
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'reservedHour'}
                                    options={state.hourOptions}
                                    value={reservedHour ? state.hourOptions.find(itemHH => itemHH.value === reservedHour) : '00'}
                                    onChange={onReserveHHChange}
                                />
                            </div>
                            <div className="pl-1" style={{width: '100px'}}>
                                <Select
                                    name={'reservedMin'}
                                    options={state.minuteOptions}
                                    value={reservedMin? state.minuteOptions.find(itemMM => itemMM.value === reservedMin) : '00'}
                                    onChange={onReserveMMChange}
                                />
                            </div>
                        </div>
                    )
                }

            </div>

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
            {
                userType === 'consumer' &&
                <div className={'text-right'}>
                    <Checkbox id={'sendPush'} className={'p-0'} color={'default'} checked={props.noticeData.sendPush} onChange={onCheckboxChange} />
                    전체 push 전송
                </div>
            }
            <div className={'text-right'}>
                <Button className={'rounded-2 '} style={{width:"100px"}} onClick={onSaveNotice} >등 록</Button>
            </div>
        </Container>
    )
}

export default NoticeReg