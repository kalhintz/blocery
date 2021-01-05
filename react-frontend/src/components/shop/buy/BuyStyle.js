import {Div, Flex} from "~/styledComponents/shared";
import styled from "styled-components";
import {getValue} from "~/styledComponents/Util";
import {color} from "~/styledComponents/Properties";
import React from "react";

export const ItemHeader = styled(Flex)`
    background-color: whitesmoke; 
    padding: 0 ${getValue(16)}; 
    height: ${getValue(54)};
    font-size: ${getValue(14)};
    border: 1px solid ${color.light};
    border-left: 0;
    border-right: 0;
    
    & > div:nth-child(1){
        font-weight: bold;
    }
    
    // & > div:nth-child(2){
    //     margin-left: auto;
    // }
`;

export const ItemDefaultBody = styled.div`
    // margin: ${getValue(16)};
    padding: ${getValue(16)};
`;

export const EditRow = styled(Div)`
    padding: ${getValue(4)};
    
    & > div:first-child {
        font-size: ${getValue(12)};
        color: ${color.green}; 
        line-height: ${getValue(20)};
    }
`;

export const PayInfoRow = styled.div`
    display: flex;
    align-items: center;
    font-size: ${getValue(12)};
    line-height: ${getValue(20)};
    margin: ${getValue(4)} 0;
    
    & > div:first-child {
        color: ${color.adjust};
    }
    
    & > div:last-child {
        margin-left: auto;
    }
`;