import React, { useState, useEffect } from 'react';
import AbuserRenderer from "~/components/common/agGridRenderers/AbuserRenderer";
import ComUtil from "~/util/ComUtil";
import {ExcelDownload, ModalConfirm} from "~/components/common";
import {Button, Table, Modal, ModalBody, ModalFooter, ModalHeader} from "reactstrap";
import {AgGridReact} from "ag-grid-react";
import {getDonAirdrops, getBalanceOfManagerDon, getManagerIGas, getSwapManagerDonBalance, donTransferAdminOk, ircDonTransferAdminOk} from "~/lib/adminApi"
import loadable from "@loadable/component";
import {Hr, Span} from "~/styledComponents/shared";
import {useModal} from "~/util/useModal";
import {getSwapManagerBlyBalance, getSwapManagerEthBalance, getEthGasPrice} from "~/lib/swapApi";
const ConsumerDetail = loadable(() => import('~/components/common/contents/ConsumerDetail'));
const DonAirDropList = (props) => {

    function nameRenderer({value, data}) {
        return <Span fg={'primary'} onClick={onNameClick.bind(this, data)}><u>{value}</u></Span>
    }
    const [gridApi, setGridApi] = useState(null);
    const [modalOpen, setModalOpen, selected, setSelected, setModalState] = useModal()

    const [agGrid, setAgGrid] = useState({
        columnBlyToDefs: [
            {
                headerName: "소비자",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "소비자No", width: 100, field: "consumerNo"},
                    {headerName: "이름", width: 100, field: "name", cellRenderer: "nameRenderer"},
                    {headerName: "어뷰징", width: 100, field: "abuser",
                        suppressFilter: true,   //no filter
                        suppressSorting: true,  //no sort
                        cellRenderer: "abuserRenderer"},
                    {headerName: "전화번호", width: 120, field: "phone"}
                ]
            },
            {
                headerName: "DON 출금",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "출금여부", width: 90, field: "withdrawStatus", cellRenderer: 'withdrawStatusRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "IRC출금여부", width: 120, field: "ircWithdrawStatus", cellRenderer: 'ircWithdrawStatusRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "출금요청금액", width: 120, field: "donAmount", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "출금요청시간", width: 120,field: "donWithdrawTime", cellRenderer: 'formatDateRenderer', cellStyle:getCellStyle({cellAlign: 'left'})},
                    {headerName: "송금완료시간", width: 120,field: "donPaidTime", cellRenderer: 'formatDateRenderer', cellStyle:getCellStyle({cellAlign: 'left'})},
                    {headerName: "송금계좌(ERC20)", width: 150,field: "donExtAccount", cellStyle:getCellStyle({cellAlign: 'left'})},
                    {headerName: "송금계좌(IRC20)", width: 150,field: "donExtIrcAccount", cellStyle:getCellStyle({cellAlign: 'left'})},
                    {headerName: "txHash", width:100, field:"txHash", cellStyle:getCellStyle({cellAlign: 'left'})},
                    {headerName: "IRCMemo", width:100, field:"ircMemo", cellStyle:getCellStyle({cellAlign: 'left'})}
                ]
            },
            {
                headerName: "Total",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Don", width: 110, field: "donTotal", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.20",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0220", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0220", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.21",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0221", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0221", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.22",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0222", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0222", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.23",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0223", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0223", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.24",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0224", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0224", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.25",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0225", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0225", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.26",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0226", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0226", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.27",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0227", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0227", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "02.28",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0228", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0228", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "03.01",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "Bly", width: 100, field: "bly0301", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})},
                    {headerName: "Don", width: 100, field: "don0301", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            },
            {
                headerName: "03.02 가중치",
                cellStyle: getCellStyle,
                children: [
                    {headerName: "donWeight", width: 150, field: "don0302Weight", cellRenderer: 'formatCurrencyRenderer', cellStyle:getCellStyle({cellAlign: 'center'})}
                ]
            }
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
            withdrawStatusRenderer: withdrawStatusRenderer,
            ircWithdrawStatusRenderer: ircWithdrawStatusRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })
    const [swapManagerDon, setSwapManagerDon] = useState();
    const [swapManagerEth, setSwapManagerEth] = useState();
    const [ethGasPrice, setEthGasPrice] = useState();

    const [balanceOfManagerDon, setBalanceOfManagerDon] = useState();
    const [managerIGas, setManagerIGas] = useState();

    const [donAirdropsList, setDonAirdropsList] = useState([]);

    const [donAirdropTotal, setDonAirdropTotal] = useState({
        don0220:0, don0221:0, don0222:0, don0223:0, don0224:0, don0225:0, don0226:0, don0227:0, don0228:0, don0301:0, don0302Weight:0, donTotal:0
    });

    const [excelData, setExcelData] = useState();

    useEffect(() => {
        getManagerData();
        getDonAirDropDataList();
    }, []);

    //[이벤트] 그리드 로드 후 callback 이벤트 API init
    const onGridReady = params => {
        setGridApi(params.api);
    };

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

    /////////cell Renderer
    function formatCurrencyRenderer({value, data:rowData}) {
        return ComUtil.addCommas(value);
    }

    //Ag-Grid Cell 날짜변환 렌더러
    function formatDateRenderer({value, data:rowData}) {
        if(value !== null) {
            return ComUtil.utcToString(value, 'YYYY-MM-DD HH:mm:ss ')
        } else {
            return '';
        }
    }

    // DON 출금 승인 처리
    const onClickWithDrawReg = async (rowData, confirmed) => {
        if(confirmed) {
            const consumerNo = rowData.consumerNo;
            const {data} = await donTransferAdminOk(consumerNo);
            if(data) {
                alert(data);
            }
            search();
        }
    }

    // IRC DON 출금 승인 처리
    const onClickIrcWithDrawReg = async (rowData, confirmed) => {
        if(confirmed) {
            const consumerNo = rowData.consumerNo;
            const {data} = await ircDonTransferAdminOk(consumerNo);
            if(data) {
                alert(data);
            }
            search();
        }
    }

    // DON출금상태 렌더러
    //1:승인필요 2:승인완료  (3:출금완료로도 일단 사용))
    function withdrawStatusRenderer({value, data:rowData}) {
        if(rowData.donExtAccount){
            if(value === 1) {
                return <ModalConfirm title={`${rowData.name}(${rowData.consumerNo}) DON 출금 승인 처리`} content={<div>{rowData.donTotal} DON 출금을 승인 처리하시겠습니까?</div>} onClick={onClickWithDrawReg.bind(this, rowData)}>
                    <Button size='sm' color='info'>승인필요</Button>
                </ModalConfirm>
            } else if(value === 2) {
                return '승인완료'
            } else if(value === 3) {
                return '출금완료'
            } else  {
                return '미완료'
            }
        }else{
            return ''
        }
    }

    // IRC DON출금상태 렌더러
    //1:승인필요 2:승인완료  (3:출금완료로도 일단 사용))
    function ircWithdrawStatusRenderer({value, data:rowData}) {
        if(rowData.donExtIrcAccount) {
            if (value === 1) {
                return <ModalConfirm title={`${rowData.name}(${rowData.consumerNo}) IRC DON 출금 승인 처리`}
                                     content={<div>{rowData.donTotal} IRC DON 출금을 승인 처리하시겠습니까?</div>}
                                     onClick={onClickIrcWithDrawReg.bind(this, rowData)}>
                    <Button size='sm' color='info'>승인필요</Button>
                </ModalConfirm>
            } else if (value === 2) {
                return '승인완료'
            } else if (value === 3) {
                return '출금완료'
            } else {
                return '미완료'
            }
        }else{
            return ''
        }
    }


    const getManagerData = async() => {
        await getManagerBalances();
    }
    const getManagerBalances = async() => {
        const { data:swapManagerDon } = await getSwapManagerDonBalance();
        const { data:swapManagerEth } = await getSwapManagerEthBalance();
        const { data:ethGasGwei } = await getEthGasPrice();


        const { data:balanceOfManagerDonData } = await getBalanceOfManagerDon();
        const { data:managerIGasData } = await getManagerIGas();


        setSwapManagerDon(swapManagerDon);
        setSwapManagerEth(swapManagerEth);
        setEthGasPrice(ethGasGwei)

        setBalanceOfManagerDon(balanceOfManagerDonData)
        setManagerIGas(managerIGasData)
    }

    const search = async () => {
        getManagerData();
        getDonAirDropDataList();
    }

    const getDonAirDropDataList = async () => {
        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 보이기
            gridApi.showLoadingOverlay();
        }
        const {data} = await getDonAirdrops();
        setDonAirdropsList(data);
        setExcelDataFunc(data);
        setDonAirdropTotalFunc(data);

        //ag-grid api
        if(gridApi) {
            //ag-grid 레이지로딩중 감추기
            gridApi.hideOverlay()
        }
    }

    const setDonAirdropTotalFunc = (data) => {

        let tDon0220=0, tDon0221=0, tDon0222=0, tDon0223=0, tDon0224=0, tDon0225=0, tDon0226=0, tDon0227=0, tDon0228=0, tDon0301=0, tDon0302Weight=0, tDonTotal=0;
        data.map((item ,index)=> {
            tDon0220 = tDon0220 + item.don0220;
            tDon0221 = tDon0221 + item.don0221;
            tDon0222 = tDon0222 + item.don0222;
            tDon0223 = tDon0223 + item.don0223;
            tDon0224 = tDon0224 + item.don0224;
            tDon0225 = tDon0225 + item.don0225;
            tDon0226 = tDon0226 + item.don0226;
            tDon0227 = tDon0227 + item.don0227;
            tDon0228 = tDon0228 + item.don0228;
            tDon0301 = tDon0301 + item.don0301;
            tDon0302Weight = tDon0302Weight + item.don0302Weight;
            tDonTotal = tDonTotal + item.donTotal;
        })

        setDonAirdropTotal({
            don0220:tDon0220, don0221:tDon0221, don0222:tDon0222, don0223:tDon0223, don0224:tDon0224, don0225:tDon0225,
            don0226:tDon0226, don0227:tDon0227, don0228:tDon0228, don0301:tDon0301, don0302Weight:tDon0302Weight,
            donTotal: tDonTotal
        })
    }

    const setExcelDataFunc = (data) => {
        let excelData = getExcelData(data);
        setExcelData(excelData);
    }

    const getExcelData = (dataList) => {
        const columns = [
            '소비자 번호', '이름', '전화번호',
            'don출금여부','ircDon출금여부','don출금요청금액', 'don출금요청시간', '송금완료시간', '송금계좌(ERC20)', '송금계좌(IRC20)', 'txHash',
            'donTotal',
            'bly0220', 'don0220', 'bly0221', 'don0221', 'bly0222', 'don0222', 'bly0223', 'don0223', 'bly0224', 'don0224', 'bly0225', 'don0225',
            'bly0226', 'don0226', 'bly0227', 'don0227', 'bly0228', 'don0228', 'bly0301', 'don0301', 'don0302Weight'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.map((item ,index)=> {

            const donWithdrawTime = (item.donWithdrawTime !== null) ? ComUtil.utcToString(item.donWithdrawTime, 'YYYY-MM-DD HH:mm:ss ') : '';
            let withdrawStatus = '';
            if(item.donExtAccount) {
                if (item.withdrawStatus === 1) {
                    withdrawStatus = '승인필요'
                } else if (item.withdrawStatus === 2) {
                    withdrawStatus = '승인완료'
                } else if (item.withdrawStatus === 3) {
                    withdrawStatus = '출금완료'
                } else {
                    withdrawStatus = '미완료'
                }
            }

            let ircWithdrawStatus = '';
            if(item.donExtIrcAccount) {
                if (item.ircWithdrawStatus === 1) {
                    ircWithdrawStatus = '승인필요'
                } else if (item.ircWithdrawStatus === 2) {
                    ircWithdrawStatus = '승인완료'
                } else if (item.ircWithdrawStatus === 3) {
                    ircWithdrawStatus = '출금완료'
                } else{
                    ircWithdrawStatus = ''
                }
            }

            const donPaidTime = (item.donPaidTime !== null) ? ComUtil.utcToString(item.donPaidTime, 'YYYY-MM-DD HH:mm:ss ') : '';

            return [
                item.consumerNo, item.name, item.phone,
                withdrawStatus, ircWithdrawStatus, item.donAmount, donWithdrawTime, donPaidTime, item.donExtAccount, item.donExtIrcAccount, item.txHash,
                item.donTotal,
                item.bly0220, item.don0220, item.bly0221, item.don0221, item.bly0222, item.don0222, item.bly0223, item.don0223, item.bly0224, item.don0224, item.bly0225, item.don0225,
                item.bly0226, item.don0226, item.bly0227, item.don0227, item.bly0228, item.don0228, item.bly0301, item.don0301, item.don0302Weight
            ]
        })

        return [{
            columns: columns,
            data: data
        }]
    }


    const toggle = () => {
        setModalState(!modalOpen)
    }

    const onNameClick = (item) => {
        setSelected(item)
        toggle()
    }

    const styles = {
        redText : { color: 'red' },
        blueText : { color: 'blue' },
        blackText : { color: 'black' }
    };

    return (
        <div className="m-2">


            <Table bordered style={{fontSize:'8pt'}}>
                <tr>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0220 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0221 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0222 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0223 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0224 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0225 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0226 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0227 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0228 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0301 </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON0302 Weight </td>
                    <td width="100px" bgcolor="#F3F3F3" align="center" valign="middle" > DON Total </td>
                </tr>
                <tr>
                    <td align="center"> {donAirdropTotal.don0220}</td>
                    <td align="center"> {donAirdropTotal.don0221}</td>
                    <td align="center"> {donAirdropTotal.don0222}</td>
                    <td align="center"> {donAirdropTotal.don0223}</td>
                    <td align="center"> {donAirdropTotal.don0224}</td>
                    <td align="center"> {donAirdropTotal.don0225}</td>
                    <td align="center"> {donAirdropTotal.don0226}</td>
                    <td align="center"> {donAirdropTotal.don0227}</td>
                    <td align="center"> {donAirdropTotal.don0228}</td>
                    <td align="center"> {donAirdropTotal.don0301}</td>
                    <td align="center"> {donAirdropTotal.don0302Weight}</td>
                    <td align="center"> {donAirdropTotal.donTotal}</td>
                </tr>
            </Table>

            <div className="d-flex p-1">
                <ExcelDownload data={excelData}
                               fileName="DonAirDrop내역"
                               sheetName="DonAirDrop내역"
                />
                &nbsp;
                <div className="mr-4">
                    SwapManager ETH : <span style={styles.blueText} className="mr-4">{ComUtil.toEthCurrency(swapManagerEth)}</span>
                    SwapManager DON : <span style={styles.blueText} className="mr-4">{ComUtil.toIntegerCurrency(swapManagerDon)}</span>
                    EthGasGwei : <span style={ ethGasPrice >= 250 ? styles.redText:styles.blueText} className="mr-4">{ComUtil.toIntegerCurrency(ethGasPrice)}</span>
                    BalanceOfManagerDon : <span style={styles.blueText} className="mr-4">{ComUtil.toIntegerCurrency(balanceOfManagerDon)}</span>
                    ManagerIGas : <span style={styles.blueText}>{ComUtil.toIntegerCurrency(managerIGas)}</span>
                </div>
                <div className="mr-4">
                    <Button color="primary" onClick={search}>재검색(스왑매니저 잔액 및 DON 출금내역)</Button>
                </div>
                <div className="flex-grow-1 text-right">
                    총 {donAirdropsList.length} 건
                </div>

            </div>


            <div
                className="ag-theme-balham mt-3"
                style={{
                    height: '500px'
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
                    rowData={donAirdropsList}
                    onGridReady={onGridReady}   //그리드 init(최초한번실행)
                    onCellDoubleClicked={({value})=>ComUtil.copyTextToClipboard(value, '', '')}
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

export default DonAirDropList