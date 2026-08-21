% calculate_I_matrix();
% Simulink.sdi.clear
%T=0.01;
names=["LQR","MPC","PID","NL PID","NN MARMA","NN MRC"];
MSE=zeros(6,10);
current=zeros(6,10);
yawMSE=zeros(6,10);
yawcurrent=zeros(6,10);
pitchMSE=zeros(6,10);
pitchcurrent=zeros(6,10);
rollMSE=zeros(6,10);
rollcurrent=zeros(6,10);

for i=1:10
set = [num2str(i)];
load (set) % ³adowanie danych dot. zak³óceñ
timeseries_creation(); %edycja danych
i
T_log
names(1)
k=1;
sim('LQR',T_log)
mse_current_update()
plot_create()
names(2)
k=2;
sim('MPC',T_log)
mse_current_update()
plot_create()
names(3)
k=3;
sim('PID',T_log)
mse_current_update()
plot_create()
names(4)
k=4;
sim('NL_PID',T_log)
mse_current_update()
plot_create()
names(5)
k=5;
sim('NN_NARMA_L2',T_log)
mse_current_update()
plot_create()
names(6)
k=6;
sim('NN_MRC',T_log)
mse_current_update()
plot_create()
figure_d()
close all
end
writetable(table(names',MSE),'MSE.txt')
writetable(table(names',current),'current.txt')
writetable(table(names',yawMSE),'yaw_MSE.txt')
writetable(table(names',yawcurrent),'yaw_current.txt')
writetable(table(names',pitchMSE),'pitch_MSE.txt')
writetable(table(names',pitchcurrent),'pitch_current.txt')
writetable(table(names',rollMSE),'roll_MSE.txt')
writetable(table(names',rollcurrent),'roll_current.txt')
