import React, { Fragment, useState } from 'react'
import { Input, Row, Col, Alert } from 'reactstrap';
import Style from './Style.module.scss'
import { DateRangePicker } from 'react-dates';
import moment from 'moment-timezone'

const CartToBuyWaesangInfo = (props) => {
    const {waesangPayFrom, waesangPayTo, sellerNo, waesangPayerName, name, index, onChangeWaesangPayCalendar, onChangeWaesangAccount, onInputWaesangPayerName, sellerWaesangAccounts } = props;

    const [focusedInput, setFocusedInput] = useState(null);

    //예상발송일 달력 문구 렌더러
    const renderWaesangPayCalendarInfo = () => <Alert className='m-1'>입금 시작일 ~ 종료일을 선택해 주세요</Alert>

    const renderWaesangAccountInfo = (sellerNo, index, name) => {
        const sellerNoAccounts = sellerWaesangAccounts.filter(accounts => accounts.sellerNo === sellerNo );
        return getAccountEl(sellerNoAccounts, index, name);
    }

    const getAccountEl = (data, index, name) => {
        return(
            <Input type='select' name='select' id='waesangAccounts' onChange={onChangeWaesangAccount.bind(this, index, name)} className={'f6'}>
                <option value={null} >입금은행을 선택해주세요</option>
                {
                    data.map(item => <option key={'waesangAccount' + name + index + item.account} value={`${item.bank}:${item.account}:${item.owner}`}>{item.bank} &nbsp; {item.account} , 예금주 : {item.owner} </option>)
                }
            </Input>
        )
    }

    return (
        <Fragment>
            <Row>
                <Col xs={'3'} className={Style.textSmall}> 입금일 입력 </Col>
                <Col xs={'9'}>

                    <span className={'text-secondary f6'}>※ 입금이 가능한 날을 선택해 주시기 바랍니다.</span>
                    <Fragment>
                        <div>
                            <DateRangePicker
                                startDateId={name + index}
                                endDateId={name + index}
                                startDatePlaceholderText="시작일"
                                endDatePlaceholderText="종료일"
                                startDate={waesangPayFrom ? moment(waesangPayFrom) : null}
                                endDate={waesangPayTo ? moment(waesangPayTo) : null}
                                onDatesChange={onChangeWaesangPayCalendar.bind(this, index, name)}
                                focusedInput={focusedInput}
                                onFocusChange={(focused) => { setFocusedInput(focused)}}
                                numberOfMonths={1}          //달력 갯수(2개로 하면 모바일에서는 옆으로 들어가버리기 때문에 orientation='vertical'로 해야함), pc 에서는 상관없음
                                orientation={'horizontal'}
                                openDirection="up"
                                withPortal
                                small
                                readOnly
                                showClearDates
                                calendarInfoPosition="top"
                                isDayBlocked={(date) => {
                                    //오늘보다 작거나 같은 일자는 블록처리하여 선택할 수 없도록 함
                                    if (date.isSameOrBefore(moment())) return true
                                    return false
                                }}
                                renderCalendarInfo={renderWaesangPayCalendarInfo}
                            />

                        </div>
                    </Fragment>

                    {/*<div className={Style.textSmall}>기간 내 입금</div>*/}


                </Col>
            </Row>
            <Row className={'mt-1'}>
                <Col xs={'3'} className={Style.textSmall}> 입금은행 </Col>
                <Col xs={'9'}>
                    {renderWaesangAccountInfo(sellerNo, index, name)}
                </Col>
            </Row>

            <Row className={'mt-1 mb-3'}>
                <Col xs={'3'} className={Style.textSmall}> 입금자명 </Col>
                <Col xs={'9'}>
                    <Input name="name"
                           value={waesangPayerName || ''}
                           onChange={onInputWaesangPayerName.bind(this, index, name)}/>
                </Col>
            </Row>
        </Fragment>
    )
}

export default CartToBuyWaesangInfo
