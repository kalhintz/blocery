import styled from "styled-components";
import {color} from "~/styledComponents/Properties";
import {Div, Flex} from "~/styledComponents/shared/Layouts";
import {getValue} from "~/styledComponents/Util";

export const Copy = styled(Div)`
    background-color: ${color.background};
    
    padding: 3px 10px;
    cursor: pointer;
    border-radius: 4px;
    display: inline-block;
    position: relative;
   
    &:hover {
        &::after {
            content: 'copy';
            display: flex;
            align-items: center;
            justify-content: center;
            position: absolute;
            font-size: 9px;
            width: 30px;
            height: 15px;
            background-color: ${color.dark};
            color: white;
            top: -9px;
            right:0;
        }
    }
    
    &:active {
        color: ${color.primary};
    }
    
`;

export const FilterGroup = styled(Flex)`
    flex-wrap: wrap;
    margin: 10px 10px 0 10px;
`;