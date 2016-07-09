export default function () {
  FlowRouter.route('/', {
    action() {
      BlazeLayout.render('layout_simple', {
        content: 'home'
      });
    }
  });
}
