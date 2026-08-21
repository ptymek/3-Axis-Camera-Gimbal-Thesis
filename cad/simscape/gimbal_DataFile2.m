% Simscape(TM) Multibody(TM) version: 6.0

% This is a model data file derived from a Simscape Multibody Import XML file using the smimport function.
% The data in this file sets the block parameter values in an imported Simscape Multibody model.
% For more information on this file, see the smimport function help page in the Simscape Multibody documentation.
% You can modify numerical values, but avoid any other changes to this file.
% Do not add code to this file. Do not edit the physical units shown in comments.

%%%VariableName:smiData


%============= RigidTransform =============%

%Initialize the RigidTransform structure array by filling in null values.
smiData.RigidTransform(28).translation = [0.0 0.0 0.0];
smiData.RigidTransform(28).angle = 0.0;
smiData.RigidTransform(28).axis = [0.0 0.0 0.0];
smiData.RigidTransform(28).ID = '';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(1).translation = [0 0 0];  % m
smiData.RigidTransform(1).angle = pi();  % rad
smiData.RigidTransform(1).axis = [0 1 1];
smiData.RigidTransform(1).ID = 'B[yaw_motor_1_stator-1:-:]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(2).translation = [0 0 0];  % m
smiData.RigidTransform(2).angle = 0;  % rad
smiData.RigidTransform(2).axis = [0 0 0];
smiData.RigidTransform(2).ID = 'F[yaw_motor_1_stator-1:-:]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(3).translation = [0 0 0.01];  % m
smiData.RigidTransform(3).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(3).axis = [1 0 0];
smiData.RigidTransform(3).ID = 'B[yaw_motor_1_rotor-1:-:yaw_motor_1_stator-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(4).translation = [0 0 0];  % m
smiData.RigidTransform(4).angle = 0;  % rad
smiData.RigidTransform(4).axis = [0 0 0];
smiData.RigidTransform(4).ID = 'F[yaw_motor_1_rotor-1:-:yaw_motor_1_stator-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(5).translation = [0 0.036499999999999991 0.0040000000000000036];  % m
smiData.RigidTransform(5).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(5).axis = [1 0 0];
smiData.RigidTransform(5).ID = 'B[yaw_part_2-1:-:roll_motor_rotor-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(6).translation = [-1.0413423053544368e-17 4.6419840729259015e-17 0.0075000000000000708];  % m
smiData.RigidTransform(6).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(6).axis = [-1 -7.502724155452886e-34 5.6894802814049948e-17];
smiData.RigidTransform(6).ID = 'F[yaw_part_2-1:-:roll_motor_rotor-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(7).translation = [0 0 0.010500000000000001];  % m
smiData.RigidTransform(7).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(7).axis = [1 0 0];
smiData.RigidTransform(7).ID = 'B[pitch_motor_rotor-2:-:pitch_motor_stator-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(8).translation = [6.1474263179928101e-17 1.9813794702172594e-17 -0.00050000000000002267];  % m
smiData.RigidTransform(8).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(8).axis = [1 -6.1629758220391534e-33 -5.5511151231257802e-17];
smiData.RigidTransform(8).ID = 'F[pitch_motor_rotor-2:-:pitch_motor_stator-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(9).translation = [0 0.033999999999999989 0.0024999999999999953];  % m
smiData.RigidTransform(9).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(9).axis = [1 0 0];
smiData.RigidTransform(9).ID = 'B[yaw_part_1-1:-:yaw_motor_1_rotor-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(10).translation = [3.67544536472586e-17 1.0234868508263162e-16 0.012499999999999994];  % m
smiData.RigidTransform(10).angle = 3.1415926535897922;  % rad
smiData.RigidTransform(10).axis = [-1 6.160953388148409e-32 -1.4052592070177767e-16];
smiData.RigidTransform(10).ID = 'F[yaw_part_1-1:-:yaw_motor_1_rotor-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(11).translation = [0.012500000000000004 0 0.004000000000000001];  % m
smiData.RigidTransform(11).angle = 2.0943951023931953;  % rad
smiData.RigidTransform(11).axis = [0.57735026918962584 -0.57735026918962584 0.57735026918962584];
smiData.RigidTransform(11).ID = 'B[roll_part_2-1:-:roll_part_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(12).translation = [0.012499999999999963 -5.2041704279304213e-18 0.0025000000000000204];  % m
smiData.RigidTransform(12).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(12).axis = [0.70710678118654768 -0.70710678118654746 1.7940835449203885e-16];
smiData.RigidTransform(12).ID = 'F[roll_part_2-1:-:roll_part_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(13).translation = [0 0.035500000000000011 0.0025000000000000022];  % m
smiData.RigidTransform(13).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(13).axis = [1 0 0];
smiData.RigidTransform(13).ID = 'B[roll_part_1-1:-:yaw_part_2-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(14).translation = [1.9006402896849794e-16 0.036499999999999963 -0.010500000000000072];  % m
smiData.RigidTransform(14).angle = 1.0472984017390208e-15;  % rad
smiData.RigidTransform(14).axis = [0.010530408714659352 -0.99994455370900548 -5.5139343640990412e-18];
smiData.RigidTransform(14).ID = 'F[roll_part_1-1:-:yaw_part_2-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(15).translation = [0 0.036499999999999998 0.0040000000000000001];  % m
smiData.RigidTransform(15).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(15).axis = [1 0 0];
smiData.RigidTransform(15).ID = 'B[roll_part_2-1:-:pitch_motor_rotor-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(16).translation = [-1.3183898417423734e-16 6.3751087742147661e-17 0.0055000000000000274];  % m
smiData.RigidTransform(16).angle = 8.7770836714417513e-16;  % rad
smiData.RigidTransform(16).axis = [-0.61592394313788956 -0.78780562086689498 2.1294448894109647e-16];
smiData.RigidTransform(16).ID = 'F[roll_part_2-1:-:pitch_motor_rotor-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(17).translation = [0 0.036499999999999991 0.0040000000000000036];  % m
smiData.RigidTransform(17).angle = 0;  % rad
smiData.RigidTransform(17).axis = [0 0 0];
smiData.RigidTransform(17).ID = 'B[yaw_part_2-1:-:yaw_part_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(18).translation = [-0.00025000000000006647 -3.4694469519536142e-17 0.039000000000000049];  % m
smiData.RigidTransform(18).angle = 1.5707963267948966;  % rad
smiData.RigidTransform(18).axis = [1 6.0614921995035485e-16 6.1856889662549011e-16];
smiData.RigidTransform(18).ID = 'F[yaw_part_2-1:-:yaw_part_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(19).translation = [0 0 0.010500000000000009];  % m
smiData.RigidTransform(19).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(19).axis = [1 0 0];
smiData.RigidTransform(19).ID = 'B[roll_motor_rotor-1:-:roll_motor_stator-3]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(20).translation = [-5.3972939399044018e-18 2.4119263173066202e-18 -0.011000000000000001];  % m
smiData.RigidTransform(20).angle = 2.0251082918487637e-16;  % rad
smiData.RigidTransform(20).axis = [-0.92645797773522198 -0.37639821398455514 3.5309497386442282e-17];
smiData.RigidTransform(20).ID = 'F[roll_motor_rotor-1:-:roll_motor_stator-3]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(21).translation = [0 0.035500000000000011 0];  % m
smiData.RigidTransform(21).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(21).axis = [1 0 0];
smiData.RigidTransform(21).ID = 'B[roll_part_1-1:-:roll_motor_stator-3]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(22).translation = [-4.6417829026009286e-17 2.00428959385812e-16 0.00400000000000002];  % m
smiData.RigidTransform(22).angle = 3.1415926535897922;  % rad
smiData.RigidTransform(22).axis = [1 1.4594438809359047e-33 2.5533222713925419e-18];
smiData.RigidTransform(22).ID = 'F[roll_part_1-1:-:roll_motor_stator-3]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(23).translation = [0 0.02375 0];  % m
smiData.RigidTransform(23).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(23).axis = [1 0 0];
smiData.RigidTransform(23).ID = 'B[camera_mount_1-1:-:pitch_motor_stator-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(24).translation = [2.1684043449710089e-17 -4.8572257327350599e-17 0.0040000000000000261];  % m
smiData.RigidTransform(24).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(24).axis = [-1 -1.6704699158987664e-32 9.869833696519171e-17];
smiData.RigidTransform(24).ID = 'F[camera_mount_1-1:-:pitch_motor_stator-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(25).translation = [0 0.036499999999999998 0.0040000000000000001];  % m
smiData.RigidTransform(25).angle = 3.1415926535897931;  % rad
smiData.RigidTransform(25).axis = [1 0 0];
smiData.RigidTransform(25).ID = 'B[roll_part_2-1:-:camera_mount_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(26).translation = [-1.5612511283791264e-16 0.023749999999999997 -0.0095000000000000223];  % m
smiData.RigidTransform(26).angle = 1.4631796100112305e-15;  % rad
smiData.RigidTransform(26).axis = [0.028199065069753337 -0.99960232729280485 -2.0621944468711416e-17];
smiData.RigidTransform(26).ID = 'F[roll_part_2-1:-:camera_mount_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(27).translation = [-0.012500000000000001 0 0.0039999999999999897];  % m
smiData.RigidTransform(27).angle = 2.0943951023931953;  % rad
smiData.RigidTransform(27).axis = [0.57735026918962584 -0.57735026918962584 0.57735026918962584];
smiData.RigidTransform(27).ID = 'B[camera_mount_2-1:-:camera_mount_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(28).translation = [-0.012500000000000041 -2.9429312719403411e-16 0.0024999999999996206];  % m
smiData.RigidTransform(28).angle = 3.1415926535897927;  % rad
smiData.RigidTransform(28).axis = [0.70710678118654746 -0.70710678118654757 -5.5511151231257815e-17];
smiData.RigidTransform(28).ID = 'F[camera_mount_2-1:-:camera_mount_1-1]';


