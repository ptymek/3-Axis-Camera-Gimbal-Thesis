
X=deg2rad(Orientation.X);
Y=deg2rad(Orientation.Y);
Z=deg2rad(Orientation.Z);
t=0.01*(1:length(X));
T_log=round(length(X)/100);
X_in=[t' X]';
Y_in=[t' Y]';
Z_in=[t' Z]';
X_ts=timeseries(X_in(2,:),X_in(1,:));
Y_ts=timeseries(Y_in(2,:),Y_in(1,:));
Z_ts=timeseries(Z_in(2,:),Z_in(1,:));
