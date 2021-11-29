const flights = require('../models/flightModel');

class flightRepository{
    async createFlight(req){
        let flight = new flights({
            from: req.body.from,
            to: req.body.to,
            departureTime: req.body.departureTime,
            arrivalTime:req.body.arrivalTime,
            economy:req.body.economy,
            business:req.body.business,
            first:req.body.first,
            flightNumber:req.body.flightNumber,
            baggageAllowance:req.body.baggageAllowance,
            price:req.body.price,
            bookedSeats:[]
            })
            console.log(flight)
        try {
            let result = await flight.save()
            return req.body.flightNumber;;
        }catch (error) {
            throw new Error()
        }
    }
    
    async deleteFlight(req) {
        let flight = flights.findOneAndRemove({
            flightNumber: req.body.flightNumber
        })
        return flight
    }

    async getFlights(){
        let allFlights = flights.find({})
        return allFlights
    }

    async updateFlight(req){
        flights.findOneAndUpdate({flightNumber: req.body.oldFlightNumber}, {$set:{
            from: req.body.from,
            to: req.body.to,
            departureTime: req.body.departureTime,
            arrivalTime:req.body.arrivalTime,
            economy:req.body.economy,
            business:req.body.business,
            first:req.body.first,
            flightNumber:req.body.flightNumber,
            baggageAllowance: req.body.baggageAllowance,
            price: req.body.price,
            bookedSeats: req.body.bookedSeats,}}).then(() => {
                console.log(`Flight ${req.body.flightNumber} was updated successfully!`)
                return req.body.flightNumber;
            })    
    }
    
    async filterFlights(req){
        var firstSeats
        var businessSeats
        var economySeats
        req.body.cabin === "first" ? firstSeats = req.body.children + req.body.adults : firstSeats = 0
        req.body.cabin === "business" ? businessSeats = req.body.children + req.body.adults : businessSeats = 0
        req.body.cabin === "economy" ? economySeats = req.body.children + req.body.adults : economySeats = 0
        let flights1 = flights.find({
            from: req.body.from,
            to: req.body.to,
            first:{$gte: firstSeats},
            business:{$gte: businessSeats},
            economy: {$gte: economySeats},
            $departureTime: {$search: req.body.departure}
        })
        return flights1
    }
}
const repository = new flightRepository();
module.exports = repository;

