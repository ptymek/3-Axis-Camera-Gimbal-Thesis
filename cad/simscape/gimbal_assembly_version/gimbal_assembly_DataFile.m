% Simscape(TM) Multibody(TM) version: 6.0

% This is a model data file derived from a Simscape Multibody Import XML file using the smimport function.
% The data in this file sets the block parameter values in an imported Simscape Multibody model.
% For more information on this file, see the smimport function help page in the Simscape Multibody documentation.
% You can modify numerical values, but avoid any other changes to this file.
% Do not add code to this file. Do not edit the physical units shown in comments.

%%%VariableName:smiData


%============= RigidTransform =============%

%Initialize the RigidTransform structure array by filling in null values.
smiData.RigidTransform(20).translation = [0.0 0.0 0.0];
smiData.RigidTransform(20).angle = 0.0;
smiData.RigidTransform(20).axis = [0.0 0.0 0.0];
smiData.RigidTransform(20).ID = '';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(1).translation = [0 0 0.0029999999999999992];  % m
smiData.RigidTransform(1).angle = 0;  % rad
smiData.RigidTransform(1).axis = [0 0 0];
smiData.RigidTransform(1).ID = 'B[yaw_motor_1_stator-1:-:]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(2).translation = [-0.037192748387332483 -4.3368086899420177e-19 0.0042862974690130728];  % m
smiData.RigidTransform(2).angle = 2.0943951023931957;  % rad
smiData.RigidTransform(2).axis = [-0.57735026918962584 -0.57735026918962573 -0.57735026918962573];
smiData.RigidTransform(2).ID = 'F[yaw_motor_1_stator-1:-:]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(3).translation = [-0.05381842850656688 -0.05206432574152469 0.039711723158316739];  % m
smiData.RigidTransform(3).angle = 3.129319314770608;  % rad
smiData.RigidTransform(3).axis = [0.9999859752999023 -3.2500972739811928e-05 -0.0052960501498949923];
smiData.RigidTransform(3).ID = 'B[roll_parts-1:-:pitch_parts-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(4).translation = [-0.053818428506566908 -0.05206432574152469 0.039711723158315719];  % m
smiData.RigidTransform(4).angle = 3.1293193147706071;  % rad
smiData.RigidTransform(4).axis = [0.9999859752999023 -3.2500972739814673e-05 -0.0052960501498951641];
smiData.RigidTransform(4).ID = 'F[roll_parts-1:-:pitch_parts-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(5).translation = [-0.03719274838733249 -0.013499999999999998 0.0042862974690130737];  % m
smiData.RigidTransform(5).angle = 2.0943951023931953;  % rad
smiData.RigidTransform(5).axis = [-0.57735026918962584 -0.57735026918962584 -0.57735026918962584];
smiData.RigidTransform(5).ID = 'B[yaw_parts-2:-:yaw_motor_1_stator-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(6).translation = [1.3196180395158921e-16 1.0408340855860843e-17 -0.010499999999999999];  % m
smiData.RigidTransform(6).angle = 1.1877434799578704e-16;  % rad
smiData.RigidTransform(6).axis = [0.70652100712558197 -0.70769207038814097 -2.9693546277483283e-17];
smiData.RigidTransform(6).ID = 'F[yaw_parts-2:-:yaw_motor_1_stator-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(7).translation = [-0.017696490617232857 -0.052500000000000054 0.0038297528799220784];  % m
smiData.RigidTransform(7).angle = 2.1005217029513914;  % rad
smiData.RigidTransform(7).axis = [0.57937811084845714 0.57937811084845658 0.57327306699281322];
smiData.RigidTransform(7).ID = 'B[roll_parts-1:-:yaw_parts-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(8).translation = [-0.017696490617232604 -0.052499999999999575 0.0038297528799220389];  % m
smiData.RigidTransform(8).angle = 2.1005217029513923;  % rad
smiData.RigidTransform(8).axis = [0.57937811084845692 0.5793781108484567 0.57327306699281333];
smiData.RigidTransform(8).ID = 'F[roll_parts-1:-:yaw_parts-2]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(9).translation = [-0.03719274838733249 -0.0034999999999999988 0.0042862974690130754];  % m
smiData.RigidTransform(9).angle = 3.0451965952175;  % rad
smiData.RigidTransform(9).axis = [0.048235386043450103 0.70628370628708392 -0.70628370628708381];
smiData.RigidTransform(9).ID = 'AssemblyGround[yaw_parts-2:yaw_motor_1_rotor-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(10).translation = [-0.010696883350446792 -0.052500000000000026 0.0037556036334123293];  % m
smiData.RigidTransform(10).angle = 2.842401025243559;  % rad
smiData.RigidTransform(10).axis = [0.70254660597386454 0.15232692990931621 0.69514370662403746];
smiData.RigidTransform(10).ID = 'AssemblyGround[yaw_parts-2:roll_motor_rotor-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(11).translation = [-0.0071970797170538637 -0.016000000000000413 0.0037185290101572877];  % m
smiData.RigidTransform(11).angle = 3.1415926535897922;  % rad
smiData.RigidTransform(11).axis = [0.71084201813813519 -3.3143657388164988e-16 0.70335170807306879];
smiData.RigidTransform(11).ID = 'AssemblyGround[yaw_parts-2:yaw_part_2-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(12).translation = [-0.0031946559486574128 -0.013500000000000022 0.0039261439859656451];  % m
smiData.RigidTransform(12).angle = 2.0882900968979174;  % rad
smiData.RigidTransform(12).axis = [0.58142747102744885 -0.57530083258006226 0.57530083258006171];
smiData.RigidTransform(12).ID = 'AssemblyGround[yaw_parts-2:yaw_part_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(13).translation = [-0.0538766842412466 -0.052131824570302555 0.034212445916942072];  % m
smiData.RigidTransform(13).angle = 3.1281137625913158;  % rad
smiData.RigidTransform(13).axis = [0.26637189001611666 -0.96385980795764048 0.0045040884873725527];
smiData.RigidTransform(13).ID = 'AssemblyGround[pitch_parts-2:pitch_motor_stator-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(14).translation = [-0.053334140425511795 -0.071950721957085212 0.027949103951171107];  % m
smiData.RigidTransform(14).angle = 3.1273688439866705;  % rad
smiData.RigidTransform(14).axis = [-0.014735276751559556 0.70273618237092672 -0.71129791902253636];
smiData.RigidTransform(14).ID = 'AssemblyGround[pitch_parts-2:camera_mount_2-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(15).translation = [-0.053183834419089249 -0.075917838351010056 0.030496533169321445];  % m
smiData.RigidTransform(15).angle = 3.1308119675982873;  % rad
smiData.RigidTransform(15).axis = [0.015448208761204523 -0.99986234150891717 0.0060539968925962234];
smiData.RigidTransform(15).ID = 'AssemblyGround[pitch_parts-2:camera_mount_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(16).translation = [-0.017362844136794453 -0.052113415798817724 0.035325613444153213];  % m
smiData.RigidTransform(16).angle = 1.570927031959922;  % rad
smiData.RigidTransform(16).axis = [-0.00083988241810206417 0.011431888866106372 0.99993430109906567];
smiData.RigidTransform(16).ID = 'AssemblyGround[roll_parts-1:roll_part_2-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(17).translation = [-0.053760172771887146 -0.051996826912746819 0.045211000399690449];  % m
smiData.RigidTransform(17).angle = 3.1394799737773633;  % rad
smiData.RigidTransform(17).axis = [-0.54912628420575815 -0.83570074455287024 0.0080367622930669208];
smiData.RigidTransform(17).ID = 'AssemblyGround[roll_parts-1:pitch_motor_rotor-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(18).translation = [-0.011196855298074522 -0.052500000000000019 0.003760900008163026];  % m
smiData.RigidTransform(18).angle = 2.0950265627692035;  % rad
smiData.RigidTransform(18).axis = [0.57748992887917416 -0.57085013139567109 -0.58363988000193368];
smiData.RigidTransform(18).ID = 'AssemblyGround[roll_parts-1:roll_motor_stator-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(19).translation = [-0.014820616591616839 -0.052064325741524739 0.039298605927762409];  % m
smiData.RigidTransform(19).angle = 2.0954402859512098;  % rad
smiData.RigidTransform(19).axis = [-0.57762327390742196 -0.57057735426521938 0.58377464508162202];
smiData.RigidTransform(19).ID = 'AssemblyGround[roll_parts-1:roll_part_1-1]';

