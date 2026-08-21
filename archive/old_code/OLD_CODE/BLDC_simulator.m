%clear all

J = 7.22e-6; %Inercja
Kt=8.44e-3; %sta³a pr¹dowa
Kv=8.44e-3; %Kv
L=0.42e-3; %indukcyjnoœæ
R=7.9; %rezystancja
F=5e-5; %tarcie

s1 = c2d(tf(1,[L R]),0.000001);
[a1,b1,c1,d1]=tf2ss(1,[L R]);