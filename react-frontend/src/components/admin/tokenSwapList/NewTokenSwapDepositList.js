import React, { useState, useEffect } from 'react';
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import ComUtil from "~/util/ComUtil";
import {ExcelDownload} from "~/components/common";
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {AgGridReact} from "ag-grid-react";
import {
    getNewBlyToBlctList, getSwapManagerBlyBalance, getSwapManagerEthBalance, getTotalNewSwapBlctIn,
    getNewBlyToBlctListBalance, updateBlyDepositFinished, sendErcBlyToManager, getEthBlyBalance, adminWeiRetrieval
} from "~/lib/swapApi";
import axios from "axios";
import {Server} from "~/components/Properties";
import {scOntGetBalanceOfBlctAdmin, scOntGetManagerOngBalance} from "~/lib/smartcontractApi";
import loadable from "@loadable/component";
import {FilterGroup, Hr, Span} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import InputFilter from "~/components/common/gridFilter/InputFilter";
import CheckboxFilter from "~/components/common/gridFilter/CheckboxFilter";
import FilterContainer from "~/components/common/gridFilter/FilterContainer";
const ConsumerDetail = loadable(() => import('~/components/common/contents/ConsumerDetail'));

const NewTokenSwapDepositList = (props) => {

    function nameRenderer({value, data}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, data)}><u>{value}</u></Span>
    }

    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [gridApi, setGridApi] = useState(null);
    const [agGrid, setAgGrid] = useState({
        columnBlyToDefs: [
            {headerName: "erc20 임시계정", width: 330, field: "swapAccount"},
            {headerName: "소비자No", width: 100, field: "consumerNo"},
            {headerName: "이름", width: 100, field: "consumerName", cellRenderer: "nameRenderer"},
            {headerName: "소비자 이메일주소", width: 170, field: "consumerEmail"},
            {headerName: "소비자 전화번호", width: 120, field: "consumerPhone"},
            {headerName: "입금완료토큰", width: 110, field: "blyAmount", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "swap시작시간", width: 140, field: "recordCreateTime", cellRenderer: 'formatDateRenderer'},
            {headerName: "manager로 전송완료", width: 150,field: "managerTransfered", cellRenderer: 'transferedRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "manager전송시각", width: 140, field: "managerTransferedTime", cellRenderer: 'formatDateRenderer'},
            {headerName: "swap 완료", width: 100, field: "blctPaid", cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "swap 완료시각", width: 140, field: "blctPaidTime", cellRenderer: 'formatDateRenderer'},
            {headerName: "BLY 잔고", width: 120, field: "blyBalance", cellRenderer: 'balanceCheckRenderer'},
            {headerName: "ETH가스잔고", width: 150, field: "ethBalance", cellRenderer: 'ercSendRenderer'},
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
            abuserRenderer: AbuserRenderer,
            formatCurrencyRenderer: formatCurrencyRenderer,
            formatDateRenderer: formatDateRenderer,
            transferedRenderer: transferedRenderer,
            ercSendRenderer: ercSendRenderer,
            balanceCheckRenderer: balanceCheckRenderer,

        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [totalBlctIn, setTotalBlctIn] = useState();
    const [blyToBlctList, setBlyToBlctList] = useState([]);
    const [managerOng, setManagerOng] = useState();
    const [managerBlct, setManagerBlct] = useState();
    const [swapManagerBly, setSwapManagerBly] = useState();
    const [swapManagerEth, setSwapManagerEth] = useState();
    const [excelData, setExcelData] = useState();
    // const [completeCount, setCompleteCount] = useState();

    useEffect(() => {
        getSwapData(); //default showEthGasFee=false
        getManagerData();

    }, []);

    const getManagerData = async() => {
        await getManagerBalances();
    }

    // Ag-Grid Cell 스타일 기본 적용 함수
    function getCellStyle ({cellAlign,color,textDecoration,whiteSpace, fontWeight}){
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

    const getManagerBalances = async() => {

        let managerAccount = await axios(Server.getRestAPIHost() + '/baseAccount',
            {   method:"get",
                withCredentials: true,
                credentials: 'same-origin'
            }
        ).then((response) => {
            return response.data

        });
        // console.log('manager Account : ' , managerAccount);

        let {data:managerOng} = await scOntGetManagerOngBalance();
        let {data:managerBlct} = await scOntGetBalanceOfBlctAdmin(managerAccount);
        let { data:swapManagerBly } = await getSwapManagerBlyBalance();
        let { data:swapManagerEth } = await getSwapManagerEthBalance();

        setManagerBlct(managerBlct);
        setManagerOng(managerOng);
        setSwapManagerBly(swapManagerBly);
        setSwapManagerEth(swapManagerEth);
    };

    /////////cell Renderer
    function formatCurrencyRenderer({value, data:rowData}) {
        return ComUtil.addCommas(value);
    }


    //Ag-Grid Cell 날짜변환 렌더러
    function formatDateRenderer({value, data:rowData}) {
        if(value !== null) {
            return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm:ss ')
        } else {
            return '-';
        }
    }

    // manager전송 진행상황 렌더러
    function transferedRenderer({value, data:rowData}) {
        let status = '요청';
        if(value === 0) {
            status = '요청'
        } else if(value === 1) {
            status = '전송중'
        } else if(value === 2) {
            status = '전송완료'
        }

        return(
            value === 1 ?
                <div>
                    {status}
                    <Span ml={10}>
                        <Button size={'small'} type={'primary'}
                                onClick={() => rowData.transferOkClick()}> 완료처리
                        </Button>
                    </Span>
                </div>
                :
                <div>{status}</div>
        )
    }

    function ercSendRenderer(props) {

        const rowData = props.data;
        const onHandleClick = () => {
            console.slog("erc bly 전송 요청");
            sendErcBlyToManager(rowData.swapBlyDepositNo);
        }
        const onRetrivalClick = async() => {
            console.slog("eth 회수");
            let {data:result} = await adminWeiRetrieval(rowData.swapAccount);
            alert(result);
        }
        let status = false;
        if(rowData.managerTransfered === 1) {
            status = true;
        }
        return(
            status ?
                <div>
                    {rowData.ethBalance}
                    <Span ml={10}>
                        <button onClick={onHandleClick}>토큰전송</button>
                    </Span>
                </div>
                :
                <div>{rowData.ethBalance}
                    <Span ml={10}>
                        <button onClick={onRetrivalClick}>wei회수</button>
                    </Span>
                </div>
        )
    }

    function balanceCheckRenderer(props) {
        const rowData = props.data;
        const onHandleClick = async() => {
            console.slog("erc bly 잔액조회");
            let {data:result} = await getEthBlyBalance(rowData.swapAccount);
            alert(rowData.swapAccount + "\nEth: " + result[0] + "\nBly: " + result[1]);
        }

        return(
            <div>
                {rowData.blyBalance}
                <Span ml={10}>
                    <button onClick={onHandleClick}>잔액조회</button>
                </Span>
            </div>
        )
    }

    const getSwapData = async(showEthGasFee) => {
        let bShowEthGasFee = false;
        if(showEthGasFee != undefined){
            bShowEthGasFee = showEthGasFee;
        }
        let {data: blyToBlctList} = await getNewBlyToBlctList(bShowEthGasFee);
        // let {data: blyToBlctList} = await getBlyToBlctList(showEthGasFee);
        // console.log(blyToBlctList);
        await setList(blyToBlctList);
    }

    const managerTransferOk = async(item) => {
        const {data:result} = await updateBlyDepositFinished(item.swapBlyDepositNo);
        if(result === 200) {
            alert("변경이 완료되었습니다.");
            getSwapData(false);
        }
    }

    const tokenSendToManager = async(item) => {
        const {data:result} = await updateBlyDepositFinished(item.swapBlyDepositNo);
        if(result === 200) {
            alert("변경이 완료되었습니다.");
            getSwapData(false);
        }
    }

    const setList = async(blyToBlctList) => {
        blyToBlctList.map(item => item.transferOkClick = function() {
            managerTransferOk(item);
        })




        setBlyToBlctList(blyToBlctList);
        setExcelDataFunc(blyToBlctList);
        const {data:swapBlctIn} = await getTotalNewSwapBlctIn();

        setTotalBlctIn(swapBlctIn);
    }

    const setExcelDataFunc = (data) => {
        let excelData = getExcelData(data);
        // console.log(excelData);
        setExcelData(excelData);
    }

    const getExcelData = (dataList) => {
        const columns = [
            'erc20 임시계정', '소비자 번호', '이름', '소비자 이메일주소', '소비자 전화번호', '입금완료토큰', 'swap시작시간',
            'manager에게 전송 완료여부', 'manager에게 전송시각','swap 완료여부', 'swap 완료시각', 'BLY잔액', 'ETH가스잔고'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.map((item ,index)=> {
            let recordCreateTime = (item.allocateTime !== null) ? ComUtil.utcToString(item.recordCreateTime, 'YYYY-MM-DD HH:mm:ss ') : '-';
            let blctPaidTime = (item.blctPaidTime !== null) ? ComUtil.utcToString(item.blctPaidTime, 'YYYY-MM-DD HH:mm:ss ') : '-';
            let managerTransferedTime = (item.managerTransferedTime !== null) ? ComUtil.utcToString(item.managerTransferedTime, 'YYYY-MM-DD HH:mm:ss ') : '-';
            let transfered = (item.managerTransfered === 0) ? '요청' : (item.managerTransfered === 1) ? '전송중' : '전송완료'

            return [
                item.swapAccount, item.consumerNo, item.consumerName, item.consumerEmail, item.consumerPhone, item.blyAmount, recordCreateTime,
                transfered, managerTransferedTime, item.blctPaid, blctPaidTime, item.blyBalance, item.ethBalance
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }

    const showEthGasFeeRemained = async () => {
        alert('시간이 소요되니 기다려 주세요.');

        await getSwapData(true); //true = showEthGasFee
    }

    const showBlyBalance = async () => {
        alert('시간이 소요되니 기다려 주세요.');

        let {data: blyToBlctList} = await getNewBlyToBlctListBalance();
        await setList(blyToBlctList);
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

    //[이벤트] 그리드 로드 후 callback 이벤트
    const onGridReady = (params) => {
        //API init
        setGridApi(params.api);
    }


    return (
        <div className="m-2">

            <div className='m-2'>
                <h6> Manager 계좌 정보 </h6>
                <div className="d-flex ml-3 mb-4">
                    <div className="mr-4">
                        SwapManager ETH : <span style={styles.blueText}>{ComUtil.toEthCurrency(swapManagerEth)}</span> <br/>
                        SwapManager BLY : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(swapManagerBly)} </span> <br/>
                    </div>
                    <div className="ml-5">
                        Manager ONG : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(managerOng)}</span> <br/>
                        Manager BLCT : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(managerBlct)} </span> <br/>
                    </div>
                </div>
            </div>

            <div className="d-flex m-2">
                <div>총 입금합계</div>
                <div className="ml-3"><b>{ComUtil.toCurrency(totalBlctIn)}BLY</b></div>
            </div>

            <FilterContainer gridApi={gridApi} excelFileName={'토큰 입금 내역'} >
                <FilterGroup>
                    <InputFilter
                        gridApi={gridApi}
                        columns={[
                            {field: 'swapAccount', name: 'erc20 임시계정', width: 80},
                            {field: 'consumerNo', name: '소비자No', width: 140},
                            {field: 'consumerName', name: '이름'},
                            {field: 'consumerEmail', name: '이메일'},
                            {field: 'consumerPhone', name: '전화번호'},


                        ]}
                        isRealTime={true}
                    />
                </FilterGroup>
                <Hr/>
                <FilterGroup>
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'managerTransfered'}
                        name={'manager로 전송완료'}
                        data={[
                            {value: 0, name: '0 요청'},
                            {value: 1, name: '1 전송중'},
                            {value: 2, name: '2 전송완료'},
                        ]}
                    />
                    <CheckboxFilter
                        gridApi={gridApi}
                        field={'blctPaid'}
                        name={'swap 완료'}
                        data={[
                            {value: true, name: '성공'},
                            {value: false, name: '실패'},
                        ]}
                    />
                </FilterGroup>
            </FilterContainer>

            <div className="d-flex p-1">
                <ExcelDownload data={excelData}
                               fileName="토큰입금내역"
                               sheetName="토큰입금내역"
                />
                &nbsp;
                <Button color="secondary" onClick={() => showEthGasFeeRemained()}> Eth가스잔고 출력 </Button>
                <div className="ml-1">
                    <Button color="secondary" onClick={() => showBlyBalance()}> BLY잔액 출력 </Button>
                </div>
                <div className="flex-grow-1 text-right">
                    총 {blyToBlctList.length} 건
                </div>

            </div>


            <div
                className="ag-theme-balham mt-3"
                style={{
                    height: '800px'
                }}
            >
                <AgGridReact
                    // enableSorting={true}
                    // enableFilter={true}
                    columnDefs={agGrid.columnBlyToDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    // enableColResize={true}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    frameworkComponents={agGrid.frameworkComponents}
                    rowData={blyToBlctList}
                    //onRowClicked={selectRow}
                    onCellDoubleClicked={({value})=>ComUtil.copyTextToClipboard(value, '', '')}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
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
                                <ConsumerDetail
                                    consumerNo={selected && selected.consumerNo}
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

export default NewTokenSwapDepositList