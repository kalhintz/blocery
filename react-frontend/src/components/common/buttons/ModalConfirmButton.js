import React, { Component, Fragment } from 'react'
import { Modal, ModalHeader, ModalBody, Button, ModalFooter } from 'reactstrap'
import PropTypes from 'prop-types'
class ModalConfirmButton extends Component {
    constructor(props){
        super(props)
        this.state = {
            modal: false
        }

        const { ...rest } = props

        this.rest = {...rest}
    }
    onClick = (isConfirm) => {
        this.toggle()
        this.props.onClick(isConfirm)
    }
    toggle = () => {
        this.setState({
            modal: !this.state.modal
        })
    }
    render(){
        return(
            <Fragment>
               <Button block={this.props.block} color={this.props.color} className={this.props.className} onClick={this.toggle} {...this.rest}>{this.props.children}</Button>{' '}
                <div>
                    <Modal isOpen={this.state.modal} toggle={this.toggle} className={this.props.className} centered>
                        <ModalHeader toggle={this.modalToggle}>{this.props.title}</ModalHeader>
                        <ModalBody>
                            {/*<Input name="inputPassPhrase" type="text" placeholder= onChange={this.passPhraseInput}/>*/}
                            { this.props.content }
                        </ModalBody>
                        <ModalFooter>
                            <Button color="info" onClick={this.onClick.bind(this, true)}>확인</Button>{' '}
                            <Button color="secondary" onClick={this.onClick.bind(this, false)}>취소</Button>
                        </ModalFooter>
                    </Modal>
                </div>
            </Fragment>
        )
    }
}
ModalConfirmButton.propTypes = {
    color: PropTypes.string,
    title: PropTypes.any.isRequired,
    content: PropTypes.any.isRequired,
    block: PropTypes.bool
}
ModalConfirmButton.defaultProps = {
    color: 'info',
    block: false
}
export default ModalConfirmButton