s1=tf([1],[0.002 1]);
s2=tf([1],[0.0015 1]);
motor =s1*s2;
[A,B,C,D]=ssdata(motor);
k_ack=acker(A,B,[-666.666 -500]);
motor_lqr2=ss(A-B*k_ack,B,C,D);
N = inv([A B;C D])*[0;0;1];
Nx=[N(1); N(2)];
Nu=N(3);

% motor_d=c2d(motor,1e-5);
% hold on;
% step(motor)
% step(motor_lqr2)