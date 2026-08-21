function gim_dyn = gimbal_dynamics(roll,pitch,yaw,yaw_speed,pitch_speed,roll_speed,roll_torque,pitch_torque,yaw_torque,IMU_1,IMU_2,IMU_3)

%sta³a grawitacji
g = 9.81;

%³adowanie macierzy dot. masy i bezw³adnoœci gimbala
load('data.mat')
I1=data{1};
I2=data{2};
I3=data{3};
DIM=data{4};
DIS=data{5};
M=data{6};
%-------------ZMIENNE--------------
% odczyty z IMU
alpha_1 = IMU_1;
alpha_2 = IMU_2;
alpha_3 = IMU_3;
IMU = [alpha_1; alpha_2; alpha_3];

% momenty generowane przez silnik - zmienne sterujace
 T1 = yaw_torque ;
 T2 = pitch_torque ;
 T3 = roll_torque ;
%predkosci katowe osiagane przez gimbal
 om_1 = yaw_speed ;
 om_2 = pitch_speed ;
 om_3 = roll_speed ;
Omega = [om_1; om_2; om_3];
%k¹ty osiagane aktualnie przez gimbal
 theta_1 = yaw ;
 theta_2 = pitch ;
 theta_3 = roll ;
    THETA = [theta_1; theta_2; theta_3];

%---------------FUNKCJE---------------------

H = calculate_H_matrix(THETA,Omega,I1,I2,I3,DIM);
D = calculate_D_matrix(THETA,I1,I2,I3,DIM);
Q = calculate_Q_matrix(T1,T2,T3,Omega);
G = calculate_G_matrix(IMU,THETA,DIM,g,M,DIS);

gim_dyn = [inv(D)*(Q-H-G); Omega];
end