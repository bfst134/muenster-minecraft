# Münster ↔ Minecraft-Koordinaten

Reale Positionen in Münster als Minecraft-Koordinaten (1 Block = 1 m), Ursprung St.-Paulus-Dom.

- `coords.js`: Umrechnung (WGS84 → ETRS89/UTM 32N → X/Z), Facing, Nether. Ursprung und Y-Offset stehen in `CONFIG`.
- `index.html`: Handy-Web-App mit GPS-Anzeige im F3-Stil, Kompass, Karte und der Rückrichtung X/Z → Ort.
- `test.html`: Tests im Browser, mit Referenzwerten aus pyproj.

## Starten

```bash
python3 -m http.server 8765
```

Danach http://localhost:8765/ für die App und http://localhost:8765/test.html für die Tests öffnen.
GPS und Kompass brauchen HTTPS (oder localhost). Auf dem Handy muss die App also über HTTPS gehostet sein.

## Konventionen

X = Ost (+), Z = Süd (+), Nord = −Z. Y = Höhe über NN. Die ellipsoidische GPS-Höhe wird um 44,2 m korrigiert (GCG2016 am Dom).
Die GPS-Höhe ist auf dem Handy oft auf ±10–30 m ungenau. Später soll das DGM NRW eine genauere Höhe liefern.
