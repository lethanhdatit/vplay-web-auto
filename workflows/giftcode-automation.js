export const CONFIG = {
    appId: "33",
}

export default {
    // ===== GLOBAL CONFIG =====
    browser: {
        headless: process.env.NODE_ENV === "production",
        slowMo: 50
    },

    startUrl: "https://giftcode.onlive.vn",

    loginButtonSelector: "a[class='btn-dangnhap']",

    credentials: {
        username: "ltdltd2",
        password: "123456789"
    },

    loginSelectors: {
        username: "input[id='login_username']",
        password: "input[id='login_password']",
        rememberMe: "input[id='flexCheckDefault']",
        submit: "button[type='submit']"
    },

    targetApiUrls: [
        "oidc-service/oauth2/me"
    ],

    waitAfterLogin: 1000,

    // ===== WORKFLOW STEPS =====
    workflow: [
        {
            type: "getAuthHeaders",
            name: "Step 1: Get Authentication Headers",
            enabled: true,
            onError: "stop",
            delayAfter: 1000,
        },

        {
            type: "apiCall",
            name: "Step 2: Get Available Servers",
            enabled: true,
            onError: "stop",
            method: "GET",
            url: `https://hub.onlive.vn/webshop-api/apps/servers?appId=${CONFIG.appId}`,
            headers: {
                "authorization": "${step1.authorization}",
                "x-core-client-id": "${step1['x-core-client-id']}",
                "x-core-api-version": "${step1['x-core-api-version']}",
                "user-agent": "${step1['user-agent']}",
            },
            // Custom response transformation to extract server with highest sort
            responseTransform: (data) => {
                const serverWithHighestSort = data.data.reduce((max, server) =>
                    server.sort > max.sort ? server : max
                );
                return {
                    idString: serverWithHighestSort.idString,
                    name: serverWithHighestSort.name,
                    sort: serverWithHighestSort.sort,
                };
            },
            delay: 500,
            retries: 1,
            delayAfter: 1000,
        },

        {
            type: "apiCall",
            name: "Step 3: Get Characters from Server",
            enabled: true,
            onError: "stop",
            method: "GET",
            url: `https://hub.onlive.vn/webshop-api/apps/characters?appId=${CONFIG.appId}` + "&serverId=${step2.idString}",
            headers: {
                "authorization": "${step1.authorization}",
                "x-core-client-id": "${step1['x-core-client-id']}",
                "x-core-api-version": "${step1['x-core-api-version']}",
                "user-agent": "${step1['user-agent']}",
            },
            // Extract first character from data array
            responseTransform: (data) => {
                return data.data[0];
            },
            delay: 500,
            retries: 1,
            delayAfter: 1000,
        },

        {
            type: "batch",
            name: "Step 4: Apply Gift Codes",
            enabled: true,
            onError: "continue",
            method: "POST",
            url: "https://hub.onlive.vn/webshop-api/giftcode/apply-by-code",
            headers: {
                "authorization": "${step1.authorization}",
                "x-core-client-id": "${step1['x-core-client-id']}",
                "x-core-api-version": "${step1['x-core-api-version']}",
                "user-agent": "${step1['user-agent']}",
            },
            bodyTemplate: {
                appId: CONFIG.appId,
                serverId: "${step2.idString}",
                serverName: "${step2.name}",
                characterId: "${step3.characterId}",
                characterName: "${step3.character}",
                code: "${step4.item}",
            },
            items: [
                "VIP6886",
                "VIP666",
                "VIP888",
                "VIP999",
                "SSVIP999",
                "TUONG5SAO",
                "TAIGAMENGAY",
                "TUONGSSR",
                "THAOTUNGTAMQUOC",
                "TRIEUVAN",
                "LUBO",
                "DIEUTHUYEN",
                "GAMEHAYTAMQUOC",
                "GIACATLUONG",
                "LUUBI",
                "TAOTHAO",
                "VIETANH6868",
                "VIETANHTHAOTUNG",
                "1000KNB",
                "LUONGTHAO",
                "TRUYENKY99",
                "PAGE10KLIKE",
                "PAGE5KLIKE",
                "LIVESTREAM66"
            ],
            delayBetweenCalls: 800,
            parallel: false, // Sequential execution recommended for gift codes
            delayAfter: 1000,
        },

        {
            type: "registerAccounts",
            name: "Register Accounts",
            enabled: true,
            onError: "stop",
            delayAfter: 1000,
            newAccountFrom: 26,
            newAccountTo: 100
        },
    ],
};
