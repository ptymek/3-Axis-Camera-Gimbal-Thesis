%load data_sim.txt;
% pitch_motor=pitch_motor.data;
% roll_motor=roll_motor.data;
% yaw_motor=yaw_motor.data;
% roll_position=roll_position.data;
% pitch_position=pitch_position.data;
% yaw_position=yaw_position.data;


%clearvars
% load danedynucz15.txt
% load danedynwer15.txt
% ud_ucz=danedynucz15(:,1);
% yd_ucz=danedynucz15(:,2);
% ud_wer=danedynwer15(:,1);
% yd_wer=danedynwer15(:,2);

uy_ucz=yaw_motor_ucz;
up_ucz=pitch_motor_ucz;
ur_ucz=roll_motor_ucz;
uy_wer=yaw_motor_wer;
up_wer=pitch_motor_wer;
ur_wer=roll_motor_wer;
yy_ucz=yaw_position_ucz;
yp_ucz=pitch_position_ucz;
yr_ucz=roll_position_ucz;
yy_wer=yaw_position_wer;
yp_wer=pitch_position_wer;
yr_wer=roll_position_wer;


%ud_ucz=yaw_motor(1:6000);
%yd_ucz=yaw_position(1:6000);
%ud_wer=yaw_motor(6000:12000);
%yd_wer=yaw_position(6000:12000);
p=length(uy_ucz);

%b³êdy do wyznaczenia dla ka¿dego rzêdu dynamiki
% rekurencja na ucz¹cym             
% rekurencja na weryfikuj¹cym       
% bez_rekurencja na ucz¹cym         
% bez_rekurencja na weryfikuj¹cym   
% liczba wspó³czynników do obliczenia: w=rz_dyn*st_wiel*2
%model rekurencyjny - y brane s¹ z modelu z poprzednich chwil
%model bezrekurencyjny - y s¹ z danych 

E_arx_ucz=0; %b³ad modelu rekurencyjnego na zbiorze ucz¹cym
E_arx_wer=0; %b³ad modelu rekurencyjnego na zbiorze weryfikuj¹cym
E_oe_ucz=0;  %b³¹d modelu bez rekurencji na zbiorze ucz¹cym
E_oe_wer=0;  %b³¹d modelu bez rekurencji na zbiorze weryfikuj¹cym
%macierze odci¹¿aj¹ce kod
%YAW
yy_mod_ucz=zeros(1,10000); %uczacy
yy_mod_wer=zeros(1,10000); %weryfikuj¹cy
yy_mod_rwe=zeros(1,10000); %rekurencja weryfikuj¹cy
yy_mod_ruc=zeros(1,10000); %rekurencja uczacy

Ey_arx_ucz=0; %b³ad modelu rekurencyjnego na zbiorze ucz¹cym
Ey_arx_wer=0; %b³ad modelu rekurencyjnego na zbiorze weryfikuj¹cym
Ey_oe_ucz=0;  %b³¹d modelu bez rekurencji na zbiorze ucz¹cym
Ey_oe_wer=0;  %b³¹d modelu bez rekurencji na zbiorze weryfikuj¹cym
%PITCH
yp_mod_ucz=zeros(1,10000); %uczacy
yp_mod_wer=zeros(1,10000); %weryfikuj¹cy
yp_mod_rwe=zeros(1,10000); %rekurencja weryfikuj¹cy
yp_mod_ruc=zeros(1,10000); %rekurencja uczacy

Ep_arx_ucz=0; %b³ad modelu rekurencyjnego na zbiorze ucz¹cym
Ep_arx_wer=0; %b³ad modelu rekurencyjnego na zbiorze weryfikuj¹cym
Ep_oe_ucz=0;  %b³¹d modelu bez rekurencji na zbiorze ucz¹cym
Ep_oe_wer=0;  %b³¹d modelu bez rekurencji na zbiorze weryfikuj¹cym
%ROLL
yr_mod_ucz=zeros(1,10000); %uczacy
yr_mod_wer=zeros(1,10000); %weryfikuj¹cy
yr_mod_rwe=zeros(1,10000); %rekurencja weryfikuj¹cy
yr_mod_ruc=zeros(1,10000); %rekurencja uczacy

