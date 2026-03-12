"use client";

import { ApolloClient, InMemoryCache, HttpLink, from } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

/* =========================
HTTP LINK
========================= */

const httpLink = new HttpLink({
  uri: process.env.NEXT_PUBLIC_GRAPHQL_URL,
  credentials: "include",
});

/* =========================
TOKEN REFRESH LOGIC
========================= */

let isRefreshing = false;
let pendingRequests = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (!graphQLErrors) return;

  for (let err of graphQLErrors) {
    if (
      err.message === "Unauthorized" ||
      err.extensions?.code === "UNAUTHENTICATED"
    ) {
      if (!isRefreshing) {
        isRefreshing = true;

        return new Promise((resolve, reject) => {
          fetch(process.env.NEXT_PUBLIC_GRAPHQL_URL, {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              query: `
                mutation RefreshToken {
                  refreshToken {
                    accessToken
                  }
                }
              `,
            }),
          })
            .then((res) => res.json())
            .then((result) => {
              if (!result?.data?.refreshToken) {
                throw new Error("Refresh failed");
              }

              isRefreshing = false;
              resolvePendingRequests();

              resolve(forward(operation));
            })
            .catch((err) => {
              console.error("Refresh token failed:", err);
              isRefreshing = false;
              reject(err);
            });
        });
      }

      return new Promise((resolve) => {
        pendingRequests.push(() => {
          resolve(forward(operation));
        });
      });
    }
  }
});

/* =========================
APOLLO CLIENT
========================= */

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: process.env.NODE_ENV === "development",
});

export default client;