%============= Solid =============%
%Center of Mass (CoM) %Moments of Inertia (MoI) %Product of Inertia (PoI)

%Initialize the Solid structure array by filling in null values.
smiData.Solid(12).mass = 0.0;
smiData.Solid(12).CoM = [0.0 0.0 0.0];
smiData.Solid(12).MoI = [0.0 0.0 0.0];
smiData.Solid(12).PoI = [0.0 0.0 0.0];
smiData.Solid(12).color = [0.0 0.0 0.0];
smiData.Solid(12).opacity = 0.0;
smiData.Solid(12).ID = '';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(1).mass = 0.009079202768874502;  % kg
smiData.Solid(1).CoM = [0 0 5];  % mm
smiData.Solid(1).MoI = [0.73163242312513699 0.73163242312513699 1.3119448001023659];  % kg*mm^2
smiData.Solid(1).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(1).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(1).opacity = 1;
smiData.Solid(1).ID = 'yaw_motor_1_rotor*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(2).mass = 0.0020253226052448707;  % kg
smiData.Solid(2).CoM = [-0.083773586837682837 17.600235242716188 1.9999999999999996];  % mm
smiData.Solid(2).MoI = [0.41791086811503519 0.14368763962505354 0.55619764745943567];  % kg*mm^2
smiData.Solid(2).PoI = [0 0 -0.0034394850439133581];  % kg*mm^2
smiData.Solid(2).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(2).opacity = 1;
smiData.Solid(2).ID = 'yaw_part_2*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(3).mass = 0.0017910162125603058;  % kg
smiData.Solid(3).CoM = [0 24.145799607708206 1.2499999999999998];  % mm
smiData.Solid(3).MoI = [0.39112089111361897 0.089038852329601237 0.47829410155513652];  % kg*mm^2
smiData.Solid(3).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(3).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(3).opacity = 1;
smiData.Solid(3).ID = 'roll_part_1*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(4).mass = 0.002723760830662351;  % kg
smiData.Solid(4).CoM = [0 0 1.5];  % mm
smiData.Solid(4).MoI = [0.19883454063835168 0.19883454063835168 0.39358344003070983];  % kg*mm^2
smiData.Solid(4).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(4).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(4).opacity = 1;
smiData.Solid(4).ID = 'yaw_motor_1_stator*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(5).mass = 0.0064653976810877924;  % kg
smiData.Solid(5).CoM = [0 0 5.2500000000000009];  % mm
smiData.Solid(5).MoI = [0.37620532756829594 0.37620532756829583 0.63360897274660377];  % kg*mm^2
smiData.Solid(5).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(5).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(5).opacity = 1;
smiData.Solid(5).ID = 'roll_motor_rotor*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(6).mass = 0.0064653976810877924;  % kg
smiData.Solid(6).CoM = [0 0 5.2500000000000009];  % mm
smiData.Solid(6).MoI = [0.37620532756829594 0.37620532756829583 0.63360897274660377];  % kg*mm^2
smiData.Solid(6).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(6).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(6).opacity = 1;
smiData.Solid(6).ID = 'pitch_motor_rotor*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(7).mass = 0.0019544109212330982;  % kg
smiData.Solid(7).CoM = [0 23.972694954701193 1.25];  % mm
smiData.Solid(7).MoI = [0.37586574298498771 0.10225738127341963 0.47608727954878949];  % kg*mm^2
smiData.Solid(7).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(7).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(7).opacity = 1;
smiData.Solid(7).ID = 'yaw_part_1*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(8).mass = 0.0024630086404143973;  % kg
smiData.Solid(8).CoM = [0 0 2.0000000000000004];  % mm
smiData.Solid(8).MoI = [0.12397143490085803 0.123971434900858 0.24137484676061097];  % kg*mm^2
smiData.Solid(8).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(8).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(8).opacity = 1;
smiData.Solid(8).ID = 'roll_motor_stator*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(9).mass = 0.0024630086404143973;  % kg
smiData.Solid(9).CoM = [0 0 2.0000000000000004];  % mm
smiData.Solid(9).MoI = [0.12397143490085803 0.123971434900858 0.24137484676061097];  % kg*mm^2
smiData.Solid(9).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(9).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(9).opacity = 1;
smiData.Solid(9).ID = 'pitch_motor_stator*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(10).mass = 0.003873650459150643;  % kg
smiData.Solid(10).CoM = [0 32.072526832842165 2];  % mm
smiData.Solid(10).MoI = [1.6823296993444665 0.26333688104453268 1.9353368458312639];  % kg*mm^2
smiData.Solid(10).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(10).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(10).opacity = 1;
smiData.Solid(10).ID = 'camera_mount_2*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(11).mass = 0.0019188015734983991;  % kg
smiData.Solid(11).CoM = [-0.041534044127053915 17.807040728889699 2];  % mm
smiData.Solid(11).MoI = [0.4123926274177766 0.13630684098794923 0.54358266420973012];  % kg*mm^2
smiData.Solid(11).PoI = [0 0 -0.0027950100399973549];  % kg*mm^2
smiData.Solid(11).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(11).opacity = 1;
smiData.Solid(11).ID = 'roll_part_2*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(12).mass = 0.0016028982473021837;  % kg
smiData.Solid(12).CoM = [0 17.836712332830256 1.2500000000000002];  % mm
smiData.Solid(12).MoI = [0.17760270660354052 0.076534998127696832 0.2524680190569642];  % kg*mm^2
smiData.Solid(12).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(12).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(12).opacity = 1;
smiData.Solid(12).ID = 'camera_mount_1*:*Domyślna';


