import React, {useState, useEffect} from 'react'
import {getItemByItemNo } from '~/lib/adminApi'
import { getConsumerGoodsByItemNo, getConsumerGoodsByItemKindCode } from '~/lib/goodsApi'
import { ShopXButtonNav, HeaderTitle, Hr } from '~/components/common'
import ItemKind from './ItemKind'
import GoodsList from './GoodsList'
import { ViewButton } from '~/components/common/buttons'
import ComUtil from '~/util/ComUtil'
import { ViewModule, ViewStream } from '@material-ui/icons'

import {Icon} from '~/components/common/icons'

import {Div, Right, Flex, Span, Img, Sticky, Fixed} from '~/styledComponents/shared'
import {Button} from '~/styledComponents/shared'
import {Header, HrThin, HrHeavy, HrHeavyX2} from '~/styledComponents/mixedIn'
import {getValue} from '~/styledComponents/Util'
import {color} from '~/styledComponents/Properties'

import styled, {css} from 'styled-components'


const SortHeader = styled(Flex)`
    margin: ${getValue(16)} ${getValue(20)};
`;

const SortItemBox = styled(Flex)`
    margin-left: auto;
    align-items: center;
    font-size: ${getValue(14)};
    & > div:last-child{
        border-right: 0;
        padding-right: 0;
    }
`;

const SortItem = styled(Flex)`
    color: ${color.dark};
    padding-right: ${getValue(12)};
    line-height: ${getValue(14)};
    display: flex;
    align-items: center;
    & > div:nth-child(2){
        padding-left: 6px;  //아이콘 오른쪽 텍스트문구
    }
    ${props => !props.noLine && css`
        &::after{
            content: "";
            display: inline-block;
            width: 1px;
            height: 14px;
            background-color: ${color.light};
            margin-left: 12px;
            
        }
    `};
`;

export default (props) => {
    const {count, onChange} = props
    const [filtered1, setFiltered1] = useState(false)   //true 예약상품
    const [filtered2, setFiltered2] = useState(true)    //true 최신순
    const [filtered3, setFiltered3] = useState('list')    //true 보기형식 : list

    function onFilterClick(type){
        if(type === 1){
            const f = !filtered1
            setFiltered1(f)
            onChange({
                reserved: f,
                newest: filtered2,
                viewType: filtered3
            })
        }else if(type === 2){
            const f = !filtered2
            setFiltered2(f)
            onChange({
                reserved: filtered1,
                newest: f,
                viewType: filtered3
            })
        }else if(type === 3){
            const f = filtered3 === 'list' ? 'halfCard' : 'list'

            setFiltered3(f)
            onChange({
                reserved: filtered1,
                newest: filtered2,
                viewType: f
            })
        }

    }

    return (
        <SortHeader>
            <Div fontSize={18} bold><Span fg='green'>{count}개</Span> 상품</Div>
            <SortItemBox cursor>
                <SortItem onClick={onFilterClick.bind(this, 1)}>
                    <Div>
                        <Icon name={filtered1 ? 'agreeCheckOn' : 'agreeCheckOff'}/>
                    </Div>
                    <Div>예약상품</Div>
                </SortItem>
                <SortItem onClick={onFilterClick.bind(this, 2)}>
                    <Div><Icon name={'arrowUpDownGray'}/></Div>
                    <Div>{filtered2 ? '최신순' : '과거순'}</Div>
                </SortItem>
                <SortItem noLine onClick={onFilterClick.bind(this, 3)}>
                    <Div><Icon name={filtered3 === 'list' ? 'viewTypeList' : 'viewTypeHalfCard'}/></Div>
                </SortItem>
            </SortItemBox>
        </SortHeader>

    )
}