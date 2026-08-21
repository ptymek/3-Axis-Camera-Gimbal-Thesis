clear all
J = 7.22e-6; %Inercja
Kt=8.44e-3; %sta³a pr¹dowa
Kv=8.44e-3; %Kv
L=0.42e-3; %indukcyjnoœæ
R=7.9; %rezystancja
F=5e-5; %tarcie

% engine = tf (Kt,[L*J R*J+L*F R*F+Kt*Kv 0]);
% figure(1)
% bode(engine)
% figure(2)
% step(engine)

