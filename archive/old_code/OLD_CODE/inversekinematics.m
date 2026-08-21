 syms  yaw_m pitch_m roll_m rd11 rd12 rd13 rd21 rd22 rd23 rd31 rd32 rd33 rg11 rg12 rg13 rg21 rg22 rg23 rg31 rg32 rg33
%  yaw_d pitch_d roll_d yaw_g pitch_g roll_g
%  Rd01 = [cos(yaw_d) -sin(yaw_d) 0; sin(yaw_d) cos(yaw_d) 0; 0 0 1];
%  Rd12 = [cos(pitch_d) 0 sin(pitch_d); 0 1 0; -sin(pitch_d) 0 cos(pitch_d)];
%  Rd23 = [ 1 0 0; 0 cos(roll_d) -sin(roll_d); 0 sin(roll_d) cos(roll_d)];
%  Rd=Rd01*Rd12*Rd23 ;
%  Rg01 = [cos(yaw_g) -sin(yaw_g) 0; sin(yaw_g) cos(yaw_g) 0; 0 0 1];
%  Rg12 = [cos(pitch_g) 0 sin(pitch_g); 0 1 0; -sin(pitch_g) 0 cos(pitch_g)];
%  Rg23 = [ 1 0 0; 0 cos(roll_g) -sin(roll_g); 0 sin(roll_g) cos(roll_g)];
%  Rg=Rg01*Rg12*Rg23 ;
 Rd=[rd11 rd12 rd13; rd21 rd22 rd23; rd31 rd32 rd33];
 Rg=[rg11 rg12 rg13; rg21 rg22 rg23; rg31 rg32 rg33];
 Rm01 = [cos(yaw_m) -sin(yaw_m) 0; sin(yaw_m) cos(yaw_m) 0; 0 0 1];
 Rm12 = [cos(pitch_m) 0 sin(pitch_m); 0 1 0; -sin(pitch_m) 0 cos(pitch_m)];
 Rm23 = [ 1 0 0; 0 cos(roll_m) -sin(roll_m); 0 sin(roll_m) cos(roll_m)];
 Rm=Rm01*Rm12*Rm23 ;
 R=Rg*Rd*Rm