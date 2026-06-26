/*
POST /trips/board — driver enters pin, trip status → boarded, parent notified
POST /trips/dropoff — driver confirms drop-off, triggers payment, trip → dropped_off
GET /trips/:id — trip status (for notifications/polling)
*/