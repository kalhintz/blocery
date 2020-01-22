import React, { useState, useEffect } from 'react';
import { getB2cEventPaymentList } from '~/lib/adminApi'
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import { Button } from 'reactstrap'
import { ExcelDownload } from '~/components/common'
import { scOntGetBalanceOfBlct } from '~/lib/smartcontractApi';

const EventPaymentList = (props) => {

    const [agGrid, setAgGrid] = useState({
        columnDefs: [
            {headerName: "ID", field: "consumerNo", width:60},
            {headerName: "이름", field: "consumerName", width:100},
            {headerName: "account", field: "consumerAccount", width:170},
            {headerName: "연락처", field: "consumerPhone", width:120},
            {headerName: "Email", field: "consumerEmail", width:170},
            {
                headerName: "지급BLCT", field: "totBlct", width:100,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemTotBlct(params.data.missionList);
                }
            },
            {
                headerName: "미션01", field: "mission01", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,1);
                }
            },
            {
                headerName: "미션02", field: "mission02", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,2);
                }
            },
            {
                headerName: "미션03", field: "mission03", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,3);
                }
            },
            {
                headerName: "미션04", field: "mission04", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,4);
                }
            },
            {
                headerName: "미션05", field: "mission05", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,5);
                }
            },
            {
                headerName: "미션06", field: "mission06", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,6);
                }
            },
            {
                headerName: "미션07", field: "mission07", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,7);
                }
            },
            {
                headerName: "미션08", field: "mission08", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,8);
                }
            },
            {
                headerName: "미션09", field: "mission09", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,9);
                }
            },
            {
                headerName: "미션10", field: "mission10", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,10);
                }
            }
        ],
        defaultColDef: {
            width: 100,
            resizable: true
        },
        overlayLoadingTemplate: '<span class="ag-overlay-loading-center">...로딩중입니다...</span>',
        overlayNoRowsTemplate: '<span class="ag-overlay-loading-center">조회된 내역이 없습니다</span>',
    })

    const [dataList, setDataList] = useState([]);

    const [totalBlct, setTotalBlct] = useState(0);

    const [totalMissionFCnt, setTotalMissionFCnt] = useState(0);

    const [excelData, setDataExcel] = useState([]);

    useEffect(()=> {
        // console.log('useEffect dataList : ', dataList)

        async function excelData() {
            await setExcelData();
        }

        excelData();

    }, [dataList])

    useEffect(() => {

        async function getData() {
            const {data} = await getB2cEventPaymentList();
            // console.log("getB2cEventPaymentList",data);

            let r_toto_blct_sum = 0;
            let r_toto_f_sum = 0;
            data.map(item => {
                item.missionList.map(itemMission => {
                    r_toto_blct_sum = r_toto_blct_sum + (itemMission.blct || 0);
                });

                r_toto_f_sum = r_toto_f_sum + (item.missionList.length || 0);
            });
            //console.log("r_toto_blct_sum",r_toto_blct_sum);
            setTotalBlct(r_toto_blct_sum);
            setTotalMissionFCnt(r_toto_f_sum);
            setDataList(data)
        }
        getData();

    }, []);

    const getMissionItemBlct = (missionItems,missionNo) => {
        let r_blct = "";
        missionItems.map(item => {
            if(item.missionNo === missionNo){
                r_blct = item.blct || "";
                return false;
            }
        })
        return r_blct;
    }
    const getMissionItemTotBlct = (missionItems) => {
        let r_toto_blct = 0;
        missionItems.map(item => {
            r_toto_blct = r_toto_blct + (item.blct || 0);
        });
        return r_toto_blct;
    }

    const getBlctBalance = async(account) => {
        let balance = await scOntGetBalanceOfBlct(account);
        return balance;
    }

    const setExcelData = async () => {
        let excelData = await getExcelData();
        setDataExcel(excelData);
    }

    const getExcelData = async() => {
        const columns = [
            'ID',
            '이름', 'account', '이벤트 총합', 'Balance'
        ]

        const data = dataList.map( async(item ,index)=> {
            const totalBlct = getMissionItemTotBlct(item.missionList)
            const {data:balance} = await getBlctBalance(item.consumerAccount);
            console.log(item.consumerNo, '  ', balance);
            return [
                item.consumerNo,
                item.consumerName,
                item.consumerAccount,
                totalBlct,
                balance
            ]
        })

        const result = await Promise.all(data)
        // console.log('result : ', result)

        return [{
            columns: columns,
            data: result
        }]
    }

    return (
        <div>
            <div className="d-flex"> <div>총 지급된 BLCT : {totalBlct} , 완료 : {totalMissionFCnt} 건</div>

                <div className="ml-2">
                    <ExcelDownload data={excelData}
                                   button={<Button color={'success'} size={'sm'} block>
                                       <div>
                                           엑셀 다운로드
                                       </div>
                                   </Button>}/>
                </div>

            </div>

            <div
                className="ag-theme-balham"
                style={{
                    height: '700px'
                }}
            >
                <AgGridReact
                    enableSorting={true}
                    enableFilter={true}
                    columnDefs={agGrid.columnDefs}
                    defaultColDef={agGrid.defaultColDef}
                    rowSelection={'single'}  //멀티체크 가능 여부
                    enableColResize={true}
                    overlayLoadingTemplate={agGrid.overlayLoadingTemplate}
                    overlayNoRowsTempalte={agGrid.overlayNoRowsTemplate}
                    rowData={dataList}
                    //onRowClicked={selectRow}
                />
            </div>
        </div>
    )
}

export default EventPaymentList