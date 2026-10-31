# Münster ↔ Minecraft-Koordinaten

Reale Positionen in Münster als Minecraft-Koordinaten (1 Block = 1 m), Ursprung St.-Paulus-Dom.

## Dateien

- `index.html`: Handy-Web-App im Minecraft-Look. Zeigt die eigene GPS-Position im F3-Stil, kopiert und teilt Koordinaten und zeigt eingefügte Koordinaten auf der Karte. Das Einfügefeld versteht `639 60 736`, `X: 639 Z: 736`, `/tp @s 639 ~ 736` und Teilen-Links (`?x=639&z=736`).
- `coords.js`: Umrechnung (WGS84 → ETRS89/UTM 32N → X/Z), Facing, Nether. Ursprung und Y-Offset stehen in `CONFIG`.
- `mcmap.js`: Karte im Minecraft-Look (MapLibre, Vektordaten von OpenFreeMap). Aufbau wie der OSM-Standardstil, aber in Blockfarben, mit selbst erzeugten Texturen und Pixel-Look. Es gibt eine Palette für die Oberwelt und eine für den Nether. Beschriftungen liegen als zweite, scharfe Karte darüber.
- `biome.js`: Biom an der eigenen Position, abgeleitet aus den Kartenflächen.
- `sky.js`: Sonnenstand und Minecraft-Tageszeit für den Tag-und-Nacht-Wechsel.
- `weather.js`: Echtes Wetter am Dom (Open-Meteo, ohne Schlüssel) und Pixel-Regen, -Schnee, Gewitter und Nebel.
- `waypoints.js`: Wegpunkte, im Browser gespeichert.
- `achievements.js`: Fortschritte für Orte in Münster und Aktionen in der App.
- `routing.js`: Route zum Ziel mit dem OSRM-Server von FOSSGIS (`routing.openstreetmap.de`, Fahrrad oder zu Fuß).
- `icons.js`: Pixel-Icons als SVG.
- `test.html`: Tests im Browser, mit Referenzwerten aus pyproj.
- `manifest.webmanifest`, `icons/`: Homescreen-Icon und Vollbildmodus.

Einstellungen, Wegpunkte und Fortschritte liegen nur im Browser des jeweiligen Geräts.
Die einzige Ausnahme ist die Route: Beim Antippen gehen die eigene Position und das Ziel an den Routing-Server, der Anfragen protokolliert.
Unterwegs kürzt das Handy die Linie selbst. Der Server wird nur wieder gefragt, wenn man die Route verlässt, und höchstens alle 15 Sekunden (Nutzungsregeln: sparsam, maximal eine Anfrage pro Sekunde).

## Starten

```bash
python3 -m http.server 8765
```

Danach http://localhost:8765/ für die App und http://localhost:8765/test.html für die Tests öffnen.
GPS und Kompass brauchen HTTPS (oder localhost). Auf dem Handy muss die App also über HTTPS gehostet sein.

Zum Ausprobieren: `?zeit=22:30` zeigt eine andere Uhrzeit, `?wetter=rain|snow|storm|fog|drizzle` einen Wettereffekt.
Mit diesen Parametern werden keine Nacht- oder Wetter-Fortschritte freigeschaltet.

## Nach Änderungen

Alle Modul-Importe tragen `?v=…`. Bei jeder Änderung an einer `.js`-Datei die Version überall hochzählen,
sonst mischt der Browser nach dem Update neue und alte Dateien aus dem Cache:

```bash
sed -i '' -E 's#\.js\?v=[0-9a-z]+"#.js?v=NEU"#g' index.html test.html mcmap.js
```

## Konventionen

X = Ost (+), Z = Süd (+), Nord = −Z. Y = Höhe über NN. Die ellipsoidische GPS-Höhe wird um 44,2 m korrigiert (GCG2016 am Dom).
Ausnahme iPhone/iPad: Safari liefert dort schon die Höhe über dem Meeresspiegel, die Korrektur entfällt.
Die GPS-Höhe ist auf dem Handy oft auf ±10–30 m ungenau. Später soll das DGM NRW eine genauere Höhe liefern.
Im Nether gelten die Koordinaten geteilt durch 8. Intern rechnet die App immer in Oberwelt-Koordinaten.
