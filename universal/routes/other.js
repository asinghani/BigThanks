export default () => {
    FlowRouter.notFound = {
        action() {
            BlazeLayout.render("layout", {
                content: "404",
                nav: "publicNav"
            });
        }
    };
};