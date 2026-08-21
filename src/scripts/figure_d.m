%% ZAK£ÓCENIE
nazwa=['TEST ',num2str(i),' ZAK£ÓCENIE'];
nazwa=join(nazwa);
fig=figure('Units','centimeters','Position', [0 0 20 8],'Color',[1 1 1]);
plot(yaw_d,'LineWidth',1.25,'DisplayName','yaw')
hold on
plot(pitch_d,'LineWidth',1.25,'DisplayName','pitch')
hold on
plot(roll_d,'LineWidth',1.25,'DisplayName','roll')
ylabel('Zak³ócenie (rad)','FontSize',12,'FontName','Arial');
xlabel('Czas(sekundy)','FontSize',12,'FontName','Arial');
legend('yaw','pitch','roll')
legend boxoff
legend('Orientation','horizontal','FontSize',12,'Position',[0.59,0.93,0.314,0.066]);
title(nazwa,'HorizontalAlignment','right','FontName','Arial','FontWeight','normal','FontSize',14);
export_fig(sprintf(nazwa),'-dpng','-r300')
saveas(fig,nazwa,'fig')