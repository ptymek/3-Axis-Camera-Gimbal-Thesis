
function[y,w,z,phase] = calculate_PWM(u,bit,voltage)
%konwersja k¹ta na wartoœci sygna³u PWM do sterowania silnikiem BLDC
nop = 14;
phase=1;
resolution = 2^bit; %rozdzielczoœæ bitowa generowanego sygna³u

%kalkulacja wartoœci PWM na poszczególne fazy

%konwersja k¹ta na wejœciu na radiany
theta_error = deg2rad(u);

%konwersja k¹ta mechanicznego na elektryczny (poœlizg silnika)
theta_e = (theta_error*nop)/2;
%ograniczenie wartoœci k¹ta do wartoœci z zakresu 0-2 pi
theta_e = mod(theta_e,(2*pi));
if(theta_e < 0)
        theta_e = theta_e + (2*pi);
end

  if  theta_e <= 2/6*pi && theta_e>0
    PWM =round(resolution*(tan(theta_e)) /  (sin(2/3*pi)-cos(2/3*pi)*tan(theta_e)));
    phase=1;
elseif theta_e <= 4/6*pi && theta_e>2/6*pi
    PWM =round(resolution*-((tan(theta_e)*cos(2/3*pi)-sin(2/3*pi))/tan(theta_e)));
    phase=2;
elseif theta_e <= 6/6*pi && theta_e>4/6*pi
    PWM =round(resolution*(tan(theta_e)*cos(2/3*pi)-sin(2/3*pi)/sin(4/3*pi) -cos(4/3*pi)*tan(theta_e)));
    phase=3;
elseif theta_e <= 8/6*pi && theta_e>6/6*pi
    PWM =round(resolution*(tan(theta_e)*cos(4/3*pi)-sin(4/3*pi)/sin(2/3*pi) -cos(2/3*pi)*tan(theta_e)));
    phase=4;   
elseif theta_e <= 10/6*pi && theta_e>8/6*pi
    PWM =round(resolution*(sin(4/3*pi) - tan(theta_e)*cos(4/3*pi))/tan(theta_e));
    phase=5;
elseif theta_e <= 12/6*pi && theta_e>10/6*pi
    PWM =round(resolution*(tan(theta_e))/(sin(4/3*pi)-cos(4/3*pi)*tan(theta_e)));
    phase=6;
 end


if(phase==1)
    y=voltage;
    w=(voltage/resolution)*PWM;
    z=0;
elseif(phase==2)
    y=(voltage/resolution)*PWM;
    w=voltage;
    z=0;
elseif(phase==3)
    y=0;
    w=voltage;
    z=(voltage/resolution)*PWM;
elseif(phase==4)
    y=0;
    w=(voltage/resolution)*PWM;
    z=voltage;
elseif(phase==5)
    y=(voltage/resolution)*PWM;
    w=0;
    z=voltage;
else
    y=voltage;
    w=0;
    z=(voltage/resolution)*PWM;
end
end
