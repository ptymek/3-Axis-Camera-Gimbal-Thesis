 
function Q = calculate_Q_matrix(T1, T2, T3, Omega)
 
 t_s = 2*10^( -17) *[1; 1; 1];
 t_d = 0.001*[1; 1; 1]; 
 Q = [T1-t_s(1)*sign(Omega(1))-t_d(1)*(Omega(1));
 T2-t_s(2)*sign(Omega(2))-t_d(2)*(Omega(2));
 T3-t_s(3)*sign(Omega(3))-t_d(3)*(Omega(3))];
end