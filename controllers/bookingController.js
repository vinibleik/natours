const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
const User = require("../models/userModel");
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
                            `${req.protocol}://${req.get("host")}/img/tours/${
                                tour.imageCover
                            }`,
                        ],
                    },
                },
            },
        ],
        currency: "usd",
        mode: "payment",
        // success_url: `${req.protocol}://${req.get("host")}/?tour=${
        //     req.params.tourId
        // }&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get(
            "host",
        )}/my-tours?alert=booking`,
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

// const createBookingCheckout = catchAsync(async (req, res, next) => {
//     const { tour, user, price } = req.query;
//
//     if (!tour || !user || !price) {
//         return next();
//     }
//
//     await Booking.create({ tour, user, price });
//
//     return res.redirect("/");
// });

const getAllBookings = factory.getAll(Booking);
const getBooking = factory.getOne(Booking);
const createBooking = factory.createOne(Booking);
const updateBooking = factory.updateOne(Booking);
const deleteBooking = factory.deleteOne(Booking);

const createBookingWebHook = catchAsync(async (session) => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.list_items[0].price_data.unit_amount / 100;
    await Booking.create({ tour, user, price });
});

const webhookCheckout = (req, res, next) => {
    const signature = req.headers["stripe-signature"];

    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET,
        );
    } catch (err) {
        return res.status(400).send(`Webhook error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        createBookingWebHook(event.data.object);
    }

    res.status(200).json({ received: true });
};

module.exports = {
    getCheckoutSession,
    getAllBookings,
    getBooking,
    createBooking,
    updateBooking,
    deleteBooking,
    webhookCheckout,
};
