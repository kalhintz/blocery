import React from 'react';
import styled, {css} from 'styled-components';
import {color, activeColor} from '../Properties'
import {Div} from '../shared/Layouts'
import {getValue}  from '../Util'

export const Badge = styled(Div)`
    font-size: ${props => getValue(props.fontSize) || getValue(10)};
    border-radius: ${props => getValue(props.rounded) || getValue(4)};
    padding: 2px 5px;
`;