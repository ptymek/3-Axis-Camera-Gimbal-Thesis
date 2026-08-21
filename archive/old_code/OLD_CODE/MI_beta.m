clear variables;
%wczytanie danych
M = xlsread('modelling_data.xlsx',2);
M(:,23)=M(:,24);
%wypelnienie dziur z interpolacja
M=fillmissing(M,'spline');

n = 50; % median filter smoothing parameter
time=1:10080;
time=time';
%%
%wrzucam dane z macierzy do wektora i normalizuje
%nastepnie wygladzam szumy - nie wiem czy to konieczne
%i robie wykresy porownawcze sygnalu przed i po wygladzeniu
%i tak 23 razy

CMill_Flow = featureNormalize((M(:,1)));
CMill_Flow_filtered=medfilt1(CMill_Flow,20);
% figure(1);
% plot(time,CMill_Flow);hold on;
% plot(time,CMill_Flow_filtered)

CMill_Power = featureNormalize(M(:,2));
CMill_Power_filtered=medfilt1(CMill_Power,50);
% figure(2);
% plot(time,CMill_Power);hold on;
% plot(time,CMill_Power_filtered)

CMill_PAir_Flow = featureNormalize(M(:,3));
CMill_PAir_filtered=medfilt1(CMill_PAir_Flow,50);
% figure(3);
% plot(time,CMill_PAir_Flow);hold on;
% plot(time,CMill_PAir_filtered)

CMill_PPreasure=featureNormalize(M(:,4));
CMill_PPreasure_filtered=medfilt1(CMill_PPreasure,50);
% figure(4);
% plot(time,CMill_PPreasure);hold on;
% plot(time,CMill_PPreasure_filtered)

CMill_PAir_Temp=featureNormalize(M(:,5));
CMill_PAir_Temp_filtered=medfilt1(CMill_PAir_Temp,50);
% figure(5);
% plot(time,CMill_PAir_Temp);hold on;
% plot(time,CMill_PAir_Temp_filtered)

CMill_PAir_Preasure=featureNormalize(M(:,6));
CMill_PAir_Preasure_filtered=medfilt1(CMill_PAir_Preasure,50);
% figure(6);
% plot(time,CMill_PAir_Preasure);hold on;
% plot(time,CMill_PAir_Preasure_filtered)

CMill_PAir_HOT=featureNormalize(M(:,7));
CMill_PAir_HOT_filtered=medfilt1(CMill_PAir_HOT,50);
% figure(7);
% plot(time,CMill_PAir_HOT);hold on;
% plot(time,CMill_PAir_HOT_filtered)

CMill_PAir_COLD=featureNormalize(M(:,8));
CMill_PAir_COLD_filtered=medfilt1(CMill_PAir_COLD,75);
% figure(8);
% plot(time,CMill_PAir_COLD);hold on;
% plot(time,CMill_PAir_COLD_filtered)

Main_Steam_Flow= featureNormalize((M(:,9)));
Main_Steam_Flow_filtered=medfilt1(Main_Steam_Flow,75);
% figure(9);
% plot(time,Main_Steam_Flow);hold on;
% plot(time,Main_Steam_Flow_filtered)

Fan1_Power= featureNormalize((M(:,10)));
Fan1_Power_filtered=medfilt1(Fan1_Power,70);
% figure(10);
% plot(time,Fan1_Power);hold on;
% plot(time,Fan1_Power_filtered)

Fan2_Power= featureNormalize((M(:,11)));
Fan2_Power_filtered=medfilt1(Fan2_Power,50);
% figure(11);
% plot(time,Fan2_Power);hold on;
% plot(time,Fan2_Power_filtered)

Fan1_Preassure= featureNormalize((M(:,12)));
Fan_Preassure_filtered=medfilt1(Fan1_Preassure,50);
% figure(12);
% plot(time,Fan1_Preassure);hold on;
% plot(time,Fan_Preassure_filtered)

Fan2_Preasure= featureNormalize((M(:,13)));
Fan2_Preasure_filtered=medfilt1(Fan2_Preasure,50);
% figure(13);
% plot(time,Fan2_Preasure);hold on;
% plot(time,Fan2_Preasure_filtered)

