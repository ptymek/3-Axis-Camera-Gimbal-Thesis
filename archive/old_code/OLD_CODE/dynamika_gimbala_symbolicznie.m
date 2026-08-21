clear all
syms alfa beta gamma theta_1 theta_2 theta_3 om_1 om_2 om_3 alpha_1 alpha_2 alpha_3 ... 
    l_1 h_1 h_3 b_1 x_1 x_2 x_3 y_1 y_2 y_3 z_1 z_2 z_3 m1 m2 m3 g ...
    I1_1_1 I1_1_2 I1_1_3 I1_1_4 ...
    I1_2_1 I1_2_2 I1_2_3 I1_2_4 ...
    I1_3_1 I1_3_2 I1_3_3 I1_3_4 ...
    I1_4_1 I1_4_2 I1_4_3 I1_4_4 ...
    I2_1_1 I2_1_2 I2_1_3 I2_1_4 ...
    I2_2_1 I2_2_2 I2_2_3 I2_2_4 ...
    I2_3_1 I2_3_2 I2_3_3 I2_3_4 ...
    I2_4_1 I2_4_2 I2_4_3 I2_4_4 ...
    I3_1_1 I3_1_2 I3_1_3 I3_1_4 ...
	I3_2_1 I3_2_2 I3_2_3 I3_2_4 ...
	I3_3_1 I3_3_2 I3_3_3 I3_3_4 ...
	I3_4_1 I3_4_2 I3_4_3 I3_4_4 ...
    T1 T2 T3 t_s t_d tsv tdv;
%     I11_1 I11_6 I11_7 I11_10 I11_11 ...
%     I22_1 I22_3 I22_5 I22_6 I22_11 ...
%     I33_1 I33_2 I33_3 I33_5 I33_6 I33_7 I33_9 I33_10 I33_11...
joints = 3;
t_s = [tsv tsv tsv];
t_d = [tdv tdv tdv];
 % masy poszczególnych elementach
 m = [m1 m2 m3];
 om = [om_1 om_2 om_3];
 Omega = [om_1 ; om_2 ; om_3];
 % macierz pseudo-inercji
%  I11 =[I11_1 0 0 m(1)*x_1 ;
%      0 I11_6 I11_7 m(1)*y_1;
%      0 I11_10 I11_11 m(1)*z_1 ;
%      m(1)*x_1 m(1)*y_1 m(1)*z_1 m(1)]; 
%  I22 =[I22_1 I22_3 0 m(2)*x_2;
%        I22_5 I22_6 0 m(2)*y_2;
%        0 0 I22_11 m(2)*z_2;
%        m(2)*x_2 m(2)*y_2 m(2)*z_2 m(2)];
% 
%  I33 =[I33_1 I33_2 I33_3 m(3)*x_3;
%        I33_5 I33_6 I33_7 m(3)*y_3;
%        I33_9 I33_10 I33_11 m(3)*z_3;
%  m(3)*x_3 m(3)*y_3 m(3)*z_3 m(3)];
I11=[I1_1_1 I1_1_2 I1_1_3 I1_1_4;
 I1_2_1 I1_2_2 I1_2_3 I1_2_4;
 I1_3_1 I1_3_2 I1_3_3 I1_3_4;
 I1_4_1 I1_4_2 I1_4_3 I1_4_4];
I22=[I2_1_1 I2_1_2 I2_1_3 I2_1_4;
 I2_2_1 I2_2_2 I2_2_3 I2_2_4;
 I2_3_1 I2_3_2 I2_3_3 I2_3_4;
 I2_4_1 I2_4_2 I2_4_3 I2_4_4];
I33=[I3_1_1 I3_1_2 I3_1_3 I3_1_4;
 I3_2_1 I3_2_2 I3_2_3 I3_2_4;
 I3_3_1 I3_3_2 I3_3_3 I3_3_4;
 I3_4_1 I3_4_2 I3_4_3 I3_4_4];
 
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
 T = cell (1, joints );
 G = sym(zeros(joints,1));
 D = sym(zeros(joints, joints));
 % macierz rotacji
 R01 = [cos(theta_1) -sin(theta_1) 0; sin(theta_1) cos(theta_1) 0; 0 0 1];
 R12 = [cos(theta_2) 0 sin(theta_2); 0 1 0; -sin(theta_2) 0 cos(theta_2)];
 R23 = [ 1 0 0; 0 cos(theta_3) -sin(theta_3); 0 sin(theta_3) cos(theta_3)];
 R03 = R01 * R12 * R23 ;
 % macierz translacji
 d01 =[ l_1 *sin(theta_1); -l_1*cos(theta_1); h_1];
 d12 = [ b_1 *cos(theta_2); l_1; b_1*sin(theta_2)];
 d23 = [-b_1; h_3 *sin(theta_3); h_3*cos(theta_3)];
 % macierz homogeniczna translacji miêdzy uk³adami wspó³rzêdnych
 T01 = [ R01 d01; 0 0 0 1];
 T12 = [ R12 d12; 0 0 0 1];
 T23 = [ R23 d23; 0 0 0 1];
 T02 = T01 * T12 ;
 T03 = T01 * T12 * T23 ;
 T {1} = T01;
 T {2} = T02 ;
 T {3} = T03 ;
 % korekta sta³ej grawitacji
 gg = R03*[-sin(alpha_2); cos(alpha_2)*sin(alpha_3);cos(alpha_2)*cos(alpha_2)]*g;
 gg = [gg;sym('0')];
 % obliczanie macierzy si³y Coriolisa
for i=1:joints
    for j=1:joints
        for k=1:joints

            r=max([i,j,k]);
            H{i}(j,k) = trace(diff(diff(T{r}, theta(j)), theta(k))*I{r}*transpose(diff(T{r},theta(i))))*om(j)*om(k);
                  
        end
    end
end
for i=1:joints
 H{i} = sum(sum(H{i}));
 H{i} = simplify(H{i});
end
 
for i=1:joints
    for j=1:joints
        for r=max([i,j]):joints
            Z = trace(diff(T{r},theta(j))*I{r}*transpose(diff(T{r},theta(i))));
            D(i,j) =D(i,j)+ Z;
        end
    end
 end
D = simplify(D);

 for i = 1:joints
 for r = 1:joints
 G(i) =G(i) - m(r)*transpose(gg)*diff(T{r},theta(i))*rr{r};
 end
 end
 % wartoœæ si³y tarcia
 Q = [T1-t_s(1)*sign(Omega(1))-t_d(1)*(Omega(1));
 T2-t_s(2)*sign(Omega(2))-t_d(2)*(Omega(2));
 T3-t_s(3)*sign(Omega(3))-t_d(3)*(Omega(3))];
%x_dot = [inv(D)*(Q-H-G); Omega];