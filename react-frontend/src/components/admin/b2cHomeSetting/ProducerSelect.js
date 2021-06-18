import React, {useState, useEffect} from 'react';
import {Flex, Div, Button, Input} from "~/styledComponents/shared";
import {FaMinusCircle, FaSearchPlus} from "react-icons/fa";
import {getProducerByProducerNo} from '~/lib/producerApi'
const ProducerSelect = ({
                            producerNo,
                            onClick = () => null,
                            onDeleteClick = () => null,
                        }) => {

    const [producer, setProducer] = useState({
        name: '', farmName: ''
    })

    useEffect(() => {
        if (producerNo) {
            getProducerByProducerNo(producerNo).then(res => {
                console.log({producer: res})

                setProducer(res.data)
            })
        }

    }, [producerNo])

    const {name, farmName} = producer
    return (
        <Flex>
            <Input underLine width={70} value={producerNo} mr={5}/>
            <Input underLine width={100} value={name} mr={5}/>
            <Input underLine width={200} value={farmName} mr={5} />
            <Button
                bg={'green'}
                fg={'white'}
                px={10}
                onClick={onClick}><FaSearchPlus/>{' 생산자검색'}</Button>
            <Button
                ml={10}
                bg={'danger'} fg={'white'}
                onClick={onDeleteClick}><FaMinusCircle />{' 삭제'}
            </Button>
        </Flex>
    );
};

export default ProducerSelect;
