% 
clear all
%function x_dot = fcn(roll,pitch,yaw,roll_dot,pitch_dot,yaw_dot,roll_torque,pitch_torque,yaw_torque,IMU_1,IMU_2,IMU_3)
 
 % K¹ty w odpowienich osiach
 theta_1 = 1 ;
 theta_2 = 2 ;
 theta_3 = 3 ;
 % Prêdkoœci k¹towe w odpowiednich osiach
 om_1 = 1 ;
 om_2 = 0.5 ;
 om_3 = 1.5 ;

 % K¹ty odczytane z ¿yroskopu
 alpha_1 = 0 ;
 alpha_2 = 0 ;
 alpha_3 = 0 ;

 % liczba osi
 joints = 3; %

 % wymiary gimbala
 l_1 =72/1000; %
 h_1 =90/1000;
 b_1 =67/1000;
 h_3 =8/1000;

 % masy poszczególnych elementach
 m = [0.025 0.027 0.174];

 % sta³a grawitacji
 g =9.81;

 % odleg³oœci miêdzy poszczególnymi uk³adami wspó³rzêdnych
 x_1 = 0;
 x_2 = -28/1000;
 x_3 = 2/1000;

 y_1 =27/1000;
 y_2 = -29/1000;
 y_3 = -2/1000;
 z_1 =38/1000;
 z_2 =0;
 z_3 = -18/1000;

 % macierz pseudo-inercji
 I11 =[(-85/1000000+51/1000000+38/1000000)/2 0 0 m(1)*x_1 ;
     0 (85/1000000-51/1000000+38/1000000)/2 -40/1000000 m(1)*y_1;
     0 -40/1000000 (85/1000000+51/1000000-38/1000000)/2 m(1)*z_1 ;
     m(1)*x_1 m(1)*y_1 m(1)*z_1 m(1)];
 
 I22 =[(-34/1000000+41/1000000+72/1000000)/2 33/1000000 0 m(2)*x_2;
 33/1000000 (34/1000000-41/1000000+72/1000000)/2 0 m(2)*y_2;
 0 0 (34/1000000+41/1000000-72/1000000)/2 m(2)*z_2;
 m(2)*x_2 m(2)*y_2 m(2)*z_2 m(2)];
 I33 =[(-96/1000000+149/1000000+73/1000000)/2 -1/1000000 -2/1000000 m(3)*x_3;
 -1/1000000 (96/1000000-149/1000000+73/1000000)/2 7/1000000 m(3)*y_3;
 -2/1000000 7/1000000 (96/1000000+149/1000000-73/1000000)/2 m(3)*z_3 ;
 m(3)*x_3 m(3)*y_3 m(3)*z_3 m(3)];

 %
 I = cell (1 ,3);
 I {1} = I11 ;
 I {2} = I22 ;
 I {3} = I33 ;

 %
 rr1 = [ x_1 ; y_1 ; z_1 ; 1];
 rr2 = [ x_2 ; y_2 ; z_2 ; 1];
 rr3 = [ x_3 ; y_3 ; z_3 ; 1];
 rr = cell (1 ,3);
 rr {1} = rr1 ;
 rr {2} = rr2 ;
 rr {3} = rr3 ;



 % macierze obliczenia
 theta = [ theta_1 theta_2 theta_3 ];
 om = [ om_1 om_2 om_3 ];
 H = cell (joints ,1) ;
H{1}=zeros(3,3);
%  H{2}=zeros(3,3);
%  H{3}=zeros(3,3);
 T = cell (1, joints );
 G = zeros(joints,1);

 % macierz rotacji
 R01 = [cos(theta_1) -sin(theta_1) 0; sin(theta_1) cos(theta_1) 0; 0 0 1];
 R12 = [cos(theta_2) 0 sin(theta_2); 0 1 0; -sin(theta_2) 0 cos(theta_2)];
 R23 = [ 1 0 0; 0 cos(theta_3) -sin(theta_3); 0 sin(theta_3) cos(theta_3)];
 R03 = R01 * R12 * R23 ;

 % macierz translacji
 d01 =[ l_1 *sin(theta_1); -l_1*cos(theta_1); h_1];
 d12 = [ b_1 *cos(theta_2); l_1; b_1*sin(theta_2)];
 d23 = [-b_1; h_3*sin(theta_3); h_3*cos(theta_3)];

 % macierz homogeniczna translacji miêdzy uk³adami wspó³rzêdnych
 T01 = [ R01 d01; 0 0 0 1];
 T12 = [ R12 d12; 0 0 0 1];
 T23 = [ R23 d23; 0 0 0 1];
 T02 = T01 * T12 ;
 T03 = T01 * T12 * T23 ;
 T{1} = T01;
 T{2} = T02 ;
 T{3} = T03 ;

 % korekta sta³ej grawitacji
 gg = R03*[-sin(alpha_2); cos(alpha_2)*sin(alpha_3);cos(alpha_2)*cos(alpha_2)]*g;
 gg = [gg;0];
 % 
 for i=1:joints
    for j=1:joints
        for k=1:joints

            r=max([i,j,k]);
            H{i}(j,k) = (diff(diff(T{r}, theta(j)), theta(k))*I{r}*transpose(diff(T{r},theta(i))))*om(j)*om(k);
            %H(i,j,k) = trace(diff(diff(T{r}, theta(j)), theta(k))*I{r}*transpose(diff(T{r},theta(i))))*om(j)*om(k);
        
        end
    end
 end


%  for i=1:joints
%  H{i} = sum(sum(H{i}));
%  %H{i} = simplify(H{i});
%  end

 %
%  D = sym(zeros(joints,joints));
% 
%  for i=1:joints
%  for j=1:joints
%  
%  for r=max([i,j]):joints
%  Z = trace(diff(T{r},theta(j))*I{r}*transpose(diff(T{r},theta(i))));
% 
%  D(i,j) =D(i,j)+ Z;
%  end
%  end
%  end
% 
%  D = simplify(D);

 %
%  for i = 1:joints
%  for r = 1:joints
%  G(i) =G(i) - m(r)*transpose(gg)*diff(T{r},theta(i))*rr{r};
%  end
%  end

% H=[H{1}; H{2}; H{3}];



 % momenty z silnika DC
 T1 = 1 ;
 T2 = 1 ;
 T3 = 1 ;

 % wartoœci tarcia statycznego i dynamicznego
 t_s = 2*10^(-17)*[1; 1; 1];
 t_d = 0.001*[1; 1; 1];

 % wektor prêdkoœci k¹towych
 Omega = [om_1 ; om_2 ; om_3 ];

 % wartoœci taræ
 Q = [T1-t_s(1)*sign(Omega(1))-t_d(1)*(Omega(1));
 T2-t_s(2)*sign(Omega(2))-t_d(2)*(Omega(2));
 T3-t_s(3)*sign(Omega(3))-t_d(3)*(Omega(3))];

 %
 % wyjœcie funkcji
%  x_dot = [inv(D)*(Q-H-G); Omega];

 