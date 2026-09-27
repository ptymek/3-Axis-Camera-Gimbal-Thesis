# GimbalSim — symulator 3-osiowego stabilizatora kamery GoPro

Interaktywny symulator (GUI w przeglądarce) układu regulacji stabilizatora z pracy magisterskiej
*„Zaawansowane algorytmy sterowania 3-osiowym stabilizatorem do kamer”* (P. Tymiński, PW 2020).
Odtwarza model z Simulinka (kinematyka, silniki GB3510, dynamika członów) i regulatory
**PID, nieliniowy PID, LQG (LQR + filtr Kalmana) oraz MPC**, z modelem 3D stabilizatora pod kamerę GoPro.
Regulatory oparte na sieciach neuronowych (NARMA-L2, MRC) celowo nie są zaimplementowane —
ich wyniki z pracy są dostępne tylko jako dane archiwalne w zakładce „Wyniki pracy”.

## Uruchomienie

Nie wymaga instalacji ani serwera — wystarczy otworzyć plik w przeglądarce (Chrome, Edge, Firefox):

```
simulator/index.html
```

Opcjonalnie przez lokalny serwer (np. `python -m http.server` w katalogu repozytorium, potem
`http://localhost:8000/simulator/`). Galeria przebiegów w zakładce „Wyniki pracy” czyta obrazy z
`../results/plots`, więc działa, gdy symulator jest otwarty z wnętrza repozytorium.

## Zakładki

| Zakładka | Zawartość |
|---|---|
| **Symulacja** | model 3D z podglądem z kamery (POV), wybór zakłóceń i regulatora, nastawy na żywo, pozycja zadana i tryb pracy, HUD orientacji, tarcze silników, KPI (MSE yaw/pitch/roll, energia mAh, prąd, moc, akumulator, nasycenia) i 10 wykresów czasu rzeczywistego |
| **Porównanie regulatorów** | wsadowe uruchamianie wybranych regulatorów na wybranych zestawach danych, tabela i wykresy MSE / energii, wynik ważony jak w tab. 14 (wagi edytowalne), eksport CSV |
| **Model i strojenie** | test skokowy wszystkich regulatorów (czas narastania, przeregulowanie, czas regulacji, ISE), model silnika i odpowiedź z ograniczeniem prędkości (rys. 14), projekt LQG (K, Nx, Nu, L, bieguny) z porównaniem do pracy, parametry MPC, kinematyka na żywo, parametry masowe (tab. 5) |
| **Wyniki pracy** | tabele 6–14 z pracy, wykresy na zestaw testowy, galeria 310 przebiegów z `results/plots` |

Wykresy w zakładce „Symulacja”: orientacja globalna kamery vs. zadana, zakłócenie podstawy,
pozycja silników `x_m` vs. nowa zadana `x_mn`, błąd orientacji, sterowanie `u`, prędkość silników
(z limitem 560 rpm), moment, prąd, narastające MSE i zużyta energia. Kursor nad wykresem pokazuje wartości.

Sterowanie: `Spacja` start/pauza, `R` reset, `1`–`4` widoki 3D; w oknie 3D lewy przycisk — obrót,
prawy / `Ctrl` — przesuwanie, kółko — zoom, `Shift` + przeciąganie — przechylanie podstawy
(źródło „Sterowanie ręczne”). Kliknięcie paska postępu przewija zestaw danych.

## Model

```
zakłócenie podstawy R_D ─┐
zadana orientacja R_G ───┴─► kinematyka odwrotna (2.32–2.33) ─► x_mn ─► regulator ─► u
u ─► nasycenie (yaw ±360°, pitch ±135°, roll ±45°) ─► ogranicznik prędkości (560 rpm)
  ─► 1/((0.002 s + 1)(0.0015 s + 1)) ─► x_m ─► kinematyka prosta R_kamera = R_D·Rz·Rx·Ry ─► błąd, MSE
x_m, ẋ_m, ẍ_m, ruch podstawy ─► dynamika Newtona-Eulera (tab. 5) ─► moment ─► prąd I = I₀ + |M|/K_t ─► mAh
```

