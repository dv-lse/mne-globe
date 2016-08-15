# Generate all data rendered on maps

ORIG=/Users/yorkc/Desktop/lse/crescenzi/orig
COUNTRIES=$(ORIG)/Base\ maps/Countries
FDI=$(ORIG)/Foreign\ Direct\ Investments

default: world-110m.json fdi_excerpt.csv

# Generate TopoJSON world map from ESRI shapefile

world-topo.json: countries.json
	topojson --quantization 1e5 -o $@ countries.json

countries.json: $(COUNTRIES)/TM_WORLD_BORDERS_SIMPL-0.3.shp
	ogr2ogr -f GeoJSON $@ $(COUNTRIES)/TM_WORLD_BORDERS_SIMPL-0.3.shp

world-110m.json:
	curl https://raw.githubusercontent.com/mbostock/topojson/master/examples/world-110m.json > $@

# Generate datasets using extracted ipython script

FDIs.ipynb: ../../FDIs.ipynb
	cp ../../FDIs.ipynb $@

FDIs.py: FDIs.ipynb
	jupyter nbconvert --to script FDIs.ipynb

fdi_excerpt.csv: $(FDI)/USAtoWorldAll.csv FDIs.py
	ipython3 FDIs.py

# Admin

clean:
	rm *.json *.csv
	rm FDIs.*
