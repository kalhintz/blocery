import React, { useState, useEffect } from 'react';
import {getBlctToBlyList, getSwapManagerBlyBalance, getSwapManagerEthBalance, getTotalSwapBlctToBly } from '~/lib/swapApi';
import { scOntGetBalanceOfBlct, scOntGetManagerOngBalance } from '~/lib/smartcontractApi';
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { ExcelDownload } from '~/components/common'
import ComUtil from '~/util/ComUtil'
import { Server } from '~/components/Properties';
import axios from 'axios';

const TokenSwapOutList = (props) => {

    const [agGrid, setAgGrid] = useState({
        columnBlctToDefs: [
            {headerName: "No", width: 60, field: "swapBlctToBlyNo"},
            // {headerName: "소비자번호", width: 100, field: "consumerNo"},
            {headerName: "소비자 이메일주소", width: 200, field: "consumerEmail"},
            {headerName: "Swap 요청 시각", width: 170, field: "swapTimestamp", cellRenderer: 'formatDateRenderer'},
            {headerName: "받은 BLY(oep4) ", width: 140, field: "blctAmount", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "출금한 BLY(erc20)", width: 150, field: "blyAmount", cellRenderer: 'formatCurrencyRenderer'},
            {headerName: "외부 송금Account", width: 350, field: "blyExtAccount"},
            {headerName: "swap 완료", width: 100, field: "blyPaid"},
            {headerName: "txHash", width: 500, field: "txHash"},

        ],

        defaultColDef: {
            width: 170,
            resizable: true
        },
        frameworkComponents: {
            formatCurrencyRenderer: formatCurrencyRenderer,
            formatDateRenderer: formatDateRenderer
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [blctToBlyList, setBlctToBlyList] = useState([]);
    const [totalBlctOut, setTotalBlctOut] = useState();

    const [managerOng, setManagerOng] = useState();
    const [managerBlct, setManagerBlct] = useState();
    const [swapManagerBly, setSwapManagerBly] = useState();
    const [swapManagerEth, setSwapManagerEth] = useState();
    const [excelData, setExcelData] = useState();

    useEffect(() => {
        getSwapData();
        getManagerData();

    }, []);

    // useEffect(() => {
    //
    // }, [blyToBlctList])

    const getManagerData = async() => {
        // await getBaseAccount();
        await getManagerBalances();
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
        console.log('manager Account : ' , managerAccount);

        let {data:managerOng} = await scOntGetManagerOngBalance();
        let {data:managerBlct} = await scOntGetBalanceOfBlct(managerAccount);
        let { data:swapManagerBly } = await getSwapManagerBlyBalance();
        let { data:swapManagerEth } = await getSwapManagerEthBalance();

        setManagerBlct(managerBlct);
        setManagerOng(managerOng);
        setSwapManagerBly(swapManagerBly);
        setSwapManagerEth(swapManagerEth);
    };

    const getSwapData = async() => {
        const {data: blctToBlyList} = await getBlctToBlyList();
        setBlctToBlyList(blctToBlyList);

        setExcelDataFunc(blctToBlyList);


        const {data:swapBlctToBly} = await getTotalSwapBlctToBly();
        setTotalBlctOut(swapBlctToBly.blctSum)
    }


    const setExcelDataFunc = (data) => {
        let excelData = getExcelData(data);
        // console.log(excelData);
        setExcelData(excelData);
    }

    const getExcelData = (dataList) => {
        const columns = [
            'No', '소비자 이메일주소', 'Swap 요청 시각', '받은 BLY(oep4)', '출금한 BLY(erc20)', '외부 송금Account', 'swap 완료여부', 'txHash'
        ]

        //필터링 된 데이터에서 sortedData._original 로 접근하여 그리드에 바인딩 원본 값을 가져옴
        const data = dataList.map((item ,index)=> {
            return [
                item.swapBlctToBlyNo, item.consumerEmail, item.swapTimestamp, item.blctAmount, item.blyAmount, item.blyExtAccount, item.blyPaid, item.txHash
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

    const styles = {
        redText : { color: 'red' },
        blueText : { color: 'blue' },
        blackText : { color: 'black' }
    };

    return (
        <div className="m-2">

            <div className='m-2'>
                <h6> Manager 계좌 정보 </h6>
                <div className="ml-3 mb-1">
                    SwapManager Account : 0x4E28710830e2c910238F60CB03233c91A16f4087
                </div>
                <div className="d-flex ml-3 mb-4">
                    <div className="mr-4">
                        SwapManager ETH : <span style={styles.blueText}>{ComUtil.toCurrency(swapManagerEth)}</span> <br/>
                        SwapManager BLY : <span style={styles.blueText}>{ComUtil.toCurrency(swapManagerBly)} </span> <br/>
                    </div>
                    <div className="ml-5">
                        Manager ONG : <span style={styles.blueText}>{ComUtil.toCurrency(managerOng)}</span> <br/>
                        Manager BLCT : <span style={styles.blueText}>{ComUtil.toCurrency(managerBlct)} </span> <br/>
                    </div>
                </div>
            </div>

            <div className="d-flex m-2">
                <div>총 출금합계</div>
                <div className="ml-3"><b>{ComUtil.toCurrency(totalBlctOut)}BLY</b></div>
            </div>


            <div className="d-flex p-1">
                <ExcelDownload data={excelData}
                               fileName="토큰출금내역"
                               sheetName="토큰출금내역"
                />

                <div className="flex-grow-1 text-right">
                    총 {blctToBlyList.length} 건
                </div>

            </div>


            <div
                className="ag-theme-balham mt-3"
                style={{
                    height: '800px'
                }}
            >
                <AgGridReact
                    enableSorting={true}
                    enableFilter={true}
                    columnDefs={agGrid.columnBlctToDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    enableColResize={true}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    frameworkComponents={agGrid.frameworkComponents}
                    rowData={blctToBlyList}
                    //onRowClicked={selectRow}
                />
            </div>

        </div>
    )

}

export default TokenSwapOutList