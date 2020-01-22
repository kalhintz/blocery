// 비밀번호 초기화 시 발송 메일 제목 및 내용
export const EMAIL_RESET_TITLE = '[블로서리(Blocery)]비밀번호 초기화 안내';

export const getEmailResetContent = (newValword) => {
    return EMAIL_RESET_CONTENT.replace('@NEW_VALWORD@', newValword);
}

const EMAIL_RESET_CONTENT =
    `
    <html>
    <head>
        <style>
        </style>
    </head>
    <body>
    <div style="background-color:#ececec;padding:0;margin:0 auto;font-weight:200;width:100%!important">
        <table align="center" border="0" cellspacing="0" cellpadding="0" style="table-layout:fixed;font-weight:200;width="100%">
            <tbody>
            <tr>
                <td align="center">
                    <center style="width:100%">
                        <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="margin:0 auto;max-width:512px;font-weight:200;width:inherit;" width="512">
                            <tbody>
                            <tr>
                                <td bgcolor="#F3F3F3" width="100%" style="background-color:#f3f3f3;padding:12px;border-bottom:1px solid #ececec">
                                    <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200;width:100%!important;min-width:100%!important" width="100%">
                                        <tbody>
                                        <tr>
                                            <td align="left" valign="middle" width="50%"><span style="margin:0;color:#4c4c4c;white-space:normal;display:inline-block;text-decoration:none;font-size:12px;line-height:20px">Blocery</span></td>
                                            <td width="1">&nbsp;</td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="left">
                                    <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200" width="100%">
                                        <tbody>
                                        <tr>
                                            <td width="100%">
                                                <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td align="center" style="padding:20px 0 10px 0">
                                                            <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200" width="100%">
                                                                <tbody>
                                                                <tr>
                                                                    <td align="center" width="100%" style="padding: 0 15px;text-align: justify;font-size: 12px;line-height: 18px;">
                                                                        <h3 style="font-weight: 600; padding: 0px; margin: 0px; font-size: 16px; line-height: 24px; text-align: center;">안녕하세요. 블로서리(Blocery)입니다.</h3>
                                                                        <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;">고객님께서 문의해 주신 비밀번호는 아래와 같이 초기화 되었습니다. </p>
                                                                        <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;">비밀번호 : <b>@NEW_VALWORD@</b></p>
                                                                        <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;">블로서리(Blocery) App or 모바일웹으로 로그인 하신 후 원하는 비밀번호로 변경하여 이용해주시기 바랍니다.</p>
                                                                        <p style="margin: 20px 0 30px 0;font-size: 15px;text-align: center;">감사합니다.</p>
                                                                    </td>
                                                                </tr>
                                                                </tbody>
                                                            </table>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td align="left">
                                    <table bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" style="padding:0 24px;color:#999999;font-weight:200" width="100%">
                                        <tbody>
                                        <tr>
                                            <td align="center" width="100%">
                                                <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td align="center" valign="middle" width="100%" style="border-top:1px solid #d9d9d9;padding:12px 0px 20px 0px;text-align:center;color:#4c4c4c;font-weight:200;font-size:12px;line-height:18px">
                                                            <b>Blocery Team</b>
                                                        </td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td align="center" width="100%">
                                                <table border="0" cellspacing="0" cellpadding="0" style="font-weight:200" width="100%">
                                                    <tbody>
                                                    <tr>
                                                        <td align="center" style="padding:0 0 8px 0" width="100%"></td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                    </center>
                </td>
            </tr>
            </tbody>
        </table>
    </div>
    </body>
    </html>
    `
;