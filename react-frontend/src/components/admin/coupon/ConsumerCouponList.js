import React, {Component, useState, useEffect} from "react";
import ComUtil from "~/util/ComUtil";
import {getAllConsumers, getConsumerCouponList} from "~/lib/adminApi";
import {BlocerySpinner, ExcelDownload} from "~/components/common";
import {Div, Span, Flex, Right, Hr} from '~/styledComponents/shared/Layouts'
import {AgGridReact} from "ag-grid-react";
import {Button, ButtonGroup, Table} from "reactstrap";
import {SingleDatePicker} from "react-dates";
import moment from "moment";
import {getLoginAdminUser} from "~/lib/loginApi";
import SearchDates from '~/components/common/search/SearchDates'
import {getCouponMaster} from "~/lib/adminApi";
import {FilterGroup} from "~/styledComponents/shared";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";

const CouponMemoRenderer = (props) => {
    const [couponMemo, setCouponMemo] = useState()
    useEffect(() => {

        getCouponMaster({masterNo:props.data.masterNo}).then(res => {
            setCouponMemo(res.data.couponMemo)
        })

    }, [])
    return <div>{couponMemo === undefined ? '...' : couponMemo}</div>
}

export default class ConsumerCouponList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
            startDate: moment(moment().toDate()),
            endDate: moment(moment().toDate()),
            data: [],
            excelData: null,
            columnDefs: [
                {headerName: "쿠폰NO", field: "couponNo", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "이름", field: "name", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "연락처", field: "phone", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "Email", field: "email", width: 160, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "쿠폰명", field: "couponTitle", width: 200, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "쿠폰메모", field: "couponMemo", width: 200, cellRenderer: "couponMemoRenderer", filter: false},
                {headerName: "일련번호", field: "hexCouponNo", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "발급일", field: "issuedDate", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'}), cellRenderer: 'formatDateTimeRenderer'},
                {headerName: "지급처", field: "manualIssueFlag", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return (params.data.manualIssueFlag) ? "수동(관리자)" : "자동";
                    }
                },
                {headerName: "사용기간", field: "useDay", width: 180,
                    valueGetter: function(params) {
                        let v_Date = '-';
                        if(params.data.useStartDay > 0) {
                            v_Date = ComUtil.intToDateString(params.data.useStartDay, 'YYYY.MM.DD') + '~' + ComUtil.intToDateString(params.data.useEndDay, 'YYYY.MM.DD')
                        }
                        return v_Date;
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'center'})},  // useStartDay useEndDay
                {headerName: "사용여부", field: "usedFlag", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return (params.data.usedFlag) ? "사용" : "미사용";
                    }
                },
                {headerName: "할인금액(BLY)", field: "couponBlyAmount", width: 120, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return params.data.couponBlyAmount + "BLY";
                    }
                },
                {headerName: "최소 주문금액", field: "minOrderBlyAmount", width: 120, cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    valueGetter: function(params) {
                        return params.data.minOrderBlyAmount + "BLY";
                    }
                },
            ],
            defaultColDef: {
                width: 110,
                resizable: true,
                filter: true,
                sortable: true,
                floatingFilter: false,
                filterParams: {
                    newRowsAction: 'keep'
                }
            },
            frameworkComponents: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                formatDateTimeRenderer: this.formatDateTimeRenderer,
                couponMemoRenderer: CouponMemoRenderer
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
        }
    }

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data: rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data: rowData}) => {
        return (value ? ComUtil.utcToString(value, 'YYYY-MM-DD') : '-')
    };
    formatDateTimeRenderer = ({value, data: rowData}) => {
        return (value ? ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm') : '-')
    };

    // Ag-Grid Cell 스타일 기본 적용 함수
    getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
        if(cellAlign === 'left') cellAlign='flex-start';
        else if(cellAlign === 'center') cellAlign='center';
        else if(cellAlign === 'right') cellAlign='flex-end';
        else cellAlign='flex-start';
        return {
            display: "flex",
            alignItems: "center",
            justifyContent: cellAlign,
            color: color,
            textDecoration: textDecoration,
            whiteSpace: whiteSpace,
            fontWeight: fontWeight
        }
    }

    async componentDidMount() {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        await this.search();
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    onGridReady(params) {
        //API init
        this.gridApi = params.api
        //this.gridColumnApi = params.columnApi
        // console.log("onGridReady");
    }

    search = async (searchButtonClicked) => {

        if (searchButtonClicked) {
            if (!this.state.startDate || !this.state.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        if(this.gridApi) {
            //ag-grid 레이지로딩중 보이기
            this.gridApi.showLoadingOverlay();
        }
        const params = {
            startDate:this.state.startDate ? moment(this.state.startDate).format('YYYYMMDD'):null,
            endDate:this.state.endDate ? moment(this.state.endDate).format('YYYYMMDD'):null
        };
        const { status, data } = await getConsumerCouponList(params);

        if (status !== 200) {
            alert('응답이 실패 하였습니다');
            return;
        }

        this.setState({
            data: data
        })

        this.setExcelData();

        //ag-grid api
        if(this.gridApi) {
            //ag-grid 레이지로딩중 감추기
            this.gridApi.hideOverlay()
        }
    };

    setExcelData = () => {
        let excelData = this.getExcelData();
        this.setState({
            excelData: excelData
        })
    }
    getExcelData = () => {
        const columns = [
            '번호', '이름', '연락처', 'Email', '쿠폰명',
            '일련번호', '발급일', '지급처', '사용기간', '사용여부', '할인금액(BLY)', '최소 주문금액(BLY)'
        ]
        const data = this.state.data.map((item ,index)=> {
            let issuedDate = ComUtil.utcToString(item.issuedDate, 'YYYY-MM-DD HH:mm');
            let manualIssueFlag = item.manualIssueFlag ? "수동(관리자)" : "자동";
            let useDay = "-";
            if(item.useStartDay > 0) {
                useDay = ComUtil.intToDateString(item.useStartDay, 'YYYY.MM.DD') + '~' + ComUtil.intToDateString(item.useEndDay, 'YYYY.MM.DD')
            }
            let usedFlag = item.usedFlag ? "사용" : "미사용";

            return [
                item.couponNo, item.name, item.phone, item.email, item.couponTitle,
                item.hexCouponNo, issuedDate, manualIssueFlag, useDay, usedFlag, item.couponBlyAmount, item.minOrderBlyAmount
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    onDatesChange = async (data) => {
        await this.setState({
            startDate: data.startDate,
            endDate: data.endDate,
            selectedGubun: data.gubun
        });
        if(data.isSearch) {
            await this.search();
        }
    }

    render() {
        return (
            <div>
                <div>
                    <Flex bc={'secondary'} m={3} p={7}>
                        <Div pl={10} pr={20} py={1}> 기 간 (발급일) </Div>
                        <Div ml={10} >
                            <Flex>
                                <SearchDates
                                    gubun={this.state.selectedGubun}
                                    startDate={this.state.startDate}
                                    endDate={this.state.endDate}
                                    onChange={this.onDatesChange}
                                />

                                <Button className="ml-3" color="primary" onClick={() => this.search(true)}> 검 색 </Button>
                            </Flex>
                        </Div>
                    </Flex>
                </div>
                <FilterContainer gridApi={this.gridApi} excelFileName={'쿠폰 지급목록'}>
                    <FilterGroup>
                        <InputFilter
                            gridApi={this.gridApi}
                            columns={[
                                {field: 'couponNo', name: '쿠폰NO', width: 80},
                                {field: 'name', name: '이름'},
                                {field: 'phone', name: '연락처'},
                                {field: 'email', name: 'Email'},
                                {field: 'couponTitle', name: '쿠폰명'},
                                {field: 'hexCouponNo', name: '일련번호'},
                                {field: 'issuedDate', name: '발급일'},
                            ]}
                            isRealTime={true}
                        />
                    </FilterGroup>
                    <Hr/>
                    <FilterGroup>
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'manualIssueFlag'}
                            name={'지급처'}
                            data={[
                                {value: '수동(관리자)', name: '수동(관리자)'},
                                {value: '자동', name: '자동'},
                            ]}
                        />
                        <CheckboxFilter
                            gridApi={this.gridApi}
                            field={'usedFlag'}
                            name={'사용여부'}
                            data={[
                                {value: '사용', name: '사용'},
                                {value: '미사용', name: '미사용'},
                            ]}
                        />
                    </FilterGroup>
                </FilterContainer>
                <div className="d-flex align-items-baseline p-1">
                    <ExcelDownload data={this.state.excelData}
                                   fileName="소비자 쿠폰지급내역"
                                   size={'md'}
                                   buttonName="Excel 다운로드"
                    />
                    <div className="flex-grow-1 text-right">
                        총 {this.state.data.length} 건
                    </div>
                </div>
                <div className="p-1">
                    <div
                        id="myGrid"
                        className="ag-theme-balham"
                        style={{
                            height: '600px'
                        }}
                    >
                        <AgGridReact
                            // enableSorting={true}                //정렬 여부
                            // enableFilter={true}                 //필터링 여부
                            floatingFilter={true}               //Header 플로팅 필터 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            frameworkComponents={this.state.frameworkComponents}
                            // enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            rowHeight={35}
                        >
                        </AgGridReact>
                    </div>
                </div>
            </div>
        )
    }
}

