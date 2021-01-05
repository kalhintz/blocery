import React from 'react';
import styled from 'styled-components';
import { Badge } from '~/styledComponents/mixedIn'
import ComUtil from '~/util/ComUtil'
import { Div, Span, Flex, Link} from '~/styledComponents/shared'
import {color} from "~/styledComponents/Properties";
import {getValue} from '~/styledComponents/Util'
import { Icon } from '~/components/common/icons'
import { exchangeWon2BLCTHome } from "~/lib/exchangeApi"
const CustomBadge = styled(Badge)`
    padding-top: ${getValue(4)};
    padding-bottom: ${getValue(4)};
    text-align: center;
    color: white;
    font-size: ${getValue(12)};
`;

const ContentContainer = styled.div`
    border-bottom-left-radius: ${getValue(8)};
    border-bottom-right-radius: ${getValue(8)};
    background-color: ${color.white};
    font-size: ${getValue(12)};
    padding: ${getValue(16)};
`;

const Content = ({goods}) => {
    const {goodsNm, defaultDiscountRate, defaultCurrentPrice, consumerPrice, superRewardReward, superRewardStart, superRewardEnd} = goods
    return(
        <ContentContainer>
            <Div fg={'dark'} fontSize={12} mb={10} >
                {`이벤트 기간 : ${ComUtil.utcToString(superRewardStart, 'MM.DD[일 ]HH:mm')} ~ ${ComUtil.utcToString(superRewardEnd, 'MM.DD[일 ]HH:mm')}`}
            </Div>
            <Div bold mb={15} fontSize={16} textAlign={'left'}>{goodsNm}</Div>
            <Flex mb={10} fontSize={14}>
                <Div mr={10} width={80}><CustomBadge bg={'secondary'}>판매가</CustomBadge></Div>
                <Div fontSize={12} mr={5} fg={'dark'}><del>{ComUtil.addCommas(consumerPrice)}원</del></Div>
                <Div fg={'danger'} bold textAlign={'right'} mr={5}>{defaultDiscountRate.toFixed(0)}%</Div>
                <Div bold fg={'black'} mr={10}>{ComUtil.addCommas(defaultCurrentPrice)}원</Div>
                <Flex fontSize={12} alignItems={'center'}>
                    <Icon name={'blocery'} />
                    <Div ml={2}><Span bold><exchangeWon2BLCTHome.Tag won={defaultCurrentPrice}/></Span> BLY</Div>
                    {/*<Div ml={2}><Span bold>{exchangeWon2BLCTHome(defaultCurrentPrice)}</Span> BLY</Div>*/}
                </Flex>
            </Flex>
            <Flex fg={'black'} fontSize={14}>
                <Div mr={10} width={80}><CustomBadge bg={'green'}>슈퍼리워드</CustomBadge></Div>
                <Div>카드결제 금액의 <Span bold>{ComUtil.addCommas(superRewardReward.toFixed(0))}%</Span> 적립</Div>
            </Flex>
        </ContentContainer>
    )
};

export default Content;
