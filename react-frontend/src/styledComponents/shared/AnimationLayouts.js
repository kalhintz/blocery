import React from 'react';
import styled, {css} from 'styled-components';
import {color, responsive} from '../Properties'
import {getValue, hasValue} from '../Util'
import {position, margin, padding, sticky, fixed, noti, notiNew, spin} from '../CoreStyles'
import aniKey from "~/styledComponents/Keyframes";
import {Div} from "~/styledComponents/shared/Layouts";

export const HeartBeat = styled(Div)`
    animation: ${props => props.play && aniKey.heartBeat} ${props => props.duration || '2'}s infinite;    
    animation-play-state: ${props => props.playState || 'running'};
`;

const AnimationLayouts = {
    HeartBeat
}

export default AnimationLayouts