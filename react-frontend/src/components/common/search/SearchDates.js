import React, {useState} from 'react';
import {Flex} from '~/styledComponents/shared/Layouts'
import {Alert, Button, ButtonGroup} from 'reactstrap'
import moment from "moment-timezone";
import {SingleDatePicker} from "react-dates";

const SearchDates = (props) => {

    // isHiddenAll 전체 버튼 숨길 경우 true
    const {isHiddenAll, isCurrenYeartHidden, txtAllTitle, isNotOnSearch}= props;

    // 시작일자 달력 , 종료일자 달력
    const renderStartCalendarInfo = () => <Alert className='m-1'>시작 날짜를 선택해 주세요</Alert>;
    const renderEndCalendarInfo = () => <Alert className='m-1'>종료 날짜를 선택해 주세요</Alert>;
    const [startDayFocusedInput,setStartDayFocusedInput] = useState(null);
    const [endDayFocusedInput,setEndDayFocusedInput] = useState(null);

    const [selectedGubun, setSelectedGubun] = useState(props.gubun ? props.gubun:'day');
    const [startDate, setStartDate] = useState((props.startDate ? props.startDate:moment(moment().toDate())));
    const [endDate, setEndDate] = useState((props.endDate ? props.endDate:moment(moment().toDate())));

    const selectCondition = async (gubun)=>{
        let pStartDate = null;
        let pEndDate = null;
        if(gubun === "day") {
            pStartDate = moment(moment().toDate());
            pEndDate = moment(moment().toDate());
        } else if(gubun === "week") {
            pStartDate = moment(moment().toDate()).add("days", -7);
            pEndDate = moment(moment().toDate());
        } else if(gubun === "month") {
            pStartDate = moment(moment().toDate()).add("months", -1);
            pEndDate = moment(moment().toDate());
        } else if(gubun === "3month") {
            pStartDate = moment(moment().toDate()).add("months", -3);
            pEndDate = moment(moment().toDate());
        } else if(gubun === "6month") {
            pStartDate = moment(moment().toDate()).add("months", -6);
            pEndDate = moment(moment().toDate());
        } else if(gubun === "1year") {
            const startYearStateDate = moment().startOf('year').toDate();
            pStartDate = moment(startYearStateDate);
            //pStartDate = moment(moment().toDate()).add("months", -6);
            pEndDate = moment(moment().toDate());
        }

        setStartDate(pStartDate);
        setEndDate(pEndDate);
        setSelectedGubun(gubun);
        props.onChange({
            startDate:pStartDate,
            endDate:pEndDate,
            gubun:gubun,
            isSearch:isNotOnSearch?false:true
        })
    }
    const onStartDateChange = async (date) => {
        setStartDate(moment(date));
        props.onChange({
            startDate:moment(date),
            endDate:endDate,
            gubun:selectedGubun,
            isSearch:false
        })
    }
    const onEndDateChange = async (date) => {
        setEndDate(moment(date));
        props.onChange({
            startDate:startDate,
            endDate:moment(date),
            gubun:selectedGubun,
            isSearch:false
        })
    }

    return (
        <>
            <Flex>
                <ButtonGroup className="pr-2">
                    <Button color="secondary" onClick={selectCondition.bind(this,'day')} active={selectedGubun === 'day'}> 오늘 </Button>
                    <Button color="secondary" onClick={selectCondition.bind(this,'week')} active={selectedGubun === 'week'}> 1주일 </Button>
                    <Button color="secondary" onClick={selectCondition.bind(this,'month')} active={selectedGubun === 'month'}> 1개월 </Button>
                    <Button color="secondary" onClick={selectCondition.bind(this,'3month')} active={selectedGubun === '3month'}> 3개월 </Button>
                    <Button color="secondary" onClick={selectCondition.bind(this,'6month')} active={selectedGubun === '6month'}> 6개월 </Button>
                    {
                        !isCurrenYeartHidden && <Button color="secondary" onClick={selectCondition.bind(this,'1year')} active={selectedGubun === '1year'}> 현재년도 </Button>
                    }
                    {
                        !isHiddenAll && <Button color="secondary" onClick={selectCondition.bind(this,'all')} active={selectedGubun === 'all'}> {txtAllTitle ? txtAllTitle : '전체'} </Button>
                    }
                </ButtonGroup>
                <SingleDatePicker placeholder="검색시작일"
                                  date={startDate}
                                  onDateChange={onStartDateChange}
                                  focused={startDayFocusedInput} // PropTypes.bool
                                  onFocusChange={({focused}) => setStartDayFocusedInput(focused)} // PropTypes.func.isRequired
                                  id={"startDate"} // PropTypes.string.isRequired,
                                  numberOfMonths={1}
                                  withPortal={false}
                                  isOutsideRange={()=>false}
                                  small
                                  readOnly
                                  calendarInfoPosition="top"
                                  verticalHeight={700}
                                  renderCalendarInfo={renderStartCalendarInfo}

                /> <Flex mx={5}>~</Flex>
                <SingleDatePicker placeholder="검색종료일"
                                  date={endDate}
                                  onDateChange={onEndDateChange}
                                  focused={endDayFocusedInput} // PropTypes.bool
                                  onFocusChange={({focused}) => setEndDayFocusedInput(focused)} // PropTypes.func.isRequired
                                  id={"endDate"} // PropTypes.string.isRequired,
                                  numberOfMonths={1}
                                  withPortal={false}
                                  isOutsideRange={()=>false}
                                  small
                                  readOnly
                                  calendarInfoPosition="top"
                                  verticalHeight={700}
                                  renderCalendarInfo={renderEndCalendarInfo}
                />
            </Flex>
        </>
    )
}
export default SearchDates