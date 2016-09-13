export default () => {
    AccountsTemplates.configure({
        defaultLayout: "publicLayout",
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

        homeRoutePath: "/user/dashboard",
        redirectTimeout: 4000,

        onLogoutHook: () => { FlowRouter.go("/"); },
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
                } else if (state === "resetPwd"){
                    FlowRouter.go("/user/dashboard");
                } else if (state === "signIn"){
                    FlowRouter.go("/user/dashboard");
                } else if (state === "signUp"){
                    FlowRouter.go("/user/dashboard");
                }
            }
        },
        postSignUpHook: (userId) => {
            // Running on server-side, see https://github.com/meteor-useraccounts/core/blob/master/Guide.md
            Meteor.users.update({_id: userId}, {$set:
            {"profile.totalHours": 0, "profile.credits": 5, "profile.history": [
                {
                    "_id" : new Mongo.ObjectID()._str,
                    "timestamp" : moment().unix(),
                    "opportunity" : "Signup Bonus",
                    "length" : -1,
                    "credits" : 5,
                    "validator" : undefined,
                    "status" : 1,
                    "new" : false,
                    "comment" : ""
                }
            ], "profile.firstLogin": true}}
            );
        },

        // Texts
        texts: {
            button: {
                signUp: "Register Now!"
            },
            title: {
                forgotPwd: "",
                signIn: "",
                signUp: "",
                verifyEmail: "",
                resetPwd: "",
                changePwd: ""

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

    let email = AccountsTemplates.removeField("email");
    let password = AccountsTemplates.removeField("password");

    AccountsTemplates.addField({
        _id: "name",
        type: "text",
        displayName: "Name",
        required: true
    });

    AccountsTemplates.addField(email);
    AccountsTemplates.addField({
        _id: "password",
        type: "password",
        required: true,
        minLength: 6,
        re: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/,
        errStr: "At least 6 characters, one letter, and one number"
    });
};