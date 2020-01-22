import React, {Component} from "react";

export default class BlsRenderer extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bls : 'loading...'
        }
    }

    async componentDidMount() {
        let bls = await this.props.data.getBalanceOfBls(this.props.data.blsGethSC, this.props.data.account);
        this.setState (
            {bls: bls}
        )
    }

    render() {
        return this.state.bls
    }
}