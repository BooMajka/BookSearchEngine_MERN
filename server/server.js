const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const path = require("path");

const { typeDefs, resolvers } = require("./schemas");
const { authMiddleware } = require("./utils/auth");
const db = require("./config/connection");
//const routes = require('./routes');   /// from RESTful API

const PORT = process.env.PORT || 3001;
const app = express();

const server = new ApolloServer({
	typeDefs,
	resolvers,
	context: authMiddleware,
});

async function startServerWithMiddleware() {
	await server.start();
	server.applyMiddleware({ app });
}

startServerWithMiddleware();

app.use(express.urlencoded({ extended: true })); // change to false?
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "../client/build")));
}

// app.use(routes);  /// from RESTful API
// or this?
// app.get('*', (req, res) => {
// 	res.sendFile(path.join(__dirname, '../client/build/index.html'));
//   });

db.once("open", () => {
	app.listen(PORT, () => {
		console.log(`🌍 Now listening on localhost:${PORT}`);
		console.log(
			`GraphQL now listening at http://localhost:${PORT}${server.graphqlPath}`
		);
	});
});
