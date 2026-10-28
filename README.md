# Münster ↔ Minecraft-Koordinaten

Reale Positionen in Münster als Minecraft-Koordinaten (1 Block = 1 m), Ursprung St.-Paulus-Dom.

- `coords.js`: Umrechnung (WGS84 → ETRS89/UTM 32N → X/Z), Facing, Nether. Ursprung und Y-Offset stehen in `CONFIG`.
- `index.html`: Handy-Web-App im Minecraft-Look. Zeigt die eigene GPS-Position im F3-Stil, kopiert und teilt Koordinaten und zeigt eingefügte Koordinaten auf der Karte. Das Einfügefeld versteht `639 60 736`, `X: 639 Z: 736`, `/tp @s 639 ~ 736` und Teilen-Links (`?x=639&z=736`).
- `mcmap.js`: Karte im Minecraft-Look (MapLibre, Vektordaten von OpenFreeMap). Aufbau wie der OSM-Standardstil, aber in Blockfarben, mit selbst erzeugten Texturen und Pixel-Look. Beschriftungen liegen als zweite, scharfe Karte darüber. Über das Zahnrad lassen sich Kartenstil, Pixelgröße und Ton einstellen. Die Einstellungen werden im Browser gespeichert.
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
