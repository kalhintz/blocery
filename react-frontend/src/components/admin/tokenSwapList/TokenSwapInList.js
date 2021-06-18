import React, { useState, useEffect } from 'react';
import {getBlyToBlctList, getSwapManagerBlyBalance, getSwapManagerEthBalance, getTotalSwapBlctIn, getBlyBalanceByAccount, swapBlyToBlctByAccount, getBlyToBlctListWithBalance } from '~/lib/swapApi';

import { scOntGetBalanceOfBlctAdmin, scOntGetManagerOngBalance } from '~/lib/smartcontractApi';
import { AgGridReact } from 'ag-grid-react';
// import "ag-grid-community/src/styles/ag-grid.scss";
// import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties';
import axios from 'axios';
import {Button, Modal, ModalBody, ModalFooter, ModalHeader} from 'reactstrap'
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import loadable from "@loadable/component";
import {Span} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
const ConsumerDetail = loadable(() => import('~/components/common/contents/ConsumerDetail'));
const TokenSwapInList = (props) => {
    function nameRenderer({value, data}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, data)}><u>{value}</u></Span>
    }
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()
    const [agGrid, setAgGrid] = useState({
        columnBlyToDefs: [
            {headerName: "erc20 임시계정", width: 380, field: "swapAccount"},
            {headerName: "소비자번호", width: 100, field: "consumerNo"},
            {headerName: "이름", width: 150, field: "consumerName", cellRenderer: "nameRenderer"},
            {headerName: "어뷰징", width: 100, field: "consumerNo", cellRenderer: 'abuserRenderer'},
            {headerName: "소비자 이메일주소", width: 170, field: "consumerEmail"},
            {headerName: "소비자 전화번호", width: 150, field: "consumerPhone"},
            {headerName: "임시계정 발급시각", width: 150, field: "allocateTime", cellRenderer: 'formatDateRenderer'},
            {headerName: "입금완료토큰", width: 110, field: "blyAmount", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
            // {headerName: "내부 BLY로 송금된 토큰", width: 160, field: "blctPayAmount", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "swap 완료", width: 100, field: "blctPayed", cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "swap 완료시각", width: 140, field: "blctPayedTime", cellRenderer: 'formatDateRenderer'},
            {headerName: "BLY 잔고", width: 130, field: "blyBalance", cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "manager전송 완료", width: 140, field: "managerTransfered", cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "manager전송 시각", width: 140, field: "managerTransferedTime", cellRenderer: 'formatDateRenderer'},
            {headerName: "manager전송 토큰양", width: 150, field: "managerTransferedBly", cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "ETH가스잔고", width: 130, field: "ethBalance"},
            {headerName: "allocateDay", width: 110, field: "allocateDay", cellStyle:getCellStyle({cellAlign: 'center'})},
            {headerName: "수동 입금처리", width: 120, field: "ethBalance", cellRenderer: "manualSwapRenderer"},
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
            manualSwapRenderer: manualSwapRenderer
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
    const [completeCount, setCompleteCount] = useState();
    //const [showEthGasFee, setShowEthGasFee] = useState(false);

    useEffect(() => {
        getSwapData(); //default showEthGasFee=false
        getManagerData();

    }, []);

    // useEffect(() => {
    //
    // }, [blyToBlctList])

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

    const getSwapData = async(showEthGasFee) => {
        let {data: blyToBlctList} = await getBlyToBlctList(showEthGasFee);
        // console.log(blyToBlctList);
        await setList(blyToBlctList);
    }

    const setList = async(blyToBlctList) => {
        blyToBlctList.map((item, index, arr) => item.swapClick = function ()  {
            {
                manualSwap(arr, item);
            }
        })

        setBlyToBlctList(blyToBlctList);
        let completeCount = 0;
        blyToBlctList.map(item => {
            if(item.blctPayed) {
                completeCount++;
            }
        })
        setCompleteCount(completeCount);

        setExcelDataFunc(blyToBlctList);
        const {data:swapBlctIn} = await getTotalSwapBlctIn();

        setTotalBlctIn(swapBlctIn);
    }

    const setExcelDataFunc = (data) => {
        let excelData = getExcelData(data);
        // console.log(excelData);
        setExcelData(excelData);
    }

    const getExcelData = (dataList) => {
        const columns = [
            'erc20 임시계정', '소비자 번호','소비자 이메일주소', '임시계정 발급시각', '입금완료토큰', '내부 BLY로 송금된 토큰', 'swap 완료여부', 'swap 완료시각', 'BLY잔액',
            'ETH가스잔고', 'manager에게 전송 완료여부', 'manager에게 전송시각', 'manager에게 전송된 토큰 양'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.map((item ,index)=> {
            // console.log('excelData : ' , item);
            let allocateTime = (item.allocateTime !== null) ? ComUtil.utcToString(item.allocateTime, 'YYYY-MM-DD HH:mm:ss ') : '-';
            let blctPayedTime = (item.blctPayedTime !== null) ? ComUtil.utcToString(item.blctPayedTime, 'YYYY-MM-DD HH:mm:ss ') : '-';
            let managerTransferedTime = (item.managerTransferedTime !== null) ? ComUtil.utcToString(item.managerTransferedTime, 'YYYY-MM-DD HH:mm:ss ') : '-';

            return [
                item.swapAccount, item.consumerNo, item.consumerEmail, allocateTime, item.blyAmount, item.blctPayAmount, item.blctPayed, blctPayedTime, item.blyBalance,
                item.ethBalance, item.managerTransfered, managerTransferedTime, item.managerTransferedBly
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

        let {data: blyToBlctList} = await getBlyToBlctListWithBalance();
        await setList(blyToBlctList);
    }

    const manualSwap = async(list, data) => {
        console.log("manualSwap : ", data);

        let {data:balance} = await getBlyBalanceByAccount(data.swapAccount);
        console.log("balance : ", balance);
        // 이 balance에서 이미 리스트에 blctPayed == true 이고 managerTransfered == false 인 금액들을 빼고 난 금액을 입금처리 해야함....
        let alreadyPaid = 0;
        list.filter(item => {
            if(item.swapAccount.includes(data.swapAccount) && item.blctPayed && !item.managerTransfered) {
                alreadyPaid = alreadyPaid + parseFloat(item.blyAmount);
                return item
            }
        } );

        // console.log(accountList);
        console.log("alreadyPaid : ", alreadyPaid);
        let swapAmount = balance - alreadyPaid;
        if(swapAmount <= 0) {
            alert("입금확인할 잔액이 없습니다");
            return ;
        }

        let payConfirm = window.confirm(swapAmount + 'BLY를 입금처리하시겠습니까?');
        if(payConfirm) {
            let {data:result} = await swapBlyToBlctByAccount(data.consumerNo, data.swapAccount, swapAmount);

            let resultText = "입금처리가 완료되었습니다.";
            switch (result) {
                case 102:
                    resultText = "해당 account가 이미 입금처리되었습니다.";
                    break;
                case 100 :
                    resultText = "이미 토큰스왑이 진행중입니다. 결과를 기다려주세요.";
                    break;
                case 101 :
                    resultText = "입금중 중 오류가 발생했습니다. 다시 시도해주세요.";
                    break;
            }

            alert(resultText);
            if(result === 200) {
                getSwapData(); //default showEthGasFee=false
            }
        }

    }

    function manualSwapRenderer({value, data:rowData}) {

        // console.log(rowData);
        if(!rowData.blctPayed || null === rowData.allocateTime) // blct 전송 완료 안된건 사용자가 직접 하도록 버튼노출 안함. (admin의 버튼은 SwapErcHistory용으로만 사용)
            return null;

        return(
            <Button size={'sm'} color={'info'}
                    onClick={() => rowData.swapClick()}> 입금확인
                    {/*// onClick={ () => manualSwap(rowData)}> 입금확인*/}
            </Button>
        )
    }

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

    const styles = {
        redText : { color: 'red' },
        blueText : { color: 'blue' },
        blackText : { color: 'black' }
    };

    const copy = ({value}) => {
        ComUtil.copyTextToClipboard(value, '', '');
    }

    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onNameClick = (item) => {
        setSelected(item)
        toggle()
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
                    총 {completeCount} 건
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
                    onCellDoubleClicked={copy}
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

export default TokenSwapInList