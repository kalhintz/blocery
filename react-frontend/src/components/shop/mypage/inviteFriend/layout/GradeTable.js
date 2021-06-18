import React from 'react';
import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {Span} from "~/styledComponents/shared";

const Table = styled.table`
    width: 100%;
   font-size: 14px;
    & th {
        font-weight: 500;
    }
    & td {
        color: ${color.dark};
    }
    & th, td {
        border-bottom: 1px solid #ddd;
        text-align: center;
        padding: 10px 5px;
    }
    
    & th:first-child {
        text-align: left;
    }
    
    & td:first-child {
        text-align: left;
    }
    
    & tr:nth-child(4) {
        & td {
            color: ${color.green};
        }
    }
    
    & > tr:last-child {
        & td {
            border: 0;
        }
    }
    
    
`;

const GradeTable = (props) => {
    return (
        <Table>
            {/*<tr>*/}
            {/*    <th></th>*/}
            {/*    <th colSpan={3} >등급</th>*/}
            {/*</tr>*/}
            <tr>
                <th>항목</th>
                <th>Good</th>
                <th>Best</th>
                <th>Excellent</th>
            </tr>
            <tr>
                <td>기준</td>
                <td>1~49명</td>
                <td>50~99명</td>
                <td>100명~</td>
            </tr>
            <tr>
                <td>
                    친구초대 가입 적립금<br/>
                    {/*<Span fontSize={12}>(이벤트 종료 후 : 2/1 ~)</Span>*/}
                </td>
                <td>3,000원</td>
                <td>4,000원</td>
                <td>5,000원</td>
            </tr>
            {/*<tr>*/}
            {/*    <td>*/}
            {/*        친구초대 가입 적립금<br/>*/}
            {/*        <Span fontSize={12}>(이벤트 기간 내 : ~ 1/31)</Span>*/}
            {/*    </td>*/}
            {/*    <td>4,500원</td>*/}
            {/*    <td>6,000원</td>*/}
            {/*    <td>7,500원</td>*/}
            {/*</tr>*/}
            <tr>
                <td>친구 상품구매 적립금</td>
                <td>3%</td>
                <td>4%</td>
                <td>5%</td>
            </tr>
        </Table>
    );
};
export default GradeTable;
