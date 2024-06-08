// config.js

module.exports = {
    GOOGLE_API_KEY: 'YOUR_GOOGLE_API_KEY',
    GEOCODING_API_URL: function(address) {
        return `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${this.GOOGLE_API_KEY}`;
    }
};
