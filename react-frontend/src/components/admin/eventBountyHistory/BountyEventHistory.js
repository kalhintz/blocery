import React, { useState, useEffect } from 'react';
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader, Table} from 'reactstrap'
import {BlocerySpinner, ExcelDownload} from '~/components/common'
import ComUtil from '~/util/ComUtil'
import moment from 'moment-timezone'
import { getAllBlctBountyHistory } from "~/lib/eventApi"
import SearchDates from '~/components/common/search/SearchDates'
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import {useModal} from "~/util/useModal";
import {Div, Flex, Span} from "~/styledComponents/shared";
import ConsumerDetail from "~/components/common/contents/ConsumerDetail";

const BountyEventHistory = (props) => {

    const [gridApi, setGridApi] = useState(null);

    const [search, setSearch] = useState({
        isSearch:true,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
    });

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()


    const agGrid = {
        columnDefs: [
            {headerName: "날짜", field: "date", sort: "desc", width:170},
            {headerName: "소비자번호", field: "consumerNo", width:100},
            {headerName: "이름", field: "name", width:100, cellRenderer: "nameRenderer"},
            {headerName: "어뷰저", field: "name", width:100, cellRenderer: "abuserRenderer"},
            {headerName: "account", field: "account", width:320},
            {headerName: "event 제목", field: "stateName", width:170},
            {headerName: "event 소제목", field: "eventName", width:270},
            {headerName: "지급된 토큰양", field: "amount", width:120},
        ],
        defaultColDef: {
            width: 100,
            resizable: true,
            filter: true,
            sortable: true,
            floatingFilter: false,
            filterParams: {
                newRowsAction: 'keep'
            }
        },
        frameworkComponents: {
            nameRenderer: nameRenderer,
            abuserRenderer: AbuserRenderer,
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    };

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

    const [dataList, setDataList] = useState([]);
    const [excelData, setDataExcel] = useState([]);
    const [totalBlct, setTotalBlct] = useState(0);

    useEffect(() => {
        async function getData() {
            await getSearch();
        }
        getData();
    }, []);

    useEffect(()=> {
        async function excelData() {
            await setExcelData();
        }
        excelData();
    }, [dataList]);

    useEffect(() => {
        async function getData() {
            if(search.isSearch) {
                await getSearch();
            }
        }
        getData();
    }, [search]);

    function nameRenderer ({value, data:rowData}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, rowData)}><u>{rowData.name}</u></Span>
    }


    const getSearch = async (searchButtonClicked) => {

        if(searchButtonClicked) {
            if (!search.startDate || !search.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        const params = {
            startDate:search.startDate ? moment(search.startDate).format('YYYYMMDD'):null,
            endDate:search.endDate ? moment(search.endDate).format('YYYYMMDD'):null,
            gubun:search.selectedGubun
        };
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const {data} = await getAllBlctBountyHistory(params);
        let r_toto_blct_sum = 0;
        data.map(item => {
            r_toto_blct_sum = ComUtil.doubleAdd(r_toto_blct_sum, item.amount);
            let date = item.date ? ComUtil.utcToString(item.date,'YYYY-MM-DD HH:mm'):null;
            item.date = date;
        });
        //console.log("r_toto_blct_sum",r_toto_blct_sum);
        setTotalBlct(r_toto_blct_sum);
        setDataList(data)
        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    };

    const setExcelData = async () => {
        let excelData = await getExcelData();
        setDataExcel(excelData);
    };

    const getExcelData = async() => {
        const columns = [
            '날짜',
            '소비자번호', '이름', 'email', 'account', 'event 제목', 'event소제목', '지급된 토큰양'
        ];

        const data = dataList.map((item ,index)=> {
            return [
                item.date,
                item.consumerNo,
                item.name,
                item.email,
                item.account,
                item.stateName,
                item.eventName,
                item.amount
            ]
        });
        return [{
            columns: columns,
            data: data
        }]
    };

    const ExampleCustomDateInput = ({ value, onClick }) => (
        <Button
            color="secondary"
            active={true}
            onClick={onClick}>검색 {value} 년</Button>
    );

    const onNameClick = (data) => {
        setSelected(data.consumerNo)
        toggle()
    }


    const toggle = () => {
        setModalState(!modalOpen)
    }
    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const onDatesChange = async (data) => {
        const search = Object.assign({}, search);
        search.startDate = data.startDate;
        search.endDate = data.endDate;
        search.selectedGubun = data.gubun;
        search.isSearch = data.isSearch;
        setSearch(search);
    }

    return(
        <div>
            <div className="ml-2 mt-2 mr-2">
                <Flex bc={'secondary'} m={3} p={7}>
                    <Div pl={10} pr={20} py={1}> 기 간 </Div>
                    <Div ml={10} >
                        <Flex>
                            <SearchDates
                                gubun={search.selectedGubun}
                                startDate={search.startDate}
                                endDate={search.endDate}
                                onChange={onDatesChange}
                            />
                            <Button className="ml-3" color="primary" onClick={() => getSearch(true)}> 검 색 </Button>
                        </Flex>
                    </Div>
                </Flex>
            </div>
            <div className="d-flex align-items-center p-1">
                <ExcelDownload data={excelData} size={'md'} fileName="이벤트 BLY 지급목록"/>
                <div className="ml-2">
                    총 지급된 BLY : {totalBlct}
                </div>
            </div>

            <div className="p-1">
                <div
                    className="ag-theme-balham"
                    style={{
                        height: '600px'
                    }}
                >
                    <AgGridReact
                        // enableSorting={true}
                        // enableFilter={true}
                        columnDefs={agGrid.columnDefs}
                        defaultColDef={agGrid.defaultColDef}
                        rowSelection={'single'}  //멀티체크 가능 여부
                        // enableColResize={true}
                        overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                        overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                        rowData={dataList}
                        frameworkComponents={agGrid.frameworkComponents}
                        onGridReady={onGridReady}   //그리드 init(최초한번실행)
                        onCellDoubleClicked={copy}
                    />
                </div>
            </div>
            <Modal size="lg" isOpen={modalOpen} toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    소비자 상세 정보
                </ModalHeader>
                <ModalBody>
                    <ConsumerDetail consumerNo={selected} onClose={toggle} />
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>닫기</Button>
                </ModalFooter>
            </Modal>
        </div>
    )
}

export default BountyEventHistory