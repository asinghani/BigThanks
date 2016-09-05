export default () => {
    AccountsTemplates.configure({
        defaultLayout: "layout",
        defaultLayoutRegions: {
            nav: "publicNav"
        },
        defaultContentRegion: "content",
        confirmPassword: true,
        enablePasswordChange: true,
        enforceEmailVerification: false,
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

        onLogoutHook: () => { FlowRouter.go("/logged-out"); },
        onSubmitHook: (err, state) => {
            if(!err){
                if(state === "changePwd"){
                    swal({
                        title: "Changed Password",
                        text: "Your account password has been changed.",
                        type: "success"
                    }, () => {
                        FlowRouter.go("/user/dashboard");
                    });
                    return false;
                }
            }
        },
        postSignUpHook: (userId) => {
            // Running on server-side, see https://github.com/meteor-useraccounts/core/blob/master/Guide.md
            Meteor.users.update({_id: userId}, {$set: {"profile.totalHours": 0, "profile.credits": 5, "profile.history": [], "firstLogin": true}});
        },

        // Texts
        texts: {
            button: {
                signUp: "Register Now!"
            },
            title: {
                forgotPwd: "Forgot Your Password?"
            },
            errors: {
                captchaVerification: "Captcha verification failed!",
                loginForbidden: "Incorrect Email or Password",
                mustBeLoggedIn: "Must be logged in to access this page"
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
};