%Translation Method - Cartesian
%Rotation Method - Arbitrary Axis
smiData.RigidTransform(20).translation = [-0.037192748387332483 -0.0030000000000000001 0.0042862974690130728];  % m
smiData.RigidTransform(20).angle = 1.5707964689545399;  % rad
smiData.RigidTransform(20).axis = [-0.99999985784036682 0.00037704061201862581 0.00037704061201861486];
smiData.RigidTransform(20).ID = 'RootGround[yaw_motor_1_stator-1]';


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
smiData.Solid(1).mass = 0.002723760830662351;  % kg
smiData.Solid(1).CoM = [0 0 1.5];  % mm
smiData.Solid(1).MoI = [0.19883454063835168 0.19883454063835168 0.39358344003070983];  % kg*mm^2
smiData.Solid(1).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(1).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(1).opacity = 1;
smiData.Solid(1).ID = 'yaw_motor_1_stator*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(2).mass = 0.009079202768874502;  % kg
smiData.Solid(2).CoM = [0 0 5];  % mm
smiData.Solid(2).MoI = [0.73163242312513699 0.73163242312513699 1.3119448001023659];  % kg*mm^2
smiData.Solid(2).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(2).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(2).opacity = 1;
smiData.Solid(2).ID = 'yaw_motor_1_rotor*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(3).mass = 0.0064653976810877924;  % kg
smiData.Solid(3).CoM = [0 0 5.2500000000000009];  % mm
smiData.Solid(3).MoI = [0.37620532756829594 0.37620532756829583 0.63360897274660377];  % kg*mm^2
smiData.Solid(3).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(3).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(3).opacity = 1;
smiData.Solid(3).ID = 'roll_motor_rotor*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(4).mass = 0.002025322605244872;  % kg
smiData.Solid(4).CoM = [-0.083773586837682726 17.600235242716192 1.9999999999999996];  % mm
smiData.Solid(4).MoI = [0.41791086811503503 0.14368763962505357 0.55619764745943556];  % kg*mm^2
smiData.Solid(4).PoI = [0 0 -0.0034394850439133577];  % kg*mm^2
smiData.Solid(4).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(4).opacity = 1;
smiData.Solid(4).ID = 'yaw_part_2*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(5).mass = 0.0019544109212330978;  % kg
smiData.Solid(5).CoM = [0 23.972694954701193 1.25];  % mm
smiData.Solid(5).MoI = [0.37586574298498771 0.10225738127341961 0.47608727954878949];  % kg*mm^2
smiData.Solid(5).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(5).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(5).opacity = 1;
smiData.Solid(5).ID = 'yaw_part_1*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(6).mass = 0.0024630086404143978;  % kg
smiData.Solid(6).CoM = [0 0 2.0000000000000004];  % mm
smiData.Solid(6).MoI = [0.12397143490085803 0.123971434900858 0.24137484676061097];  % kg*mm^2
smiData.Solid(6).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(6).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(6).opacity = 1;
smiData.Solid(6).ID = 'pitch_motor_stator*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(7).mass = 0.003873650459150643;  % kg
smiData.Solid(7).CoM = [0 32.072526832842165 2];  % mm
smiData.Solid(7).MoI = [1.6823296993444665 0.26333688104453268 1.9353368458312639];  % kg*mm^2
smiData.Solid(7).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(7).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(7).opacity = 1;
smiData.Solid(7).ID = 'camera_mount_2*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(8).mass = 0.0016028982473021837;  % kg
smiData.Solid(8).CoM = [0 17.836712332830256 1.2500000000000002];  % mm
smiData.Solid(8).MoI = [0.17760270660354049 0.076534998127696804 0.2524680190569642];  % kg*mm^2
smiData.Solid(8).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(8).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(8).opacity = 1;
smiData.Solid(8).ID = 'camera_mount_1*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(9).mass = 0.0019188015734983991;  % kg
smiData.Solid(9).CoM = [-0.041534044127053978 17.807040728889699 2];  % mm
smiData.Solid(9).MoI = [0.4123926274177766 0.13630684098794918 0.54358266420973012];  % kg*mm^2
smiData.Solid(9).PoI = [0 0 -0.002795010039997351];  % kg*mm^2
smiData.Solid(9).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(9).opacity = 1;
smiData.Solid(9).ID = 'roll_part_2*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(10).mass = 0.0064653976810877933;  % kg
smiData.Solid(10).CoM = [0 0 5.2500000000000009];  % mm
smiData.Solid(10).MoI = [0.37620532756829594 0.37620532756829583 0.63360897274660366];  % kg*mm^2
smiData.Solid(10).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(10).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(10).opacity = 1;
smiData.Solid(10).ID = 'pitch_motor_rotor*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(11).mass = 0.0024630086404143973;  % kg
smiData.Solid(11).CoM = [0 0 2.0000000000000004];  % mm
smiData.Solid(11).MoI = [0.12397143490085803 0.123971434900858 0.24137484676061097];  % kg*mm^2
smiData.Solid(11).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(11).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(11).opacity = 1;
smiData.Solid(11).ID = 'roll_motor_stator*:*Domyślna';

