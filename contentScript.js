function executeContentScript() {
  if (window.contentScriptInjected === true) {
    return;
  }

  window.contentScriptInjected = true;

  //console.log("[Content SCRIPT]: Shopify Navigation Duplication Tool RUNNING AGAIN!", window.location.href);

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getHostData') {

      (async () => {
        let serverData = {}
        
        try {
          serverData = JSON.parse(document.querySelector('[data-serialized-id="server-data"]').innerText)
        } catch (error) {
          serverData = {}
        }

        let csrfToken = serverData.csrfToken;
        let appId = "gid://shopify/App/580111";
        let url = window.location.href;
        sendResponse({
          result: {
            csrfToken,
            appId,
            url
          }
        });
      })();

      return true;
    } else if (request.type === 'openNewMenu') {
      const newMenuUrl = request.data.onlineStoreMenuCreate.menu.id.split('/').pop();

      if (window.location.host === "admin.shopify.com") {
        const regex = /(https?:\/\/admin.shopify.com\/store\/.*\/menus)\/?/;
        let url = window.location.href;
        const [, origin] = regex.exec(url);
        window.location.href = `${origin}/${newMenuUrl}`;
        return;
      }

      window.location.href = `/admin/menus/${newMenuUrl}`;

      return;
    } else if (request.type === 'setCookie') {
      fetch("https://accounts.shopify.com/lookup", {
        "mode": "no-cors",
        "credentials": "include"
      });

      sendResponse({ result: 'done' });
      return true;
    } else if (request.type === 'openPopup') {
      window.cookiesData = request.cookiesData;

      const left = (screen.width - 350) / 2;
      const top = (screen.height - 300) / 2;

      window.open(
        `https://meraki-apps.com/2024-04/import`,
        "mywindow",
        `menubar=1,resizable=0,width=350,height=300,left=${left},top=${top}`
      );
    }

    //console.log("Message from the background script:");
    //console.log(request.greeting);
    return Promise.resolve({ response: "Hi from content script" });
  });

  async function messageHandler(event) {
    // Do we trust the sender of this message?  (might be
    // different from what we originally opened, for example).
    //console.log("EVENT:", event);
    const { data = {} } = event;
    if (
      (event.origin === "https://www.meraki-apps.com" || event.origin === "https://meraki-apps.com") &&
      data.type === "getHostData"
    ) {

      (async () => {
        let serverData = {}
        
        try {
          serverData = JSON.parse(document.querySelector('[data-serialized-id="server-data"]').innerText)
        } catch (error) {
          serverData = {}
        }

        let csrfToken = serverData.csrfToken;
        let appId = "gid://shopify/App/580111";
        let url = window.location.href;

        event.source.postMessage(
          {
            cookie_prepared: window.cookiesData,
            csrfToken,
            appId,
            url
          },
          event.origin
        );
      })();

      return true;
    } else if (
      (event.origin === "https://www.meraki-apps.com" || event.origin === "https://meraki-apps.com") &&
      data.type === "openNewMenu"
    ) {
      const newMenuUrl = data.details.onlineStoreMenuCreate.menu.id.split('/').pop();
      if (window.location.host === "admin.shopify.com") {
        const regex = /(https?:\/\/admin.shopify.com\/store\/.*\/menus)\/?/;
        let url = window.location.href;
        const [, origin] = regex.exec(url);
        window.location.href = `${origin}/${newMenuUrl}`;
        return;
      }

      window.location.href = `/admin/menus/${newMenuUrl}`;
      return;
    }
  }

  window.removeEventListener("message", messageHandler);
  window.addEventListener("message", messageHandler);
}

executeContentScript();