export default {
  browser: {
    headless: true,
    slowMo: 50
  },

  startUrl: "https://giftcode.onlive.vn",

  loginButtonSelector: "a[class='btn-dangnhap']",

  credentials: {
    username: "ltdltd1",
    password: "123456789"
  },

  loginSelectors: {
    username: "input[id='login_username']",
    password: "input[id='login_password']",
    rememberMe: "input[id='flexCheckDefault']",
    submit: "button[type='submit']"
  },

  loginPagePattern: "oidc-service/oauth2/interaction", 
  // bất kỳ URL nào chứa chuỗi này đều là trang login thật (random)

  targetApiUrls: [
    "oidc-service/oauth2/me"
  ],

  waitAfterLogin: 2000
};
