const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const bodyParser = require('body-parser');
const fs = require('fs');
const pool = require('./db');


router = express.Router();

router.use(bodyParser.json());
router.use(fileUpload());
router.use(express.urlencoded({ extended: true }));

router.get('/', async (req, res) => {
    res.redirect('/birds');
});

router.get('/birds', async (req, res) => {
    conservation_status_data = [];
    birds = [];

    /* conservation status from mysql */
    const db = pool.promise();

    const status_query = `SELECT * FROM ConservationStatus;`;

    const birds_query = `SELECT * FROM Bird INNER JOIN ConservationStatus on Bird.status_id = ConservationStatus.status_id INNER JOIN Photos on Bird.bird_id = Photos.bird_id ORDER BY Bird.english_name;`;
    
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;

        const [b_rows, b_fields] = await db.query(birds_query);
        birds = b_rows;

    } catch (err) {
        console.error("You havent set up the database yet!");
    }
    
    /* bind data to the view (index.ejs) */
    res.render('index', { 
        title: 'Birds of Aotearoa', 
        birds: birds, 
        status: conservation_status_data 
    });
});

router.get('/birds/create', async (req, res) => {
    conservation_status_data = [];
    /* conservation status from mysql */
    const db = pool.promise();

    const status_query = `SELECT * FROM ConservationStatus;`;
    
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;

    } catch (err) {
        console.error("You havent set up the database yet!");
    }
    
    /* bind data to the view (create.ejs) */
    res.render('create.ejs', { 
        title: 'Create A New Bird',
        status: conservation_status_data 
    });
});

router.get('/birds/inter_update', async (req, res) => { 
    conservation_status_data = [];
    /* conservation status from mysql */
    const db = pool.promise();

    const status_query = `SELECT * FROM ConservationStatus;`;
    
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;

    } catch (err) {
        console.error("You havent set up the database yet!");
    }
    
    /* bind data to the view (create.ejs) */
    res.render('inter_update.ejs', { 
        title: 'Update a Bird',
        status: conservation_status_data 
    });
});

router.get('/birds/inter_delete', async (req, res) => { 
    conservation_status_data = [];
    /* conservation status from mysql */
    const db = pool.promise();

    const status_query = `SELECT * FROM ConservationStatus;`;
    
    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;

    } catch (err) {
        console.error("You havent set up the database yet!");
    }
    
    /* bind data to the view (create.ejs) */
    res.render('inter_delete.ejs', { 
        title: 'Delete a Bird',
        status: conservation_status_data 
    });
});

router.get('/birds/update_search', async (req, res) => {
    const id = req.query.id;
    res.redirect(`/birds/${id}/update`);
});

router.get('/birds/bird_search', async (req, res) => {
    const id = req.query.id;
    res.redirect(`/birds/${id}`);
});

router.get('/birds/delete_search', async (req, res) => {
    const id = req.query.id;
    res.redirect(`/birds/${id}/delete`);
});

router.get('/birds/:id', async (req, res) => {
    const id = req.params.id;
    
    const db = pool.promise();
    
    conservation_status_data = [];
    birds = [];

    const status_query = `SELECT * FROM ConservationStatus;`;

    const birds_query = `SELECT * FROM Bird INNER JOIN ConservationStatus on Bird.status_id = ConservationStatus.status_id INNER JOIN Photos on Bird.bird_id = Photos.bird_id WHERE Bird.bird_id = ?;`;

    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;

        const [b_rows, b_fields] = await db.query(birds_query, [id]);
        
        if (b_rows.length > 0) {
            birds = b_rows; 
        }else {
            res.status(404).render('404-page', { message: 'Bird not found' });
            return;
        }

    } catch (err) {
        console.error("You havent set up the database yet!");
    }
    
    /* REPLACE THE .json WITH A MYSQL DATABASE */
    //const birds = require('./sql/nzbird.json');
    
    /* bind data to the view (index.ejs) */
    res.render('index', { 
        title: 'Birds of Aotearoa', 
        bird: birds,
        status: conservation_status_data 
    });
});

router.get('/birds/:id/update', async (req, res) => {
    const id = req.params.id;

    conservation_status_data = [];
    birds = [];

    /* conservation status from mysql */
    const db = pool.promise();

    const status_query = `SELECT * FROM ConservationStatus;`;

    const birds_query = `SELECT * FROM Bird INNER JOIN ConservationStatus on Bird.status_id = ConservationStatus.status_id INNER JOIN Photos on Bird.bird_id = Photos.bird_id WHERE Bird.bird_id = ?;`;

    try {
        const [rows, fields] = await db.query(status_query);
        conservation_status_data = rows;

        const [b_rows, b_fields] = await db.query(birds_query, [id]);
        
        if (b_rows.length > 0) {
            birds = b_rows; 
        }else {
            res.status(404).render('404-page', { message: 'Bird not found' });
            return;
        }

    } catch (err) {
        console.error("Error finding the bird's data!");
    }
    
    
    /* bind data to the view (index.ejs) */
    res.render('update', { 
        title: 'Update A Bird', 
        bird: birds[0],
        status: conservation_status_data 
    });
});

