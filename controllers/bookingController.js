const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Tour = require("../models/tourModel");
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
        success_url: `${req.protocol}://${req.get("host")}/`,
        cancel_url: `${req.protocol}://${req.get("host")}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        payment_method_types: ["card"],
    });

    res.redirect(303, session.url);
});

module.exports = {
    getCheckoutSession,
};
