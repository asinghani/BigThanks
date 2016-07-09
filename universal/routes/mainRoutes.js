export default function () {
  FlowRouter.route('/', {
    action() {
      BlazeLayout.render('template', {
        content: 'home'
      });
    }
  });
}
