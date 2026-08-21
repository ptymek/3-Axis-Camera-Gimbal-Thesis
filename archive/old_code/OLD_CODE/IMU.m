%funkcja wyznaczaj¹ca po³o¿enie kamery wzglêdem ziemi z u¿yciem informacji
%o akutalnym po³o¿eniu silników oraz po³o¿eniu uk³adu bazowego
% "Stephan von Nispen - Design and control of a three-axis gimbal" rozdzia³
% 4.3 - "IMU"
function [IMU_1, IMU_2, IMU_3] = IMU(outside_roll,outside_pitch,outside_yaw,gimbal_roll , gimbal_pitch , gimbal_yaw , gimbal_roll_speed ,gimbal_pitch_speed , gimbal_yaw_speed )
% k¹ty gimbala
theta_1 = gimbal_yaw ;
theta_2 = gimbal_pitch ;
theta_3 = gimbal_roll ;

J_0 =[1 0 0;
    0 cos(theta_1) -sin(theta_1);
   -sin(theta_2) cos(theta_2)*sin(theta_1) cos(theta_1)*cos(theta_2)];
Phi_0 = [outside_yaw; outside_pitch; outside_roll];

Omega_phi = J_0*Phi_0;

Omega = [gimbal_yaw_speed; gimbal_pitch_speed; gimbal_roll_speed];

J = [cos(theta_2)*cos(theta_3) sin(theta_3) 0;
    cos(theta_2)*sin(theta_3) cos(theta_3) 0;
    -sin(theta_2) 0 1];
A=J*(Omega_phi + Omega);

IMU_1 = A(1); %yaw
IMU_2 = A(2); %pitch
IMU_3 = A(3); %roll

end