Total_Air_Flow= featureNormalize((M(:,14)));
Total_Air_Flow_filtered=medfilt1(Total_Air_Flow,70);
% figure(14);
% plot(time,Total_Air_Flow);hold on;
% plot(time,Total_Air_Flow_filtered)

Air_before_fan1= featureNormalize((M(:,15)));
Air_before_fan1_filtered=medfilt1(Air_before_fan1,70);
% figure(15);
% plot(time,Air_before_fan1);hold on;
% plot(time,Air_before_fan1_filtered)


Air_before_fan2= featureNormalize((M(:,16)));
Air_before_fan2_filtered=medfilt1(Air_before_fan2,50);
% figure(16);
% plot(time,Air_before_fan2);hold on;
% plot(time,Air_before_fan2_filtered)

Preasure_after_fan1= featureNormalize((M(:,17)));
Preasure_after_fan1_filtered=medfilt1(Preasure_after_fan1,50);
% figure(17);
% plot(time,Preasure_after_fan1);hold on;
% plot(time,Preasure_after_fan1_filtered)

Preasure_after_fan2= featureNormalize((M(:,18)));
Preasure_after_fan2_filtered=medfilt1(Preasure_after_fan2,50);
% figure(18);
% plot(time,Preasure_after_fan2);hold on;
% plot(time,Preasure_after_fan2_filtered)

Air_before_preheater1= featureNormalize((M(:,19)));
Air_before_preheater1_filtered=medfilt1(Air_before_preheater1,10);
% figure(19);
% plot(time,Air_before_preheater1);hold on;
% plot(time,Air_before_preheater1_filtered)

Air_before_preheater2= featureNormalize((M(:,20)));
Air_before_preheater2_filtered=medfilt1(Air_before_preheater2,10);
% figure(20);
% plot(time,Air_before_preheater2);hold on;
% plot(time,Air_before_preheater2_filtered)

Air_after_preheater1= featureNormalize((M(:,21)));
Air_after_preheater1_filtered=medfilt1(Air_after_preheater1,10);
% figure(21);
% plot(time,Air_after_preheater1);hold on;
% plot(time,Air_after_preheater1_filtered)

Air_after_preheater2= featureNormalize((M(:,22)));
Air_after_preheater2_filtered=medfilt1(Air_after_preheater2,50);
% figure(22);
% plot(time,Air_after_preheater2);hold on;
% plot(time,Air_after_preheater2_filtered)

CMill_Primary_coaltemp= featureNormalize((M(:,23)));
CMill_Primary_coaltemp_filtered=medfilt1(CMill_Primary_coaltemp,80);
% figure(23);
% plot(time,CMill_Primary_coaltemp);hold on;
% plot(time,CMill_Primary_coaltemp_filtered)
%%

%teraz wrzucam te wygladzone sygnaly z powrotem do macierzy
M_filtered=[CMill_Flow_filtered,CMill_Power_filtered,CMill_PAir_filtered,CMill_PPreasure_filtered,CMill_PAir_Temp_filtered,CMill_PAir_Preasure_filtered,CMill_PAir_HOT_filtered,CMill_PAir_COLD_filtered,Main_Steam_Flow_filtered,Fan1_Power_filtered,Fan2_Power_filtered,Fan_Preassure_filtered,Fan2_Preasure_filtered,Total_Air_Flow_filtered,Air_before_fan1_filtered,Air_before_fan2_filtered,Preasure_after_fan1_filtered,Preasure_after_fan2_filtered,Air_before_preheater1_filtered,Air_before_preheater2_filtered,Air_after_preheater1_filtered,Air_after_preheater2_filtered,CMill_Primary_coaltemp_filtered];

