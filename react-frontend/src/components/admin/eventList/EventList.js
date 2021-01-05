import React, { Component } from 'react';
import { Button } from 'reactstrap'
import ComUtil from '~/util/ComUtil'
import { getLoginAdminUser } from '~/lib/loginApi'
import { getEventInfoList, delEventInfo } from '~/lib/adminApi'

import { ModalConfirm, AdminModalFullPopupWithNav } from '~/components/common'
import EventReg from '~/components/admin/eventList/EventReg'

import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Cell } from '~/components/common'

export default class EventList extends Component{
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            data: [],
            columnDefs: [
                {
                    headerName: "이벤트NO", field: "eventNo",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    sortable: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 150
                },
                {
                    headerName: "이벤트 타이틀",
                    field: "eventTitle",
                    suppressSizeToFit: true,
                    filterParams: {
                        clearButton: true //클리어버튼
                    },
                    cellStyle:this.getCellStyle({cellAlign: 'left'}),
                    cellRenderer: "titleRenderer",
                    width: 400
                },
                {
                    headerName: "이벤트 등록일", field: "timestamp",
                    suppressSizeToFit: true,
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 180,
                    cellRenderer: "formatDatesRenderer",
                    valueGetter: function(params) {
                        //console.log("params",params);
                        //기공된 필터링 데이터로 필터링 되게 적용 (UTCDate 변환)
                        let v_Date = params.data.timestamp ? ComUtil.utcToString(params.data.timestamp, 'YYYY-MM-DD HH:mm') : null;
                        return v_Date;
                    },
                    filter: "agDateColumnFilter",
                    filterParams: {
                        comparator: function (filterLocalDateAtMidnight, cellValue) {
                            let dateAsString = cellValue;
                            if (dateAsString == null) return -1;
                            let filterLocalDate = ComUtil.utcToString(filterLocalDateAtMidnight);
                            let cellDate = ComUtil.utcToString(dateAsString);
                            if (filterLocalDate == cellDate) {
                                return 0;
                            }
                            else if (cellDate < filterLocalDate) {
                                return -1;
                            }
                            else if (cellDate > filterLocalDate) {
                                return 1;
                            }
                        },
                        browserDatePicker: true, //달력
                        clearButton: true //클리어버튼
                    }
                },
                {
                    headerName: "이벤트 URL",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "eventUrlRenderer"
                },
                {
                    headerName: "비고",
                    suppressFilter: true,   //no filter
                    suppressSorting: true,  //no sort
                    cellStyle:this.getCellStyle({cellAlign: 'center'}),
                    width: 150,
                    cellRenderer: "delButtonRenderer"
                },
            ],
            defaultColDef: {
                width: 100,
                resizable: true
            },
            overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
            overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
            components: {
                formatDateRenderer: this.formatDateRenderer,
                formatDatesRenderer: this.formatDatesRenderer
            },
            frameworkComponents: {
                titleRenderer:this.titleRenderer,
                delButtonRenderer:this.delButtonRenderer,
                eventUrlRenderer:this.eventUrlRenderer
            },
            rowHeight: 75,
            eventNo:"",
            isModalOpen:false
        };
    }

    componentDidMount = async () => {
        let user = await getLoginAdminUser();
        if (!user || user.email.indexOf('ezfarm') < 0) {
            //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
            window.location = '/admin/login';
        }

        //리스트 조회
        this.search();

    };

    //[이벤트] 그리드 로드 후 callback 이벤트
    // onGridReady(params) {
    //     //API init
    //     this.gridApi = params.api;
    //     this.gridColumnApi = params.columnApi;
    // }

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

    //Ag-Grid Cell 숫자콤마적용 렌더러
    formatCurrencyRenderer = ({value, data:rowData}) => {
        //console.log("rowData",rowData);
        return ComUtil.addCommas(value);
    };
    //Ag-Grid Cell 날짜변환 렌더러
    formatDateRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD') : '-')
    };
    formatDatesRenderer = ({value, data:rowData}) => {
        return (value ? ComUtil.utcToString(value,'YYYY-MM-DD HH:mm') : '-')
    };

    titleRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div onClick={this.regEvent.bind(this, rowData.eventNo)} style={{color: 'blue'}}>
                    <u>{rowData.eventTitle}</u>
                </div>
            </Cell>
        );
    };

    eventUrlRenderer = ({value, data:rowData}) => {
        return (
            <Cell textAlign="left">
                <div style={{color: 'black'}}>
                    <span>/event?no={rowData.eventNo}</span>
                </div>
            </Cell>
        );
    };

    delButtonRenderer = ({value, data:rowData}) => {
        return (
            <Cell>
                <div className="d-flex" style={{textAlign: 'center'}}>
                    <ModalConfirm title={'삭제'} content={<div>선택한 이벤트를 삭제하시겠습니까?</div>} onClick={this.delEvent.bind(this, rowData.eventNo)}>
                        <Button block size='sm' color={'info'}>삭제</Button>
                    </ModalConfirm>
                </div>
            </Cell>
        );
    };

    search = async () => {
        this.setState({loading: true});
        const { status, data } = await getEventInfoList();
        if(status !== 200){
            alert('응답이 실패 하였습니다');
            return
        }
        this.setState({
            data: data,
            loading: false
        });
    };

    delEvent = async(eventNo, isConfirmed) => {
        if (isConfirmed) {
            await delEventInfo(eventNo);
            await this.search();
        }
    };

    regEvent = (eventNo) => {
        let v_eventNo="";
        if(eventNo){
            v_eventNo = eventNo;
        }
        this.setState({
            eventNo:v_eventNo,
            isModalOpen: true
        });
    };

    regModalToggle=()=>{
        this.setState({
            eventNo:"",
            isModalOpen: !this.state.isModalOpen
        });
    };

    //등록 모달 팝업 닫기
    onPopupClose = (data) => {

        this.setState({
            eventNo:"",
            isModalOpen: !this.state.isModalOpen
        });

        if(data && data.refresh){
            this.search();
        }
    };

    render() {
        return (
            <div>
                <div className="d-flex p-1">
                    <div className="d-flex align-items-center pl-1">
                        <span className="text-success">{this.state.data.length}</span>개의 이벤트
                    </div>
                    <div className="flex-grow-1 text-right">
                        <Button outline size='sm' color={'info'} onClick={this.regEvent.bind(this,'')} className='m-2'>이벤트 등록</Button>
                    </div>
                </div>
                <div className="p-1">
                    <div
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
                            rowHeight={this.state.rowHeight}
                            enableColResize={true}              //컬럼 크기 조정
                            overlayLoadingTemplate={this.state.overlayLoadingTemplate}
                            overlayNoRowsTemplate={this.state.overlayNoRowsTemplate}
                            // onGridReady={this.onGridReady.bind(this)}   //그리드 init(최초한번실행)
                            rowData={this.state.data}
                            components={this.state.components}
                            frameworkComponents={this.state.frameworkComponents}
                        >
                        </AgGridReact>

                    </div>
                    <AdminModalFullPopupWithNav
                        show={this.state.isModalOpen}
                        title={'이벤트 등록 및 수정'}
                        onClose={this.onPopupClose}>
                        <EventReg
                            eventNo={this.state.eventNo}
                        />
                    </AdminModalFullPopupWithNav>
                </div>
            </div>
        )
    }
}
