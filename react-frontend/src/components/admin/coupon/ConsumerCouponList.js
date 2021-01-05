import React, {Component} from "react";
import ComUtil from "~/util/ComUtil";
import {getConsumerCouponList} from "~/lib/adminApi";
import {BlocerySpinner, ExcelDownload} from "~/components/common";
import { Div, Span, Flex, Right } from '~/styledComponents/shared/Layouts'
import {AgGridReact} from "ag-grid-react";
import {Button, ButtonGroup, Table} from "reactstrap";
import {SingleDatePicker} from "react-dates";
import moment from "moment";
import {getLoginAdminUser} from "~/lib/loginApi";

export default class ConsumerCouponList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            selectedGubun: 'all',
            startDate: null,
            endDate: null,
            data: [],
            excelData: null,
            columnDefs: [
                {headerName: "쿠폰NO", field: "couponNo", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "이름", field: "name", width: 100, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "연락처", field: "phone", width: 130, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "Email", field: "email", width: 160, cellStyle:this.getCellStyle({cellAlign: 'center'})},
                {headerName: "쿠폰명", field: "couponTitle", width: 200, cellStyle:this.getCellStyle({cellAlign: 'center'})},
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
            },
            frameworkComponents: {
                formatCurrencyRenderer: this.formatCurrencyRenderer,
                formatDateRenderer: this.formatDateRenderer,
                formatDateTimeRenderer: this.formatDateTimeRenderer
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

    search = async (searchButtonClicked) => {

        if (searchButtonClicked) {
            if (!this.state.startDate || !this.state.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        this.setState({loading: true});

        const { status, data } = (searchButtonClicked)? await getConsumerCouponList( moment(this.state.startDate).format('YYYYMMDD'), //날짜검색
            moment(this.state.endDate).format('YYYYMMDD'),
            null)
            : await getConsumerCouponList( null, null, this.state.selectedGubun ); //구분검색

        if (status !== 200) {
            alert('응답이 실패 하였습니다');
            return;
        }

        // console.log(data);

        this.setState({
            data: data,
            loading: false
        })

        this.setExcelData();
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


    //검색 조건들 설정..//////////////
    selectCondition = async (gubun) => {
        console.log('selectCondition', gubun);

        await this.setState({ //gubun이 변경될 때까지 대기필요.
            selectedGubun: gubun
        });

        await this.search();
    }

    onStartDateChange = async (date) => {
        console.log('onStartDateChange', moment(date).format('YYYY-MM-DD'));

        await this.setState({
            startDate: moment(date)
        })

    }
    onEndDateChange = async (date) => {
        console.log('onEndDateChange', moment(date).format('YYYY-MM-DD'));

        await this.setState({
            endDate: moment(date)
        })
    }

    render() {
        return (
            <div>
                {
                    this.state.loading && <BlocerySpinner/>
                }

                <div className="p-1">
                    조회
                </div>

                <div>
                    <Flex bc={'secondary'} m={3} p={7}>
                        <Div pl={10} pr={20} py={1}> 기 간 </Div>
                        <Div ml={10} >
                            <div className="d-flex">
                                <ButtonGroup>
                                    <Button color="secondary" onClick={() => this.selectCondition('day')} active={this.state.selectedGubun === 'day'}> 오늘 </Button>
                                    <Button color="secondary" onClick={() => this.selectCondition('week')} active={this.state.selectedGubun === 'week'}> 1주일 </Button>
                                    <Button color="secondary" onClick={() => this.selectCondition('month')} active={this.state.selectedGubun === 'month'}> 1개월 </Button>
                                    <Button color="secondary" onClick={() => this.selectCondition('3month')} active={this.state.selectedGubun === '3month'}> 3개월 </Button>
                                    <Button color="secondary" onClick={() => this.selectCondition('6month')} active={this.state.selectedGubun === '6month'}> 6개월 </Button>
                                    <Button color="secondary" onClick={() => this.selectCondition('all')} active={this.state.selectedGubun === 'all'}> 전체 </Button>
                                </ButtonGroup>

                                <div className="ml-3">
                                    <SingleDatePicker
                                          placeholder="검색시작일"
                                          date={ this.state.startDate}
                                          onDateChange={this.onStartDateChange}
                                          focused={this.state[`focused`]} // PropTypes.bool
                                          onFocusChange={({ focused }) => this.setState({ [`focused`]:focused })} // PropTypes.func.isRequired
                                          id={"startDate"} // PropTypes.string.isRequired,
                                          numberOfMonths={1}
                                          withPortal={false}
                                          isOutsideRange={() => false}
                                          small
                                          readOnly
                                    /> ~
                                    <SingleDatePicker
                                          placeholder="검색종료일"
                                          date={ this.state.endDate}
                                          onDateChange={this.onEndDateChange}
                                          focused={this.state[`focused2`]} // PropTypes.bool
                                          onFocusChange={({ focused }) => this.setState({ [`focused2`]:focused })} // PropTypes.func.isRequired
                                          id={"endDate"} // PropTypes.string.isRequired,
                                          numberOfMonths={1}
                                          withPortal={false}
                                          isOutsideRange={() => false}
                                          small
                                          readOnly
                                    />
                                </div>

                                <Button className="ml-3" color="primary" onClick={() => this.search(true)}> 검 색 </Button>
                            </div>
                        </Div>
                    </Flex>
                </div>
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
                            height: '550px'
                        }}
                    >
                        <AgGridReact
                            enableSorting={true}                //정렬 여부
                            enableFilter={true}                 //필터링 여부
                            floatingFilter={true}               //Header 플로팅 필터 여부
                            columnDefs={this.state.columnDefs}  //컬럼 세팅
                            defaultColDef={this.state.defaultColDef}
                            // components={this.state.components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                            frameworkComponents={this.state.frameworkComponents}
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            rowHeight={75}
                        >
                        </AgGridReact>
                    </div>
                </div>
            </div>
        )
    }
}

