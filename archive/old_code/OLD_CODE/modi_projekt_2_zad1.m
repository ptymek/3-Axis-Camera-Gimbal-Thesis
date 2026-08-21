load('dynamic_simplification_simulation_data_05112019.mat')
%podzia³ na zbiór ucz¹cy i weryfikuj¹cy
INucz = [ymp(1:5000) yms(1:5000) yma(1:5000) rms(1:5000) rmp(1:5000) rma(1:5000) pms(1:5000) pmp(1:5000) pma(1:5000) yd(1:5000) pd(1:5000) rd(1:5000)];
INwer = [ymp(5001:10000) yms(5001:10000) yma(5001:10000) rms(5001:10000) rmp(5001:10000) rma(5001:10000) pms(5001:10000) pmp(5001:10000) pma(5001:10000) yd(5001:10000) pd(5001:10000) rd(5001:10000)];
Yaw_ucz = yaw_mom(1:5000);
Yaw_wer = yaw_mom(5001:10000);
Pit_ucz = pitch_mom(1:5000);
Pit_wer = pitch_mom(5001:10000);
Rol_ucz = roll_mom(1:5000);
Rol_wer = roll_mom(5001:10000);
yaw_mod_ucz=zeros(5000,1);
yaw_mod_wer=zeros(5000,1);
pit_mod_ucz=zeros(5000,1);
pit_mod_wer=zeros(5000,1);
rol_mod_ucz=zeros(5000,1);
rol_mod_wer=zeros(5000,1);
% E_wer_yaw=0;
% E_wer_pit=0;
% E_wer_rol=0;
% E_ucz_yaw=0;
% E_ucz_pit=0;
% E_ucz_rol=0;


% Uucz = [INucz ones(5000,1)];
% Uwer = [INwer ones(5000,1)];
%         
% 		wsp_y=Uucz\Yaw_ucz;
% 		wsp_p=Uucz\Pit_ucz;
% 		wsp_r=Uucz\Rol_ucz;
%             yaw_mod_ucz(i)=wsp_y*Uucz(i,:);
% 			yaw_mod_wer(i)=wsp_y*Uwer(i,:);
% 			pit_mod_ucz(i)=wsp_p*Uucz(i,:);
% 			pit_mod_wer(i)=wsp_p*Uwer(i,:);
% 			rol_mod_ucz(i)=wsp_r*Uucz(i,:);
% 			rol_mod_wer(i)=wsp_r*Uwer(i,:);
%             E_wer=E_wer+(ys_wer(i)-y_wer(i))^2;
%             E_ucz=E_ucz+(ys_ucz(i)-y_ucz(i))^2;
% 			E_wer_yaw=E_wer_yaw+(Yaw_wer(i)-yaw_mod_wer(i))^2;
% 			E_wer_pit=E_wer_pit+(Pit_wer(i)-pit_mod_wer(i))^2;
% 			E_wer_rol=E_wer_rol+(Rol_wer(i)-rol_mod_wer(i))^2;
% 			E_ucz_yaw=E_ucz_yaw+(Yaw_ucz(i)-yaw_mod_ucz(i))^2;
% 			E_ucz_pit=E_ucz_pit+(Pit_ucz(i)-pit_mod_ucz(i))^2;
% 			E_ucz_rol=E_ucz_rol+(Rol_ucz(i)-rol_mod_ucz(i))^2;





