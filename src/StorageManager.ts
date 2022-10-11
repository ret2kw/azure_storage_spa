import { TokenCredential } from "@azure/identity";
import { BlobServiceClient } from "@azure/storage-blob";
import { saveAs } from 'file-saver';
import * as CryptoJS from 'crypto-js';
import * as DOMPurify from 'dompurify';


export class StorageDownloader {

    async downloadBySAS( token: TokenCredential, 
        account: string, 
        containername_unsanitized: string, 
        filename_unsanitized: string )  
    {
        
        const blobServiceClient = new BlobServiceClient(
        `https://${account}.blob.core.windows.net`,
        token
        );

        const FIVE_MINUTES = 5 * 60 * 1000;
        const NOW = new Date();
        const FIVE_MINUTES_AFTER_NOW = new Date(NOW.valueOf() + FIVE_MINUTES);

        const resp = await blobServiceClient.getUserDelegationKey(
            NOW, 
            FIVE_MINUTES_AFTER_NOW
        );

        // limit malicious input
        const containername = this.sanitize(containername_unsanitized);
        const filename = this.sanitize(filename_unsanitized);

        // ISO string without the milliseconds
        const skt = resp.signedStartsOn.toISOString().split('.')[0] + 'Z'
        const ske = resp.signedExpiresOn.toISOString().split('.')[0] + 'Z'
        const signedKeyVersion = '2021-06-08'
    
        var toSign = [
        "r",
        "",
        ske,
        `/blob/${account}/${containername}/${filename}`,
        resp.signedObjectId,
        resp.signedTenantId,
        skt,
        ske,
        "b",
        resp.signedVersion,
        "",
        "",
        "",
        "",
        "",
        signedKeyVersion,
        "b",
        "",
        "",
        "",
        "",
        "",
        "",
        ""  
        ].join("\n")

        //console.log(toSign);

        var str = CryptoJS.HmacSHA256( toSign ,CryptoJS.enc.Base64.parse(resp.value) );
        var sig = CryptoJS.enc.Base64.stringify(str);

        const sasUrl = `https://${account}.blob.core.windows.net/${containername}/${filename}?se=${ske}&sp=r&sv=${signedKeyVersion}&sr=b&skoid=${resp.signedObjectId}&sktid=${resp.signedTenantId}&skt=${encodeURIComponent(skt)}&ske=${encodeURIComponent(ske)}&sks=b&skv=${resp.signedVersion}&sig=${encodeURIComponent(sig)}`;

        //console.log(sasUrl);
        saveAs(sasUrl, filename);

    }

    sanitize(user_input: string) {

        let stripped = user_input.replace(/\.\.|#/g, function (x) {
            return "";
          });

        return DOMPurify.sanitize(stripped);

    }
 
}