import React, { Component } from 'react';
import ComUtil from '~/util/ComUtil'
import { getAllTempProducer } from '~/lib/adminApi'

//ag-grid
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import MonthPicker from "react-month-picker";
import {MonthBox} from "~/components/common";
import {Div, Flex, Hr, Right} from '~/styledComponents/shared/Layouts'
import { Button } from 'reactstrap';
import moment from "moment-timezone";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
import {FilterGroup} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";

const pickerLang = {
    months: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
}

export default class TempProducerList extends Component {

    constructor(props) {
        super(props);
        this.rowHeight = 50;

        const today =  moment();
        const initMonth = today.subtract(1, 'month');
        const limitMonth = {year: initMonth.year(), month: initMonth.month() + 1};

        this.state = {
            data: [],
            columnDefs: [
                {headerName: "id", field: "producerDotOrder"},
                {headerName: "생산자번호", field: "producerNo"},
                {headerName: "주문번호", field: "orderSeq"},
                {headerName: "결제방법", field: "payMethod"},
                {headerName: "blctToken", field: "blctToken"},
                {headerName: "구매시점환율", field: "orderBlctExchangeRate"},
                {headerName: "등록일", field: "regDate", width: 200, cellRenderer: "dateRenderer"},
                {headerName: "토큰전송", field: "sentComplete"},
            ],
            defaultColDef: {
                width: 150,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            frameworkComponents: {
                dateRenderer: this.dateRenderer
            },
            showMonthPicker:false,
            searchMonthValue: limitMonth,
            monthlyCount: 0
        }
    }

    async componentDidMount() {

        await this.search();
    }

    search = async() => {

        // if(!this.state.searchMonthValue)
        //     return;

        let searchMonthValue = this.state.searchMonthValue;
        let year = searchMonthValue.year;
        let month = searchMonthValue.month;
        let {data} = await getAllTempProducer(year, month);

        console.log(data.length);

        data.sort((a,b) => {
            return b.regDate - a.regDate;
        });

        this.setState({
            data:data,
            monthlyCount:data.length
        })
    }

    handleClickMonthBox() {
        this.setState({
            showMonthPicker: true,
        })
    }
    handleAMonthChange(value, text) {
        // console.log(value, text);
        let monthValue = {year: value, month: text}
        this.setState({
            showMonthPicker:false,
            searchMonthValue: monthValue,
        });
    }
    handleAMonthDismiss(value) {
        // console.log(value);
        this.setState({
            showMonthPicker:false,
            searchMonthValue: value,
        });
    }

    makeMonthText = (m) => {
        if (m && m.year && m.month) return (m.year + "년 " + pickerLang.months[m.month-1])
        return '?'
    }

    dateRenderer = ({value, data: rowData}) => {
        return value ? ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm') : null;
    }
    copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }
    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        this.gridColumnApi = params.columnApi
        // console.log("onGridReady");
    }
    render() {

        // if (this.state.data.length <= 0)
        //     return null;

        return (
            <div>
                <Flex m={10}>
                    <Div width="150px">
                        {
                            this.state.showMonthPicker &&
                            <MonthPicker
                                show={true}
                                years={[2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026, 2027, 2028, 2029]}
                                value={this.state.searchMonthValue}
                                lang={pickerLang.months}
                                onChange={this.handleAMonthChange.bind(this)}
                                onDismiss={this.handleAMonthDismiss.bind(this)}
                            >
                            </MonthPicker>
                        }
                        <MonthBox value={this.makeMonthText(this.state.searchMonthValue)}
                                  onClick={this.handleClickMonthBox.bind(this)}/>
                    </Div>
                    <Div width="100px" ml={5}>
                        <Button onClick={this.search} block color={'info'}>조회</Button>
                    </Div>
                    <Right>
                        총 {this.state.monthlyCount}건
                    </Right>
                </Flex>

                {/* filter START */}
                <FilterContainer gridApi={this.gridApi} excelFileName={'생산자 현금대납 목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'producerNo', name: '생산자번호'},
                                {field: 'orderSeq', name: '주문번호'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'payMethod'}
                            name={'결제방법'}
                            data={[
                                {value: 'blct', name: 'blct'},
                                {value: 'cardBlct', name: 'cardBlct'},
                                {value: 'card', name: 'card'},
                                {value: 'supportPrice', name: 'supportPrice'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'sentComplete'}
                            name={'토큰전송'}
                            data={[
                                {value: true, name: '전송'},
                                {value: false, name: '미전송'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                {/* filter END */}

                <div
                    className="ag-theme-balham"
                    style={{
                        height: '1000px'
                    }}
                >
                    <AgGridReact
                        // enableSorting={true}                //정렬 여부
                        // enableFilter={true}                 //필터링 여부
                        columnDefs={this.state.columnDefs}  //컬럼 세팅
                        defaultColDef={this.state.defaultColDef}
                        // enableColResize={true}              //컬럼 크기 조정
                        overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                        overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                        rowData={this.state.data}
                        frameworkComponents={this.state.frameworkComponents}
                        onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                        onCellDoubleClicked={this.copy}
                    >
                    </AgGridReact>
                </div>
            </div>
        )
    }
}