for stopien = 1:10
	E_wer_yaw=0;
	E_wer_pit=0;
	E_wer_rol=0;
	E_ucz_yaw=0;
	E_ucz_pit=0;
	E_ucz_rol=0;   
    if stopien == 1
		Uucz = [INucz ones(5000,1)];
		Uwer = [INwer ones(5000,1)];
    elseif stopien == 2
        Uucz = [INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^2 INwer ones(5000,1)];
    elseif stopien == 3
        Uucz = [INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^3 INwer.^2 INwer ones(5000,1)];
	elseif stopien == 4
        Uucz = [INucz.^4 INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^4 INwer.^3 INwer.^2 INwer ones(5000,1)];
    elseif stopien == 5
        Uucz = [INucz.^5 INucz.^4 INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^5 INwer.^4 INwer.^3 INwer.^2 INwer ones(5000,1)];
    elseif stopien == 6
        Uucz = [INucz.^6 INucz.^5 INucz.^4 INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^6 INwer.^5 INwer.^4 INwer.^3 INwer.^2 INwer ones(5000,1)];
    elseif stopien == 7
        Uucz = [INucz.^7 INucz.^6 INucz.^5 INucz.^4 INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^7 INwer.^6 INwer.^5 INwer.^4 INwer.^3 INwer.^2 INwer ones(5000,1)];
    elseif stopien == 8
        Uucz = [INucz.^8 INucz.^7 INucz.^6 INucz.^5 INucz.^4 INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^8 INwer.^7 INwer.^6 INwer.^5 INwer.^4 INwer.^3 INwer.^2 INwer ones(5000,1)];
    elseif stopien == 9
        Uucz = [INucz.^9 INucz.^8 INucz.^7 INucz.^6 INucz.^5 INucz.^4 INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INwer.^9 INwer.^8 INwer.^7 INwer.^6 INwer.^5 INwer.^4 INwer.^3 INwer.^2 INwer ones(5000,1)];
    elseif stopien == 10
        Uucz = [INucz.^10 INucz.^9 INucz.^8 INucz.^7 INucz.^6 INucz.^5 INucz.^4 INucz.^3 INucz.^2 INucz ones(5000,1)];
		Uwer = [INucz.^10 INwer.^9 INwer.^8 INwer.^7 INwer.^6 INwer.^5 INwer.^4 INwer.^3 INwer.^2 INwer ones(5000,1)];
    end
	   	wsp_y=Uucz\Yaw_ucz;
		wsp_p=Uucz\Pit_ucz;
		wsp_r=Uucz\Rol_ucz;
         for i=1:5000
            yaw_mod_ucz(i)=Uucz(i,:)*wsp_y;
			yaw_mod_wer(i)=Uwer(i,:)*wsp_y;
			pit_mod_ucz(i)=Uucz(i,:)*wsp_p;
			pit_mod_wer(i)=Uwer(i,:)*wsp_p;
			rol_mod_ucz(i)=Uucz(i,:)*wsp_r;
			rol_mod_wer(i)=Uwer(i,:)*wsp_r;
			E_wer_yaw=E_wer_yaw+(Yaw_wer(i)-yaw_mod_wer(i))^2;
			E_wer_pit=E_wer_pit+(Pit_wer(i)-pit_mod_wer(i))^2;
			E_wer_rol=E_wer_rol+(Rol_wer(i)-rol_mod_wer(i))^2;
			E_ucz_yaw=E_ucz_yaw+(Yaw_ucz(i)-yaw_mod_ucz(i))^2;
			E_ucz_pit=E_ucz_pit+(Pit_ucz(i)-pit_mod_ucz(i))^2;
			E_ucz_rol=E_ucz_rol+(Rol_ucz(i)-rol_mod_ucz(i))^2;
            end            
    %   tworzenie i zapisywanie wykresów
    fig1=figure
    subplot(6,1,1);
    stairs(Yaw_ucz,'r')
    hold on;
    stairs(yaw_mod_ucz,'b')
    xlabel('k')
    ylabel('y')
    title(['Yaw ucz=',sprintf('%f',E_ucz_yaw)]);
    legend('Ymod','Yucz')
    nazwa = ['modelstatycznyporownanie_zbioruczacy_wielomian_stopnia_',sprintf('%g',stopien)];

    subplot(6,1,2);
    stairs(Pit_ucz,'r')
    hold on;
    stairs(pit_mod_ucz,'b')
    xlabel('k')
    ylabel('y')
    title(['Pit ucz=',sprintf('%f',E_ucz_pit)]);
    legend('Ymod','Yucz')

    subplot(6,1,3);
    stairs(Rol_ucz,'r')
    hold on;
    stairs(rol_mod_ucz,'b')
    xlabel('k')
    ylabel('y')
    title(['Rol ucz=',sprintf('%f',E_ucz_rol)]);
    legend('Ymod','Yucz')
    nazwa = ['modelstatycznyporownanie_zbioruczacy_wielomian_stopnia_',sprintf('%g',stopien)];
    saveas(fig1,nazwa,'fig');
    saveas(fig1,nazwa,'png');
    
    subplot(6,1,4);
    stairs(Yaw_wer,'r')
    hold on;
    stairs(yaw_mod_wer,'b')
    xlabel('k')
    ylabel('y')
    title(['Yaw wer=',sprintf('%f',E_wer_yaw)]);
    legend('Ymod','Ywer')
    subplot(6,1,5);
    stairs(Pit_wer,'r')
    hold on;
    stairs(pit_mod_wer,'b')
    xlabel('k')
    ylabel('y')
    title(['Pit wer=',sprintf('%f',E_wer_pit)]);
    legend('Ymod','Ywer')

    subplot(6,1,6);
    stairs(Rol_wer,'r')
    hold on;
    stairs(rol_mod_wer,'b')
    xlabel('k')
    ylabel('y')
    title(['Rol wer=',sprintf('%f',E_wer_rol)]);
    legend('Ymod','Ywer')
    
    
  mat_E_ucz(stopien,:)=[E_wer_yaw	E_wer_pit E_wer_rol];
  mat_E_wer(stopien,:)=[E_ucz_yaw	E_ucz_pit E_ucz_rol];

end