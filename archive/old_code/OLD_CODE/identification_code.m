
%wczytanie danych
% M(:,23)=M(:,24);
time=1:30001;
time=time';
gim_raw=[yaw_pos,pitch_pos,roll_pos,yaw_mot,pitch_mot,roll_mot];
yaw_pos_norm=featureNormalize(yaw_pos);
yaw_mot_norm=featureNormalize(yaw_mot);
pitch_pos_norm=featureNormalize(pitch_pos);
pitch_mot_norm=featureNormalize(pitch_mot);
roll_pos_norm=featureNormalize(roll_pos);
roll_mot_norm=featureNormalize(roll_mot);
gim=[yaw_pos_norm,pitch_pos_norm,roll_pos_norm,yaw_mot_norm,pitch_mot_norm,roll_mot_norm];
rho_Pearson=zeros(6,6);
p_value_Pearson=zeros(6,6);
% %w tej petli sprawdzam, jak kazdy sygnal jest skorelowany z kazdym innym
%najpierw liniowo - korelacja Pearsona
for i=1:1:6
    for j= 1:1:6
        [rho_Pearson(i,j),p_value_Pearson(i,j)] = corr(gim(:,i),gim(:,j),'Type','Pearson');
    end
end
% %potem jeszcze korelacja Spearmana, ona moze wykryc zaleznosci nieliniowe
rho_Spearman=zeros(23,23);
p_value_Spearman=zeros(23,23);
for i=1:1:6
    for j= 1:1:6
        [rho_Spearman(i,j),p_value_Spearman(i,j)] = corr(gim(:,i),gim(:,j),'Type','Spearman');
    end
end



% tu sobie mozna wymierzac dane, wektory tablicy sie zamieniaja losowo miejscami
% chyba tak sie powinno robic, jak sie siec uczy



% U_train=gim(1:8000,:);
% U_test=gim(8001:10080,:);
% 
% %Wyjscie nazywam inaczej, zeby sie juz nie mylilo
% Y_train=M_filtered(1:8000,23);
% Y_test=M_filtered(8001:10080,23);
% 
% trainData = [Y_train U_train];
% testData = [Y_test U_test];
% end
%przygotowuje sobie zbiory uczace i testujace
U_train=zeros(4*30000/5,3);
U_test=zeros(30000/5,3);
Y_train=zeros(4*30000/5,3);
Y_test=zeros(30000/5,3);
k=1;
u=1;
%rodzielam na zbior testowy
for i=1:1:30001
    if mod(i,5)==0
    Y_test(u,1)=gim(i,1);
    Y_test(u,2)=gim(i,2);
    Y_test(u,3)=gim(i,3);
    U_test(u,1)=gim(i,4);
    U_test(u,2)=gim(i,5);
    U_test(u,3)=gim(i,6);
    u=u+1;
    else
    Y_train(k,1)=gim(i,1);
    Y_train(k,2)=gim(i,2);
    Y_train(k,3)=gim(i,3);
    U_train(k,1)=gim(i,4);     
    U_train(k,2)=gim(i,5);
    U_train(k,3)=gim(i,6);
    k=k+1;
    end
end
trainData = [Y_train U_train];
testData = [Y_test U_test];
%% siec nieuronowa

% czas symulacji 
simStart = 1;
tsim = 100000;

%dane wejsciowe
inputs = U_train';
targets = Y_train';

%utworzenie sieci dopasowujacej
hiddenLayerSize = 50;
net = fitnet(hiddenLayerSize,'trainlm');

%podzial danych na uczace, testujace i walidujace
net.divideParam.trainRatio = 65/100;
net.divideParam.testRatio = 20/100;
net.divideParam.valRatio = 15/100;

%uczenie sieci
[net, tr] = train(net, inputs, targets);

%testowanie sieci
outputs = net(inputs);
errors = gsubtract(outputs,targets);
performance = perform(net,targets,outputs);

%wizualizacja sieci
view(net) 


% wykresy
figure, plotperform(tr)
figure, plottrainstate(tr)
figure, plot(targets)
hold on
plot(outputs)
legend('process', 'simulation');
figure, plotregression(targets,outputs)
figure, ploterrhist(errors)

% %% test on test data
% pocz=1;
% kon=1000;
% random_testData=testData(randperm(size(testData, 1)), :);
% Y_sim = net(random_testData(:,1:3)');
% figure(20); hold on;
% plot(random_testData(pocz:kon,1)');
% plot(Y_sim(pocz:kon));
% legend('process', 'simulation');
% %% test na calym zbiorze
% figure(21); hold on;
% Y_sim = net(gim_raw(:,4)');
% % plot(M_filtered(:,23)');
% plot(Y_sim);