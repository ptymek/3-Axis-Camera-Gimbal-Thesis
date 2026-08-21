body1 = robotics.RigidBody('body1');
jnt1 = robotics.Joint('jnt1','revolute');
jnt1.HomePosition = 0;
tform = trvec2tform([-1, 0, -1]); % User defined
setFixedTransform(jnt1,tform);
body1.Joint = jnt1;
robot = robotics.RigidBodyTree;
addBody(robot,body1,'base')
body2 = robotics.RigidBody('body2');
jnt2 = robotics.Joint('jnt2','revolute');
jnt2.HomePosition = 0; % User defined
tform2 = trvec2tform([1, 1, 0]); % User defined
setFixedTransform(jnt2,tform2);
body2.Joint = jnt2;
addBody(robot,body2,'body1'); % Add body2 to body1
body3 = robotics.RigidBody('body3');

jnt3 = robotics.Joint('jnt3','revolute');

tform3 = trvec2tform([0, 0, 0])*eul2tform([0, 0, 0]); % User defined
setFixedTransform(jnt3,tform3);

jnt3.HomePosition = pi/4; % User defined
body3.Joint = jnt3;

addBody(robot,body3,'body2'); % Add body3 to body2

bodyEndEffector = robotics.RigidBody('endeffector');
tform5 = trvec2tform([0.5, 0, 0]); % User defined
setFixedTransform(bodyEndEffector.Joint,tform5);

show(robot)