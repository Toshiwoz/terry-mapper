# Maps overlay folder
This folder stores the maps overlays, areas and points.

Each feature will be rendered using the following properties:
name -> will be displayed as a label
poi -> classifies the type of area-point, it does nothing for now.


Here an example:
```
"features": [
    {
      "type": "Feature",
      "properties": {
        "name": "Fla. Araki",
        "poi" : "home"
      },
      "geometry": {
        "coordinates": [
          -78.40355448825697,
          -0.3539252347306814
        ],
        "type": "Point"
      },
      "id": "6ea5c4429125564c63d68d0aea1617ab"
    },
```