Er_arx_ucz=0; %b³ad modelu rekurencyjnego na zbiorze ucz¹cym
Er_arx_wer=0; %b³ad modelu rekurencyjnego na zbiorze weryfikuj¹cym
Er_oe_ucz=0;  %b³¹d modelu bez rekurencji na zbiorze ucz¹cym
Er_oe_wer=0;  %b³¹d modelu bez rekurencji na zbiorze weryfikuj¹cym
%macierze magazynowania b³êdów
E_rek_ucz=zeros(3,9);
E_rek_wer=zeros(3,9);
E_bre_ucz=zeros(3,9);
E_bre_wer=zeros(3,9);
typ=[11,12,13,21,22,23,31,32,33];

for i=1:9
dynamik = typ(i);

%zerowanie b³êdów przed kolejn¹ iteracj¹ liczenia

Ey_arx_ucz=0; %b³ad modelu rekurencyjnego na zbiorze ucz¹cym
Ey_arx_wer=0; %b³ad modelu rekurencyjnego na zbiorze weryfikuj¹cym
Ey_oe_ucz=0;  %b³¹d modelu bez rekurencji na zbiorze ucz¹cym
Ey_oe_wer=0;  %b³¹d modelu bez rekurencji na zbiorze weryfikuj¹cym
Ep_arx_ucz=0; %b³ad modelu rekurencyjnego na zbiorze ucz¹cym
Ep_arx_wer=0; %b³ad modelu rekurencyjnego na zbiorze weryfikuj¹cym
Ep_oe_ucz=0;  %b³¹d modelu bez rekurencji na zbiorze ucz¹cym
Ep_oe_wer=0;  %b³¹d modelu bez rekurencji na zbiorze weryfikuj¹cym
Er_arx_ucz=0; %b³ad modelu rekurencyjnego na zbiorze ucz¹cym
Er_arx_wer=0; %b³ad modelu rekurencyjnego na zbiorze weryfikuj¹cym
Er_oe_ucz=0;  %b³¹d modelu bez rekurencji na zbiorze ucz¹cym
Er_oe_wer=0;  %b³¹d modelu bez rekurencji na zbiorze weryfikuj¹cym



if     dynamik == 11 %skonfigurowane
    %dynamika 1 rzêdu,wielomian 1 stopnia
    Y=yd_ucz(2:p);
    M=[ud_ucz(1:p-1) yd_ucz(1:p-1)];
    wsp=M\Y;
    w=[wsp(1) 0 0 0 0 0 0 0 0 wsp(2) 0 0 0 0 0 0 0 0];
    y_mod_ucz(1)=yd_ucz(1);
    y_mod_wer(1)=yd_wer(1);
    y_mod_ruc(1)=yd_ucz(1);
    y_mod_rwe(1)=yd_ucz(1);
        for k = 2:p 
            y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(10)*yd_ucz(k-1); 	
			y_mod_wer(k)=w(1)*ud_wer(k-1)+w(10)*yd_wer(k-1); 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(10)*y_mod_ruc(k-1); 	
			y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(10)*y_mod_rwe(k-1);				
            %b³¹d modelu rekurencyjnego
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
        end 
