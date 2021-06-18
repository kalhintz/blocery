import React, { useState, useEffect } from 'react';
import {
    getBlctToBlyList,
    getSwapManagerBlyBalance,
    getSwapManagerEthBalance,
    getTotalSwapBlctToBly,
    getTotalSwapBlctToBlyByGigan,
    getEthGasPrice,
    getSwapBlctToBlyById
} from '~/lib/swapApi';
import { scOntGetBalanceOfBlctAdmin, scOntGetManagerOngBalance } from '~/lib/smartcontractApi';
import {
    getAllGoodsSaleList,
    getPausedGoods,
    getSaleEndGoods,
    getSoldOutGoods,
    requestAdminOkStatusBatch
} from '~/lib/adminApi'
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties';
import axios from 'axios';
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import {Button, Input, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {Button as StyledButton} from "~/styledComponents/shared/Buttons";
import {useModal} from "~/util/useModal";
import {Div, Span, Hr, Link, Flex, FilterGroup} from "~/styledComponents/shared";
import loadable from "@loadable/component";
import {FiLink} from 'react-icons/fi'
import moment from "moment-timezone";
import SearchDates from "~/components/common/search/SearchDates";
import {getRecommendFriends} from "~/lib/adminApi";
import {getLoginAdminUser} from "~/lib/loginApi";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";

const ConsumerDetail = loadable(() => import('~/components/common/contents/ConsumerDetail'));
const AdminOkStatusView = loadable(() => import('~/components/common/contents/AdminOkStatusView'));

const ADMIN_OK_STATUS_NM = ['승인', '요청', '검토중', '거절', '배치']

const TokenSwapOutList = (props) => {

    function nameRenderer({value, data}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, data)}><u>{value}</u></Span>
    }

    function adminOkStatusRenderer({value, data}) {
        //요청, 검토 일 경우 버튼으로 보이게..
        if (value === 1 || value === 2){
            return <StyledButton p={0} px={10} fontSize={12} rounded={2} bg={'primary'} fg={'white'} onClick={onNameClick.bind(this, data)}>{`${ADMIN_OK_STATUS_NM[parseFloat(value)]}[code:${value}]`}</StyledButton>
        }

        return <Span fg={'primary'} onClick={onNameClick.bind(this, data)}><u>{`${ADMIN_OK_STATUS_NM[parseFloat(value)]}[code:${value}]`}</u></Span>
    }

    const [search, setSearch] = useState({
        isSearch:true,
        selectedGubun: 'day', //'week': 최초화면을 오늘(day)또는 1주일(week)로 설정.
        startDate: moment(moment().toDate()),
        endDate: moment(moment().toDate()),
    });
    const [adminOkSt, setAdminOkSt] = useState("")

    const [managerLoading, setManagerLoading] = useState(false);
    const [gridApi, setGridApi] = useState(null);
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [agGrid, setAgGrid] = useState({
        columnBlctToDefs: [
            {headerName: "No", width: 100, field: "swapBlctToBlyNo",
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,  //전체 체크시 필터된 것만 체크
                checkboxSelection: true,
            },
            {headerName: "소비자번호", width: 100, field: "consumerNo"},
            {headerName: "이름", width: 100, field: "name", cellRenderer: "nameRenderer"},
            {
                headerName: "어뷰징", field: "abuser",
                suppressFilter: true,   //no filter
                suppressSorting: true,  //no sort
                cellRenderer: "abuserRenderer"
            },
            {headerName: "출금요청상태", width: 100, field: "adminOkStatus", cellRenderer: "adminOkStatusRenderer",
                cellStyle: {textAlign:'center'}
            },
            {headerName: "swap 결과", width: 100, field: "finalResult"},
            {headerName: "swap 완료", width: 100, field: "blyPaid"},
            {headerName: "소비자 이메일주소", width: 200, field: "consumerEmail"},
            {headerName: "소비자 전화번호", width: 150, field: "consumerPhone"},
            {headerName: "Swap 요청 시각", width: 170, field: "swapTimestamp", cellRenderer: 'formatDateRenderer'},
            {headerName: "받은 BLCT(oep4) ", width: 140, field: "blctAmount", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "출금한 BLY(erc20)", width: 150, field: "blyAmount", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "외부 송금Account", width: 350, field: "blyExtAccount"},
            {headerName: "txHash", width: 500, field: "txHash"},
        ],
        defaultColDef: {
            width: 170,
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
            adminOkStatusRenderer: adminOkStatusRenderer,
            abuserRenderer: AbuserRenderer,
            formatCurrencyRenderer: formatCurrencyRenderer,
            formatDateRenderer: formatDateRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [blctToBlyList, setBlctToBlyList] = useState([]);
    const [totalBlctOutAll, setTotalBlctOutAll] = useState();
    const [totalBlctOut, setTotalBlctOut] = useState();

    const [managerOng, setManagerOng] = useState();
    const [managerBlct, setManagerBlct] = useState();
    const [swapManagerBly, setSwapManagerBly] = useState();
    const [swapManagerEth, setSwapManagerEth] = useState();
    const [ethGasPrice, setEthGasPrice] = useState();

    const [excelData, setExcelData] = useState();
    const [selectedRows, setSelectedRows] = useState([])

    useEffect(() => {
        async function fetch() {
            const user = await getLoginAdminUser();
            if (!user || user.email.indexOf('ezfarm') < 0) {
                //admin은 웹전용이라서, window로 이동하는 것이 더 잘됨. //this.props.history.push('/admin');
                window.location = '/admin/login';
            }

            await getSearch();
            getManagerData();
        }
        fetch();

    }, []);

    useEffect(() => {
        async function getData() {
            if(search.isSearch) {
                await getSearch();
                getManagerData();
            }
        }
        getData();
    }, [search]);

    const getSearch = async (searchButtonClicked) => {

        if(searchButtonClicked) {
            if (!search.startDate || !search.endDate) {
                alert('시작일과 종료일을 선택해주세요')
                return;
            }
        }

        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }

        const params = {
            startDate:search.startDate ? moment(search.startDate).format('YYYYMMDD'):null,
            endDate:search.endDate ? moment(search.endDate).format('YYYYMMDD'):null,
            adminOkStatus:adminOkSt ? adminOkSt:null
        };

        const {data: blctToBlyList} = await getBlctToBlyList(params);
        setBlctToBlyList(blctToBlyList);

        setExcelDataFunc(blctToBlyList);

        //전체 blct 출금 합계
        const {data:swapBlctToBlyAll} = await getTotalSwapBlctToBly();
        setTotalBlctOutAll(swapBlctToBlyAll.blctSum)

        //기간 조건에 따른 blct 출금 합계
        params.adminOkStatus = null; // 출금합계는 상태값 전체로 함 (승인된 출금만 가져옴)
        const {data:swapBlctToBly} = await getTotalSwapBlctToBlyByGigan(params);
        setTotalBlctOut(swapBlctToBly.blctSum)

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const onSearchManagerClick = () => {
        getManagerData();
    }

    const getManagerData = async() => {
        // await getBaseAccount();
        await getManagerBalances();
    }


    const getManagerBalances = async() => {
        setManagerLoading(true);

        let managerAccount = await axios(Server.getRestAPIHost() + '/baseAccount',
            {   method:"get",
                withCredentials: true,
                credentials: 'same-origin'
            }
        ).then((response) => {
            return response.data

        });
        console.log('manager Account : ' , managerAccount);

        const {data:managerOng} = await scOntGetManagerOngBalance();
        const {data:managerBlct} = await scOntGetBalanceOfBlctAdmin(managerAccount);
        const {data:swapManagerBly} = await getSwapManagerBlyBalance();
        const {data:swapManagerEth} = await getSwapManagerEthBalance();
        const {data:ethGasGwei} = await getEthGasPrice();

        setManagerBlct(managerBlct);
        setManagerOng(managerOng);
        setSwapManagerBly(swapManagerBly);
        setSwapManagerEth(swapManagerEth);
        setEthGasPrice(ethGasGwei);

        setManagerLoading(false);
    };

    const setExcelDataFunc = (data) => {
        let excelData = getExcelData(data);
        // console.log(excelData);
        setExcelData(excelData);
    }

    const getExcelData = (dataList) => {
        const columns = [
            'No', '소비자 번호', '출금요청상태', '소비자 이메일주소', 'Swap 요청 시각', '받은 BLCT(oep4)', '출금한 BLY(erc20)', '외부 송금Account', 'swap 완료여부', 'txHash'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.map((item ,index)=> {
            return [
                item.swapBlctToBlyNo, item.consumerNo, ADMIN_OK_STATUS_NM[item.adminOkStatus], item.consumerEmail, item.swapTimestamp, item.blctAmount, item.blyAmount, item.blyExtAccount, item.blyPaid, item.txHash
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    function formatCurrencyRenderer({value, data:rowData}) {
        return ComUtil.addCommas(value);
    }


    //Ag-Grid Cell 날짜변환 렌더러
    function formatDateRenderer({value, data:rowData}) {
        return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm:ss ')
    }

    // 조회할 출금상태 change
    const onStateChange = async (e) => {
        console.log(e.target.value)
        setAdminOkSt(e.target.value)
    }

    const onDatesChange = async (data) => {
        const search = Object.assign({}, search);
        search.startDate = data.startDate;
        search.endDate = data.endDate;
        search.selectedGubun = data.gubun;
        search.isSearch = data.isSearch;
        setSearch(search);
        setSelectedRows([]);
    }

    const styles = {
        redText : { color: 'red' },
        blueText : { color: 'blue' },
        blackText : { color: 'black' }
    };

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onNameClick = (item) => {
        setSelected(item)
        toggle()
    }


    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '')
    }

    const onWithdrawBatchRegClick = async () => {
        //상태값 확인
        // const {data} = await getSwapBlctToBlyById(swapBlctToBlyNo)


        //체크된 목록 중 업데이트 가능한 (adminOkStatus ===1) 가져오기
        const updateRows = await getAvailableBatchRows()

        // console.log({rows})

        //상태값 체크(배치 처리 가능한지)

        if (updateRows.length <= 0){
            alert('자동 출금처리 등록 할 건이 없습니다')
            return
        }

        if (!window.confirm(`${ComUtil.addCommas(updateRows.length)}건을 자동 출금처리 등록 하시겠습니까?`)) {
            return
        }

        const promises = updateRows.map(item => requestAdminOkStatusBatch(item.swapBlctToBlyNo))

        await Promise.all(promises)

        alert('처리되었습니다.')

        // setSelectedRows([])

        //새로고침
        getSearch()

    }

    //체크된 목록 중 업데이트 가능한 (adminOkStatus ===1) 가져오기
    const getAvailableBatchRows = async () => {
        //그리드 체크된 목록
        const sRows = gridApi.getSelectedRows()
        //db 조회
        const promises = sRows.map(item => getSwapBlctToBlyById(item.swapBlctToBlyNo))
        const res = await Promise.all(promises)
        const dbRows = res.map(({data}) => data)
        //필터링
        return dbRows.filter(item => item.adminOkStatus === 1)   //상태값이 요청 인 경우만 필터링
    }

    const onSelectionChanged = (event) => {
        updateSelectedRows()
    }

    const updateSelectedRows = () => {
        // setSelectedRows(gridApi.getSelectedRows())
        setSelectedRows(gridApi.getSelectedRows())
    }

    //[이벤트] 그리드 로드 후 callback 이벤트
    const onGridReady = (params) => {
        //API init
        setGridApi(params.api);
        // this.gridColumnApi = params.columnApi;
        // console.log("ready", params.api)
    }

    return (
        <div className="m-2">

            <div className='m-2'>
                <h6> Manager 계좌 정보 <Button className="ml-3" size={'sm'} color={'info'} disabled={managerLoading} onClick={onSearchManagerClick}>Manager계좌정보검색</Button></h6>
                <div className="ml-3 mb-1">
                    SwapManager Account : 0x4E28710830e2c910238F60CB03233c91A16f4087
                </div>
                <div className="ml-3 mb-1">
                    OntManager Account :  AYZ14K5FJKXC9mzS5YFfdr52E6seBqAPPU
                </div>
                <div className="d-flex ml-3 mb-4">
                    <div className="mr-4">
                        SwapManager ETH : <span style={styles.blueText}>{ComUtil.toEthCurrency(swapManagerEth)}</span> <br/>
                        SwapManager BLY : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(swapManagerBly)} </span> <br/>
                    </div>
                    <div className="ml-5">
                        Manager ONG : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(managerOng)}</span> <br/>
                        Manager BLCT : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(managerBlct)} </span> <br/>
                    </div>
                    <div className="ml-5">
                        EthGasGwei : <span style={ ethGasPrice >= 250 ? styles.redText:styles.blueText}>{ComUtil.toIntegerCurrency(ethGasPrice)}</span>
                    </div>
                </div>
            </div>

            <div className="ml-2 mt-2 mr-2">
                <Flex bc={'secondary'} m={3} p={7}>
                    <Div pl={10} pr={20} py={1}> 기 간 (요청일) </Div>
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

            <FilterContainer gridApi={gridApi} excelFileName={'출금 목록'}>
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'consumerNo', name: '소비자번호', width: 80},
                            {field: 'name', name: '이름', width: 140},
                            {field: 'consumerEmail', name: '이메일'},
                            {field: 'consumerPhone', name: '전화번호'},
                            {field: 'blyExtAccount', name: '외부 송금Account'},
                            {field: 'txHash', name: 'txHash'},
                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'adminOkStatus'}
                        name={'출금요청상태'}
                        data={[
                            {value: 0, name: '0 승인'},
                            {value: 1, name: '1 요청'},
                            {value: 2, name: '2 검토중'},
                            {value: 3, name: '3 거절'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'finalResult'}
                        name={'swap 결과'}
                        data={[
                            {value: 200, name: '성공'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'blyPaid'}
                        name={'swap 완료'}
                        data={[
                            {value: true, name: '성공'},
                            {value: false, name: '실패'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>

            <div className="d-flex m-2">
                <div>총 출금합계(승인된항목)</div>
                <div className="ml-3"><b>{ComUtil.toCurrency(totalBlctOutAll)} BLCT</b></div>
                <div className="ml-3">현재 페이지 출금합계(승인된항목)</div>
                <div className="ml-3"><b>{ComUtil.toCurrency(totalBlctOut)} BLCT</b></div>
            </div>


            <Flex>

                {
                    (selectedRows.length > 0) && (
                        <Button size={'sm'} className={'mr-1'} onClick={onWithdrawBatchRegClick}>
                            {selectedRows.length}건 자동출금처리 등록
                        </Button>
                    )
                }
                <ExcelDownload data={excelData}
                               fileName="토큰출금내역"
                               sheetName="토큰출금내역"
                />

                <Link to={'/admin/shop/token/consumerKycList'} fg={'primary'} ml={10}>
                    <Flex fontSize={12} bc={'secondary'} cursor={1} p={5} rounded={3}>
                        <Flex mr={3}><FiLink/></Flex>
                        KYC인증 페이지
                    </Flex>
                </Link>
                <div className='ml-2'>
                    <Input type='select' name='select' id='adminOkState' onChange={onStateChange}>
                        <option name='radioall' value=''>출금요청상태=전체=</option>
                        <option name='radio1' value='1'>출금요청상태=요청(1)=</option>
                        <option name='radio2' value='2'>출금요청상태=검토중(2)=</option>
                        <option name='radio3' value='3'>출금요청상태=거절(3)=</option>
                        <option name='radio4' value='4'>출금요청상태=배치(4)=</option>
                        <option name='radio0' value='0'>출금요청상태=승인(0)=</option>
                    </Input>
                </div>


                <div className="flex-grow-1 text-right">
                    총 {blctToBlyList.length} 건
                </div>
            </Flex>


            <div
                className="ag-theme-balham mt-3"
                style={{
                    height: '800px'
                }}
            >
                <AgGridReact
                    onGridReady={onGridReady.bind(this)}
                    // enableSorting={true}
                    // enableFilter={true}
                    columnDefs={agGrid.columnBlctToDefs}
                    defaultColDef={agGrid.defaultColDef}
                    // enableColResize={true}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    frameworkComponents={agGrid.frameworkComponents}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    rowData={blctToBlyList}
                    //onRowClicked={selectRow}
                    onCellDoubleClicked={copy}
                    rowSelection={'multiple'} //멀티체크 가능 여부
                    suppressRowClickSelection={false}   //false : 셀 클릭시 체크박스도 체크 true: 셀클릭시 체크박스 체크 안함
                    onSelectionChanged={onSelectionChanged.bind(this)}
                />
            </div>
            <Modal size="lg" isOpen={modalOpen}
                   toggle={toggle} >
                <ModalHeader toggle={toggle}>
                    소비자 상세 정보
                </ModalHeader>
                <ModalBody style={{padding: 0}}>
                    {
                        selected && (
                            <>
                                <AdminOkStatusView swapBlctToBlyNo={selected ? selected.swapBlctToBlyNo:null} />
                                <Hr/>
                                <ConsumerDetail
                                    consumerNo={selected ? selected.consumerNo:null}
                                    onClose={toggle}
                                />
                            </>
                        )
                    }
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" onClick={toggle}>닫기</Button>
                </ModalFooter>
            </Modal>
        </div>
    )

}

export default TokenSwapOutList