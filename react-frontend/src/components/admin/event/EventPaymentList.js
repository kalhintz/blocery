import React, { useState, useEffect } from 'react';
import { getB2cEventPaymentList } from '~/lib/adminApi'
import { AgGridReact } from 'ag-grid-react';
import "ag-grid-community/src/styles/ag-grid.scss";
import "ag-grid-community/src/styles/ag-theme-balham.scss";
import { Button } from 'reactstrap'
import { ExcelDownload } from '~/components/common'

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
                headerName: "미션11", field: "mission11", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,11);
                }
            },
            {
                headerName: "미션12", field: "mission12", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,12);
                }
            },
            {
                headerName: "미션13", field: "mission13", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,13);
                }
            },
            {
                headerName: "미션14", field: "mission14", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,14);
                }
            },
            {
                headerName: "미션15", field: "mission15", width:90,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlct(params.data.missionList,15);
                }
            },
            {
                headerName: "미션01~10합계", field: "missionBeforeTot", width:120,
                cellStyle:{"text-align":"right"},
                valueGetter: function(params) {
                    //console.log(params.data.missionList);
                    return getMissionItemBlctBefore10(params.data.missionList);
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

    }, [dataList]);

    useEffect(() => {

        async function getData() {
            const {data} = await getB2cEventPaymentList();
            // console.log("getB2cEventPaymentList",data);

            let r_toto_blct_sum = 0;
            let r_toto_f_sum = 0;
            let r_toto_bf01to10_sum = 0;
            data.map(item => {

                let v_finish_cnt = 0;
                let r_blct_sum = 0;
                item.missionList.map(itemMission => {

                    if(itemMission.missionNo < 11){
                        r_toto_bf01to10_sum = r_toto_bf01to10_sum + (itemMission.blct || 0);

                    }
                    if(itemMission.missionNo > 10){
                        r_toto_blct_sum = r_toto_blct_sum + (itemMission.blct || 0);
                        v_finish_cnt = v_finish_cnt + 1;
                    }

                });

                r_toto_f_sum = r_toto_f_sum + v_finish_cnt;


            });
            //console.log("r_toto_blct_sum",r_toto_blct_sum);
            setTotalBlct(r_toto_blct_sum);
            setTotalMissionFCnt(r_toto_f_sum);
            setDataList(data)
        }
        getData();

    }, []);

    const getMissionItemBlctBefore10 = (missionItems) => {
        let sum_blct = 0;

        missionItems.map(item => {
            if(item.missionNo < 11){
                sum_blct = sum_blct + (item.blct||0);
            }
        });
        return sum_blct;
    };

    const getMissionItemBlct = (missionItems,missionNo) => {
        let r_blct = "";
        missionItems.map(item => {
            if(item.missionNo === missionNo){
                r_blct = item.blct || "";
                return false;
            }
        });
        return r_blct;
    };

    const getMissionItemTotBlct = (missionItems) => {
        let r_toto_blct = 0;
        missionItems.map(item => {

            if(item.missionNo > 10) {
                r_toto_blct = r_toto_blct + (item.blct || 0);
            }
        });
        return r_toto_blct;
    };

    const setExcelData = async () => {
        let excelData = await getExcelData();
        setDataExcel(excelData);
    };

    const getExcelData = async() => {
        const columns = [
            'ID',
            '이름', 'account', '이벤트 총합', '첫번째 이벤트 총합'
        ];

        const data = dataList.map((item ,index)=> {
            const totalBlct = getMissionItemTotBlct(item.missionList);
            const total1stBlct = getMissionItemBlctBefore10(item.missionList);
            return [
                item.consumerNo,
                item.consumerName,
                item.consumerAccount,
                totalBlct, total1stBlct
            ]
        });

        // const result = await Promise.all(data)
        // console.log('result : ', result)

        return [{
            columns: columns,
            data: data
        }]
    };

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