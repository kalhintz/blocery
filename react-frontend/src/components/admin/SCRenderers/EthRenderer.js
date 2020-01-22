import React, {Component} from "react";
import { scOntGetEthBalance } from "~/lib/smartcontractApi"


export default class EthRenderer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            eth : 'loading...'
        }
    }

    async componentDidMount() {

        // 매니저가 모두 payer 역할을 하기에 사용자들은 ong 필요없음.

        this.setState (
            // {eth: eth}
        )
    }

    render() {
        return this.state.eth
    }
}