%============= Joint =============%
%X Revolute Primitive (Rx) %Y Revolute Primitive (Ry) %Z Revolute Primitive (Rz)
%X Prismatic Primitive (Px) %Y Prismatic Primitive (Py) %Z Prismatic Primitive (Pz) %Spherical Primitive (S)
%Constant Velocity Primitive (CV) %Lead Screw Primitive (LS)
%Position Target (Pos)

%Initialize the CylindricalJoint structure array by filling in null values.
smiData.CylindricalJoint(2).Rz.Pos = 0.0;
smiData.CylindricalJoint(2).Pz.Pos = 0.0;
smiData.CylindricalJoint(2).ID = '';

smiData.CylindricalJoint(1).Rz.Pos = 90.00961791161761;  % deg
smiData.CylindricalJoint(1).Pz.Pos = 0;  % m
smiData.CylindricalJoint(1).ID = '[roll_part_1-1:-:yaw_part_2-1]';

smiData.CylindricalJoint(2).Rz.Pos = -90.493658295305437;  % deg
smiData.CylindricalJoint(2).Pz.Pos = 0;  % m
smiData.CylindricalJoint(2).ID = '[roll_part_2-1:-:camera_mount_1-1]';


%Initialize the PlanarJoint structure array by filling in null values.
smiData.PlanarJoint(3).Rz.Pos = 0.0;
smiData.PlanarJoint(3).Px.Pos = 0.0;
smiData.PlanarJoint(3).Py.Pos = 0.0;
smiData.PlanarJoint(3).ID = '';

