const express = require('express'); // Express framework
const app = express(); // Express server
const PORT = 4100; // Server porti
const path = require('path'); // Fayllar bilan ishlash uchun
const bodyParser = require('body-parser'); // JSON formatda ma'lumotlar olish uchun 
require('dotenv').config(); // .env faylni o‘qish uchun
 
const register = require('./register'); // Ro‘yxatdan o‘tish uchun router
const login = require('./login'); // Kirish uchun router
const CMSAdmin = require('./controllers/cmsAdminController'); // CMS Admin uchun router
const ApiBackend = require('./controllers/kafeAdminController'); // Backend uchun router 
 
    app.use(bodyParser.json({ limit: '10mb' }));
    app.use(express.static('public'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
 
    app.use('/api/register', register);
    app.use('/api/login', login);
    app.use('/api/cms', CMSAdmin);
    app.use('/api', ApiBackend); 
    
    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/LandingRegistrator.html');
    });
    app.get('/cms', (req, res) => {
        res.sendFile(__dirname + '/public/cms.panel/cms.html');
    });

    app.get('/backend', (req, res) => {
        res.sendFile(__dirname + '/public/backend.html');
    });

    app.get('/p/frontend',  (req, res) => {
        res.sendFile(__dirname + '/public/frontend.html');
    });
 
    app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    }); 