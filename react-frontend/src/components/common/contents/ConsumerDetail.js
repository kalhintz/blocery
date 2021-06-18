import React from 'react';
import {Div, Flex} from "~/styledComponents/shared";
import styled from 'styled-components'
import AbuserReg from "./AbuserReg"
import ConsumerBasicView from "~/components/common/contents/ConsumerBasicView";
import ConsumerTokenHistory from "~/components/common/contents/ConsumerTokenHistory";
import ConsumerOrderDetailView from "~/components/common/contents/ConsumerOrderDetailView";
const Label = styled(Div)`
    min-width: 150px;
`
const ConsumerDetail = ({consumerNo, onClose}) => {
    return (
        <Div>
            <ConsumerBasicView consumerNo={consumerNo} onClose={onClose}/>
            <hr/>
            <ConsumerOrderDetailView consumerNo={consumerNo}/>
            <hr/>
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>입/출 BLY</Label>
                <Div flexGrow={1}>
                    <ConsumerTokenHistory consumerNo={consumerNo}/>
                </Div>
            </Flex>
            <hr/>
            <Flex mb={16} alignItems={'flex-start'}>
                <Label>어뷰저 상태</Label>
                <Div flexGrow={1}>
                    <AbuserReg consumerNo={consumerNo} />
                </Div>
            </Flex>
        </Div>
    );
};
export default ConsumerDetail;