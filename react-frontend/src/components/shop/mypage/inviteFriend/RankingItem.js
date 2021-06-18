import {Div, Flex, Right} from "~/styledComponents/shared";
import React from "react";

const RankingItem = ({no, name, count}) => {
    return(
        <Flex my={5} fontSize={12}>
            <Flex>
                <Flex justifyContent={'center'} rounded={'50%'}
                      fontSize={11}
                      bg={no <= 3 && 'green'}
                      fg={no <= 3 && 'white'}
                      width={20} height={20}
                      mr={10}
                >
                    {no}
                </Flex>

                <Div>
                    {name}
                </Div>
            </Flex>
            <Right>
                {count}
            </Right>
        </Flex>
    )
}
export default RankingItem