%Inertia Type - Custom
%Visual Properties - Simple
smiData.Solid(12).mass = 0.0017910162125603067;  % kg
smiData.Solid(12).CoM = [0 24.145799607708206 1.25];  % mm
smiData.Solid(12).MoI = [0.39112089111361897 0.089038852329601223 0.47829410155513652];  % kg*mm^2
smiData.Solid(12).PoI = [0 0 0];  % kg*mm^2
smiData.Solid(12).color = [0.792156862745098 0.81960784313725488 0.93333333333333335];
smiData.Solid(12).opacity = 1;
smiData.Solid(12).ID = 'roll_part_1*:*Domyślna';


%============= Joint =============%
%X Revolute Primitive (Rx) %Y Revolute Primitive (Ry) %Z Revolute Primitive (Rz)
%X Prismatic Primitive (Px) %Y Prismatic Primitive (Py) %Z Prismatic Primitive (Pz) %Spherical Primitive (S)
%Constant Velocity Primitive (CV) %Lead Screw Primitive (LS)
%Position Target (Pos)

%Initialize the PlanarJoint structure array by filling in null values.
smiData.PlanarJoint(1).Rz.Pos = 0.0;
smiData.PlanarJoint(1).Px.Pos = 0.0;
smiData.PlanarJoint(1).Py.Pos = 0.0;
smiData.PlanarJoint(1).ID = '';

smiData.PlanarJoint(1).Rz.Pos = -90.043205675642142;  % deg
smiData.PlanarJoint(1).Px.Pos = 0;  % m
smiData.PlanarJoint(1).Py.Pos = 0;  % m
smiData.PlanarJoint(1).ID = '[yaw_motor_1_stator-1:-:]';


%Initialize the RevoluteJoint structure array by filling in null values.
smiData.RevoluteJoint(3).Rz.Pos = 0.0;
smiData.RevoluteJoint(3).ID = '';

smiData.RevoluteJoint(1).Rz.Pos = 2.0022533898630868;  % deg
smiData.RevoluteJoint(1).ID = '[roll_parts-1:-:pitch_parts-2]';

smiData.RevoluteJoint(2).Rz.Pos = 90.094889473472264;  % deg
smiData.RevoluteJoint(2).ID = '[yaw_parts-2:-:yaw_motor_1_stator-1]';

smiData.RevoluteJoint(3).Rz.Pos = -1.3184750764400768;  % deg
smiData.RevoluteJoint(3).ID = '[roll_parts-1:-:yaw_parts-2]';

