// { "path" : "universal/routes/mainRoutes.js" }
export default () => {
  FlowRouter.route("/", {
    action() {
      BlazeLayout.render("basicLayout", {
        content: "home"
      });
    }
  });
}
