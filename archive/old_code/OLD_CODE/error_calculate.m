syms theta_1 theta_2 theta_3 error_1 error_2 error_3
R01 = [cos(theta_1) -sin(theta_1) 0; sin(theta_1) cos(theta_1) 0; 0 0 1];
R12 = [cos(theta_2) 0 sin(theta_2); 0 1 0; -sin(theta_2) 0 cos(theta_2)];
R23 = [ 1 0 0; 0 cos(theta_3) -sin(theta_3); 0 sin(theta_3) cos(theta_3)];
R03 = R01 * R12 * R23 ;

E=[cos(error_1)*cos(error_3)-sin(error_1)*sin(error_2)*sin(error_3) -cos(error_2)*sin(error_1) cos(error_1)*sin(error_1)+cos(error_3)*sin(error_1)*sin(error_2);
cos(error_3)*sin(error_1)+cos(error_1)*sin(error_2)*sin(error_2) cos(error_1)*cos(error_2) sin(error_1)*sin(error_3)-cos(error_1)*cos(error_3)*sin(error_2);
-cos(error_2)*sin(error_3) sin(error_2) cos(error_2)*cos(error_3)];



r12 = E(1,2);
r22 = E(2,2);
r31 = E(3,1);
r32 = E(3,2);
r33 = E(3,3);
theta_1=atan2(-r12,r22);
theta_2=asin(r32);
theta_3=atan2(-r31,r33);
