# Generate all data rendered on maps

ORIG=/Users/yorkc/Desktop/lse/crescenzi/orig
COUNTRIES=$(ORIG)/Base\ maps/Countries
FDI=$(ORIG)/Foreign\ Direct\ Investments

default: world-topo.json fdi_usa.csv

# Generate TopoJSON world map from ESRI shapefile

world-topo.json: countries.json
	topojson -o world-topo.json countries.json

countries.json: $(COUNTRIES)/TM_WORLD_BORDERS_SIMPL-0.3.shp
	ogr2ogr -f GeoJSON countries.json $(COUNTRIES)/TM_WORLD_BORDERS_SIMPL-0.3.shp

# Generate datasets

fdi_usa.csv: $(FDI)/USAtoWorldAll.csv
	cp $(FDI)/USAtoWorldAll.csv fdi_usa.csv

# Admin

clean:
	rm *.json *.csv