router.get('/birds/:id/delete', async (req, res) => {
    const bird_id = req.params.id;
        
    const db = pool.promise();
    
    //delete from database
    try {
        await db.query(`SELECT * FROM Bird WHERE Bird.bird_id = ?;`, [bird_id]);
        await db.query(`DELETE FROM Photos WHERE Photos.bird_id = ?;`, [bird_id]);
        await db.query(`DELETE FROM Bird WHERE Bird.bird_id = ?;`, [bird_id]);
    } catch (err) {
        res.status(404).render('404-page');
        console.error('Error deleting bird or photo from database:', err);
    }
    
    res.redirect('/birds');
});

router.post('/birds/create', async (req, res) => {
    if(!req.files || Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const { bird_id, primary_name, english_name, scientific_name, order_name, family, weight, length, stat_name, photographer } = req.body;

    const photo = req.files.photo;
    const uploadPath = path.join(__dirname, 'public/images', photo.name);

    const db = pool.promise();

    const ins_bird_query = `INSERT INTO Bird (bird_id, primary_name, english_name, scientific_name, order_name, family, weight, length, status_id) VALUES (?,?,?,?,?,?,?,?,?);`;
    const ins_photo_query = `INSERT INTO Photos (bird_id, filename, photographer) VALUES (?,?,?);`;
    
    try {
        //get status id from text name input in form
        const [statusResult] = await db.query(`SELECT status_id FROM ConservationStatus WHERE status_name = ?;`, [stat_name]);
        const status_id = statusResult[0]?.status_id;

        if (!status_id) {
            throw new Error('Invalid status name');
        }
        
        //use query and data to insert new bird
        await db.query(ins_bird_query, [bird_id, primary_name, english_name, scientific_name, order_name, family, weight, length, status_id]);

        //writing into photos
        await db.query(ins_photo_query, [bird_id, photo.name, photographer]);
        
        //writing photo to server location
        await fs.writeFile(uploadPath, photo.data, (err) => {
            if(err) {
                console.log("Error writing photo to file: ", err);
            }
        });

    } catch (err) {
        console.error('Error inserting bird or photo:', err);
    }
    
    res.redirect('/birds'); 
});

router.post('/birds/edit', async (req, res) => {
    const id = req.params.id;
    
    const { bird_id, primary_name, english_name, scientific_name, order_name, family, weight, length, stat_name, photographer } = req.body;
    
    const db = pool.promise();
    
    if(!req.files || Object.keys(req.files).length == 0) {
        return res.status(400).send('No files were uploaded.');
    }

    const photo = req.files.photo;
    const uploadPath = path.join(__dirname, 'public/images', photo.name);

    const ins_bird_query = `INSERT INTO Bird (bird_id, primary_name, english_name, scientific_name, order_name, family, weight, length, status_id) VALUES (?,?,?,?,?,?,?,?,?);`;
    const ins_photo_query = `INSERT INTO Photos (bird_id, filename, photographer) VALUES (?,?,?);`;
    
    //delete from database
    try {
        await db.query(`DELETE FROM Photos WHERE Photos.bird_id = ?;`, [bird_id]);
        await db.query(`DELETE FROM Bird WHERE Bird.bird_id = ?;`, [bird_id]);
    } catch (err) {
        console.error('Error deleting bird or photo from database:', err);
    }

    try {
        //get status id from text name input in form
        const [statusResult] = await db.query(`SELECT status_id FROM ConservationStatus WHERE status_name = ?;`, [stat_name]);
        const status_id = statusResult[0]?.status_id;

        if (!status_id) {
            throw new Error('Invalid status name');
        }
        
        //use query and data to insert new bird
        await db.query(ins_bird_query, [bird_id, primary_name, english_name, scientific_name, order_name, family, weight, length, status_id]);

        //writing into photos
        await db.query(ins_photo_query, [bird_id, photo.name, photographer]);
        
        //writing photo to server location
        await fs.writeFile(uploadPath, photo.data, (err) => {
            if(err) {
                console.log("Error writing photo to file: ", err);
            }
        });

    } catch (err) {
        console.error('Error editing bird or photo:', err);
    }

    res.redirect('/birds'); 
});

module.exports = router;