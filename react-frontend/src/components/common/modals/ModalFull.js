import React from 'react';
import PropTypes from 'prop-types';
// import { ProducerXButtonNav } from '../../common'
import { Close } from '@material-ui/icons'
import Style from './ModalFull.module.scss'
import { Container, Row, Col } from 'reactstrap'
import classNames from 'classnames'
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



            <div className={Style.wrap}>
                <Container>
                    <Row>
                        <Col sm={12} className={'p-0'}>
                            <div className={Style.body}>
                                <div className={Style.title}>
                                    {this.props.title}
                                </div>
                                <div className={classNames(Style.close, 'cursor-pointer')} onClick={this.onCancel}>
                                    <Close/>
                                </div>
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
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

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