smiData.PlanarJoint(1).Rz.Pos = -90.043205675642142;  % deg
smiData.PlanarJoint(1).Px.Pos = 0;  % m
smiData.PlanarJoint(1).Py.Pos = 0;  % m
smiData.PlanarJoint(1).ID = '[yaw_motor_1_stator-1:-:]';

%This joint has been chosen as a cut joint. Simscape Multibody treats cut joints as algebraic constraints to solve closed kinematic loops. The imported model does not use the state target data for this joint.
smiData.PlanarJoint(2).Rz.Pos = -179.32781157243127;  % deg
smiData.PlanarJoint(2).Px.Pos = 0;  % m
smiData.PlanarJoint(2).Py.Pos = 0;  % m
smiData.PlanarJoint(2).ID = '[roll_part_1-1:-:roll_motor_stator-3]';

%This joint has been chosen as a cut joint. Simscape Multibody treats cut joints as algebraic constraints to solve closed kinematic loops. The imported model does not use the state target data for this joint.
smiData.PlanarJoint(3).Rz.Pos = -55.922138073842071;  % deg
smiData.PlanarJoint(3).Px.Pos = 0;  % m
smiData.PlanarJoint(3).Py.Pos = 0;  % m
smiData.PlanarJoint(3).ID = '[camera_mount_1-1:-:pitch_motor_stator-2]';


