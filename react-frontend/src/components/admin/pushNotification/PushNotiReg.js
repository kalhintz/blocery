import React, { useState, useEffect } from 'react';
import { Alert, Container, Input, Row, Col, Label, Button } from 'reactstrap'
import { regPushNoti } from '~/lib/adminApi'
import { SingleDatePicker } from 'react-dates';
import moment from 'moment-timezone'
import Select from 'react-select'
import ComUtil from '~/util/ComUtil'

const PushNotiReg = (props) => { // props에 수정할 공지사항 key를 넘겨서 db 조회해서 보여줘야함

    const {pushNotiData} = props;
    const [pushNotiNo, setPushNotiNo] = useState(pushNotiData.pushNotiNo || null);
    const [title, setTitle] = useState(pushNotiData.title || '');
    const [url, setUrl] = useState(pushNotiData.url || '');
    const [userType, setUserType] = useState(pushNotiData.userType || 'consumer');
    const [reserved, setReserved] = useState(pushNotiData.reserved || 0);
    const [reservedDate, setReservedDate] = useState('');
    const [reservedHour, setReservedHour] = useState('00');
    const [reservedMin, setReservedMin] = useState('00');
    const [reservedDateFocused, setReservedDateFocused] = useState(false);
    const [pushSent, setPushSent] = useState(pushNotiData.pushSent || false);

    const [refUrl, setRefUrl] = useState('');

    const state = {
        urlOptions: [
            {value:'',label:'푸시알림 참조 URL 선택'},
            {value:'goods?goodsNo=상품번호',label:'상품 - 상품번호 입력 필요'},
            {value:'home/2',label:'블리타임'},
            {value:'home/3',label:'포텐타임'},
            {value:'home/superReward',label:'슈퍼리워드'},
            {value:'home/4',label:'예약할인'},
            {value:'home/5',label:'베스트'},
            {value:'home/6',label:'신상품'},
            {value:'home/7',label:'단골상품'},
            {value:'event?no=이벤트번호',label:'이벤트 - 이벤트번호 입력 필요'},
        ],
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

        if(pushNotiData.reservedDateHHmm) {
            let v_reservedDateTime =  moment(pushNotiData.reservedDateHHmm);
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

    const onSave= async () => {

        if(title.length == 0){
            alert("알림문구는 필수입니다!");
            return false;
        }

        const v_reservedDate = moment(reservedDate).endOf('day').format('YYYY-MM-DD');
        const reservedDateHHmm = moment(v_reservedDate + 'T' + reservedHour + ':' + reservedMin+':00').format('YYYY-MM-DDTHH:mm:ss');
        const reservedValue = reserved ? 1 : 0;
        const pushNoti = {
            pushNotiNo: pushNotiNo,
            title: title,
            url: url,
            userType: userType,
            reserved: reservedValue,
            reservedDateHHmm: reservedDateHHmm,
            pushSent: pushSent
        }

        const { status, data } = await regPushNoti(pushNoti);
        if(data) {
            alert('푸시알림을 등록하였습니다.');
            props.onClose();
        } else {
            alert('푸사일림 등록에 실패하였습니다.');
        }
    }

    const onSelectUserType = (e) => {
        setUserType(e.target.selectedOptions[0].value);
    }

    const onChangeTitle = (e) => {
        setTitle(e.target.value);
    }

    const onChangeUrl = (e) => {
        setUrl(e.target.value);
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

    const onRefUrlChange = (data) => {
        setRefUrl(data.value);
        setUrl(data.value);
    }

    return(
        <Container>
            <Row>
                <Col xs={'5'}> 푸시알림 대상 </Col>
                <Col xs={'7'}>
                    <Input type='select' name='select' id='userType' onChange={onSelectUserType}>
                        <option name='radio_consumer' value='consumer' selected={ userType === 'consumer' }>소비자</option>
                        {/*<option name='radio_producer' value='producer' selected={ userType === 'producer' }>생산자</option>*/}
                    </Input>
                </Col>
            </Row>
            <hr/>
            <br/>
            <div className="flex">
                <Label className={'text-secondary'}><b>발행시간</b></Label>
                <span className="ml-4">
                    <input checked={!reserved} type="radio" id="now" name="time" onChange={onSelectReserved} value={0} disabled={pushNotiNo > 0 ? true:false} />
                    <label for="now" className='pl-1 mr-3'>즉시</label>
                    <input checked={reserved} type="radio" id="reserve" name="time" onChange={onSelectReserved} value={1} disabled={pushNotiNo > 0 ? true:false} />
                    <label for="reserve" className='pl-1'>예약</label>
                </span>
                {
                    (reserved == 1) && (
                        <div className="d-flex align-items-center" >
                            <SingleDatePicker

                                placeholder="시작일"
                                date={reservedDate ? moment(reservedDate) : null}
                                onDateChange={onCalendarDatesChange.bind(this)}
                                focused={reservedDateFocused}
                                onFocusChange={({ focused }) => {
                                    setReservedDateFocused(focused);
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
            <Label className={'text-secondary'}><b>푸시알림 문구</b></Label>
            <Input type='text' value={title} onChange={onChangeTitle}/>

            <br/>
            <Label className={'text-secondary'}><b>푸시알림 URL</b></Label>
            <Select
                name={'refUrl'}
                placeholder={'URL 참조'}
                options={state.urlOptions}
                value={refUrl ? state.urlOptions.find(url => url.value === refUrl) : ''}
                onChange={onRefUrlChange}
            />
            <Input type='text' value={url} onChange={onChangeUrl} placeholder={'푸시알림 URL'}/>
            <span> * url이 없을경우 홈으로 갑니다.</span>
            <br/>
            <div className={'text-right'}>
                <Button className={'rounded-2 '} style={{width:"100px"}} onClick={onSave} >등 록</Button>
            </div>
        </Container>
    )
}

export default PushNotiReg