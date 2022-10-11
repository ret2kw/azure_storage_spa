import { InteractiveBrowserCredential } from "@azure/identity";
import { StorageDownloader } from "./StorageManager";


const accountName = "spatest420"
const credential = new InteractiveBrowserCredential({
    // You MUST provide a client ID if you have an application configured.
    clientId: "89a62162-110e-48c0-8c32-59d91ca5b267",
    // You may provide a tenant ID based on the resource you are trying to access.
    tenantId: "d8afe580-b284-4d1f-ba7e-03ce2766af7a",
    // You may provide a redirectUri based on the redirectUri configured in your AAD application:
    redirectUri: "https://spatest420.z13.web.core.windows.net/",
    loginStyle: "redirect"
  });

//const token = credential.authenticate( "https://storage.azure.com/user_impersonation" );

let container = window.location.pathname.split('/')[1];
let filename = window.location.pathname.split('/')[2];

const downloader = new StorageDownloader();
downloader.downloadBySAS(credential, accountName, container, filename);