elseif dynamik == 12    %skonfigurowane
    %dynamika 2 rzêdu,wielomian 1 stopnia
    Y=yd_ucz(3:p);
    M=[ud_ucz(2:p-1) ud_ucz(1:p-2) yd_ucz(2:p-1) yd_ucz(1:p-2)];
    wsp=M\Y;
    w=[wsp(1) 0 0 wsp(2) 0 0 0 0 0 wsp(3) 0 0 wsp(4) 0 0 0 0 0];
    y_mod_ucz(1:2)=yd_ucz(1:2);
    y_mod_wer(1:2)=yd_wer(1:2);
    y_mod_ruc(1:2)=yd_ucz(1:2);
    y_mod_rwe(1:2)=yd_ucz(1:2);
        for k=3:p
			y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(4)*ud_ucz(k-2)+w(10)*yd_ucz(k-1)+w(13)*yd_ucz(k-2); 	
			y_mod_wer(k)=w(1)*ud_wer(k-1)+w(4)*ud_wer(k-2)+w(10)*yd_wer(k-1)+w(13)*yd_wer(k-2); 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(4)*ud_ucz(k-2)+w(10)*y_mod_ruc(k-1)+w(13)*y_mod_ruc(k-2); 	
			y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(4)*ud_wer(k-2)+w(10)*y_mod_rwe(k-1)+w(13)*y_mod_rwe(k-2); 	
			
            %b³¹d modelu rekurencyjnego           
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2;%b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
    end 
elseif dynamik == 13    %skonfigurowane
    % dynamika 3 rzêdu,wielomian 1 stopnia
    Y=yd_ucz(4:p);
    M=[ud_ucz(3:p-1) ud_ucz(2:p-2) ud_ucz(1:p-3) yd_ucz(3:p-1) yd_ucz(2:p-2) yd_ucz(1:p-3)];
    wsp=M\Y;
    w=[wsp(1) 0 0 wsp(2) 0 0 wsp(3) 0 0 wsp(4) 0  0 wsp(5) 0 0 wsp(6) 0 0 ];
    y_mod_ucz(1:3)=yd_ucz(1:3);
    y_mod_wer(1:3)=yd_wer(1:3);
    y_mod_ruc(1:3)=yd_ucz(1:3);
    y_mod_rwe(1:3)=yd_ucz(1:3);
        for k=4:p
            y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(4)*ud_ucz(k-2)+w(7)*ud_ucz(k-3)+w(10)*yd_ucz(k-1)+w(13)*yd_ucz(k-1)+w(16)*yd_ucz(k-3); 	
            y_mod_wer(k)=w(1)*ud_wer(k-1)+w(4)*ud_wer(k-2)+w(7)*ud_wer(k-3)+w(10)*yd_wer(k-1)+w(13)*yd_wer(k-1)+w(16)*yd_wer(k-3); 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(4)*ud_ucz(k-2)+w(7)*ud_ucz(k-3)+w(10)*y_mod_ruc(k-1)+w(13)*y_mod_ruc(k-2)+w(16)*y_mod_ruc(k-3); 	
            y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(4)*ud_wer(k-2)+w(7)*ud_wer(k-3)+w(10)*y_mod_rwe(k-1)+w(13)*y_mod_rwe(k-2)+w(16)*y_mod_rwe(k-3); 	
            %b³¹d modelu rekurencyjnego
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
    end    
