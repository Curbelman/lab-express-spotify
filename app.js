require('dotenv').config();

const bodyParser = require('body-parser');
const express = require('express');
const hbs = require('hbs');
//const kirbyDance = require ('kirby-dance');


// require spotify-web-api-node package here:
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
  // Retrieve an access token
  spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

// Our routes go here:
app.get('/', (req, res) => {
    res.render('home');
});

let artistSearched
let searchResult

app.get('/artist-search', (req, res) => {
    artistSearched = req.query.artistSearch;
    console.log('req.query', req.query)
    spotifyApi
    .searchArtists(artistSearched)
    .then(data => {
        //console.log (kirbyDance(5))
        console.log('The received data from the API: ', data.body)
        console.log('Items inside', data.body.items)
        searchResult = data.body.artists.items
    })
    .then(() => res.render('artist-search-results', {searchResult}))
    .catch(err => console.log('An error occurred', err));
})

let artistId;
let artistAlbums;

app.get('/albums/:artistId', (req, res) => {
    console.log('Req.params are', req.params)
    artistId = req.params.artistId;
    spotifyApi
    .getArtistAlbums(req.params.artistId)
    .then ((data) => {
        console.log('data received', data.body.items)
        artistAlbums = data.body.items;
        res.render('albums', {artistAlbums})
    })
    .catch(err => console.log('There was an error retrieving the albums', err));
})


app.get('/tracks/:albumId', (req, res) => {
    spotifyApi
    .getAlbumTracks(req.params.albumId)
    .then((data) => {
        trackList = data.body.items;
        console.log('The tracks are:', trackList)
        res.render('tracks', {trackList})
    })
    .catch(err => console.log('There was an error retrieving the tracks', err));
})


app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
