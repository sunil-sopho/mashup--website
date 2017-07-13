# pset8
make a mashup using google map and getting live news articles and combining them togethor
# [Problem Set 8: Mashup](http://cdn.cs50.net/2016/x/psets/6/pset6/pset6.html)

***Note:*** *vendor, the folder that contains CS50’s PHP library, is not included in this repo folder.*

### Objectives
- Introduction to JavaScript, Ajax, JSON.
- Exposure to objects and methods.
- Grapple with real-world APIs and libraries.

### Project
Implement "mashup", a web app that integrates Google Maps with Google News with a MySQL database containing thousands of postal codes, GPS coordinates, and more. Quite like [this version](https://mashup.cs50.net/) by the staff. Not only can you search for places via the text box up top, you can also click on and drag the map elsewhere. Scattered across the map, meanwhile, are newspaper icons that, when clicked, provide links to local news!

### *// TODO*
- Write, in **import**, a command-line script in PHP that accepts as a command-line argument the path to a file (which can be assumed to be formatted like US.txt) that iterates over the file’s lines, inserting each as new row in places.
- Implement **search.php** in such a way that it outputs a JSON array of objects, each of which represents a row from places that somehow matches the value of geo. The value of geo, passed into search.php as a GET parameter, meanwhile, might be a city, state, and/or postal code.
- Modify the value of suggestion in **configure**, the function in **scripts.js**, so that it displays matches (i.e., place_name, admin_name1, and/or other fields) instead of TODO.
- Implement **addMarker** in **scripts.js** in such a way that it adds a marker for place on the map, where place is a JavaScript object that represents a row from places, your MySQL table. When a marker is clicked, it should trigger the mashup’s info window to open, anchored at that same marker, the contents of which should be an unordered list of links to article for that article’s location (unless articles.php outputs an empty array)!
- Implement **removeMarkers** in **scripts.js** in such a way that it removes all markers from the map.
- Last but not least, add at least one personal touch to your mashup, altering its aesthetics or adding some feature that (ideally!) no classmate has. Any touch that compels you to learn at least one new technique is of reasonable scope. *See line 326 in scripts.js in the public folder and line 68 in index.html and repected css in styles folder in public folder *

