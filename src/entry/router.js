import { Router, Route, Redirect, browserHistory } from 'react-router';
import App from '../layout/App.jsx';

export default (
  <Router history={browserHistory}>
    <Route path="/" component={App}/>
  </Router>
);