%tu sobie przygotowuje tablice do zapisania jak sa skorelowane sygnaly
rho_Pearson=zeros(23,23);
p_value_Pearson=zeros(23,23);
%w tej petli sprawdzam, jak kazdy sygnal jest skorelowany z kazdym innym
%najpierw liniowo - korelacja Pearsona
for i=1:1:23
    for j= 1:1:23
        [rho_Pearson(i,j),p_value_Pearson(i,j)] = corr(M_filtered(:,i),M_filtered(:,j),'Type','Pearson');
    end
end
%potem jeszcze korelacja Spearmana, ona moze wykryc zaleznosci nieliniowe
rho_Spearman=zeros(23,23);
p_value_Spearman=zeros(23,23);
for i=1:1:23
    for j= 1:1:23
        [rho_Spearman(i,j),p_value_Spearman(i,j)] = corr(M_filtered(:,i),M_filtered(:,j),'Type','Spearman');
    end
end

%nastepnie odsylam do excela, tam te tabelki ladnie wygladaja,
%zakolorowalem na czerwono duze korelacje, a na zielono te mniej
%skorelowane

%po przyjzeniu sie tym tabelom w excelu stwierdzam, ze z powodzeniem mozna
%wyrzucic wiekszosc wejsc, po sa ze zoba w duzym stopniu skorelowane. Wiec
%bylyby kilkukrotnie te same informacje wprowadzane do modelu.

%zostaja wejscia 1,2,7,8,11,20,21 Robie nowa macierz wejsc tylko z nimi
%stary index                                 nowy index
%1           CMill_Flow_filtered             1
%2           CMill_Power_filtered            2
%7           CMill_PAir_HOT_filtered         3
%8           CMill_PAir_COLD_filtered        4
%11          Fan2_Power_filtered             5
%20          Air_before_preheater2_filtered  6
%21          Air_after_preheater1_filtered   7
M_reduced=[M_filtered(:,1),M_filtered(:,2),M_filtered(:,7),M_filtered(:,8),M_filtered(:,11),M_filtered(:,20),M_filtered(:,21),M_filtered(:,23)];

% tu sobie mozna wymierzac dane, wektory tablicy sie zamieniaja losowo miejscami
% chyba tak sie powinno robic, jak sie siec uczy
% M_reduced=M_reduced(randperm(size(M_reduced, 1)), :); 


% U_train=M_reduced(1:8000,:);
% U_test=M_reduced(8001:10080,:);
% 
% %Wyjscie nazywam inaczej, zeby sie juz nie mylilo
% Y_train=M_filtered(1:8000,23);
% Y_test=M_filtered(8001:10080,23);
% 
% trainData = [Y_train U_train];
% testData = [Y_test U_test];
% end
%przygotowuje sobie zbiory uczace i testujace
U_train=zeros(4*10080/5,7);
U_test=zeros(10080/5,7);
Y_train=zeros(4*10080/5,1);
Y_test=zeros(10080/5,1);
k=1;
l=1;
%rodzielam na zbior testowy
for i=1:1:10080
    if mod(i,5)==0
    U_test(l,:)=M_reduced(i,1:7);
    Y_test(l,1)=M_reduced(i,8);
    l=l+1;
    else
    U_train(k,:)=M_reduced(i,1:7);
    Y_train(k,1)=M_reduced(i,8);
    k=k+1;
    end
end
trainData = [Y_train U_train];
testData = [Y_test U_test];
%% siec nieuronowa

% czas symulacji 
simStart = 1;
tsim = 50000;

%dane wejsciowe
inputs = U_train';
targets = Y_train';

%utworzenie sieci dopasowujacej
hiddenLayerSize = 30;
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

%% test on test data
pocz=1;
kon=1000;
random_testData=testData(randperm(size(testData, 1)), :);
Y_sim = net(random_testData(:,2:8)');
figure(20); hold on;
plot(random_testData(pocz:kon,1)');
plot(Y_sim(pocz:kon));
legend('process', 'simulation');
%% test na calym zbiorze
figure(21); hold on;
Y_sim = net([M_filtered(:,1),M_filtered(:,2),M_filtered(:,7),M_filtered(:,8),M_filtered(:,11),M_filtered(:,20),M_filtered(:,21)]');
plot(M_filtered(:,23)');
plot(Y_sim);