const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const Booking = require("../models/bookingModel");
const factory = require("../helpers/hadlerFactory.js");
const catchAsync = require("../helpers/catchAsync");

const getCheckoutSession = catchAsync(async (req, res, next) => {
    const tour = await Tour.findById(req.params.tourId);
    const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                quantity: 1,
                price_data: {
                    currency: "usd",
                    unit_amount: tour.price * 100,
                    product_data: {
                        name: `${tour.name} Tour`,
                        description: tour.summary,
                        images: [
                            "https://www.natours.dev/img/tours/tour-3-cover.jpg",
                        ],
                    },
                },
            },
        ],
        currency: "usd",
        mode: "payment",
        success_url: `${req.protocol}://${req.get("host")}/?tour=${
            req.params.tourId
        }&user=${req.user.id}&price=${tour.price}`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        payment_method_types: ["card"],
    });

    return res.json({
        status: "success",
        session,
    });
});

const createBookingCheckout = catchAsync(async (req, res, next) => {
    const { tour, user, price } = req.query;

    if (!tour || !user || !price) {
        return next();
    }

    await Booking.create({ tour, user, price });

    return res.redirect("/");
});

const getAllBookings = factory.getAll(Booking);
const getBooking = factory.getOne(Booking);
const createBooking = factory.createOne(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

module.exports = {
    getCheckoutSession,
    createBookingCheckout,
    getAllBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
};
