AccountsTemplates.configure({
    defaultLayout: "layout",
    defaultContentRegion: "content",
    confirmPassword: true,
    enablePasswordChange: true,
    enforceEmailVerification: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: true,
    lowercaseUsername: false,
    focusFirstInput: true,

    showAddRemoveServices: false,
    showForgotPasswordLink: true,
    showLabels: true,
    showPlaceholders: true,
    showResendVerificationEmailLink: true,

    continuousValidation: true,
    negativeFeedback: true,
    negativeValidation: true,
    positiveValidation: true,
    positiveFeedback: true,
    showValidating: true,

    privacyUrl: "privacy",
    termsUrl: "terms-of-use",

    homeRoutePath: "/",
    redirectTimeout: 4000,

    //onLogoutHook: myLogoutFunc,
    //onSubmitHook: mySubmitFunc,
    //postSignUpHook: myPostSubmitFunc,

    // Texts
    texts: {
        button: {
            signUp: "Register Now!"
        },
        title: {
            forgotPwd: "Forgot Your Password?"
        }
    },
    reCaptcha: {
        siteKey: Meteor.settings.public.reCaptcha.siteKey,
        theme: "light",
        data_type: "image"
    },
    showReCaptcha: true
});