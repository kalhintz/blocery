import React from 'react';
import {Div, Flex, Span} from "~/styledComponents/shared";

import styled from 'styled-components'

const DotText = styled(Div)`
    &::before {
        content: '·';
        margin-right: 10px;
    }
`;

const DetailBox = (props) => {
    return (
        <Div fontSize={13} lineHeight={23} p={10} bg={'background'} rounded={2}>

            <Flex dot alignItems={'flex-start'}>
                <Div>친구가 회원가입 시 추천인 코드를 입력시 즉시 적립됩니다.</Div>
            </Flex>
            <Flex dot alignItems={'flex-start'}>
                <Div>활동 보상은 <Span fg={'green'}>BLY 시세를 기준</Span>으로 지급됩니다.</Div>
            </Flex>
            <Flex dot alignItems={'flex-start'}>
                <Div>친구가 상품구매 시 결제수단에 상관없이 <Span fg={'green'}>정해진 %만큼 적립</Span>되며, 구매확정 시 <Span fg={'green'}>즉시 적립</Span>됩니다.</Div>
            </Flex>
        </Div>
    );
};

export default DetailBox;
