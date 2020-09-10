import React from 'react';
import styled, {css} from 'styled-components';
import {color, responsive} from '../Properties'
import {getValue} from '../Util'
import {position, margin, padding, sticky, fixed, noti, notiNew} from '../CoreStyles'


const defaultStyle = css`
    width: ${props => props.width && getValue(props.width)};
    height: ${props => props.height && getValue(props.height)};
    font-size: ${props => getValue(props.fontSize) || 'inherit'};
    line-height: ${props => getValue(props.lineHeight)};blctToWon
    font-weight: ${props => props.bold ? 'bold' : 'inherit'};
    ${props => props.fw && `font-weight: ${props.fw};`};
    ${props => props.bold && `font-weight: bold;`}
    ${props => props.lighter && `font-weight: lighter;`}
    
    text-align: ${props => props.textAlign};
    color: ${props => color[props.fg] || 'inherit'};
    ${props => props.bg && `
        background-color: ${color[props.bg]}
    `};    
    border: ${props => props.bc ? `1px solid ${color[props.bc]}` : '0'};
    border-top: ${props => props.bt && `${getValue(props.bt)} solid ${color[props.bc]}`};
    border-right: ${props => props.br && `${getValue(props.br)} solid ${color[props.bc]}`};
    border-bottom: ${props => props.bb && `${getValue(props.bb)} solid ${color[props.bc]}`};
    border-left: ${props => props.bl && `${getValue(props.bl)} solid ${color[props.bc]}`};
    
    ${position};
    ${margin}; 
    ${padding};
    
    ${props => props.xCenter && `transform: translateX(-50%);`};
    ${props => props.yCenter && `transform: translateY(-50%);`};
    ${props => props.center && `transform: translate(-50%, -50%);`};
    
    position: ${props => props.position};    
    display: ${props => props.display};    
    flex-grow: ${props => props.flexGrow};
    flex-basis: ${props => props.flexBasis};
    flex-shrink: ${props => props.flexShrink && props.flexShrink};
    cursor: ${props => props.cursor && 'pointer'};
    z-index: ${props => props.zIndex};
    max-width: ${props => getValue(props.maxWidth)};
    min-width: ${props => getValue(props.minWidth)};
    border-radius: ${props => getValue(props.rounded)};
    top: ${props => getValue(props.top)};
    bottom: ${props => getValue(props.bottom)};
    left: ${props => getValue(props.left)};
    right: ${props => getValue(props.right)};
    
    overflow: ${props => props.overflow};

    ${props => props.noti && noti};
    ${props => props.notiNew && notiNew};
    
    ${props => props.shadow === 'sm' && 'box-shadow: 1px 1px 3px rgba(0,0,0,0.1);'};
    ${props => props.shadow === 'md' && 'box-shadow: 1px 1px 10px rgba(0,0,0,0.1);'};
    ${props => props.shadow === 'lg' && 'box-shadow: 1px 1px 15px rgba(0,0,0,0.1);'};
`;

export const Div = styled.div`
    ${defaultStyle};
`;
export const Span = styled.span`
    ${defaultStyle};
`;
export const Img = styled.img`
    width: ${props => getValue(props.width) || '100%'};
    height: ${props => getValue(props.height) || '100%'};
    object-fit: ${props => props.cover && 'cover'};
    ${defaultStyle};
`;

export const Flex = styled(Div)`
    display: flex;
    align-items: ${props => props.alignItems || 'center'};
    justify-content: ${props => props.justifyContent};
    flex-direction: ${props => props.flexDirection};    //test 후 삭제(아래 props 로 대체함)
    flex-wrap: ${props => props.flexWrap};
    flex-direction: ${props => props.column && 'column'};
    margin-left: ${props => props.right && 'auto'};
`;

export const Right = styled(Div)`
    margin-left: auto;
`;

export const Hr = styled.hr`
    margin: 0;
    ${margin};
    ${padding};    
    border: 1px solid ${color.light};
    border-color: ${props => color[props.bc]};
    border-left: 0;
    border-right: 0;
    border-bottom: 0;
`;

export const Sticky = styled(Div)`
    ${sticky};
`;

export const Fixed = styled(Div)`
    ${fixed};

    max-width: ${responsive.maxWidth};            //디폴트 값으로 768 이상일 경우는 더이상 클수 없도록 제어
    ${props => props.noResponsive && `max-width: none;`};   //max-width 해제
    max-width: ${props => getValue(props.maxWidth)};
`;

export const Mask = styled.div`
    ${fixed};
    top: ${props => props.underNav ? '56px' : '0'};
    width: 100%;
    bottom: 0;
    background-color: rgba(0,0,0, 0.7);   
    z-index: 50;     
`;