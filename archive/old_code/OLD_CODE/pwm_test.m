u=0:0.0001:360;

for i=1:length(u)
%konwersja k¹ta na wartoœci sygna³u PWM(i) do sterowania silnikiem BLDC
nop = 14;
resolution=12;
resolution = 2^resolution; %rozdzielczoœæ bitowa generowanego sygna³u

%kalkulacja wartoœci PWM(i) na poszczególne fazy

%konwersja k¹ta na wejœciu na radiany
theta_error(i) = deg2rad(u(i));

%konwersja k¹ta mechanicznego na elektryczny (poœlizg silnika)
theta_e(i) = (theta_error(i)*nop)/2;
%ograniczenie wartoœci k¹ta do wartoœci z zakresu 0-2 pi
theta_e(i) = mod(theta_e(i),(2*pi));
if(theta_e(i) < 0)
        theta_e(i) = theta_e(i) + (2*pi);
end

 if  theta_e(i) <= 2/6*pi && theta_e(i)>0
    PWM(i) =round(resolution*(tan(theta_e(i))) /  (sin(2/3*pi)-cos(2/3*pi)*tan(theta_e(i))));
    phase=1;
elseif theta_e(i) <= 4/6*pi && theta_e(i)>2/6*pi
    PWM(i) =round(resolution*-((tan(theta_e(i))*cos(2/3*pi)-sin(2/3*pi))/tan(theta_e(i))));
    phase=2;
elseif theta_e(i) <= 6/6*pi && theta_e(i)>4/6*pi
    PWM(i) =round(resolution*(tan(theta_e(i))*cos(2/3*pi)-sin(2/3*pi)/sin(4/3*pi) -cos(4/3*pi)*tan(theta_e(i))));
    phase=3;
elseif theta_e(i) <= 8/6*pi && theta_e(i)>6/6*pi
    PWM(i) =round(resolution*(tan(theta_e(i))*cos(4/3*pi)-sin(4/3*pi)/sin(2/3*pi) -cos(2/3*pi)*tan(theta_e(i))));
    phase=4;   
elseif theta_e(i) <= 10/6*pi && theta_e(i)>8/6*pi
    PWM(i) =round(resolution*(sin(4/3*pi) - tan(theta_e(i))*cos(4/3*pi))/tan(theta_e(i)));
    phase=5;
elseif theta_e(i) <= 12/6*pi && theta_e(i)>10/6*pi
    PWM(i) =round(resolution*(tan(theta_e(i)))/(sin(4/3*pi)-cos(4/3*pi)*tan(theta_e(i))));
    phase=6;
 end

end
stairs(PWM)
hold on