elseif dynamik == 21 %skonfigurowane
    %dynamika 1 rzêdu,wielomian 2 stopnia,w=4
    Y=yd_ucz(2:p);
    M=[ud_ucz(1:p-1) ud_ucz(1:p-1).^2 yd_ucz(1:p-1) yd_ucz(1:p-1).^2];
    wsp=M\Y;
    w=[wsp(1) wsp(2) 0 0 0 0 0 0 0 wsp(3) wsp(4) 0 0 0 0 0 0 0];
    y_mod_ucz(1)=yd_ucz(1);
    y_mod_wer(1)=yd_wer(1);
    y_mod_ruc(1)=yd_ucz(1);
    y_mod_rwe(1)=yd_ucz(1);
        for k = 2:p
            y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(10)*yd_ucz(k-1)+w(11)*yd_ucz(k-1).^2; 	
			y_mod_wer(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(10)*yd_wer(k-1)+w(11)*yd_wer(k-1).^2; 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(10)*y_mod_ruc(k-1)+w(11)*y_mod_ruc(k-1).^2; 	
			y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(10)*y_mod_rwe(k-1)+w(11)*y_mod_rwe(k-1).^2; 	
			%b³¹d modelu rekurencyjnego
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
        end 
elseif dynamik == 22    %skonfigurowane
    %dynamika 2 rzêdu,wielomian 2 stopnia,w=8
    Y=yd_ucz(3:p);
    M=[ud_ucz(2:p-1) ud_ucz(2:p-1).^2 ud_ucz(1:p-2) ud_ucz(1:p-2).^2 yd_ucz(2:p-1) yd_ucz(2:p-1).^2 yd_ucz(1:p-2) yd_ucz(1:p-2).^2];
    wsp=M\Y;
    w=[wsp(1) wsp(2) 0 wsp(3) wsp(4) 0 0 0 0 wsp(5) wsp(6) 0 wsp(7) wsp(8) 0 0 0 0];
    y_mod_ucz(1:2)=yd_ucz(1:2);
    y_mod_wer(1:2)=yd_wer(1:2);
    y_mod_ruc(1:2)=yd_ucz(1:2);
    y_mod_rwe(1:2)=yd_ucz(1:2);
        for k=3:p
			y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(10)*yd_ucz(k-1)+w(11)*yd_ucz(k-1).^2+w(13)*yd_ucz(k-2)+w(14)*yd_ucz(k-2).^2; 	
			y_mod_wer(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(10)*yd_wer(k-1)+w(11)*yd_wer(k-1).^2+w(13)*yd_wer(k-2)+w(14)*yd_wer(k-2).^2; 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(10)*y_mod_ruc(k-1)+w(11)*y_mod_ruc(k-1).^2+w(13)*y_mod_ruc(k-2)+w(14)*y_mod_ruc(k-2).^2; 	
			y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(10)*y_mod_rwe(k-1)+w(11)*y_mod_rwe(k-1).^2+w(13)*y_mod_rwe(k-2)+w(14)*y_mod_rwe(k-2).^2; 	
			
            %b³¹d modelu rekurencyjnego
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
    end 
elseif dynamik == 23    %skonfigurowane
    % dynamika 3 rzêdu,wielomian 2 stopnia,w=12
    Y=yd_ucz(4:p);
    M=[ud_ucz(3:p-1) ud_ucz(3:p-1).^2 ud_ucz(2:p-2) ud_ucz(2:p-2).^2 ud_ucz(1:p-3) ud_ucz(1:p-3).^2 yd_ucz(3:p-1) yd_ucz(3:p-1).^2 yd_ucz(2:p-2) yd_ucz(2:p-2).^2 yd_ucz(1:p-3) yd_ucz(1:p-3).^2];
    wsp=M\Y;
    w=[wsp(1) wsp(2) 0 wsp(3) wsp(4) 0 wsp(5) wsp(6) 0 wsp(7) wsp(8) 0 wsp(9) wsp(10) 0 wsp(11) wsp(12) 0];
    y_mod_ucz(1:3)=yd_ucz(1:3);
    y_mod_wer(1:3)=yd_wer(1:3);
    y_mod_ruc(1:3)=yd_ucz(1:3);
    y_mod_rwe(1:3)=yd_ucz(1:3);
        for k=4:p
            y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(7)*ud_ucz(k-3)+w(8)*ud_ucz(k-3).^2+w(10)*yd_ucz(k-1)+w(11)*yd_ucz(k-1).^2+w(13)*yd_ucz(k-1)+w(14)*yd_ucz(k-1).^2+w(16)*yd_ucz(k-3)+w(17)*yd_ucz(k-3).^2; 	
            y_mod_wer(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(7)*ud_wer(k-3)+w(8)*ud_wer(k-3).^2+w(10)*yd_wer(k-1)+w(11)*yd_wer(k-1).^2+w(13)*yd_wer(k-1)+w(14)*yd_wer(k-1).^2+w(16)*yd_wer(k-3)+w(17)*yd_wer(k-3).^2; 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(7)*ud_ucz(k-3)+w(8)*ud_ucz(k-3).^2+w(10)*y_mod_ruc(k-1)+w(11)*y_mod_ruc(k-1).^2+w(13)*y_mod_ruc(k-2)+w(14)*y_mod_ruc(k-2).^2+w(16)*y_mod_ruc(k-3)+w(17)*y_mod_ruc(k-3).^2; 	
            y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(7)*ud_wer(k-3)+w(8)*ud_wer(k-3).^2+w(10)*y_mod_rwe(k-1)+w(11)*y_mod_rwe(k-1).^2+w(13)*y_mod_rwe(k-2)+w(14)*y_mod_rwe(k-2).^2+w(16)*y_mod_rwe(k-3)+w(17)*y_mod_rwe(k-3).^2; 	

            %b³¹d modelu rekurencyjnego
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
    end    
elseif dynamik == 31    %skonfigurowane
    %dynamika 1 rzêdu,wielomian 3 stopnia,w=6
    Y=yd_ucz(2:p);
    M=[ud_ucz(1:p-1) ud_ucz(1:p-1).^2 ud_ucz(1:p-1).^3 yd_ucz(1:p-1) yd_ucz(1:p-1).^2 yd_ucz(1:p-1).^3];
    wsp=M\Y;
    w=[wsp(1) wsp(2) wsp(3) 0 0 0 0 0 0 wsp(4) wsp(5) wsp(6) 0 0 0 0 0 0];
    y_mod_ucz(1)=yd_ucz(1);
    y_mod_wer(1)=yd_wer(1);
    y_mod_ruc(1)=yd_ucz(1);
    y_mod_rwe(1)=yd_ucz(1);
        for k = 2:p
            y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(3)*ud_ucz(k-1).^3+w(10)*yd_ucz(k-1)+w(11)*yd_ucz(k-1).^2+w(12)*yd_ucz(k-1).^3; 	
			y_mod_wer(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(3)*ud_wer(k-1).^3+w(10)*yd_wer(k-1)+w(11)*yd_wer(k-1).^2+w(12)*yd_wer(k-1).^3; 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(3)*ud_ucz(k-1).^3+w(10)*y_mod_ruc(k-1)+w(11)*y_mod_ruc(k-1).^2+w(12)*y_mod_ruc(k-1).^3; 	
			y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(3)*ud_wer(k-1).^3+w(10)*y_mod_rwe(k-1)+w(11)*y_mod_rwe(k-1).^2+w(12)*y_mod_rwe(k-1).^3; 	
			
            %b³¹d modelu rekurencyjnego
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
        end 
elseif dynamik == 32    
    %dynamika 2 rzêdu,wielomian 3 stopnia,w=12
    Y=yd_ucz(3:p);
    M=[ud_ucz(2:p-1) ud_ucz(2:p-1).^2 ud_ucz(2:p-1).^3 ud_ucz(1:p-2) ud_ucz(1:p-2).^2 ud_ucz(1:p-2).^3 yd_ucz(2:p-1) yd_ucz(2:p-1).^2 yd_ucz(2:p-1).^3 yd_ucz(1:p-2) yd_ucz(1:p-2).^2 yd_ucz(1:p-2).^3];
    wsp=M\Y;
    w=[wsp(1) wsp(2) wsp(3) wsp(4) wsp(5) wsp(6) 0 0 0 wsp(7) wsp(8) wsp(9) wsp(10) wsp(11) wsp(12) 0 0 0];
    y_mod_ucz(1:2)=yd_ucz(1:2);
    y_mod_wer(1:2)=yd_wer(1:2);
    y_mod_ruc(1:2)=yd_ucz(1:2);
    y_mod_rwe(1:2)=yd_ucz(1:2);
        for k=3:p
			y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(3)*ud_ucz(k-1).^3+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(6)*ud_ucz(k-2).^3+w(10)*yd_ucz(k-1)+w(11)*yd_ucz(k-1).^2+w(12)*yd_ucz(k-1).^3+w(13)*yd_ucz(k-2)+w(14)*yd_ucz(k-2).^2+w(15)*yd_ucz(k-2).^3; 	
			y_mod_wer(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(3)*ud_wer(k-1).^3+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(6)*ud_wer(k-2).^3+w(10)*yd_wer(k-1)+w(11)*yd_wer(k-1).^2+w(12)*yd_wer(k-1).^3+w(13)*yd_wer(k-2)+w(14)*yd_wer(k-2).^2+w(15)*yd_wer(k-2).^3; 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(3)*ud_ucz(k-1).^3+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(6)*ud_ucz(k-2).^3+w(10)*y_mod_ruc(k-1)+w(11)*y_mod_ruc(k-1).^2+w(12)*y_mod_ruc(k-1).^3+w(13)*y_mod_ruc(k-2)+w(14)*y_mod_ruc(k-2).^2+w(15)*y_mod_ruc(k-2).^3; 	
			y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(3)*ud_wer(k-1).^3+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(6)*ud_wer(k-2).^3+w(10)*y_mod_rwe(k-1)+w(11)*y_mod_rwe(k-1).^2+w(12)*y_mod_rwe(k-1).^3+w(13)*y_mod_rwe(k-2)+w(14)*y_mod_rwe(k-2).^2+w(15)*y_mod_rwe(k-2).^3; 	
			
            %b³¹d modelu rekurencyjnego           
            E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2;%b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
    end 
elseif dynamik == 33    
    % dynamika 3 rzêdu,wielomian 3 stopnia,w=18
    Y=yd_ucz(4:p);
    M=[ud_ucz(3:p-1) ud_ucz(3:p-1).^2 ud_ucz(3:p-1).^3 ud_ucz(2:p-2) ud_ucz(2:p-2).^2 ud_ucz(2:p-2).^3 ud_ucz(1:p-3) ud_ucz(1:p-3).^2 ud_ucz(1:p-3).^3 yd_ucz(3:p-1) yd_ucz(3:p-1).^2 yd_ucz(3:p-1).^3 yd_ucz(2:p-2) yd_ucz(2:p-2).^2 yd_ucz(2:p-2).^3 yd_ucz(1:p-3) yd_ucz(1:p-3).^2 yd_ucz(1:p-3).^3];
    wsp=M\Y;
    w=[wsp(1:18)];
    y_mod_ucz(1:3)=yd_ucz(1:3);
    y_mod_wer(1:3)=yd_wer(1:3);
    y_mod_ruc(1:3)=yd_ucz(1:3);
    y_mod_rwe(1:3)=yd_ucz(1:3);
        for k=4:p
        		
			y_mod_ucz(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(3)*ud_ucz(k-1).^3+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(6)*ud_ucz(k-2).^3+w(7)*ud_ucz(k-3)+w(8)*ud_ucz(k-3).^2+w(9)*ud_ucz(k-3).^3+ w(10)*yd_ucz(k-1)+w(11)*yd_ucz(k-1).^2+w(12)*yd_ucz(k-1).^3+w(13)*yd_ucz(k-1)+w(14)*yd_ucz(k-1).^2+w(15)*yd_ucz(k-1).^3+w(16)*yd_ucz(k-3)+w(17)*yd_ucz(k-3).^2+w(18)*yd_ucz(k-3).^3; 	
			y_mod_wer(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(3)*ud_wer(k-1).^3+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(6)*ud_wer(k-2).^3+w(7)*ud_wer(k-3)+w(8)*ud_wer(k-3).^2+w(9)*ud_wer(k-3).^3+ w(10)*yd_wer(k-1)+w(11)*yd_wer(k-1).^2+w(12)*yd_wer(k-1).^3+w(13)*yd_wer(k-1)+w(14)*yd_wer(k-1).^2+w(15)*yd_wer(k-1).^3+w(16)*yd_wer(k-3)+w(17)*yd_wer(k-3).^2+w(18)*yd_wer(k-3).^3; 	
            y_mod_ruc(k)=w(1)*ud_ucz(k-1)+w(2)*ud_ucz(k-1).^2+w(3)*ud_ucz(k-1).^3+w(4)*ud_ucz(k-2)+w(5)*ud_ucz(k-2).^2+w(6)*ud_ucz(k-2).^3+w(7)*ud_ucz(k-3)+w(8)*ud_ucz(k-3).^2+w(9)*ud_ucz(k-3).^3+ w(10)*y_mod_ruc(k-1)+w(11)*y_mod_ruc(k-1).^2+w(12)*y_mod_ruc(k-1).^3+w(13)*y_mod_ruc(k-2)+w(14)*y_mod_ruc(k-2).^2+w(15)*y_mod_ruc(k-2).^3+w(16)*y_mod_ruc(k-3)+w(17)*y_mod_ruc(k-3).^2+w(18)*y_mod_ruc(k-3).^3; 	
			y_mod_rwe(k)=w(1)*ud_wer(k-1)+w(2)*ud_wer(k-1).^2+w(3)*ud_wer(k-1).^3+w(4)*ud_wer(k-2)+w(5)*ud_wer(k-2).^2+w(6)*ud_wer(k-2).^3+w(7)*ud_wer(k-3)+w(8)*ud_wer(k-3).^2+w(9)*ud_wer(k-3).^3+ w(10)*y_mod_rwe(k-1)+w(11)*y_mod_rwe(k-1).^2+w(12)*y_mod_rwe(k-1).^3+w(13)*y_mod_rwe(k-2)+w(14)*y_mod_rwe(k-2).^2+w(15)*y_mod_rwe(k-2).^3+w(16)*y_mod_rwe(k-3)+w(17)*y_mod_rwe(k-3).^2+w(18)*y_mod_rwe(k-3).^3; 	
			
			%b³¹d modelu rekurencyjnego
			E_arx_ucz=E_arx_ucz+(y_mod_ruc(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_arx_wer=E_arx_wer+(y_mod_rwe(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
            %b³¹d modelu bez rekurencji
            E_oe_ucz=E_oe_ucz+(y_mod_ucz(k)-yd_ucz(k))^2; %b³¹d na zbiorze ucz¹cym
            E_oe_wer=E_oe_wer+(y_mod_wer(k)-yd_wer(k))^2; %b³¹d na zbiorze weryfikuj¹cym
    end    
end

%zapis kolejnych b³êdów do odpowiednich komórek macierzy
E_rek_ucz(i)=E_arx_ucz;
E_rek_wer(i)=E_arx_wer;
E_bre_ucz(i)=E_oe_ucz;
E_bre_wer(i)=E_oe_wer;
%macierz b³edów -tworzenie tabeli z wartoœciami blêdów dla poszczególnych
%typów modeli w 4 wersjach
macierz_bledow=[typ; E_rek_ucz; E_rek_wer; E_bre_ucz; E_bre_wer];

%rysowanie wykresów
fig=figure
title(['typ_',sprintf('%g',typ)]);
subplot(2,1,1)
stairs(yd_ucz,'r')
hold on;
stairs(y_mod_ucz,'b')
hold on;
stairs(y_mod_ruc,'k')
xlabel('k - zbiór ucz¹cy')
ylabel('y')
title(['E arx ucz:',sprintf('%g',E_arx_ucz),' E oe ucz:',sprintf('%g',E_oe_ucz)]);
legend('Ymod','Yucz','Ymod-rek')
subplot(2,1,2)
stairs(yd_wer,'r')
hold on;
stairs(y_mod_wer,'b')
hold on;
stairs(y_mod_rwe,'k')
xlabel('k - zbiór weryfikuj¹cy')
ylabel('y')
title(['E arx wer:',sprintf('%g',E_arx_wer),' E oe wer:',sprintf('%g',E_oe_wer)]);
legend('Ymod','Ywer','Ymod-rek')
nazwa0=['modeltyp_',sprintf('%g',dynamik),'_porównanie'];
saveas(fig,nazwa0,'fig');
saveas(fig,nazwa0,'png');
end



