#!/usr/bin/env bash

# https://data.cityofnewyork.us/Transportation/Subway-Entrances/drex-xx56 \
    # ... > data/subway_entrances.geojson
# https://data.cityofnewyork.us/Transportation/Subway-Lines/3qz8-muuu \
    # ... > data/subway_lines.geojson

source activate pymain
cd ~/Documents/SAVI-780/final/

# trim, prep, and export subway data to new .geojsons
python export_geojson.py

# prepend .geojsons with JS assignment operators
for x in lines stations; do
    { echo -n "var ${x} = ";
      cat data/subway_${x}_reduction.geojson;
    } > "subway_${x}_js.geojson";
    echo ";" >> "subway_${x}_js.geojson";
done
