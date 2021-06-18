import React from 'react';
 
import styled, {css} from 'styled-components';
import {color} from '../Properties'
import {getValue} from '../Util'
import * as core from '../CoreStyles'

const BasicInput = styled.input`

    ${props => props.width && css`width: ${getValue(props.width)};`}
    height: ${props => props.height ? getValue(props.height) : '40px;'};
    box-sizing: border-box;
    color: ${color.black};
    border-radius: ${props => props.rounded ? getValue(props.rounded) : getValue(5)};
    
    border: solid 1px #e1e1e1;
    padding: ${props => props.padding || '0 13px'};        
    ${props => props.bold && `
        font-weight: bold;
    `}
    
    font-size: ${props => getValue(props.fontSize) || '14px'};


    ${core.margin};
    ${core.padding};

    &::placeholder {
        color: #b9b9b9;        
    }
    &:focus {
        outline: none;
    }
`;


//override
export const Input = styled(BasicInput)`    
    ${props => props.green && `
        border: 1px solid ${color.green};
    `}
    ${props => props.underLine && `
        border-radius: 0;
        border-top: 0;
        border-right: 0;
        border-left: 0;
    `}    
    ${props => props.readOnly && `
        background-color: #f8f8f8;
    `}

    ${props => props.block && `
        width: 100%;
    `}

`;