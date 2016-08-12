// { "path" : "server/publications/__modelName__.js" }
// TODO: call this in entry file
export default () => {
  Meteor.publish('__modelName__', () => {
    return __modelName__.find();
  });
}
