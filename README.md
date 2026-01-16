
# Geo ETL Engine

A web application for converting and visualizing GIS data.

![alt text](public/data/webgis-burhan.png)
## Features
- Import GIS files: KML, Shapefile (ZIP), GeoJSON, GPX, WKT
- Export data as GeoJSON, KML, or Shapefile
- Dynamic Context Menus
- Layer Management
- View data on an interactive map
- Draw points, lines, polygons
- Print the map as PDF or PNG

## Tech Stack
- Angular 21 (Standalone Components, Signals)
- Openlayers
- Other libraries: shpjs, @mapbox/togeojson
- Tailwind CSS


## Getting Started
1. Install dependencies:
	```bash
	npm install
	```
2. Start the app:
	```bash
	npm start
	```
3. Open [http://localhost:4200](http://localhost:4200)

## Project Structure
- `src/app/components/` - UI components (map, upload, download, etc.)
- `src/app/services/` - Data and map services
- `src/app/import-export/` - Format strategies
- `src/app/helpers/` 
- `src/app/models/` 
- `src/app/utils/` 
- `public/data/` - Sample GIS files

## License
MIT
