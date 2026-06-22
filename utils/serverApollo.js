import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

const serverApollo = new ApolloClient({
  link: new HttpLink({
    uri: "https://dhwaniastro.com/userAuth/graphql",
  }),
  cache: new InMemoryCache(),
});

export default serverApollo;