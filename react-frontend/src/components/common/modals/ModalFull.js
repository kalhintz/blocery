import React from 'react';
import PropTypes from 'prop-types';
import {MdClose} from "react-icons/md";
import { Container, Row, Col } from 'reactstrap'
import {Div, Flex} from '~/styledComponents/shared'

class ModalFull extends React.Component {

    onCancel = (e) => {
        this.props.onClose(null)
        e.stopPropagation()
    }

    render() {
        if(!this.props.show) {
            return null;
        }
        const { ...rest } = this.props;
        return (



            <Flex
                top={0}
                bottom={0}
                left={0}
                right={0}
                fixed
                bg={'black'}
                zIndex={9999}
                justifyContent={'center'}
                overflow={'hidden'}

            >
                <Container>
                    <Row>
                        <Col sm={12} className={'p-0'}>
                            <Div relative>
                                <Div fixed p={'1rem'} fg={'white'} zIndex={12} left={'50%'} top={0} xCenter>
                                    {this.props.title}
                                </Div>
                                <Flex width={52} height={52} fixed top={0} right={0} justifyContent={'center'} fg={'white'} zIndex={11}
                                      cursor
                                      onClick={this.onCancel}>
                                    <MdClose size={30}/>
                                </Flex>
                                {/*<div className={classNames(Style.close, 'cursor-pointer')} onClick={this.onCancel}>*/}
                                {/*    <MdClose size={15}/>*/}
                                {/*</div>*/}
                                <figure>
                                    {
                                        //children 객체에 props 를 전달
                                        React.cloneElement(this.props.children, {
                                            ...rest,
                                            onClose: this.props.onClose,     //callback
                                            onLoad: this.props.onLoad
                                        })
                                    }
                                </figure>
                            </Div>
                        </Col>
                    </Row>
                </Container>
            </Flex>

        );
    }
}

ModalFull.propTypes = {
    title: PropTypes.any,
    onClose: PropTypes.func.isRequired,
    onLoad: PropTypes.func,
    show: PropTypes.bool,
    children: PropTypes.node,
};

ModalFull.defaultProps = {
    title: '',
    show: false,
    noPadding: false,
    onLoad: ()=>{}
}

export default ModalFull;