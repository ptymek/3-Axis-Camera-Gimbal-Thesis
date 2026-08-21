%% B£¥D
nazwa=[names(k),': TEST',num2str(i),'B£¥D'];
nazwa=join(nazwa);
filename=[names(k),' ',num2str(i),'B£¥D'];
filename=join(filename);
fig=figure('Units','centimeters','Position', [0 0 20 8],'Color',[1 1 1]);
plot(yaw_e,'LineWidth',1.25,'DisplayName','yaw')
hold on
plot(pitch_e,'LineWidth',1.25,'DisplayName','pitch')
hold on
plot(roll_e,'LineWidth',1.25,'DisplayName','roll')
ylabel('B³¹d pozycji (rad)','FontSize',12,'FontName','Arial');
xlabel('Czas(sekundy)','FontSize',12,'FontName','Arial');
legend('yaw','pitch','roll')
legend boxoff
legend('Orientation','horizontal','FontSize',12,'Position',[0.59,0.93,0.314,0.066]);
title(nazwa,'HorizontalAlignment','right','FontName','Arial','FontWeight','normal','FontSize',14);
export_fig(sprintf(filename),'-dpng','-r300')
saveas(fig,filename,'fig')