%Initialize the RevoluteJoint structure array by filling in null values.
smiData.RevoluteJoint(6).Rz.Pos = 0.0;
smiData.RevoluteJoint(6).ID = '';

smiData.RevoluteJoint(1).Rz.Pos = -175.01868222044817;  % deg
smiData.RevoluteJoint(1).ID = '[yaw_motor_1_rotor-1:-:yaw_motor_1_stator-1]';

smiData.RevoluteJoint(2).Rz.Pos = 24.467148365906692;  % deg
smiData.RevoluteJoint(2).ID = '[yaw_part_2-1:-:roll_motor_rotor-1]';

smiData.RevoluteJoint(3).Rz.Pos = 2.8624992133171654e-14;  % deg
smiData.RevoluteJoint(3).ID = '[pitch_motor_rotor-2:-:pitch_motor_stator-2]';

smiData.RevoluteJoint(4).Rz.Pos = 175.04183440674035;  % deg
smiData.RevoluteJoint(4).ID = '[yaw_part_1-1:-:yaw_motor_1_rotor-1]';

smiData.RevoluteJoint(5).Rz.Pos = -34.571520221463324;  % deg
smiData.RevoluteJoint(5).ID = '[roll_part_2-1:-:pitch_motor_rotor-2]';

smiData.RevoluteJoint(6).Rz.Pos = -115.12971888185781;  % deg
smiData.RevoluteJoint(6).ID = '[roll_motor_rotor-1:-:roll_motor_stator-3]';

