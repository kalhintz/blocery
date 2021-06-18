import React, { useState, useEffect } from 'react'
import { getConsumerAbusers } from '~/lib/adminApi'
import { getLoginAdminUser } from '~/lib/loginApi'
import ComUtil from '~/util/ComUtil'
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import {Span} from "~/styledComponents/shared";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";
import BlctRenderer from "~/components/common/agGridRenderers/BlctRenderer";
import ExcelUtil from "~/util/ExcelUtil";
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";

const WrappedBlctRenderer = ({data:rowData}) => {
    //console.log("rowData",rowData)
    const d = {
        account:rowData.consumerAccount || null
    };
    return <BlctRenderer data={d} />;
}
const AbsuerList = (props) => {
    const [gridApi, setGridApi] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [modalValue, setModalValue] = useState(null);
    const [data, setData] = useState([]);
    // const [excelData, setExcelData] = useState({
    //     columns: [],
    //     data: []
    // });
    const agGrid = {
        columnDefs: [
            {headerName: "소비자번호", field: "consumerNo",width: 100},
            {headerName: "이름", field: "name", cellRenderer: "nameRenderer",width: 100},
            {headerName: "email", field: "email", width: 150},
            {headerName: "phone", field: "phone", width: 100},
            {headerName: "차단여부", field: "blocked", width: 100},
            {headerName: "해킹여부", field: "hackerFlag", width: 100},
            {headerName: "소비자안내메시지", field: "userMessage", width: 150},
            {headerName: "관리자메모", field: "memo", width: 150},
            {
                headerName: "등록일", field: "regDate", width: 150,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.regDate ? ComUtil.utcToString(params.data.regDate, 'YYYY-MM-DD HH:mm'):null;
                }
            },
            {
                headerName: "수정일", field: "modDate", width: 150,
                valueGetter: function(params) {
                    return params.data.modDate ? ComUtil.utcToString(params.data.modDate, 'YYYY-MM-DD HH:mm'):null;
                }
            },
            {headerName: "IP", field: "ip", width: 150},
            {headerName: "송금주소", field: "account", width: 150},
            {
                headerName: "구분", field: "authType", width: 100,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.authType == 1 ? '카카오' : '일반';
                }
            },
            {headerName: "카카오ID", field: "authId", width: 100, cellRenderer: "authIdRenderer"},
            {headerName: "소비자지갑주소", field: "consumerAccount", width: 200 },
            {headerName: "BLY", field: "bly", cellRenderer: "wrappedBlctRenderer", width: 150},
            {
                headerName: "탈퇴일", field: "stoppedDate", width: 100,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.stoppedDate ? ComUtil.intToDateString(params.data.stoppedDate,"YYYY-MM-DD"):null;
                }
            },
            {
                headerName: "가입일", field: "timestamp", width: 150,
                valueGetter: function(params) {
                    //기공된 필터링 데이터로 필터링 되게 적용
                    return params.data.timestamp ? ComUtil.utcToString(params.data.timestamp, 'YYYY-MM-DD HH:mm'):null;
                }
            }
        ],
        defaultColDef: {
            width: 130,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            emailRenderer: emailCellRenderer,
            nameRenderer: nameCellRenderer,
            authIdRenderer: authIdCellRenderer,
            wrappedBlctRenderer: WrappedBlctRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    const [showBlctBalance, setShowBlctBalance] = useState(false);

    // 디드마운트
    useEffect(() => {
        async function fetch(){
            let user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            }

            await search();
        }
        fetch()
    }, [])

    // blct 잔고 출력
    useEffect(() => {
        search();
    }, [showBlctBalance])

    const search = async () => {

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const { status, data } = await getConsumerAbusers()
        if(status !== 200){
            alert('응답이 실패 하였습니다')
            return
        }
        setData(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const onNameClick = (data) => {
        // console.log({data})
        setModalValue(data.consumerNo);
        toggle();
    }

    const toggle = () => {
        const vIsOpen = !isOpen
        setIsOpen(vIsOpen)
        if (!isOpen) {
            //search();
        }
    }

    //// cellRenderer
    function nameCellRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData)}><u>{rowData.name}</u></Span>
    }

    function emailCellRenderer ({value, data:rowData}) {
        return (<span><u>{rowData.email}</u></span>);
    }

    function authIdCellRenderer ({value, data:rowData}) {
        return (rowData.authType == 1? <span className='text-danger'>{rowData.authId}</span> : <span></span>)
    }

    const getFilterData = () => {
        if(!gridApi){ return [] }
        //필터링된 데이터 push
        let sortedData = [];
        gridApi.forEachNodeAfterFilterAndSort(function(node, index) {
            sortedData.push(node.data);
        });
        return sortedData;
    }
    const onExcelDownLoad = () => {
        const columns = [
            '소비자번호', '이름', '이메일', '전화번호','차단여부', '해커여부',
            '소비자안내메시지','관리자메모','등록일','수정일','IP','송금주소',
            '소비자지갑주소', '탈퇴일', '가입일'
        ]
        //필터링된 데이터
        let sortedData = getFilterData();
        //console.log(sortedData);
        const oData = sortedData.map((item ,index)=> {
            return [
                item.consumerNo, item.name, item.email, item.phone, item.blocked, item.hackerFlag,
                item.userMessage, item.memo,
                item.regDate ? ComUtil.utcToString(item.regDate, 'YYYY-MM-DD HH:mm'):null,
                item.modDate ? ComUtil.utcToString(item.modDate, 'YYYY-MM-DD HH:mm'):null,
                item.ip, item.account,
                item.consumerAccount,
                item.stoppedDate ? ComUtil.intToDateString(item.stoppedDate,"YYYY-MM-DD"):null,
                item.timestamp ? ComUtil.utcToString(item.timestamp, 'YYYY-MM-DD HH:mm'):null
            ]
        })
        const dataExcel = [{
            columns: columns,
            data: oData
        }];
        ExcelUtil.download("어뷰저조회", dataExcel);
    }

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }


    if(data.length <= 0) return null;
    return (
        <div>

            <div className="d-flex p-1">
                <div className="d-flex">
                    <Button color={'info'} size={'sm'} onClick={onExcelDownLoad}>
                        <div className="d-flex">엑셀 다운로드</div>
                    </Button>
                </div>
                <div className="flex-grow-1 text-right">총 {data.length}명</div>
            </div>


            <div
                className="ag-theme-balham"
                style={{
                    height: '550px'
                }}
            >
                <AgGridReact
                    // enableSorting={true}                //정렬 여부
                    // enableFilter={true}                 //필터링 여부
                    columnDefs={agGrid.columnDefs}  //컬럼 세팅
                    rowSelection={'multiple'}
                    defaultColDef={agGrid.defaultColDef}
                    // components={components}  //custom renderer 지정, 물론 정해져있는 api도 있음
                    // enableColResize={true}              //컬럼 크기 조정
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTemplate={agGrid.overlayNoRowsTemplate}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    rowData={data}
                    frameworkComponents={agGrid.frameworkComponents}
                    //onFilterChanged={onGridFilterChanged.bind(this)} //필터온체인지 이벤트
                    //onRowClicked={onSelectionChanged.bind(this)}       // 클릭된 row
                    onCellDoubleClicked={copy}
                >
                </AgGridReact>
            </div>
            <Modal size="lg" isOpen={isOpen}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    소비자 상세 정보
                </ModalHeader>
                <ModalBody>
                    <ConsumerDetail consumerNo={modalValue} onClose={toggle} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>닫기</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}
export default AbsuerList;
