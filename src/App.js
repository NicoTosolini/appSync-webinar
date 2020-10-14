import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import "react-datepicker/dist/react-datepicker.css";

import appSyncConfig from "./aws-exports";
import { ApolloProvider } from "react-apollo";
import AWSAppSyncClient, {
  defaultDataIdFromObject,
  AUTH_TYPE,
} from "aws-appsync";
import { Rehydrated } from "aws-appsync-react";

import "./App.css";
import AllEvents from "./Components/AllEvents";
import NewEvent from "./Components/NewEvent";
import ViewEvent from "./Components/ViewEvent";
import Amplify, { Auth } from "aws-amplify";
import awsconfig from "./aws-exports";
import { withAuthenticator, AmplifySignOut } from "@aws-amplify/ui-react";

Amplify.configure(awsconfig);
const Home = () => (
  <div className="ui container">
    <AllEvents />
  </div>
);

const App = () => (
  <Router>
    <div>
      <AmplifySignOut />
      <Route exact={true} path="/" component={Home} />
      <Route path="/event/:id" component={ViewEvent} />
      <Route path="/newEvent" component={NewEvent} />
    </div>
  </Router>
);

const client = new AWSAppSyncClient({
  url: appSyncConfig.aws_appsync_graphqlEndpoint,
  region: appSyncConfig.aws_appsync_region,
  auth: {
    type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
    jwtToken: async () =>
      (await Auth.currentSession()).getIdToken().getJwtToken(),
  },
  cacheOptions: {
    dataIdFromObject: (obj) => {
      let id = defaultDataIdFromObject(obj);

      if (!id) {
        const { __typename: typename } = obj;
        switch (typename) {
          case "Comment":
            return `${typename}:${obj.commentId}`;
          default:
            return id;
        }
      }

      return id;
    },
  },
});

const WithProvider = () => (
  <ApolloProvider client={client}>
    <Rehydrated>
      <App />
    </Rehydrated>
  </ApolloProvider>
);

export default withAuthenticator(WithProvider);
