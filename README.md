# Birds - Dynamic Data

## Author
Steven Simpson

## Description
This project houses the neccesary data and source files to form a complete webpage which can be locally hosted.

The content of this webpage is a collection of New Zealand birds with various scientific data and images.

The data folder holds both the bird data and the bird images themselves (images folder).

## Development
This project was a continuation of another birds-based web development project in a University of Otago paper.   
In the other project, the data was collected from a JSON file and statically displayed.  
This project uses a database to dynamically create, update and remove displayed information on the webpage.

## Initial Setup

This project requires the use of Express.js and a MySQL server to view the data.   
The first step is to setup and populate the database with the SQL files located in /sql/: run db_setup, then db_populate.  
Then, the command 'npm install' can be used to install the required Express.js and MySQL dependencies.
Finally, 'npm run start' can be used to deploy a locally hosted webpage with a linked database. 


## Navigation
By default, all birds are displayed in alphabetical order based on their common name.

The 'Search for Birds' section allows the user to input a number of the bird to view.   

The Create, Update and Delete buttons on the side bar allow for the basic CRUD operations when viewing the webpage.   
These buttons redirect to intermediary webpages to specify the details for which birds to add, remove or delete from the database.  

The Conservation Status key on the left pane displays the meaning of the coloured diamonds on each bird's information card.


