/*
generatePin(scholarId, tripId) → creates a random 5-digit code, saves to pins table, sets expiry (e.g. same day, or 30 min after creation — your call)
validatePin(code, scholarId) → checks the pin exists, matches scholar, is unused and not expired
consumePin(code) → marks pin as used so it can't be reused
getActivePinForScholar(scholarId) → for the parent dashboard, shows today's pin
*/

