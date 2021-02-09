import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import SignIn from "./components/auth/SignIn";
import SignUp from "./components/auth/SignUp";
import Recover from "./components/auth/Recover";
import { Provider as AuthProvider } from "./context/AuthContext";
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Switch>
          <Route exact path="/" component={SignIn} />
          <Route path="/signup" component={SignUp} />
          <Route path="/signin" component={SignIn} />
          <Route path="/recover" component={Recover} />
          {/* <Route path="*" component={ResolveAuth} /> */}
        </Switch>
      </Router>
    </AuthProvider>
  );
};
export default App;