* Krok symulacji 1 ms; regulatory PID/NL PID/LQG działają co 1 ms, MPC z własnym okresem (domyślnie 2 ms).
* **LQG**: wagi Q = diag(10⁴, 10⁴), R = 10⁴, filtr Kalmana Q = 30000, R = 0.01 (rozdz. 5.3).
  Symulator wyznacza K ciągłe ≈ [0.0245 0.0246], bieguny −667 i −500, Nx = [0 0.0492], Nu = 1 — jak w pracy.
  W pętli używany jest odpowiednik dyskretny (DARE, Ts = 1 ms).
* **MPC**: model silnika w przestrzeni stanu, horyzonty N / Nu, kara λ na Δu, ograniczenia
  |Δu| ≤ ω_max·Ts i u_min ≤ u ≤ u_max, QP rozwiązywane metodą zbioru aktywnego,
  model wewnętrzny + estymacja stałego zakłócenia wyjściowego.
* **PID / NL PID**: wzory 3.1 i 3.2, filtr członu D, całkowanie warunkowe (anti-windup).
  Nastawy nie są w pracy podane liczbowo — domyślne dobrano testem skokowym (k_p = 1.2, T_i = 4 ms, T_d = 0.5 ms).
* **Zakłócenia**: 10 zapisów MATLAB Mobile z `src/data/disturbances/*.mat` (orientacja X/Y/Z, 100 Hz),
  wyeksportowane do `data/disturbance_N.js` (int16, 0.01°). Mapowanie osi, rozwijanie skoków ±180°,
  zerowanie pozycji początkowej i skala są konfigurowalne. Dostępne są też profile syntetyczne
  (chód, bieg, samochód, łódź, sinusoida, skoki) i sterowanie ręczne.
* Dodatkowo: tryby podążania (yaw / FPV), programy wartości zadanej, szum i rozdzielczość czujnika,
  niewyważenie kamery i skala masy, regulator hybrydowy (inny regulator w każdej osi — kierunek z „Dalszych planów” pracy).

Model prądu jest przybliżeniem (prąd spoczynkowy + moment / K_t), więc wartości mAh służą do porównań
między regulatorami, a nie do odtworzenia liczb z tab. 6.

## Struktura

```
simulator/
├── index.html            interfejs
├── css/style.css
├── js/core/              model obliczeniowy (działa także w Node.js)
│   ├── linalg.js         macierze, obroty, expm, c2d, DARE
│   ├── params.js         parametry z pracy (tab. 2, 5) i wyniki (tab. 6–14)
│   ├── motor.js          model silnika GB3510
│   ├── controllers.js    PID, NL PID, LQG, MPC
│   ├── dynamics.js       dynamika Newtona-Eulera
│   ├── disturbance.js    źródła zakłóceń
│   └── engine.js         pętla symulacji, metryki, rejestracja
├── js/ui/                wykresy, scena 3D (three.js), widżety, widoki
├── data/                 zestawy zakłóceń
├── vendor/three.min.js   three.js r158 (MIT)
└── tests/                testy modelu: node simulator/tests/run.js
```

## Testy

```
node simulator/tests/run.js
```

Sprawdzają m.in. zgodność macierzy silnika, wzmocnień LQR, biegunów i Nx/Nu z pracą, poprawność
kinematyki odwrotnej, stabilizację wszystkich regulatorów na zestawie 1, spełnienie ograniczeń MPC
oraz moment grawitacyjny przy niewyważeniu.

## Ponowny eksport danych zakłóceń

```
pip install mat-io numpy
python - <<'EOF'
from matio import load_from_mat
import numpy as np, base64
for i in range(1, 11):
    o = load_from_mat(f'src/data/disturbances/{i}.mat')['Orientation']
    q = np.round(np.stack([o['X'], o['Y'], o['Z']], 1) * 100).astype('<i2')
    open(f'simulator/data/disturbance_{i}.js', 'w').write(
        f'(window.GIMBAL_DATA=window.GIMBAL_DATA||{{}})[{i}]={{fs:100,n:{len(q)},scale:0.01,'
        f'order:"X(azimuth),Y(pitch),Z(roll)",b64:"{base64.b64encode(q.tobytes()).decode()}"}};\n')
EOF
```
