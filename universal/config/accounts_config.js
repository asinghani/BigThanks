AccountsTemplates.configure({
    defaultLayout: "layout",
    defaultLayoutRegions: {
        nav: "nav"
    },
    defaultContentRegion: "content",
    confirmPassword: true,
    enablePasswordChange: true,
    enforceEmailVerification: true,
    forbidClientAccountCreation: false,
    overrideLoginErrors: true,
    sendVerificationEmail: true,
    lowercaseUsername: true,
    focusFirstInput: true,

    showAddRemoveServices: true,
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

    homeRoutePath: "/user/dashboard",
    redirectTimeout: 4000,

    onLogoutHook: () => { Router.go("/logged-out"); },
    onSubmitHook: (err, state) => {
        if(!err){
            if(state === "changePwd"){
                swal({
                    title: "Changed Password",
                    text: "Your account password has been changed.",
                    type: "success"
                }, () => {
                    Router.go("/user/dashboard");
                });
                return false;
            }
        }
    },
    postSignUpHook: () => { Meteor.call("user.created"); },

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

AccountsTemplates.addField({
    _id: 'name',
    type: 'text',
    displayName: "Name",
    required: true
});