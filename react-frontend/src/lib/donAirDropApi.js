import axios from "axios";
import {Server} from "~/components/Properties";

export const isAbuser = () => axios(Server.getRestAPIHost() + '/isAbuser', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getDonTotal = () => axios(Server.getRestAPIHost() + '/getDonTotal', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const getMyDonAirdropHistory = () => axios(Server.getRestAPIHost() + '/myDonAirdropHistory', { method: "get", withCredentials: true, credentials: 'same-origin' })

export const donWithdrawRequest = (extAccount) => axios(Server.getRestAPIHost() + '/donWithdrawRequest', { method: "post", params: {extAccount}, withCredentials: true, credentials: 'same-origin' })

export const ircDonWithdrawRequest = (extIrcAccount,ircMemo) => axios(Server.getRestAPIHost() + '/ircDonWithdrawRequest', { method: "post", params: {extIrcAccount:extIrcAccount,ircMemo:ircMemo}, withCredentials: true, credentials: 'same-origin' })

export const withdrawDonStatus = () => axios(Server.getRestAPIHost() + '/withdrawDonStatus', { method: "get", withCredentials: true, credentials: 'same-origin' })
