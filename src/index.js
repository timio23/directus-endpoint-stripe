import Stripe from 'stripe';
export default {
	id: 'stripe',
	handler: (router, { env, services }) => {
		const secret_key = env.STRIPE_LIVE_SECRET_KEY;
		const stripe = new Stripe(secret_key);

		const { PermissionsService } = services;

		router.get('/payments', (req, res) => {
			const permission = new PermissionsService({
				accountability: req.accountability,
				schema: req.schema,
			});

			let output = [];
			if(permission.getAllowedFields('read', env.STRIPE_CUSTOMERS_COLLECTION)){
				stripe.paymentIntents.list({limit: 100})
				.autoPagingEach(function(payments) {
					output.push(payments);
				}).then(() => {
					res.json(output);
				});
			} else {
				res.send(401);
			}
		});

		router.get('/payments/:customer_id', (req, res) => {
			const permission = new PermissionsService({
				accountability: req.accountability,
				schema: req.schema,
			});

			let output = [];
			if(permission.getAllowedFields('read', env.STRIPE_CUSTOMERS_COLLECTION)){
				stripe.paymentIntents.list({customer: req.params.customer_id,limit: 100})
				.autoPagingEach(function(payments) {
					output.push(payments);
				}).then(() => {
					res.json(output);
				});
			} else {
				res.send(401);
			}
		});

		router.get('/customers', (req, res) => {
			const permission = new PermissionsService({
				accountability: req.accountability,
				schema: req.schema,
			});

			let output = [];
			if(permission.getAllowedFields('read', env.STRIPE_CUSTOMERS_COLLECTION)){
				stripe.customers.list({limit: 100})
				.autoPagingEach(function(customer) {
					output.push(customer);
				}).then(() => {
					res.json(output);
				});
			} else {
				res.send(401);
			}
		});

		router.post('/customers', (req, res) => {
			const permission = new PermissionsService({
				accountability: req.accountability,
				schema: req.schema,
			});

			if(permission.getAllowedFields('create', env.STRIPE_CUSTOMERS_COLLECTION)){

				if(req.body.email !== undefined){
					let customer = {
						email: req.body.email,
					};

					if(req.body.name !== undefined){
						customer.name = req.body.name;
					}

					stripe.customers.create(customer)
					.then((response) => {
						res.json(response);
					});
				} else {
					res.send(400); // Bad Request
				}
				
			} else {
				res.send(401);
			}
		});
	},
};